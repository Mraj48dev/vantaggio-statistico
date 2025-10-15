import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Seed data for Vantaggio Statistico casino platform
 *
 * This file initializes the database with:
 * - Default packages (Free, Premium)
 * - Permissions system
 * - Game types (starting with European Roulette)
 * - Betting methods (Fibonacci + premium strategies)
 * - Platform configuration
 */

async function main() {
  console.log('🌱 Starting seed process for Vantaggio Statistico...')

  // ================================
  // PERMISSIONS - Core permissions for the platform
  // ================================
  console.log('📋 Creating permissions...')

  const permissions = [
    // Game access permissions
    { id: 'access_game_roulette_classica', name: 'Accesso Roulette Europea', category: 'game', resourceType: 'game', resourceId: 'roulette_classica' },
    { id: 'access_game_roulette_americana', name: 'Accesso Roulette Americana', category: 'game', resourceType: 'game', resourceId: 'roulette_americana' },
    { id: 'access_game_blackjack', name: 'Accesso Blackjack', category: 'game', resourceType: 'game', resourceId: 'blackjack' },

    // Method access permissions
    { id: 'access_method_fibonacci', name: 'Metodo Fibonacci', category: 'method', resourceType: 'method', resourceId: 'fibonacci' },
    { id: 'access_method_martingale', name: 'Metodo Martingale', category: 'method', resourceType: 'method', resourceId: 'martingale' },
    { id: 'access_method_paroli', name: 'Metodo Paroli', category: 'method', resourceType: 'method', resourceId: 'paroli' },
    { id: 'access_method_dalembert', name: 'Metodo D\'Alembert', category: 'method', resourceType: 'method', resourceId: 'dalembert' },
    { id: 'access_method_labouchere', name: 'Metodo Labouchere', category: 'method', resourceType: 'method', resourceId: 'labouchere' },
    { id: 'access_method_james_bond', name: 'Strategia James Bond', category: 'method', resourceType: 'method', resourceId: 'james_bond' },

    // Platform features
    { id: 'access_analytics_basic', name: 'Analytics Base', category: 'feature', resourceType: 'analytics', resourceId: 'basic' },
    { id: 'access_analytics_advanced', name: 'Analytics Avanzati', category: 'feature', resourceType: 'analytics', resourceId: 'advanced' },
    { id: 'access_multiple_sessions', name: 'Sessioni Multiple', category: 'feature', resourceType: 'sessions', resourceId: 'multiple' },
    { id: 'access_export_data', name: 'Esportazione Dati', category: 'feature', resourceType: 'export', resourceId: 'data' },

    // Admin permissions
    { id: 'admin_users_manage', name: 'Gestione Utenti', category: 'admin', resourceType: 'users', resourceId: 'manage' },
    { id: 'admin_platform_stats', name: 'Statistiche Piattaforma', category: 'admin', resourceType: 'stats', resourceId: 'platform' },
    { id: 'admin_content_manage', name: 'Gestione Contenuti', category: 'admin', resourceType: 'content', resourceId: 'manage' },
  ]

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { id: permission.id },
      update: {},
      create: permission,
    })
  }

  // ================================
  // PACKAGES - Free and Premium tiers
  // ================================
  console.log('📦 Creating packages...')

  const freePackage = await prisma.package.upsert({
    where: { id: 'free' },
    update: {},
    create: {
      id: 'free',
      name: 'free',
      displayName: 'Piano Gratuito',
      description: 'Accesso base alla piattaforma con il metodo Fibonacci per la Roulette Europea',
      price: 0,
      billingPeriod: 'monthly',
      limits: {
        maxConcurrentSessions: 1,
        maxDailyBets: 50,
        maxSessionDuration: 7200, // 2 hours in seconds
        analyticsRetention: 30, // days
        exportFormats: ['csv'],
      },
      isActive: true,
      sortOrder: 1,
    },
  })

  const premiumPackage = await prisma.package.upsert({
    where: { id: 'premium' },
    update: {},
    create: {
      id: 'premium',
      name: 'premium',
      displayName: 'Piano Premium',
      description: 'Accesso completo a tutti i metodi, giochi e funzionalità avanzate',
      price: 2999, // €29.99 in cents
      billingPeriod: 'monthly',
      limits: {
        maxConcurrentSessions: 5,
        maxDailyBets: 1000,
        maxSessionDuration: 28800, // 8 hours in seconds
        analyticsRetention: 365, // days
        exportFormats: ['csv', 'xlsx', 'pdf'],
      },
      isActive: true,
      sortOrder: 2,
    },
  })

  const premiumYearlyPackage = await prisma.package.upsert({
    where: { id: 'premium_yearly' },
    update: {},
    create: {
      id: 'premium_yearly',
      name: 'premium_yearly',
      displayName: 'Piano Premium Annuale',
      description: 'Piano premium con fatturazione annuale (2 mesi gratis)',
      price: 29999, // €299.99 in cents (instead of €359.88)
      billingPeriod: 'yearly',
      limits: {
        maxConcurrentSessions: 5,
        maxDailyBets: 1000,
        maxSessionDuration: 28800,
        analyticsRetention: 365,
        exportFormats: ['csv', 'xlsx', 'pdf'],
      },
      isActive: true,
      sortOrder: 3,
    },
  })

  // ================================
  // PACKAGE PERMISSIONS - Assign permissions to packages
  // ================================
  console.log('🔑 Assigning permissions to packages...')

  // Free package permissions
  const freePermissions = [
    'access_game_roulette_classica',
    'access_method_fibonacci',
    'access_analytics_basic',
  ]

  for (const permissionId of freePermissions) {
    await prisma.packagePermission.upsert({
      where: {
        packageId_permissionId: {
          packageId: 'free',
          permissionId,
        },
      },
      update: {},
      create: {
        packageId: 'free',
        permissionId,
      },
    })
  }

  // Premium package permissions (all permissions)
  const allPermissionIds = permissions.map(p => p.id)

  for (const permissionId of allPermissionIds) {
    await prisma.packagePermission.upsert({
      where: {
        packageId_permissionId: {
          packageId: 'premium',
          permissionId,
        },
      },
      update: {},
      create: {
        packageId: 'premium',
        permissionId,
      },
    })

    await prisma.packagePermission.upsert({
      where: {
        packageId_permissionId: {
          packageId: 'premium_yearly',
          permissionId,
        },
      },
      update: {},
      create: {
        packageId: 'premium_yearly',
        permissionId,
      },
    })
  }

  // ================================
  // GAME TYPES - Starting with European Roulette
  // ================================
  console.log('🎰 Creating game types...')

  const rouletteClassica = await prisma.gameType.upsert({
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

  // ================================
  // BETTING METHODS - Fibonacci + Premium strategies
  // ================================
  console.log('🎯 Creating betting methods...')

  const fibonacciMethod = await prisma.method.upsert({
    where: { id: 'fibonacci' },
    update: {},
    create: {
      id: 'fibonacci',
      name: 'fibonacci',
      displayName: 'Metodo Fibonacci',
      description: 'Sistema di progressione basato sulla sequenza di Fibonacci. Aumenta la puntata seguendo la sequenza dopo ogni perdita, torna indietro di 2 posizioni dopo ogni vincita.',
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
      isActive: true,
      sortOrder: 1,
    },
  })

  const martingaleMethod = await prisma.method.upsert({
    where: { id: 'martingale' },
    update: {},
    create: {
      id: 'martingale',
      name: 'martingale',
      displayName: 'Metodo Martingale',
      description: 'Sistema classico di raddoppio: raddoppia la puntata dopo ogni perdita, torna alla puntata base dopo ogni vincita.',
      category: 'progression',
      requiredPackage: 'premium',
      configSchema: {
        type: 'object',
        properties: {
          baseAmount: { type: 'integer', minimum: 100, maximum: 10000 },
          stopLoss: { type: 'integer', minimum: 500, maximum: 100000 },
          stopWin: { type: 'integer', minimum: 500, maximum: 100000 },
          maxDoubles: { type: 'integer', minimum: 5, maximum: 12, default: 8 },
        },
        required: ['baseAmount', 'stopLoss'],
      },
      defaultConfig: {
        baseAmount: 500,
        stopLoss: 10000,
        stopWin: 5000,
        maxDoubles: 8,
      },
      algorithm: 'Double bet after loss, reset to base after win. High risk, high reward strategy.',
      isActive: true,
      sortOrder: 2,
    },
  })

  const paroliMethod = await prisma.method.upsert({
    where: { id: 'paroli' },
    update: {},
    create: {
      id: 'paroli',
      name: 'paroli',
      displayName: 'Metodo Paroli',
      description: 'Sistema di progressione positiva: raddoppia la puntata dopo ogni vincita per un numero limitato di volte.',
      category: 'progression',
      requiredPackage: 'premium',
      configSchema: {
        type: 'object',
        properties: {
          baseAmount: { type: 'integer', minimum: 100, maximum: 10000 },
          stopLoss: { type: 'integer', minimum: 500, maximum: 100000 },
          stopWin: { type: 'integer', minimum: 500, maximum: 100000 },
          maxWins: { type: 'integer', minimum: 2, maximum: 5, default: 3 },
        },
        required: ['baseAmount', 'stopLoss'],
      },
      defaultConfig: {
        baseAmount: 500,
        stopLoss: 5000,
        stopWin: 10000,
        maxWins: 3,
      },
      algorithm: 'Double bet after win, reset after loss or max wins reached. Conservative positive progression.',
      isActive: true,
      sortOrder: 3,
    },
  })

  // ================================
  // METHOD-GAME ASSOCIATIONS
  // ================================
  console.log('🔗 Linking methods to game types...')

  const methods = [fibonacciMethod, martingaleMethod, paroliMethod]
  const gameTypes = [rouletteClassica]

  for (const method of methods) {
    for (const gameType of gameTypes) {
      await prisma.methodGameType.upsert({
        where: {
          methodId_gameTypeId: {
            methodId: method.id,
            gameTypeId: gameType.id,
          },
        },
        update: {},
        create: {
          methodId: method.id,
          gameTypeId: gameType.id,
        },
      })
    }
  }

  console.log('✅ Seed completed successfully!')
  console.log(`
📊 Summary:
   - ${permissions.length} permissions created
   - 3 packages created (free, premium monthly, premium yearly)
   - 1 game type created (European Roulette)
   - 3 betting methods created (Fibonacci, Martingale, Paroli)
   - All associations established

🚀 Your Vantaggio Statistico platform is ready for development!
  `)
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