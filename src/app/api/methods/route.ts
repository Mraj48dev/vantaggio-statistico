/**
 * Methods API Route - Get Available Methods
 *
 * API endpoint for retrieving methods available to a user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/infrastructure/database/prisma'
import { MethodsContainer } from '@/modules/methods'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, gameTypeId, activeOnly = true, showAllMethods = false } = body

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Initialize Methods container
    const methodsContainer = MethodsContainer.getInstance(prisma)
    const getAvailableMethodsUseCase = methodsContainer.getGetAvailableMethodsUseCase()

    // Execute use case
    const result = await getAvailableMethodsUseCase.execute({
      userId,
      gameTypeId,
      activeOnly,
      showAllMethods
    })

    if (!result.isSuccess) {
      console.error('Failed to get available methods:', result.error)
      return NextResponse.json(
        { error: 'Failed to retrieve methods' },
        { status: 500 }
      )
    }

    return NextResponse.json(result.value)

  } catch (error) {
    console.error('Methods API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  )
}