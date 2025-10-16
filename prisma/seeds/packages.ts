/**
 * Package Seed Data - Default Packages and Permissions
 *
 * Creates the default Free and Premium packages as specified in the roadmap.
 * This follows the exact specification from the Week 3 requirements.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedPackages() {
  console.log('🎁 Seeding packages and permissions...')

  // Create permissions first
  const permissions = await createPermissions()
  console.log(`✅ Created ${permissions.length} permissions`)

  // Create packages
  const packages = await createPackages()
  console.log(`✅ Created ${packages.length} packages`)

  // Link permissions to packages
  await linkPermissionsToPackages()
  console.log('✅ Linked permissions to packages')

  console.log('🎉 Package seeding completed!')
}

async function createPermissions() {
  const permissions = [
    // Game permissions
    {
      id: 'access_game_roulette_classica',
      name: 'access',
      category: 'games',
      resourceType: 'game',
      resourceId: 'roulette_classica',
      description: 'Access to European Roulette game'
    },
    {
      id: 'access_all_games',
      name: 'access_all',
      category: 'games',
      description: 'Access to all casino games'
    },

    // Method permissions - Free tier
    {
      id: 'access_method_fibonacci',
      name: 'access',
      category: 'methods',
      resourceType: 'method',
      resourceId: 'fibonacci',
      description: 'Access to Fibonacci betting method'
    },

    // Method permissions - Premium tier
    {
      id: 'access_method_martingale',
      name: 'access',
      category: 'methods',
      resourceType: 'method',
      resourceId: 'martingale',
      description: 'Access to Martingale betting method'
    },
    {
      id: 'access_method_paroli',
      name: 'access',
      category: 'methods',
      resourceType: 'method',
      resourceId: 'paroli',
      description: 'Access to Paroli betting method'
    },
    {
      id: 'access_method_dalembert',
      name: 'access',
      category: 'methods',
      resourceType: 'method',
      resourceId: 'dalembert',
      description: 'Access to D\'Alembert betting method'
    },
    {
      id: 'access_method_labouchere',
      name: 'access',
      category: 'methods',
      resourceType: 'method',
      resourceId: 'labouchere',
      description: 'Access to Labouchere betting method'
    },
    {
      id: 'access_all_methods',
      name: 'access_all',
      category: 'methods',
      description: 'Access to all betting methods'
    },

    // Analytics permissions
    {
      id: 'analytics_basic_stats',
      name: 'view_basic',
      category: 'analytics',
      description: 'View basic session statistics'
    },
    {
      id: 'analytics_advanced_stats',
      name: 'view_advanced',
      category: 'analytics',
      description: 'View advanced analytics and reports'
    },
    {
      id: 'analytics_export_data',
      name: 'export_data',
      category: 'analytics',
      description: 'Export analytics data in various formats'
    },

    // Session permissions
    {
      id: 'sessions_create',
      name: 'create',
      category: 'sessions',
      description: 'Create gaming sessions'
    },
    {
      id: 'sessions_unlimited',
      name: 'unlimited',
      category: 'sessions',
      description: 'Create unlimited concurrent sessions'
    },
    {
      id: 'sessions_extended_duration',
      name: 'extended_duration',
      category: 'sessions',
      description: 'Extended session duration limits'
    }
  ]

  // Use upsert to avoid conflicts
  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { id: permission.id },
      update: permission,
      create: permission
    })
  }

  return permissions
}

async function createPackages() {
  const packages = [
    // FREE PACKAGE - As specified in roadmap
    {
      id: 'free',
      name: 'free',
      displayName: 'Piano Gratuito',
      description: 'Accesso limitato alla piattaforma con le funzionalità essenziali',
      price: 0, // Free
      billingPeriod: 'free',
      limits: {
        maxConcurrentSessions: 1,
        maxDailyBets: 50,
        maxSessionDuration: 3600, // 1 hour
        analyticsRetention: 30, // 30 days
        exportFormats: ['csv']
      },
      isActive: true,
      sortOrder: 1
    },

    // PREMIUM PACKAGE - As specified in roadmap
    {
      id: 'premium',
      name: 'premium',
      displayName: 'Piano Premium',
      description: 'Accesso completo a tutti i metodi di betting e funzionalità avanzate',
      price: 2900, // €29.00 per month
      billingPeriod: 'monthly',
      limits: {
        maxConcurrentSessions: 3,
        maxDailyBets: 500,
        maxSessionDuration: 14400, // 4 hours
        analyticsRetention: 365, // 1 year
        exportFormats: ['csv', 'json', 'pdf', 'excel']
      },
      isActive: true,
      sortOrder: 2
    },

    // PREMIUM YEARLY - Better value option
    {
      id: 'premium_yearly',
      name: 'premium_yearly',
      displayName: 'Piano Premium Annuale',
      description: 'Piano premium con fatturazione annuale - 2 mesi gratuiti',
      price: 29000, // €290.00 per year (equivalent to 10 months)
      billingPeriod: 'yearly',
      limits: {
        maxConcurrentSessions: 3,
        maxDailyBets: 500,
        maxSessionDuration: 14400, // 4 hours
        analyticsRetention: 365, // 1 year
        exportFormats: ['csv', 'json', 'pdf', 'excel']
      },
      isActive: true,
      sortOrder: 3
    }
  ]

  // Use upsert to avoid conflicts
  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { id: pkg.id },
      update: pkg,
      create: pkg
    })
  }

  return packages
}

async function linkPermissionsToPackages() {
  // FREE PACKAGE PERMISSIONS
  const freePermissions = [
    'access_game_roulette_classica',
    'access_method_fibonacci',
    'analytics_basic_stats',
    'sessions_create'
  ]

  for (const permissionId of freePermissions) {
    await prisma.packagePermission.upsert({
      where: {
        packageId_permissionId: {
          packageId: 'free',
          permissionId
        }
      },
      update: {},
      create: {
        packageId: 'free',
        permissionId
      }
    })
  }

  // PREMIUM PACKAGE PERMISSIONS (both monthly and yearly)
  const premiumPermissions = [
    'access_all_games',
    'access_all_methods',
    'access_method_fibonacci',
    'access_method_martingale',
    'access_method_paroli',
    'access_method_dalembert',
    'access_method_labouchere',
    'analytics_basic_stats',
    'analytics_advanced_stats',
    'analytics_export_data',
    'sessions_create',
    'sessions_unlimited',
    'sessions_extended_duration'
  ]

  for (const packageId of ['premium', 'premium_yearly']) {
    for (const permissionId of premiumPermissions) {
      await prisma.packagePermission.upsert({
        where: {
          packageId_permissionId: {
            packageId,
            permissionId
          }
        },
        update: {},
        create: {
          packageId,
          permissionId
        }
      })
    }
  }
}

// Run seeding if called directly
if (require.main === module) {
  seedPackages()
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}