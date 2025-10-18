/**
 * Games API Route - Server-side endpoint for Games Module
 *
 * Provides REST API access to Games Module functionality
 * GET /api/games - Get all active game types
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { GamesContainer } from '@/modules/games'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'
    const category = searchParams.get('category')

    // Use Games Module use case
    const container = GamesContainer.getInstance(prisma)
    const useCase = container.getGameTypesUseCase

    const result = await useCase.execute({
      activeOnly,
      category: category as any
    })

    if (!result.isSuccess) {
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      )
    }

    // Transform domain entities to JSON-serializable format
    const gameTypesData = result.value.gameTypes.map(gameType => ({
      id: gameType.id.value,
      name: gameType.name,
      displayName: gameType.displayName,
      category: gameType.category,
      config: gameType.config,
      isActive: gameType.isActive,
      sortOrder: gameType.sortOrder,
      createdAt: gameType.createdAt.toISOString(),
      updatedAt: gameType.updatedAt.toISOString(),
      // Helper methods as computed properties
      minBet: gameType.getMinBet(),
      maxBet: gameType.getMaxBet(),
      isRouletteGame: gameType.isRouletteGame(),
      isBlackjackGame: gameType.isBlackjackGame()
    }))

    return NextResponse.json({
      success: true,
      data: {
        gameTypes: gameTypesData,
        total: result.value.total
      }
    })

  } catch (error) {
    console.error('Games API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: Implement game creation endpoint
    // This would use CreateGameTypeUseCase

    return NextResponse.json({
      success: false,
      error: 'Game creation not implemented yet'
    }, { status: 501 })

  } catch (error) {
    console.error('Games API POST error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    )
  }
}