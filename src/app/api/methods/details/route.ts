/**
 * Method Details API Route
 *
 * API endpoint for retrieving detailed information about a specific method.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/infrastructure/database/prisma'
import { MethodsContainer } from '@/modules/methods'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { methodId, baseBet = 10, includeProgression = true, progressionSteps = 10 } = body

    if (!methodId) {
      return NextResponse.json(
        { error: 'Method ID is required' },
        { status: 400 }
      )
    }

    // Initialize Methods container
    const methodsContainer = MethodsContainer.getInstance(prisma)
    const getMethodDetailsUseCase = methodsContainer.getGetMethodDetailsUseCase()

    // Execute use case
    const result = await getMethodDetailsUseCase.execute({
      methodId,
      baseBet,
      includeProgression,
      progressionSteps
    })

    if (!result.isSuccess) {
      console.error('Failed to get method details:', result.error)

      // Check if it's a "not found" error
      if (result.error.code === 'METHOD_NOT_FOUND') {
        return NextResponse.json(
          { error: 'Method not found' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to retrieve method details' },
        { status: 500 }
      )
    }

    return NextResponse.json(result.value)

  } catch (error) {
    console.error('Method details API error:', error)
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