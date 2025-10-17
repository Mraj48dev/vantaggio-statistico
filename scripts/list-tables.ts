#!/usr/bin/env tsx
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listTables() {
  try {
    console.log('🔍 Checking database tables in Neon...\n')

    const result = await prisma.$queryRaw<Array<{table_name: string}>>`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `

    console.log(`Found ${result.length} tables:`)
    result.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`)
    })

    if (result.length === 0) {
      console.log('\n❌ No tables found! Database might be empty.')
      console.log('This suggests the schema push did not work correctly.')
    } else {
      console.log('\n✅ Tables found in database!')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listTables()