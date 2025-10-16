/**
 * Database Seed Script - Vantaggio Statistico Platform
 *
 * Populates the database with initial data needed for development and testing.
 * This includes packages, permissions, game types, and methods.
 */

import { PrismaClient } from '@prisma/client'
import { seedPackages } from './seeds/packages'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding for Vantaggio Statistico...')

  try {
    // Seed packages and permissions (following roadmap specification)
    await seedPackages()

    // Seed game types
    await seedGameTypes()

    // Seed betting methods
    await seedMethods()

    console.log('✅ All seeding completed successfully!')
    console.log(`
📊 Platform ready with:
   - FREE Package: Fibonacci + Roulette Europea (max 1 session, 50 bets/day)
   - PREMIUM Package: All methods + unlimited access
   - European Roulette game engine
   - Fibonacci, Martingale, Paroli methods

🚀 Vantaggio Statistico is ready for Week 4 development!
    `)
  } catch (error) {
    console.error('❌ Seeding failed:', error)
    throw error
  }
}

async function seedGameTypes() {
  console.log('🎰 Creating game types...')

  await prisma.gameType.upsert({
    where: { id: 'roulette_classica' },
    update: {},
    create: {
      id: 'roulette_classica',
      name: 'roulette_classica',
      displayName: 'Roulette Europea',
      category: 'table',
      config: {
        type: 'european',
        numbers: Array.from({ length: 37 }, (_, i) => i), // 0-36
        colors: {
          0: 'green',
          1: 'red', 2: 'black', 3: 'red', 4: 'black', 5: 'red', 6: 'black',
          7: 'red', 8: 'black', 9: 'red', 10: 'black', 11: 'black', 12: 'red',
          13: 'black', 14: 'red', 15: 'black', 16: 'red', 17: 'black', 18: 'red',
          19: 'red', 20: 'black', 21: 'red', 22: 'black', 23: 'red', 24: 'black',
          25: 'red', 26: 'black', 27: 'red', 28: 'black', 29: 'black', 30: 'red',
          31: 'black', 32: 'red', 33: 'black', 34: 'red', 35: 'black', 36: 'red',
        },
        bets: {
          'red': { payout: 2, probability: 18/37 },
          'black': { payout: 2, probability: 18/37 },
          'even': { payout: 2, probability: 18/37 },
          'odd': { payout: 2, probability: 18/37 },
          'high': { payout: 2, probability: 18/37 }, // 19-36
          'low': { payout: 2, probability: 18/37 }, // 1-18
          'number': { payout: 36, probability: 1/37 },
        },
        minBet: 100, // €1.00 in cents
        maxBet: 100000, // €1000.00 in cents
      },
      isActive: true,
      sortOrder: 1,
    },
  })
}

async function seedMethods() {
  console.log('🎯 Creating betting methods...')

  const methods = [
    {
      id: 'fibonacci',
      name: 'fibonacci',
      displayName: 'Metodo Fibonacci',
      description: 'Sistema di progressione basato sulla sequenza di Fibonacci. Aumenta la puntata seguendo la sequenza dopo ogni perdita.',
      category: 'progression',
      requiredPackage: 'free',
      configSchema: {
        type: 'object',
        properties: {
          baseAmount: { type: 'integer', minimum: 100, maximum: 10000 },
          stopLoss: { type: 'integer', minimum: 500, maximum: 100000 },
          stopWin: { type: 'integer', minimum: 500, maximum: 100000 },
          maxSequenceLength: { type: 'integer', minimum: 10, maximum: 20, default: 15 },
        },
        required: ['baseAmount', 'stopLoss'],
      },
      defaultConfig: {
        baseAmount: 500, // €5.00
        stopLoss: 5000, // €50.00
        stopWin: 10000, // €100.00
        maxSequenceLength: 15,
      },
      algorithm: 'Fibonacci sequence: 1,1,2,3,5,8,13,21,34,55... On loss: advance sequence. On win: go back 2 positions.',
      sortOrder: 1,
    },
    {
      id: 'martingale',
      name: 'martingale',
      displayName: 'Metodo Martingale',
      description: 'Sistema classico di raddoppio: raddoppia la puntata dopo ogni perdita.',
      category: 'progression',
      requiredPackage: 'premium',
      configSchema: {
        type: 'object',
        properties: {
          baseAmount: { type: 'integer', minimum: 100, maximum: 10000 },
          stopLoss: { type: 'integer', minimum: 500, maximum: 100000 },
          maxDoubles: { type: 'integer', minimum: 5, maximum: 12, default: 8 },
        },
        required: ['baseAmount', 'stopLoss'],
      },
      defaultConfig: {
        baseAmount: 500,
        stopLoss: 10000,
        maxDoubles: 8,
      },
      algorithm: 'Double bet after loss, reset to base after win.',
      sortOrder: 2,
    },
    {
      id: 'paroli',
      name: 'paroli',
      displayName: 'Metodo Paroli',
      description: 'Sistema di progressione positiva: raddoppia dopo ogni vincita.',
      category: 'progression',
      requiredPackage: 'premium',
      configSchema: {
        type: 'object',
        properties: {
          baseAmount: { type: 'integer', minimum: 100, maximum: 10000 },
          stopLoss: { type: 'integer', minimum: 500, maximum: 100000 },
          maxWins: { type: 'integer', minimum: 2, maximum: 5, default: 3 },
        },
        required: ['baseAmount', 'stopLoss'],
      },
      defaultConfig: {
        baseAmount: 500,
        stopLoss: 5000,
        maxWins: 3,
      },
      algorithm: 'Double bet after win, reset after loss or max wins reached.',
      sortOrder: 3,
    }
  ]

  // Create methods
  for (const method of methods) {
    await prisma.method.upsert({
      where: { id: method.id },
      update: {},
      create: method,
    })

    // Link to European Roulette
    await prisma.methodGameType.upsert({
      where: {
        methodId_gameTypeId: {
          methodId: method.id,
          gameTypeId: 'roulette_classica',
        },
      },
      update: {},
      create: {
        methodId: method.id,
        gameTypeId: 'roulette_classica',
      },
    })
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })