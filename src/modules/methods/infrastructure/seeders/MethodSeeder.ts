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
  seedFibonacciAdvanced(): Promise<Result<void, MethodSeederError>>
  seedFibonacciInverse(): Promise<Result<void, MethodSeederError>>
  seedMartingale(): Promise<Result<void, MethodSeederError>>
  seedParoli(): Promise<Result<void, MethodSeederError>>
  seedDAlembert(): Promise<Result<void, MethodSeederError>>
  seedLabouchere(): Promise<Result<void, MethodSeederError>>
  seedJamesBond(): Promise<Result<void, MethodSeederError>>
}

export class DefaultMethodSeeder implements MethodSeeder {
  constructor(private readonly prisma: PrismaClient) {}

  async seed(): Promise<Result<void, MethodSeederError>> {
    try {
      console.log('🌱 Seeding betting methods...')

      // Seed all methods
      const methods = [
        this.seedFibonacci(),
        this.seedFibonacciAdvanced(),
        this.seedFibonacciInverse(),
        this.seedMartingale(),
        this.seedParoli(),
        this.seedDAlembert(),
        this.seedLabouchere(),
        this.seedJamesBond()
      ]

      for (const methodPromise of methods) {
        const result = await methodPromise
        if (!result.isSuccess) {
          return Result.failure(result.error)
        }
      }

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

  async seedFibonacciAdvanced(): Promise<Result<void, MethodSeederError>> {
    try {
      console.log('🎯 Seeding Fibonacci Advanced method...')

      const method = {
        id: 'fibonacci_advanced',
        name: 'fibonacci_advanced',
        displayName: 'Fibonacci Avanzato',
        description: 'Sistema Fibonacci con scelta personalizzabile tra colonne e dozzine per maggiore flessibilità strategica.',
        category: 'progressive',
        requiredPackage: 'premium',
        configSchema: {
          compatibleGames: ['european_roulette', 'american_roulette'],
          requiredFields: ['baseBet', 'stopLoss', 'betTarget'],
          fields: {
            baseBet: {
              type: 'number',
              label: 'Puntata Base',
              description: 'Importo della puntata base in euro',
              min: 1,
              max: 1000,
              default: 10,
              placeholder: '10'
            },
            stopLoss: {
              type: 'number',
              label: 'Stop Loss',
              description: 'Perdita massima accettabile in euro',
              min: 10,
              max: 10000,
              default: 100,
              placeholder: '100'
            },
            betTarget: {
              type: 'select',
              label: 'Target di Puntata',
              description: 'Scegli dove puntare: colonne o dozzine',
              options: [
                { value: 'column_1', label: '1ª Colonna (1,4,7,10,13,16,19,22,25,28,31,34)' },
                { value: 'column_2', label: '2ª Colonna (2,5,8,11,14,17,20,23,26,29,32,35)' },
                { value: 'column_3', label: '3ª Colonna (3,6,9,12,15,18,21,24,27,30,33,36)' },
                { value: 'dozen_1', label: '1ª Dozzina (1-12)' },
                { value: 'dozen_2', label: '2ª Dozzina (13-24)' },
                { value: 'dozen_3', label: '3ª Dozzina (25-36)' }
              ],
              default: 'column_1'
            }
          }
        },
        defaultConfig: {
          baseBet: 10,
          stopLoss: 100,
          betTarget: 'column_1'
        },
        algorithm: 'fibonacci_advanced_customizable',
        isActive: true,
        sortOrder: 2
      }

      await this.prisma.method.upsert({
        where: { id: method.id },
        update: method,
        create: method
      })

      await this.prisma.methodGameType.upsert({
        where: {
          methodId_gameTypeId: {
            methodId: 'fibonacci_advanced',
            gameTypeId: 'european_roulette'
          }
        },
        update: {},
        create: {
          methodId: 'fibonacci_advanced',
          gameTypeId: 'european_roulette'
        }
      })

      console.log('✅ Fibonacci Advanced method seeded successfully')
      return Result.success(undefined)
    } catch (error) {
      return Result.failure(new MethodSeederError(
        'Failed to seed Fibonacci Advanced method',
        MethodSeederErrorCode.SEED_FAILED,
        error as Error
      ))
    }
  }

  async seedFibonacciInverse(): Promise<Result<void, MethodSeederError>> {
    try {
      console.log('🎯 Seeding Fibonacci Inverse method...')

      const method = {
        id: 'fibonacci_inverse',
        name: 'fibonacci_inverse',
        displayName: 'Fibonacci Inverso',
        description: 'Fibonacci modificato che scende sempre di 2 posizioni dopo ogni vincita per un approccio più conservativo.',
        category: 'progressive',
        requiredPackage: 'premium',
        configSchema: {
          compatibleGames: ['european_roulette', 'american_roulette'],
          requiredFields: ['baseBet', 'stopLoss', 'betTarget'],
          fields: {
            baseBet: {
              type: 'number',
              label: 'Puntata Base',
              description: 'Importo della puntata base in euro',
              min: 1,
              max: 1000,
              default: 10,
              placeholder: '10'
            },
            stopLoss: {
              type: 'number',
              label: 'Stop Loss',
              description: 'Perdita massima accettabile in euro',
              min: 10,
              max: 10000,
              default: 100,
              placeholder: '100'
            },
            betTarget: {
              type: 'select',
              label: 'Target di Puntata',
              description: 'Scegli dove puntare: colonne o dozzine',
              options: [
                { value: 'column_1', label: '1ª Colonna (1,4,7,10,13,16,19,22,25,28,31,34)' },
                { value: 'column_2', label: '2ª Colonna (2,5,8,11,14,17,20,23,26,29,32,35)' },
                { value: 'column_3', label: '3ª Colonna (3,6,9,12,15,18,21,24,27,30,33,36)' },
                { value: 'dozen_1', label: '1ª Dozzina (1-12)' },
                { value: 'dozen_2', label: '2ª Dozzina (13-24)' },
                { value: 'dozen_3', label: '3ª Dozzina (25-36)' }
              ],
              default: 'column_1'
            }
          }
        },
        defaultConfig: {
          baseBet: 10,
          stopLoss: 100,
          betTarget: 'column_1'
        },
        algorithm: 'fibonacci_inverse_two_step_back',
        isActive: true,
        sortOrder: 3
      }

      await this.prisma.method.upsert({
        where: { id: method.id },
        update: method,
        create: method
      })

      await this.prisma.methodGameType.upsert({
        where: {
          methodId_gameTypeId: {
            methodId: 'fibonacci_inverse',
            gameTypeId: 'european_roulette'
          }
        },
        update: {},
        create: {
          methodId: 'fibonacci_inverse',
          gameTypeId: 'european_roulette'
        }
      })

      console.log('✅ Fibonacci Inverse method seeded successfully')
      return Result.success(undefined)
    } catch (error) {
      return Result.failure(new MethodSeederError(
        'Failed to seed Fibonacci Inverse method',
        MethodSeederErrorCode.SEED_FAILED,
        error as Error
      ))
    }
  }

  async seedMartingale(): Promise<Result<void, MethodSeederError>> {
    try {
      console.log('🎯 Seeding Martingale method...')

      const method = {
        id: 'martingale',
        name: 'martingale',
        displayName: 'Martingale',
        description: 'Sistema classico aggressivo: raddoppia su perdita, torna alla base su vincita. Alto rischio, alto potenziale.',
        category: 'progressive',
        requiredPackage: 'premium',
        configSchema: {
          compatibleGames: ['european_roulette', 'american_roulette'],
          requiredFields: ['baseBet', 'stopLoss', 'betTarget', 'maxDoubleCount'],
          fields: {
            baseBet: {
              type: 'number',
              label: 'Puntata Base',
              description: 'Importo della puntata base in euro',
              min: 1,
              max: 1000,
              default: 10,
              placeholder: '10'
            },
            stopLoss: {
              type: 'number',
              label: 'Stop Loss',
              description: 'Perdita massima accettabile in euro',
              min: 50,
              max: 50000,
              default: 500,
              placeholder: '500'
            },
            betTarget: {
              type: 'select',
              label: 'Tipo di Puntata',
              description: 'Scegli il tipo di puntata even-money (50/50)',
              options: [
                { value: 'red', label: 'Rosso (Paga 1:1)' },
                { value: 'black', label: 'Nero (Paga 1:1)' },
                { value: 'even', label: 'Pari (Paga 1:1)' },
                { value: 'odd', label: 'Dispari (Paga 1:1)' },
                { value: 'high', label: 'Alto 19-36 (Paga 1:1)' },
                { value: 'low', label: 'Basso 1-18 (Paga 1:1)' }
              ],
              default: 'red'
            },
            maxDoubleCount: {
              type: 'number',
              label: 'Massimo Raddoppi',
              description: 'Numero massimo di raddoppi consecutivi (protezione)',
              min: 3,
              max: 12,
              default: 8,
              placeholder: '8'
            }
          }
        },
        defaultConfig: {
          baseBet: 10,
          stopLoss: 500,
          betTarget: 'red',
          maxDoubleCount: 8
        },
        algorithm: 'martingale_double_on_loss',
        isActive: true,
        sortOrder: 4
      }

      await this.prisma.method.upsert({
        where: { id: method.id },
        update: method,
        create: method
      })

      await this.prisma.methodGameType.upsert({
        where: {
          methodId_gameTypeId: {
            methodId: 'martingale',
            gameTypeId: 'european_roulette'
          }
        },
        update: {},
        create: {
          methodId: 'martingale',
          gameTypeId: 'european_roulette'
        }
      })

      console.log('✅ Martingale method seeded successfully')
      return Result.success(undefined)
    } catch (error) {
      return Result.failure(new MethodSeederError(
        'Failed to seed Martingale method',
        MethodSeederErrorCode.SEED_FAILED,
        error as Error
      ))
    }
  }

  async seedParoli(): Promise<Result<void, MethodSeederError>> {
    try {
      console.log('🎯 Seeding Paroli method...')

      const method = {
        id: 'paroli',
        name: 'paroli',
        displayName: 'Paroli',
        description: 'Progressione positiva che cavalca le serie vincenti: raddoppia su vincita fino al target, limitando i rischi.',
        category: 'progressive',
        requiredPackage: 'premium',
        configSchema: {
          compatibleGames: ['european_roulette', 'american_roulette'],
          requiredFields: ['baseBet', 'stopLoss', 'betTarget', 'targetWins'],
          fields: {
            baseBet: {
              type: 'number',
              label: 'Puntata Base',
              description: 'Importo della puntata base in euro',
              min: 1,
              max: 1000,
              default: 10,
              placeholder: '10'
            },
            stopLoss: {
              type: 'number',
              label: 'Stop Loss',
              description: 'Perdita massima accettabile in euro',
              min: 20,
              max: 10000,
              default: 200,
              placeholder: '200'
            },
            betTarget: {
              type: 'select',
              label: 'Tipo di Puntata',
              description: 'Scegli il tipo di puntata even-money (50/50)',
              options: [
                { value: 'red', label: 'Rosso (Paga 1:1)' },
                { value: 'black', label: 'Nero (Paga 1:1)' },
                { value: 'even', label: 'Pari (Paga 1:1)' },
                { value: 'odd', label: 'Dispari (Paga 1:1)' },
                { value: 'high', label: 'Alto 19-36 (Paga 1:1)' },
                { value: 'low', label: 'Basso 1-18 (Paga 1:1)' }
              ],
              default: 'red'
            },
            targetWins: {
              type: 'number',
              label: 'Vincite Consecutive Target',
              description: 'Quante vincite consecutive prima di resettare',
              min: 2,
              max: 6,
              default: 3,
              placeholder: '3'
            }
          }
        },
        defaultConfig: {
          baseBet: 10,
          stopLoss: 200,
          betTarget: 'red',
          targetWins: 3
        },
        algorithm: 'paroli_positive_progression',
        isActive: true,
        sortOrder: 5
      }

      await this.prisma.method.upsert({
        where: { id: method.id },
        update: method,
        create: method
      })

      await this.prisma.methodGameType.upsert({
        where: {
          methodId_gameTypeId: {
            methodId: 'paroli',
            gameTypeId: 'european_roulette'
          }
        },
        update: {},
        create: {
          methodId: 'paroli',
          gameTypeId: 'european_roulette'
        }
      })

      console.log('✅ Paroli method seeded successfully')
      return Result.success(undefined)
    } catch (error) {
      return Result.failure(new MethodSeederError(
        'Failed to seed Paroli method',
        MethodSeederErrorCode.SEED_FAILED,
        error as Error
      ))
    }
  }

  async seedDAlembert(): Promise<Result<void, MethodSeederError>> {
    try {
      console.log('🎯 Seeding D\'Alembert method...')

      const method = {
        id: 'dalembert',
        name: 'dalembert',
        displayName: 'D\'Alembert',
        description: 'Sistema equilibrato basato sull\'equilibrio: +1 unità su perdita, -1 unità su vincita. Progressione controllata.',
        category: 'progressive',
        requiredPackage: 'premium',
        configSchema: {
          compatibleGames: ['european_roulette', 'american_roulette'],
          requiredFields: ['baseBet', 'stopLoss', 'betTarget', 'unitSize', 'maxUnits'],
          fields: {
            baseBet: {
              type: 'number',
              label: 'Puntata Base',
              description: 'Importo della puntata base in euro (1 unità)',
              min: 1,
              max: 1000,
              default: 10,
              placeholder: '10'
            },
            stopLoss: {
              type: 'number',
              label: 'Stop Loss',
              description: 'Perdita massima accettabile in euro',
              min: 50,
              max: 10000,
              default: 300,
              placeholder: '300'
            },
            betTarget: {
              type: 'select',
              label: 'Tipo di Puntata',
              description: 'Scegli il tipo di puntata even-money (50/50)',
              options: [
                { value: 'red', label: 'Rosso (Paga 1:1)' },
                { value: 'black', label: 'Nero (Paga 1:1)' },
                { value: 'even', label: 'Pari (Paga 1:1)' },
                { value: 'odd', label: 'Dispari (Paga 1:1)' },
                { value: 'high', label: 'Alto 19-36 (Paga 1:1)' },
                { value: 'low', label: 'Basso 1-18 (Paga 1:1)' }
              ],
              default: 'red'
            },
            unitSize: {
              type: 'number',
              label: 'Dimensione Unità',
              description: 'Importo aggiunto/sottratto per ogni unità in euro',
              min: 1,
              max: 50,
              default: 5,
              placeholder: '5'
            },
            maxUnits: {
              type: 'number',
              label: 'Massimo Unità',
              description: 'Numero massimo di unità da raggiungere',
              min: 5,
              max: 15,
              default: 10,
              placeholder: '10'
            }
          }
        },
        defaultConfig: {
          baseBet: 10,
          stopLoss: 300,
          betTarget: 'red',
          unitSize: 5,
          maxUnits: 10
        },
        algorithm: 'dalembert_balanced_progression',
        isActive: true,
        sortOrder: 6
      }

      await this.prisma.method.upsert({
        where: { id: method.id },
        update: method,
        create: method
      })

      await this.prisma.methodGameType.upsert({
        where: {
          methodId_gameTypeId: {
            methodId: 'dalembert',
            gameTypeId: 'european_roulette'
          }
        },
        update: {},
        create: {
          methodId: 'dalembert',
          gameTypeId: 'european_roulette'
        }
      })

      console.log('✅ D\'Alembert method seeded successfully')
      return Result.success(undefined)
    } catch (error) {
      return Result.failure(new MethodSeederError(
        'Failed to seed D\'Alembert method',
        MethodSeederErrorCode.SEED_FAILED,
        error as Error
      ))
    }
  }

  async seedLabouchere(): Promise<Result<void, MethodSeederError>> {
    try {
      console.log('🎯 Seeding Labouchere method...')

      const method = {
        id: 'labouchere',
        name: 'labouchere',
        displayName: 'Labouchere',
        description: 'Sistema di cancellazione avanzato: lista numeri personalizzabile, punta primo+ultimo, obiettivo di profitto definito.',
        category: 'progressive',
        requiredPackage: 'premium',
        configSchema: {
          compatibleGames: ['european_roulette', 'american_roulette'],
          requiredFields: ['baseBet', 'stopLoss', 'betTarget', 'initialSequence', 'maxSequenceLength'],
          fields: {
            baseBet: {
              type: 'number',
              label: 'Puntata Base (Unità)',
              description: 'Valore di 1 unità in euro',
              min: 1,
              max: 100,
              default: 10,
              placeholder: '10'
            },
            stopLoss: {
              type: 'number',
              label: 'Stop Loss',
              description: 'Perdita massima accettabile in euro',
              min: 100,
              max: 10000,
              default: 500,
              placeholder: '500'
            },
            betTarget: {
              type: 'select',
              label: 'Tipo di Puntata',
              description: 'Scegli il tipo di puntata even-money (50/50)',
              options: [
                { value: 'red', label: 'Rosso (Paga 1:1)' },
                { value: 'black', label: 'Nero (Paga 1:1)' },
                { value: 'even', label: 'Pari (Paga 1:1)' },
                { value: 'odd', label: 'Dispari (Paga 1:1)' },
                { value: 'high', label: 'Alto 19-36 (Paga 1:1)' },
                { value: 'low', label: 'Basso 1-18 (Paga 1:1)' }
              ],
              default: 'red'
            },
            initialSequence: {
              type: 'text',
              label: 'Sequenza Iniziale',
              description: 'Lista di numeri separati da virgola (es: 1,2,3,4)',
              default: '1,2,3',
              placeholder: '1,2,3'
            },
            maxSequenceLength: {
              type: 'number',
              label: 'Lunghezza Max Sequenza',
              description: 'Protezione: ferma se la sequenza supera questo limite',
              min: 10,
              max: 30,
              default: 20,
              placeholder: '20'
            }
          }
        },
        defaultConfig: {
          baseBet: 10,
          stopLoss: 500,
          betTarget: 'red',
          initialSequence: '1,2,3',
          maxSequenceLength: 20
        },
        algorithm: 'labouchere_cancellation_system',
        isActive: true,
        sortOrder: 7
      }

      await this.prisma.method.upsert({
        where: { id: method.id },
        update: method,
        create: method
      })

      await this.prisma.methodGameType.upsert({
        where: {
          methodId_gameTypeId: {
            methodId: 'labouchere',
            gameTypeId: 'european_roulette'
          }
        },
        update: {},
        create: {
          methodId: 'labouchere',
          gameTypeId: 'european_roulette'
        }
      })

      console.log('✅ Labouchere method seeded successfully')
      return Result.success(undefined)
    } catch (error) {
      return Result.failure(new MethodSeederError(
        'Failed to seed Labouchere method',
        MethodSeederErrorCode.SEED_FAILED,
        error as Error
      ))
    }
  }

  async seedJamesBond(): Promise<Result<void, MethodSeederError>> {
    try {
      console.log('🎯 Seeding James Bond method...')

      const method = {
        id: 'james_bond',
        name: 'james_bond',
        displayName: 'James Bond',
        description: 'Strategia leggendaria di 007: puntate multiple fisse su High, Six Line e Zero. 67.6% di copertura della ruota.',
        category: 'flat',
        requiredPackage: 'premium',
        configSchema: {
          compatibleGames: ['european_roulette', 'american_roulette'],
          requiredFields: ['unitSize', 'stopLoss', 'maxSpins'],
          fields: {
            unitSize: {
              type: 'number',
              label: 'Dimensione Unità',
              description: 'Moltiplicatore per la puntata base (1.0 = €200 totali)',
              min: 0.1,
              max: 5,
              step: 0.1,
              default: 0.5,
              placeholder: '0.5'
            },
            stopLoss: {
              type: 'number',
              label: 'Stop Loss',
              description: 'Perdita massima accettabile in euro',
              min: 200,
              max: 10000,
              default: 1000,
              placeholder: '1000'
            },
            maxSpins: {
              type: 'number',
              label: 'Massimo Spin',
              description: 'Numero massimo di spin per sessione',
              min: 10,
              max: 200,
              default: 50,
              placeholder: '50'
            }
          }
        },
        defaultConfig: {
          unitSize: 0.5,
          stopLoss: 1000,
          maxSpins: 50
        },
        algorithm: 'james_bond_multiple_coverage',
        isActive: true,
        sortOrder: 8
      }

      await this.prisma.method.upsert({
        where: { id: method.id },
        update: method,
        create: method
      })

      await this.prisma.methodGameType.upsert({
        where: {
          methodId_gameTypeId: {
            methodId: 'james_bond',
            gameTypeId: 'european_roulette'
          }
        },
        update: {},
        create: {
          methodId: 'james_bond',
          gameTypeId: 'european_roulette'
        }
      })

      console.log('✅ James Bond method seeded successfully')
      return Result.success(undefined)
    } catch (error) {
      return Result.failure(new MethodSeederError(
        'Failed to seed James Bond method',
        MethodSeederErrorCode.SEED_FAILED,
        error as Error
      ))
    }
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