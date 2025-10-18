/**
 * Sessions Module Dependency Injection Container
 *
 * Configures and provides dependencies for the Sessions module.
 */

import { PrismaClient } from '@prisma/client'

// Domain
import { SessionService, DefaultSessionService } from '../../domain/services/SessionService'
import { SessionRepository } from '../../domain/repositories/SessionRepository'

// Application
import { CreateSessionUseCase, DefaultCreateSessionUseCase } from '../../application/use-cases/CreateSessionUseCase'
import { PlaceBetUseCase, DefaultPlaceBetUseCase } from '../../application/use-cases/PlaceBetUseCase'
import { EndSessionUseCase, DefaultEndSessionUseCase } from '../../application/use-cases/EndSessionUseCase'
import { GetActiveSessionUseCase, DefaultGetActiveSessionUseCase } from '../../application/use-cases/GetActiveSessionUseCase'

// Infrastructure
import { PrismaSessionRepository } from '../repositories/PrismaSessionRepository'

export class SessionsContainer {
  private static instance: SessionsContainer | null = null

  private _sessionRepository: SessionRepository | null = null
  private _sessionService: SessionService | null = null

  // Use Cases
  private _createSessionUseCase: CreateSessionUseCase | null = null
  private _placeBetUseCase: PlaceBetUseCase | null = null
  private _endSessionUseCase: EndSessionUseCase | null = null
  private _getActiveSessionUseCase: GetActiveSessionUseCase | null = null

  constructor(
    private readonly prisma: PrismaClient,
    private readonly methodService?: any, // Will be injected from Methods Module
    private readonly gameService?: any    // Will be injected from Games Module
  ) {}

  static getInstance(
    prisma: PrismaClient,
    methodService?: any,
    gameService?: any
  ): SessionsContainer {
    if (!SessionsContainer.instance) {
      SessionsContainer.instance = new SessionsContainer(prisma, methodService, gameService)
    }
    return SessionsContainer.instance
  }

  static resetInstance(): void {
    SessionsContainer.instance = null
  }

  // Repository
  getSessionRepository(): SessionRepository {
    if (!this._sessionRepository) {
      this._sessionRepository = new PrismaSessionRepository(this.prisma)
    }
    return this._sessionRepository
  }

  // Services
  getSessionService(): SessionService {
    if (!this._sessionService) {
      this._sessionService = new DefaultSessionService(
        this.methodService,
        this.gameService
      )
    }
    return this._sessionService
  }

  // Use Cases
  getCreateSessionUseCase(): CreateSessionUseCase {
    if (!this._createSessionUseCase) {
      this._createSessionUseCase = new DefaultCreateSessionUseCase(
        this.getSessionRepository(),
        this.getSessionService()
      )
    }
    return this._createSessionUseCase
  }

  getPlaceBetUseCase(): PlaceBetUseCase {
    if (!this._placeBetUseCase) {
      this._placeBetUseCase = new DefaultPlaceBetUseCase(
        this.getSessionRepository(),
        this.getSessionService()
      )
    }
    return this._placeBetUseCase
  }

  getEndSessionUseCase(): EndSessionUseCase {
    if (!this._endSessionUseCase) {
      this._endSessionUseCase = new DefaultEndSessionUseCase(
        this.getSessionRepository(),
        this.getSessionService()
      )
    }
    return this._endSessionUseCase
  }

  getGetActiveSessionUseCase(): GetActiveSessionUseCase {
    if (!this._getActiveSessionUseCase) {
      this._getActiveSessionUseCase = new DefaultGetActiveSessionUseCase(
        this.getSessionRepository(),
        this.getSessionService()
      )
    }
    return this._getActiveSessionUseCase
  }

  // Utility methods for testing
  clearCache(): void {
    this._sessionRepository = null
    this._sessionService = null
    this._createSessionUseCase = null
    this._placeBetUseCase = null
    this._endSessionUseCase = null
    this._getActiveSessionUseCase = null
  }
}