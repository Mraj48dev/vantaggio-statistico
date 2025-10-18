#!/usr/bin/env tsx

/**
 * Seed Methods Script
 *
 * Seeds the database with betting methods data.
 * Run with: npm run methods:seed
 */

import { PrismaClient } from '@prisma/client'
import { MethodsContainer } from '../src/modules/methods'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🚀 Starting Methods seeding...')

    // Initialize container
    const methodsContainer = MethodsContainer.getInstance(prisma)
    const methodSeeder = methodsContainer.getMethodSeeder()

    // Seed methods
    const result = await methodSeeder.seed()

    if (!result.isSuccess) {
      console.error('❌ Failed to seed methods:', result.error.message)
      process.exit(1)
    }

    console.log('✅ Methods seeding completed successfully!')

    // Verify seeded data
    const methods = await prisma.method.findMany({
      orderBy: { sortOrder: 'asc' }
    })

    console.log(`📊 Total methods in database: ${methods.length}`)
    methods.forEach(method => {
      console.log(`  - ${method.displayName} (${method.id}) - ${method.category} - ${method.requiredPackage}`)
    })

  } catch (error) {
    console.error('💥 Unexpected error during seeding:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()