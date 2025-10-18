/**
 * GameType Repository Interface - Games Module Domain Layer
 *
 * Repository contract for GameType persistence operations.
 * This interface defines the persistence contract without implementation details.
 */

import { Result } from '@/shared/domain/types/common'
import { GameType, GameTypeId } from '../entities/GameType'

export interface GameTypeRepository {
  /**
   * Saves a new GameType or updates an existing one
   */
  save(gameType: GameType): Promise<Result<GameType, GameTypeRepositoryError>>

  /**
   * Updates an existing GameType
   */
  update(gameType: GameType): Promise<Result<GameType, GameTypeRepositoryError>>

  /**
   * Finds a GameType by its ID
   */
  findById(id: GameTypeId): Promise<Result<GameType | null, GameTypeRepositoryError>>

  /**
   * Finds a GameType by its name
   */
  findByName(name: string): Promise<Result<GameType | null, GameTypeRepositoryError>>

  /**
   * Finds all active GameTypes ordered by sortOrder
   */
  findAllActive(): Promise<Result<readonly GameType[], GameTypeRepositoryError>>

  /**
   * Finds all GameTypes (active and inactive) ordered by sortOrder
   */
  findAll(): Promise<Result<readonly GameType[], GameTypeRepositoryError>>

  /**
   * Finds GameTypes by category
   */
  findByCategory(category: string): Promise<Result<readonly GameType[], GameTypeRepositoryError>>

  /**
   * Deletes a GameType by ID
   */
  delete(id: GameTypeId): Promise<Result<void, GameTypeRepositoryError>>

  /**
   * Checks if a GameType exists with the given name
   */
  existsByName(name: string): Promise<Result<boolean, GameTypeRepositoryError>>

  /**
   * Updates the sort order for multiple GameTypes
   */
  updateSortOrders(updates: readonly { id: GameTypeId; sortOrder: number }[]): Promise<Result<void, GameTypeRepositoryError>>
}

export class GameTypeRepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: GameTypeRepositoryErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'GameTypeRepositoryError'
  }
}

export enum GameTypeRepositoryErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_NAME = 'DUPLICATE_NAME',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}