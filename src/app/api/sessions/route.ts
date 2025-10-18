/**
 * Sessions API Route - Create Session
 *
 * API endpoint for creating new gaming sessions.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/infrastructure/database/prisma'
import { SessionsContainer } from '@/modules/sessions'
import { MethodsContainer } from '@/modules/methods'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, gameTypeId, methodId, config } = body

    if (!userId || !gameTypeId || !methodId || !config) {
      return NextResponse.json(
        { error: 'userId, gameTypeId, methodId, and config are required' },
        { status: 400 }
      )
    }

    // Initialize containers
    const methodsContainer = MethodsContainer.getInstance(prisma)
    const sessionsContainer = SessionsContainer.getInstance(
      prisma,
      methodsContainer.getCalculateNextBetUseCase() // Inject methods service
    )

    const createSessionUseCase = sessionsContainer.getCreateSessionUseCase()

    // Execute use case
    const result = await createSessionUseCase.execute({
      userId,
      gameTypeId,
      methodId,
      config
    })

    if (!result.isSuccess) {
      console.error('Failed to create session:', result.error)

      // Handle specific error types
      if (result.error.code === 'ACTIVE_SESSION_EXISTS') {
        return NextResponse.json(
          { error: result.error.message },
          { status: 409 } // Conflict
        )
      }

      return NextResponse.json(
        { error: 'Failed to create session' },
        { status: 500 }
      )
    }

    return NextResponse.json(result.value)

  } catch (error) {
    console.error('Sessions API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      )
    }

    // Initialize container
    const sessionsContainer = SessionsContainer.getInstance(prisma)
    const getActiveSessionUseCase = sessionsContainer.getGetActiveSessionUseCase()

    // Get active session
    const result = await getActiveSessionUseCase.execute({ userId })

    if (!result.isSuccess) {
      console.error('Failed to get active session:', result.error)
      return NextResponse.json(
        { error: 'Failed to retrieve active session' },
        { status: 500 }
      )
    }

    return NextResponse.json(result.value)

  } catch (error) {
    console.error('Get active session API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}