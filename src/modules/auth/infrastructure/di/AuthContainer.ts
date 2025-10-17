/**
 * Auth Module Dependency Injection Container
 *
 * Implements the Composition Root pattern for the Auth module.
 * All dependencies are wired here maintaining Clean Architecture principles.
 */

import { PrismaClient } from '@prisma/client'
import { ClerkAuthAdapter } from '../adapters/ClerkAuthAdapter'
import { PrismaUserRepository } from '../repositories/PrismaUserRepository'
import { GetCurrentUserUseCase } from '../../application/use-cases/GetCurrentUserUseCase'
import { SyncUserUseCase } from '../../application/use-cases/SyncUserUseCase'
import { AuthService } from '../../domain/services/AuthService'
import { UserRepository } from '../../domain/repositories/UserRepository'

/**
 * Container for Auth Module dependencies
 * Following the roadmap's emphasis on proper DI and modular architecture
 */
export class AuthContainer {
  private static instance: AuthContainer
  private _prisma?: PrismaClient
  private _userRepository?: UserRepository
  private _authService?: AuthService
  private _getCurrentUserUseCase?: GetCurrentUserUseCase
  private _syncUserUseCase?: SyncUserUseCase

  private constructor() {}

  static getInstance(): AuthContainer {
    if (!AuthContainer.instance) {
      AuthContainer.instance = new AuthContainer()
    }
    return AuthContainer.instance
  }

  /**
   * Get Prisma Client instance
   * Shared across all repositories
   */
  getPrisma(): PrismaClient {
    if (!this._prisma) {
      this._prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        errorFormat: 'pretty'
      })
    }
    return this._prisma
  }

  /**
   * Get User Repository
   * Infrastructure layer - Prisma implementation
   */
  getUserRepository(): UserRepository {
    if (!this._userRepository) {
      this._userRepository = new PrismaUserRepository(this.getPrisma())
    }
    return this._userRepository
  }

  /**
   * Get Sync User Use Case
   * Application layer - Business logic for user synchronization
   */
  getSyncUserUseCase(): SyncUserUseCase {
    if (!this._syncUserUseCase) {
      this._syncUserUseCase = new SyncUserUseCase(this.getUserRepository())
    }
    return this._syncUserUseCase
  }

  /**
   * Get Auth Service
   * Infrastructure layer - Clerk integration
   */
  getAuthService(): AuthService {
    if (!this._authService) {
      this._authService = new ClerkAuthAdapter(
        this.getUserRepository(),
        this.getSyncUserUseCase()
      )
    }
    return this._authService
  }

  /**
   * Get Current User Use Case
   * Application layer - Business logic for getting current user
   */
  getCurrentUserUseCase(): GetCurrentUserUseCase {
    if (!this._getCurrentUserUseCase) {
      this._getCurrentUserUseCase = new GetCurrentUserUseCase(this.getAuthService())
    }
    return this._getCurrentUserUseCase
  }

  /**
   * Cleanup resources
   * Important for graceful shutdown
   */
  async cleanup(): Promise<void> {
    if (this._prisma) {
      await this._prisma.$disconnect()
    }
  }

  /**
   * Health check for Auth Module
   * Verifies all dependencies are properly wired
   */
  async healthCheck(): Promise<{
    status: 'healthy' | 'unhealthy'
    components: Record<string, boolean>
    timestamp: Date
  }> {
    const components: Record<string, boolean> = {}

    try {
      // Test database connection
      await this.getPrisma().$queryRaw`SELECT 1`
      components.database = true
    } catch {
      components.database = false
    }

    try {
      // Test auth service initialization
      this.getAuthService()
      components.authService = true
    } catch {
      components.authService = false
    }

    try {
      // Test use cases initialization
      this.getCurrentUserUseCase()
      this.getSyncUserUseCase()
      components.useCases = true
    } catch {
      components.useCases = false
    }

    const allHealthy = Object.values(components).every(status => status)

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      components,
      timestamp: new Date()
    }
  }
}

/**
 * Factory function for easy access to Auth Module services
 * Use this in your Next.js API routes and components
 */
export const authContainer = () => AuthContainer.getInstance()

/**
 * Helper functions for common Auth Module operations
 */
export const authServices = {
  getCurrentUser: () => authContainer().getCurrentUserUseCase(),
  getAuthService: () => authContainer().getAuthService(),
  getUserRepository: () => authContainer().getUserRepository(),
  syncUser: () => authContainer().getSyncUserUseCase()
}