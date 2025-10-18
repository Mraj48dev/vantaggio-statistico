/**
 * End Session API Route - Terminate Active Session
 *
 * API endpoint for manually ending an active gaming session.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/infrastructure/database/prisma'
import { SessionsContainer } from '@/modules/sessions'
import { MethodsContainer } from '@/modules/methods'

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const body = await request.json()
    const { reason = 'MANUAL' } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    // Initialize containers
    const methodsContainer = MethodsContainer.getInstance(prisma)
    const sessionsContainer = SessionsContainer.getInstance(
      prisma,
      methodsContainer.getCalculateNextBetUseCase()
    )

    const endSessionUseCase = sessionsContainer.getEndSessionUseCase()

    // Execute end session use case
    const result = await endSessionUseCase.execute({
      sessionId,
      reason,
      userId: 'demo-user' // In real app, get from auth
    })

    if (!result.isSuccess) {
      console.error('Failed to end session:', result.error)

      // Handle specific error types
      if (result.error.code === 'SESSION_NOT_FOUND') {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        )
      }

      if (result.error.code === 'SESSION_ALREADY_ENDED') {
        return NextResponse.json(
          { error: 'Session is already ended' },
          { status: 409 } // Conflict
        )
      }

      return NextResponse.json(
        { error: 'Failed to end session' },
        { status: 500 }
      )
    }

    return NextResponse.json(result.value)

  } catch (error) {
    console.error('End session API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}