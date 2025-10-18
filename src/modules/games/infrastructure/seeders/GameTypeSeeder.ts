/**
 * Game Type Seeder - Games Module Infrastructure
 *
 * Seeds the database with default game types and configurations.
 * This ensures the platform has the basic game types available.
 */

import { PrismaClient } from '@prisma/client'
import { GameCategory } from '../../domain/entities/GameType'
import { createEuropeanRouletteConfig } from '../../domain/services/RouletteGameEngine'

export class GameTypeSeeder {
  constructor(private readonly prisma: PrismaClient) {}

  async seed(): Promise<void> {
    console.log('🎲 Seeding game types...')

    // European Roulette
    await this.createGameTypeIfNotExists({
      id: 'european_roulette',
      name: 'european_roulette',
      displayName: 'European Roulette',
      category: GameCategory.TABLE,
      config: createEuropeanRouletteConfig(),
      isActive: true,
      sortOrder: 1
    })

    // American Roulette (for future implementation)
    await this.createGameTypeIfNotExists({
      id: 'american_roulette',
      name: 'american_roulette',
      displayName: 'American Roulette',
      category: GameCategory.TABLE,
      config: {
        type: 'american' as const,
        numbers: [
          0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
          19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37 // 00 = 37
        ],
        redNumbers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
        blackNumbers: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
        greenNumbers: [0, 37], // 0 and 00
        payouts: {
          straight: 36,
          split: 18,
          street: 12,
          corner: 9,
          line: 6,
          dozen: 3,
          column: 3,
          even: 2,
          red: 2,
          low: 2
        },
        minBet: 1,
        maxBet: 1000,
        tableLimits: {
          inside: 100,
          outside: 500
        }
      },
      isActive: false, // Disabled for now
      sortOrder: 2
    })

    // Blackjack (placeholder for future implementation)
    await this.createGameTypeIfNotExists({
      id: 'blackjack',
      name: 'blackjack',
      displayName: 'Blackjack',
      category: GameCategory.CARD,
      config: {
        decks: 6,
        dealerStandsOn: 17,
        blackjackPayout: 1.5,
        doubleAfterSplit: true,
        surrenderAllowed: false,
        minBet: 5,
        maxBet: 500
      },
      isActive: false, // Disabled for now
      sortOrder: 3
    })

    console.log('✅ Game types seeded successfully')
  }

  private async createGameTypeIfNotExists(data: {
    id: string
    name: string
    displayName: string
    category: GameCategory
    config: any
    isActive: boolean
    sortOrder: number
  }): Promise<void> {
    const existing = await this.prisma.gameType.findUnique({
      where: { id: data.id }
    })

    if (!existing) {
      await this.prisma.gameType.create({
        data: {
          id: data.id,
          name: data.name,
          displayName: data.displayName,
          category: data.category,
          config: data.config,
          isActive: data.isActive,
          sortOrder: data.sortOrder,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log(`  ✓ Created game type: ${data.displayName}`)
    } else {
      console.log(`  → Game type already exists: ${data.displayName}`)
    }
  }

  /**
   * Removes all game types (for testing purposes)
   */
  async cleanup(): Promise<void> {
    console.log('🧹 Cleaning up game types...')
    await this.prisma.gameType.deleteMany()
    console.log('✅ Game types cleaned up')
  }
}

// Standalone seeder function
export async function seedGameTypes(prisma: PrismaClient): Promise<void> {
  const seeder = new GameTypeSeeder(prisma)
  await seeder.seed()
}