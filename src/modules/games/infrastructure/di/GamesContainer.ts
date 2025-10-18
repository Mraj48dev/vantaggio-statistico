/**
 * Games Module - Dependency Injection Container
 *
 * This container manages all dependencies for the Games module,
 * providing a clean way to wire up domain, application, and infrastructure layers.
 */

import { PrismaClient } from '@prisma/client'

// Domain
import { GameTypeRepository } from '../../domain/repositories/GameTypeRepository'

// Application
import { GetGameTypesUseCase } from '../../application/use-cases/GetGameTypesUseCase'
import { PlayRouletteUseCase } from '../../application/use-cases/PlayRouletteUseCase'
import { CreateGameTypeUseCase } from '../../application/use-cases/CreateGameTypeUseCase'

// Infrastructure
import { PrismaGameTypeRepository } from '../repositories/PrismaGameTypeRepository'

export class GamesContainer {
  private static instance: GamesContainer | null = null

  private _gameTypeRepository: GameTypeRepository | null = null
  private _getGameTypesUseCase: GetGameTypesUseCase | null = null
  private _playRouletteUseCase: PlayRouletteUseCase | null = null
  private _createGameTypeUseCase: CreateGameTypeUseCase | null = null

  private constructor(private readonly prisma: PrismaClient) {}

  static getInstance(prisma: PrismaClient): GamesContainer {
    if (!GamesContainer.instance) {
      GamesContainer.instance = new GamesContainer(prisma)
    }
    return GamesContainer.instance
  }

  static resetInstance(): void {
    GamesContainer.instance = null
  }

  // Repository
  get gameTypeRepository(): GameTypeRepository {
    if (!this._gameTypeRepository) {
      this._gameTypeRepository = new PrismaGameTypeRepository(this.prisma)
    }
    return this._gameTypeRepository
  }

  // Use Cases
  get getGameTypesUseCase(): GetGameTypesUseCase {
    if (!this._getGameTypesUseCase) {
      this._getGameTypesUseCase = new GetGameTypesUseCase(this.gameTypeRepository)
    }
    return this._getGameTypesUseCase
  }

  get playRouletteUseCase(): PlayRouletteUseCase {
    if (!this._playRouletteUseCase) {
      this._playRouletteUseCase = new PlayRouletteUseCase(this.gameTypeRepository)
    }
    return this._playRouletteUseCase
  }

  get createGameTypeUseCase(): CreateGameTypeUseCase {
    if (!this._createGameTypeUseCase) {
      this._createGameTypeUseCase = new CreateGameTypeUseCase(this.gameTypeRepository)
    }
    return this._createGameTypeUseCase
  }

  // Factory methods for external use
  createGetGameTypesUseCase(): GetGameTypesUseCase {
    return new GetGameTypesUseCase(this.gameTypeRepository)
  }

  createPlayRouletteUseCase(): PlayRouletteUseCase {
    return new PlayRouletteUseCase(this.gameTypeRepository)
  }

  createCreateGameTypeUseCase(): CreateGameTypeUseCase {
    return new CreateGameTypeUseCase(this.gameTypeRepository)
  }
}