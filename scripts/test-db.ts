#!/usr/bin/env tsx
/**
 * Database Connection Test Script
 *
 * This script tests the connection to Neon PostgreSQL database
 * and verifies that all tables were created correctly.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testDatabaseConnection() {
  console.log('🔄 Testing database connection...\n')

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...')
    await prisma.$connect()
    console.log('✅ Database connected successfully!\n')

    // Test 2: Count tables
    console.log('2️⃣ Checking database tables...')

    const tables = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `

    console.log(`✅ Found ${tables.length} tables:`)
    tables.forEach(table => console.log(`   📋 ${table.table_name}`))
    console.log()

    // Test 3: Test core tables exist
    console.log('3️⃣ Verifying core tables...')
    const expectedTables = [
      'users',
      'packages',
      'permissions',
      'package_permissions',
      'game_types',
      'methods',
      'method_game_types',
      'sessions',
      'bets',
      'subscriptions',
      'payments'
    ]

    const existingTableNames = tables.map(t => t.table_name)
    const missingTables = expectedTables.filter(table => !existingTableNames.includes(table))

    if (missingTables.length === 0) {
      console.log('✅ All core tables present!')
    } else {
      console.log('⚠️ Missing tables:', missingTables)
    }
    console.log()

    // Test 4: Test data insertion (packages)
    console.log('4️⃣ Testing data operations...')

    // Check if free package exists
    const freePackage = await prisma.package.findUnique({
      where: { id: 'free' }
    })

    if (!freePackage) {
      console.log('📦 Creating free package...')
      await prisma.package.create({
        data: {
          id: 'free',
          name: 'Free',
          displayName: 'Pacchetto Gratuito',
          description: 'Accesso al metodo Fibonacci e funzionalità base',
          price: 0,
          billingPeriod: 'monthly',
          limits: {
            maxConcurrentSessions: 1,
            maxDailyBets: 50,
            maxSessionDuration: 3600, // 1 hour
            analyticsRetention: 30, // 30 days
            exportFormats: ['json']
          },
          isActive: true,
          sortOrder: 1
        }
      })
      console.log('✅ Free package created!')
    } else {
      console.log('✅ Free package already exists!')
    }

    // Test 5: Performance check
    console.log('\n5️⃣ Performance test...')
    const start = Date.now()
    await prisma.package.findMany()
    const duration = Date.now() - start
    console.log(`✅ Query executed in ${duration}ms`)

    console.log('\n🎉 Database setup completed successfully!')
    console.log('\n📊 Summary:')
    console.log(`   • Database: Connected to Neon PostgreSQL`)
    console.log(`   • Tables: ${tables.length} created`)
    console.log(`   • Performance: ${duration}ms response time`)
    console.log(`   • Status: Ready for development! 🚀`)

  } catch (error) {
    console.error('❌ Database test failed:')
    console.error(error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the test
testDatabaseConnection()
  .catch((error) => {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  })