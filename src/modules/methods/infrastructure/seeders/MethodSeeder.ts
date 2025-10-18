/**
 * Method Seeder - Methods Module Infrastructure Layer
 *
 * Seeds the database with default betting methods.
 */

import { PrismaClient } from '@prisma/client'
import { Result } from '@/shared/domain/types/common'

export interface MethodSeeder {
  seed(): Promise<Result<void, MethodSeederError>>
  seedFibonacci(): Promise<Result<void, MethodSeederError>>
}

export class DefaultMethodSeeder implements MethodSeeder {
  constructor(private readonly prisma: PrismaClient) {}

  async seed(): Promise<Result<void, MethodSeederError>> {
    try {
      console.log('🌱 Seeding betting methods...')

      // Seed Fibonacci method
      const fibonacciResult = await this.seedFibonacci()
      if (!fibonacciResult.isSuccess) {
        return Result.failure(fibonacciResult.error)
      }

      // TODO: Add other methods here when implemented
      // await this.seedMartingale()
      // await this.seedParoli()
      // await this.seedDAlembert()

      console.log('✅ Methods seeded successfully')
      return Result.success(undefined)
    } catch (error) {
      return Result.failure(new MethodSeederError(
        'Failed to seed methods',
        MethodSeederErrorCode.SEED_FAILED,
        error as Error
      ))
    }
  }

  async seedFibonacci(): Promise<Result<void, MethodSeederError>> {
    try {
      console.log('🎯 Seeding Fibonacci method...')

      const fibonacciMethod = {
        id: 'fibonacci',
        name: 'fibonacci',
        displayName: 'Metodo Fibonacci',
        description: 'Sistema di progressione basato sulla sequenza di Fibonacci. Ideale per principianti che vogliono un approccio metodico al betting.',
        category: 'progressive',
        requiredPackage: 'free',
        configSchema: {
          compatibleGames: ['european_roulette', 'american_roulette'],
          requiredFields: ['baseBet', 'stopLoss'],
          fields: {
            baseBet: {
              type: 'number',
              label: 'Puntata Base',
              description: 'Importo della puntata base in euro. Questo sarà moltiplicato per i numeri della sequenza di Fibonacci.',
              min: 1,
              max: 1000,
              default: 10,
              placeholder: '10'
            },
            stopLoss: {
              type: 'number',
              label: 'Stop Loss',
              description: 'Perdita massima accettabile in euro. La sessione si fermerà automaticamente se si raggiunge questo limite.',
              min: 10,
              max: 10000,
              default: 100,
              placeholder: '100'
            }
          }
        },
        defaultConfig: {
          baseBet: 10,
          stopLoss: 100
        },
        algorithm: 'fibonacci_progression_first_column',
        isActive: true,
        sortOrder: 1
      }

      // Use upsert to avoid duplicate key errors
      await this.prisma.method.upsert({
        where: { id: fibonacciMethod.id },
        update: fibonacciMethod,
        create: fibonacciMethod
      })

      // Create method-game type associations
      await this.prisma.methodGameType.upsert({
        where: {
          methodId_gameTypeId: {
            methodId: 'fibonacci',
            gameTypeId: 'european_roulette'
          }
        },
        update: {},
        create: {
          methodId: 'fibonacci',
          gameTypeId: 'european_roulette'
        }
      })

      console.log('✅ Fibonacci method seeded successfully')
      return Result.success(undefined)
    } catch (error) {
      return Result.failure(new MethodSeederError(
        'Failed to seed Fibonacci method',
        MethodSeederErrorCode.FIBONACCI_SEED_FAILED,
        error as Error
      ))
    }
  }

  // Future methods can be added here
  private async seedMartingale(): Promise<Result<void, MethodSeederError>> {
    // TODO: Implement when Martingale method is ready
    return Result.success(undefined)
  }

  private async seedParoli(): Promise<Result<void, MethodSeederError>> {
    // TODO: Implement when Paroli method is ready
    return Result.success(undefined)
  }

  private async seedDAlembert(): Promise<Result<void, MethodSeederError>> {
    // TODO: Implement when D'Alembert method is ready
    return Result.success(undefined)
  }
}

export class MethodSeederError extends Error {
  constructor(
    message: string,
    public readonly code: MethodSeederErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'MethodSeederError'
  }
}

export enum MethodSeederErrorCode {
  SEED_FAILED = 'SEED_FAILED',
  FIBONACCI_SEED_FAILED = 'FIBONACCI_SEED_FAILED',
  DATABASE_ERROR = 'DATABASE_ERROR'
}