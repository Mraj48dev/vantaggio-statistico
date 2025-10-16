/**
 * Clerk Webhook Handler
 *
 * Handles Clerk webhook events for user sync.
 * This keeps our local database in sync with Clerk user changes.
 */

import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { Webhook } from 'svix'
import { container } from '@/shared/infrastructure/di/container'

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || 'dev-webhook-secret'

export async function POST(req: NextRequest) {
  try {
    // Get headers
    const headerPayload = headers()
    const svixId = headerPayload.get('svix-id')
    const svixTimestamp = headerPayload.get('svix-timestamp')
    const svixSignature = headerPayload.get('svix-signature')

    if (!svixId || !svixTimestamp || !svixSignature) {
      return NextResponse.json(
        { error: 'Missing required webhook headers' },
        { status: 400 }
      )
    }

    // Get body
    const payload = await req.text()

    // Verify webhook signature
    const wh = new Webhook(webhookSecret)
    let evt: any

    try {
      evt = wh.verify(payload, {
        'svix-id': svixId,
        'svix-timestamp': svixTimestamp,
        'svix-signature': svixSignature,
      })
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid webhook signature' },
        { status: 400 }
      )
    }

    // Handle different event types
    const eventType = evt.type
    const userId = evt.data.id

    console.log(`Received Clerk webhook: ${eventType} for user ${userId}`)

    switch (eventType) {
      case 'user.created':
        await handleUserCreated(evt.data)
        break

      case 'user.updated':
        await handleUserUpdated(evt.data)
        break

      case 'user.deleted':
        await handleUserDeleted(evt.data)
        break

      default:
        console.log(`Unhandled webhook event type: ${eventType}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function handleUserCreated(userData: any) {
  try {
    const authService = container.authService

    const clerkUser = {
      id: userData.id,
      emailAddresses: userData.email_addresses || [],
      firstName: userData.first_name,
      lastName: userData.last_name,
      username: userData.username,
      imageUrl: userData.image_url,
      createdAt: userData.created_at,
      updatedAt: userData.updated_at,
    }

    const result = await authService.syncUserWithDatabase(clerkUser)

    if (!result.isSuccess) {
      console.error('Failed to sync new user:', result.error)
      throw new Error('User sync failed')
    }

    console.log(`Successfully synced new user: ${userData.id}`)
  } catch (error) {
    console.error('Error handling user.created:', error)
    throw error
  }
}

async function handleUserUpdated(userData: any) {
  try {
    const userRepository = container.userRepository

    // Find existing user
    const userResult = await userRepository.findByClerkId(userData.id)
    if (!userResult.isSuccess || !userResult.value) {
      console.log(`User not found in database: ${userData.id}`)
      // Try to create the user if not found
      await handleUserCreated(userData)
      return
    }

    const user = userResult.value
    const primaryEmail = userData.email_addresses?.[0]?.email_address

    // Update email if changed
    if (primaryEmail && user.email !== primaryEmail) {
      const updatedUser = user.updateEmail(primaryEmail)
      if (updatedUser.isSuccess) {
        await userRepository.update(updatedUser.value)
        console.log(`Updated email for user: ${userData.id}`)
      }
    }
  } catch (error) {
    console.error('Error handling user.updated:', error)
    throw error
  }
}

async function handleUserDeleted(userData: any) {
  try {
    const userRepository = container.userRepository

    // Find user by Clerk ID
    const userResult = await userRepository.findByClerkId(userData.id)
    if (!userResult.isSuccess || !userResult.value) {
      console.log(`User not found for deletion: ${userData.id}`)
      return
    }

    // Delete user from our database
    await userRepository.delete(userResult.value.id)
    console.log(`Successfully deleted user: ${userData.id}`)
  } catch (error) {
    console.error('Error handling user.deleted:', error)
    throw error
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 })
}