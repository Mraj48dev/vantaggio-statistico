/**
 * Seed script for Games Module
 * Run this to populate the database with default game types
 */

import { PrismaClient } from '@prisma/client'
import { GameTypeSeeder } from '../src/modules/games/infrastructure/seeders/GameTypeSeeder'

async function main() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

  try {
    console.log('🚀 Starting Games Module seeding...')

    const seeder = new GameTypeSeeder(prisma)
    await seeder.seed()

    console.log('✅ Games Module seeding completed successfully!')

    // Verify seeded data
    const gameTypes = await prisma.gameType.findMany({
      orderBy: { sortOrder: 'asc' }
    })

    console.log('\n📊 Seeded Game Types:')
    gameTypes.forEach(gt => {
      console.log(`  ${gt.isActive ? '✅' : '⚠️ '} ${gt.displayName} (${gt.id})`)
    })

  } catch (error) {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })