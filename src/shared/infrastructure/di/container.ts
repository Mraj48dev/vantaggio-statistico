/**
 * Dependency Injection Container
 *
 * Manages all dependencies for the application following Clean Architecture.
 * This container wires up all adapters, repositories, and use cases.
 */

import { PrismaClient } from '@prisma/client'

// Auth Module
import { AuthService } from '@/modules/auth/domain/services/AuthService'
import { UserRepository } from '@/modules/auth/domain/repositories/UserRepository'
import { ClerkAuthAdapter } from '@/modules/auth/infrastructure/adapters/ClerkAuthAdapter'
import { PrismaUserRepository } from '@/modules/auth/infrastructure/repositories/PrismaUserRepository'
import { SyncUserUseCase } from '@/modules/auth/application/use-cases/SyncUserUseCase'
import { GetCurrentUserUseCase } from '@/modules/auth/application/use-cases/GetCurrentUserUseCase'

// Permissions Module (when implemented)
// import { PermissionService } from '@/modules/permissions/domain/services/PermissionService'

export interface Container {
  // Infrastructure
  prisma: PrismaClient

  // Auth Module
  userRepository: UserRepository
  authService: AuthService
  syncUserUseCase: SyncUserUseCase
  getCurrentUserUseCase: GetCurrentUserUseCase

  // Permissions Module (to be added)
  // permissionService: PermissionService
}

class DIContainer implements Container {
  private static instance: DIContainer
  private _prisma: PrismaClient | null = null
  private _userRepository: UserRepository | null = null
  private _authService: AuthService | null = null
  private _syncUserUseCase: SyncUserUseCase | null = null
  private _getCurrentUserUseCase: GetCurrentUserUseCase | null = null

  private constructor() {}

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer()
    }
    return DIContainer.instance
  }

  // Infrastructure
  get prisma(): PrismaClient {
    if (!this._prisma) {
      this._prisma = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      })
    }
    return this._prisma
  }

  // Auth Module
  get userRepository(): UserRepository {
    if (!this._userRepository) {
      this._userRepository = new PrismaUserRepository(this.prisma)
    }
    return this._userRepository
  }

  get syncUserUseCase(): SyncUserUseCase {
    if (!this._syncUserUseCase) {
      this._syncUserUseCase = new SyncUserUseCase(this.userRepository)
    }
    return this._syncUserUseCase
  }

  get authService(): AuthService {
    if (!this._authService) {
      this._authService = new ClerkAuthAdapter(
        this.userRepository,
        this.syncUserUseCase
      )
    }
    return this._authService
  }

  get getCurrentUserUseCase(): GetCurrentUserUseCase {
    if (!this._getCurrentUserUseCase) {
      this._getCurrentUserUseCase = new GetCurrentUserUseCase(
        this.authService,
        this.userRepository
      )
    }
    return this._getCurrentUserUseCase
  }

  // Cleanup method for testing or graceful shutdown
  async dispose(): Promise<void> {
    if (this._prisma) {
      await this._prisma.$disconnect()
      this._prisma = null
    }
  }

  // Reset for testing
  reset(): void {
    this._userRepository = null
    this._authService = null
    this._syncUserUseCase = null
    this._getCurrentUserUseCase = null
    // Don't reset Prisma as it should be reused
  }
}

// Export singleton instance
export const container = DIContainer.getInstance()

// Export factory function for testing
export const createTestContainer = (): DIContainer => {
  return new DIContainer()
}

// Cleanup function for Next.js hot reload
if (process.env.NODE_ENV === 'development') {
  if (module.hot) {
    module.hot.dispose(() => {
      container.dispose()
    })
  }
}