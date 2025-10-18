/**
 * Prisma GameType Repository - Games Module Infrastructure Layer
 *
 * Concrete implementation of GameTypeRepository using Prisma ORM.
 * This adapter connects our domain to the PostgreSQL database.
 */

import { PrismaClient } from '@prisma/client'
import { Result } from '@/shared/domain/types/common'
import {
  GameType,
  GameTypeId,
  GameTypeProps,
  GameCategory,
  GameConfig,
  RouletteConfig,
  BlackjackConfig
} from '../../domain/entities/GameType'
import {
  GameTypeRepository,
  GameTypeRepositoryError,
  GameTypeRepositoryErrorCode
} from '../../domain/repositories/GameTypeRepository'

export class PrismaGameTypeRepository implements GameTypeRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(gameType: GameType): Promise<Result<GameType, GameTypeRepositoryError>> {
    try {
      const persistenceData = gameType.toPersistence()

      const savedGameType = await this.prisma.gameType.create({
        data: {
          id: persistenceData.id.value,
          name: persistenceData.name,
          displayName: persistenceData.displayName,
          category: persistenceData.category,
          config: persistenceData.config as any, // Prisma handles JSON serialization
          isActive: persistenceData.isActive,
          sortOrder: persistenceData.sortOrder,
          createdAt: persistenceData.createdAt,
          updatedAt: persistenceData.updatedAt
        }
      })

      const domainGameType = this.toDomain(savedGameType)
      return Result.success(domainGameType)
    } catch (error: any) {
      if (error.code === 'P2002') {
        return Result.failure(new GameTypeRepositoryError(
          'A game type with this name already exists',
          GameTypeRepositoryErrorCode.DUPLICATE_NAME,
          error
        ))
      }

      return Result.failure(new GameTypeRepositoryError(
        'Failed to save game type',
        GameTypeRepositoryErrorCode.DATABASE_ERROR,
        error
      ))
    }
  }

  async update(gameType: GameType): Promise<Result<GameType, GameTypeRepositoryError>> {
    try {
      const persistenceData = gameType.toPersistence()

      const updatedGameType = await this.prisma.gameType.update({
        where: { id: persistenceData.id.value },
        data: {
          name: persistenceData.name,
          displayName: persistenceData.displayName,
          category: persistenceData.category,
          config: persistenceData.config as any,
          isActive: persistenceData.isActive,
          sortOrder: persistenceData.sortOrder,
          updatedAt: persistenceData.updatedAt
        }
      })

      const domainGameType = this.toDomain(updatedGameType)
      return Result.success(domainGameType)
    } catch (error: any) {
      if (error.code === 'P2025') {
        return Result.failure(new GameTypeRepositoryError(
          'Game type not found',
          GameTypeRepositoryErrorCode.NOT_FOUND,
          error
        ))
      }

      if (error.code === 'P2002') {
        return Result.failure(new GameTypeRepositoryError(
          'A game type with this name already exists',
          GameTypeRepositoryErrorCode.DUPLICATE_NAME,
          error
        ))
      }

      return Result.failure(new GameTypeRepositoryError(
        'Failed to update game type',
        GameTypeRepositoryErrorCode.DATABASE_ERROR,
        error
      ))
    }
  }

  async findById(id: GameTypeId): Promise<Result<GameType | null, GameTypeRepositoryError>> {
    try {
      const gameType = await this.prisma.gameType.findUnique({
        where: { id: id.value }
      })

      if (!gameType) {
        return Result.success(null)
      }

      const domainGameType = this.toDomain(gameType)
      return Result.success(domainGameType)
    } catch (error: any) {
      return Result.failure(new GameTypeRepositoryError(
        'Failed to find game type by ID',
        GameTypeRepositoryErrorCode.DATABASE_ERROR,
        error
      ))
    }
  }

  async findByName(name: string): Promise<Result<GameType | null, GameTypeRepositoryError>> {
    try {
      const gameType = await this.prisma.gameType.findFirst({
        where: { name }
      })

      if (!gameType) {
        return Result.success(null)
      }

      const domainGameType = this.toDomain(gameType)
      return Result.success(domainGameType)
    } catch (error: any) {
      return Result.failure(new GameTypeRepositoryError(
        'Failed to find game type by name',
        GameTypeRepositoryErrorCode.DATABASE_ERROR,
        error
      ))
    }
  }

  async findAllActive(): Promise<Result<readonly GameType[], GameTypeRepositoryError>> {
    try {
      const gameTypes = await this.prisma.gameType.findMany({
        where: { isActive: true },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      })

      const domainGameTypes = gameTypes.map(gt => this.toDomain(gt))
      return Result.success(domainGameTypes)
    } catch (error: any) {
      return Result.failure(new GameTypeRepositoryError(
        'Failed to find active game types',
        GameTypeRepositoryErrorCode.DATABASE_ERROR,
        error
      ))
    }
  }

  async findAll(): Promise<Result<readonly GameType[], GameTypeRepositoryError>> {
    try {
      const gameTypes = await this.prisma.gameType.findMany({
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      })

      const domainGameTypes = gameTypes.map(gt => this.toDomain(gt))
      return Result.success(domainGameTypes)
    } catch (error: any) {
      return Result.failure(new GameTypeRepositoryError(
        'Failed to find all game types',
        GameTypeRepositoryErrorCode.DATABASE_ERROR,
        error
      ))
    }
  }

  async findByCategory(category: string): Promise<Result<readonly GameType[], GameTypeRepositoryError>> {
    try {
      const gameTypes = await this.prisma.gameType.findMany({
        where: { category },
        orderBy: [
          { sortOrder: 'asc' },
          { name: 'asc' }
        ]
      })

      const domainGameTypes = gameTypes.map(gt => this.toDomain(gt))
      return Result.success(domainGameTypes)
    } catch (error: any) {
      return Result.failure(new GameTypeRepositoryError(
        'Failed to find game types by category',
        GameTypeRepositoryErrorCode.DATABASE_ERROR,
        error
      ))
    }
  }

  async delete(id: GameTypeId): Promise<Result<void, GameTypeRepositoryError>> {
    try {
      await this.prisma.gameType.delete({
        where: { id: id.value }
      })

      return Result.success(undefined)
    } catch (error: any) {
      if (error.code === 'P2025') {
        return Result.failure(new GameTypeRepositoryError(
          'Game type not found',
          GameTypeRepositoryErrorCode.NOT_FOUND,
          error
        ))
      }

      return Result.failure(new GameTypeRepositoryError(
        'Failed to delete game type',
        GameTypeRepositoryErrorCode.DATABASE_ERROR,
        error
      ))
    }
  }

  async existsByName(name: string): Promise<Result<boolean, GameTypeRepositoryError>> {
    try {
      const count = await this.prisma.gameType.count({
        where: { name }
      })

      return Result.success(count > 0)
    } catch (error: any) {
      return Result.failure(new GameTypeRepositoryError(
        'Failed to check if game type exists',
        GameTypeRepositoryErrorCode.DATABASE_ERROR,
        error
      ))
    }
  }

  async updateSortOrders(updates: readonly { id: GameTypeId; sortOrder: number }[]): Promise<Result<void, GameTypeRepositoryError>> {
    try {
      await this.prisma.$transaction(
        updates.map(update =>
          this.prisma.gameType.update({
            where: { id: update.id.value },
            data: {
              sortOrder: update.sortOrder,
              updatedAt: new Date()
            }
          })
        )
      )

      return Result.success(undefined)
    } catch (error: any) {
      return Result.failure(new GameTypeRepositoryError(
        'Failed to update sort orders',
        GameTypeRepositoryErrorCode.DATABASE_ERROR,
        error
      ))
    }
  }

  /**
   * Converts Prisma model to domain entity
   */
  private toDomain(prismaGameType: any): GameType {
    const gameTypeProps: GameTypeProps = {
      id: { value: prismaGameType.id },
      name: prismaGameType.name,
      displayName: prismaGameType.displayName,
      category: prismaGameType.category as GameCategory,
      config: prismaGameType.config as GameConfig,
      isActive: prismaGameType.isActive,
      sortOrder: prismaGameType.sortOrder,
      createdAt: prismaGameType.createdAt,
      updatedAt: prismaGameType.updatedAt
    }

    return GameType.fromPersistence(gameTypeProps)
  }
}