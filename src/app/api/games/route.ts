/**
 * Games API Route - Server-side endpoint for Games Module
 *
 * Provides REST API access to Games Module functionality
 * GET /api/games - Get all active game types
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET(request: NextRequest) {
  let prisma: PrismaClient | null = null

  try {
    // Create PrismaClient per request to avoid memory leaks
    prisma = new PrismaClient()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'
    const category = searchParams.get('category')

    // Direct Prisma query (bypass Games Module for now to avoid import issues)
    const where: any = {}
    if (activeOnly) {
      where.isActive = true
    }
    if (category) {
      where.category = category
    }

    const gameTypes = await prisma.gameType.findMany({
      where,
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    })

    // Transform to expected format
    const gameTypesData = gameTypes.map(gameType => {
      const config = gameType.config as any
      const isRouletteGame = gameType.category === 'table' && config?.numbers
      const isBlackjackGame = gameType.category === 'card' && config?.decks

      return {
        id: gameType.id,
        name: gameType.name,
        displayName: gameType.displayName,
        category: gameType.category,
        config: gameType.config,
        isActive: gameType.isActive,
        sortOrder: gameType.sortOrder,
        createdAt: gameType.createdAt.toISOString(),
        updatedAt: gameType.updatedAt.toISOString(),
        // Helper computed properties
        minBet: config?.minBet || 0,
        maxBet: config?.maxBet || 0,
        isRouletteGame,
        isBlackjackGame
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        gameTypes: gameTypesData,
        total: gameTypesData.length
      }
    })

  } catch (error) {
    console.error('Games API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  } finally {
    // Always disconnect to prevent memory leaks
    if (prisma) {
      await prisma.$disconnect()
    }
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