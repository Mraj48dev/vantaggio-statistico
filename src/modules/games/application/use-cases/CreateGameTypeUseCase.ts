/**
 * Create Game Type Use Case - Games Module Application Layer
 *
 * Creates a new game type with validation and persistence.
 * This use case is typically used by administrators to configure new games.
 */

import { Result } from '@/shared/domain/types/common'
import { GameType, GameCategory, GameConfig, GameTypeValidationError } from '../../domain/entities/GameType'
import { GameTypeRepository, GameTypeRepositoryError } from '../../domain/repositories/GameTypeRepository'

export interface CreateGameTypeUseCaseInput {
  readonly name: string
  readonly displayName: string
  readonly category: GameCategory
  readonly config: GameConfig
  readonly isActive?: boolean
  readonly sortOrder?: number
}

export interface CreateGameTypeUseCaseOutput {
  readonly gameType: GameType
  readonly isNewGameType: boolean
}

export class CreateGameTypeUseCase {
  constructor(private readonly gameTypeRepository: GameTypeRepository) {}

  async execute(input: CreateGameTypeUseCaseInput): Promise<Result<CreateGameTypeUseCaseOutput, CreateGameTypeUseCaseError>> {
    try {
      // Check if game type with this name already exists
      const existingGameTypeResult = await this.gameTypeRepository.findByName(input.name)
      if (!existingGameTypeResult.isSuccess) {
        return Result.failure(new CreateGameTypeUseCaseError(
          'Failed to check if game type exists',
          CreateGameTypeUseCaseErrorCode.REPOSITORY_ERROR,
          existingGameTypeResult.error
        ))
      }

      if (existingGameTypeResult.value) {
        return Result.failure(new CreateGameTypeUseCaseError(
          `Game type with name '${input.name}' already exists`,
          CreateGameTypeUseCaseErrorCode.DUPLICATE_NAME
        ))
      }

      // Create new game type entity
      const gameTypeResult = GameType.create({
        name: input.name,
        displayName: input.displayName,
        category: input.category,
        config: input.config,
        isActive: input.isActive ?? true,
        sortOrder: input.sortOrder ?? 0
      })

      if (!gameTypeResult.isSuccess) {
        return Result.failure(new CreateGameTypeUseCaseError(
          'Failed to create game type entity',
          CreateGameTypeUseCaseErrorCode.VALIDATION_ERROR,
          gameTypeResult.error
        ))
      }

      // Save to repository
      const savedGameTypeResult = await this.gameTypeRepository.save(gameTypeResult.value)
      if (!savedGameTypeResult.isSuccess) {
        return Result.failure(new CreateGameTypeUseCaseError(
          'Failed to save game type',
          CreateGameTypeUseCaseErrorCode.REPOSITORY_ERROR,
          savedGameTypeResult.error
        ))
      }

      return Result.success({
        gameType: savedGameTypeResult.value,
        isNewGameType: true
      })
    } catch (error) {
      return Result.failure(new CreateGameTypeUseCaseError(
        'Unexpected error during game type creation',
        CreateGameTypeUseCaseErrorCode.UNKNOWN_ERROR,
        error as Error
      ))
    }
  }
}

export class CreateGameTypeUseCaseError extends Error {
  constructor(
    message: string,
    public readonly code: CreateGameTypeUseCaseErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'CreateGameTypeUseCaseError'
  }
}

export enum CreateGameTypeUseCaseErrorCode {
  DUPLICATE_NAME = 'DUPLICATE_NAME',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REPOSITORY_ERROR = 'REPOSITORY_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}