/**
 * Place Bet API Route - Handle Bet Placement in Session
 *
 * API endpoint for placing bets in an active gaming session.
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
    const { number, color, isEven, isHigh, betType, betAmount } = body

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    if (typeof number !== 'number' || !color || !betType || typeof betAmount !== 'number') {
      return NextResponse.json(
        { error: 'number, color, betType, and betAmount are required' },
        { status: 400 }
      )
    }

    // Initialize containers
    const methodsContainer = MethodsContainer.getInstance(prisma)
    const sessionsContainer = SessionsContainer.getInstance(
      prisma,
      methodsContainer.getCalculateNextBetUseCase()
    )

    const placeBetUseCase = sessionsContainer.getPlaceBetUseCase()

    // Execute place bet use case
    const result = await placeBetUseCase.execute({
      sessionId,
      betData: {
        betType,
        amount: betAmount,
        target: 'first_column' // Fibonacci always bets on first column
      },
      gameResult: {
        number,
        color,
        isEven: isEven ?? (number % 2 === 0 && number !== 0),
        isHigh: isHigh ?? (number >= 19 && number <= 36)
      }
    })

    if (!result.isSuccess) {
      console.error('Failed to place bet:', result.error)

      // Handle specific error types
      if (result.error.code === 'SESSION_NOT_FOUND') {
        return NextResponse.json(
          { error: 'Session not found' },
          { status: 404 }
        )
      }

      if (result.error.code === 'SESSION_ENDED' || result.error.code === 'SESSION_INACTIVE') {
        return NextResponse.json(
          { error: 'Session is not active' },
          { status: 409 } // Conflict
        )
      }

      if (result.error.code === 'INSUFFICIENT_BALANCE') {
        return NextResponse.json(
          { error: 'Insufficient balance for bet' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to place bet' },
        { status: 500 }
      )
    }

    return NextResponse.json(result.value)

  } catch (error) {
    console.error('Place bet API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}