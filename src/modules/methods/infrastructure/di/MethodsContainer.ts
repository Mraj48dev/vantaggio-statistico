/**
 * Methods Module Dependency Injection Container
 *
 * Configures and provides dependencies for the Methods module.
 */

import { PrismaClient } from '@prisma/client'
import { BettingMethod } from '@/shared/domain/types/methods'

// Domain
import { FibonacciMethod } from '../../domain/entities/FibonacciMethod'
import { MethodCalculator, DefaultMethodCalculator } from '../../domain/services/MethodCalculator'
import { MethodRepository } from '../../domain/repositories/MethodRepository'

// Application
import { GetAvailableMethodsUseCase, DefaultGetAvailableMethodsUseCase } from '../../application/use-cases/GetAvailableMethodsUseCase'
import { CalculateNextBetUseCase, DefaultCalculateNextBetUseCase } from '../../application/use-cases/CalculateNextBetUseCase'
import { GetMethodDetailsUseCase, DefaultGetMethodDetailsUseCase } from '../../application/use-cases/GetMethodDetailsUseCase'

// Infrastructure
import { PrismaMethodRepository } from '../repositories/PrismaMethodRepository'
import { MethodSeeder, DefaultMethodSeeder } from '../seeders/MethodSeeder'

export class MethodsContainer {
  private static instance: MethodsContainer | null = null

  private _methodRepository: MethodRepository | null = null
  private _methodCalculator: MethodCalculator | null = null
  private _methodRegistry: Map<string, BettingMethod> | null = null
  private _methodSeeder: MethodSeeder | null = null

  // Use Cases
  private _getAvailableMethodsUseCase: GetAvailableMethodsUseCase | null = null
  private _calculateNextBetUseCase: CalculateNextBetUseCase | null = null
  private _getMethodDetailsUseCase: GetMethodDetailsUseCase | null = null

  constructor(private readonly prisma: PrismaClient) {
    this.initializeMethodRegistry()
  }

  static getInstance(prisma: PrismaClient): MethodsContainer {
    if (!MethodsContainer.instance) {
      MethodsContainer.instance = new MethodsContainer(prisma)
    }
    return MethodsContainer.instance
  }

  static resetInstance(): void {
    MethodsContainer.instance = null
  }

  // Repository
  getMethodRepository(): MethodRepository {
    if (!this._methodRepository) {
      this._methodRepository = new PrismaMethodRepository(this.prisma)
    }
    return this._methodRepository
  }

  // Services
  getMethodCalculator(): MethodCalculator {
    if (!this._methodCalculator) {
      this._methodCalculator = new DefaultMethodCalculator()
    }
    return this._methodCalculator
  }

  getMethodRegistry(): Map<string, BettingMethod> {
    if (!this._methodRegistry) {
      this.initializeMethodRegistry()
    }
    return this._methodRegistry!
  }

  getMethodSeeder(): MethodSeeder {
    if (!this._methodSeeder) {
      this._methodSeeder = new DefaultMethodSeeder(this.prisma)
    }
    return this._methodSeeder
  }

  // Use Cases
  getGetAvailableMethodsUseCase(): GetAvailableMethodsUseCase {
    if (!this._getAvailableMethodsUseCase) {
      this._getAvailableMethodsUseCase = new DefaultGetAvailableMethodsUseCase(
        this.getMethodRepository()
      )
    }
    return this._getAvailableMethodsUseCase
  }

  getCalculateNextBetUseCase(): CalculateNextBetUseCase {
    if (!this._calculateNextBetUseCase) {
      this._calculateNextBetUseCase = new DefaultCalculateNextBetUseCase(
        this.getMethodRepository(),
        this.getMethodCalculator(),
        this.getMethodRegistry()
      )
    }
    return this._calculateNextBetUseCase
  }

  getGetMethodDetailsUseCase(): GetMethodDetailsUseCase {
    if (!this._getMethodDetailsUseCase) {
      this._getMethodDetailsUseCase = new DefaultGetMethodDetailsUseCase(
        this.getMethodRepository(),
        this.getMethodCalculator()
      )
    }
    return this._getMethodDetailsUseCase
  }

  private initializeMethodRegistry(): void {
    this._methodRegistry = new Map<string, BettingMethod>()

    // Register all available betting methods
    this._methodRegistry.set('fibonacci', new FibonacciMethod())

    // TODO: Register other methods when implemented
    // this._methodRegistry.set('martingale', new MartingaleMethod())
    // this._methodRegistry.set('paroli', new ParoliMethod())
    // this._methodRegistry.set('dalembert', new DAlembertMethod())
  }

  // Utility method for testing - allows clearing registrations
  clearMethodRegistry(): void {
    this._methodRegistry?.clear()
    this.initializeMethodRegistry()
  }

  // Get all registered method IDs
  getRegisteredMethodIds(): string[] {
    return Array.from(this.getMethodRegistry().keys())
  }
}