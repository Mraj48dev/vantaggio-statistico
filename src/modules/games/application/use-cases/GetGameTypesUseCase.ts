/**
 * Get Game Types Use Case - Games Module Application Layer
 *
 * Retrieves available game types with optional filtering.
 * This use case orchestrates the domain operations for fetching game configurations.
 */

import { Result } from '@/shared/domain/types/common'
import { GameType, GameCategory } from '../../domain/entities/GameType'
import { GameTypeRepository, GameTypeRepositoryError } from '../../domain/repositories/GameTypeRepository'

export interface GetGameTypesUseCaseInput {
  readonly category?: GameCategory
  readonly activeOnly?: boolean
}

export interface GetGameTypesUseCaseOutput {
  readonly gameTypes: readonly GameType[]
  readonly total: number
}

export class GetGameTypesUseCase {
  constructor(private readonly gameTypeRepository: GameTypeRepository) {}

  async execute(input: GetGameTypesUseCaseInput = {}): Promise<Result<GetGameTypesUseCaseOutput, GetGameTypesUseCaseError>> {
    try {
      let gameTypesResult: Result<readonly GameType[], GameTypeRepositoryError>

      if (input.category) {
        // Get by category
        gameTypesResult = await this.gameTypeRepository.findByCategory(input.category)
      } else if (input.activeOnly) {
        // Get active only
        gameTypesResult = await this.gameTypeRepository.findAllActive()
      } else {
        // Get all
        gameTypesResult = await this.gameTypeRepository.findAll()
      }

      if (!gameTypesResult.isSuccess) {
        return Result.failure(new GetGameTypesUseCaseError(
          'Failed to retrieve game types',
          GetGameTypesUseCaseErrorCode.REPOSITORY_ERROR,
          gameTypesResult.error
        ))
      }

      let gameTypes = gameTypesResult.value

      // Apply additional filtering if needed
      if (input.activeOnly && input.category) {
        gameTypes = gameTypes.filter(gt => gt.isActive)
      }

      return Result.success({
        gameTypes,
        total: gameTypes.length
      })
    } catch (error) {
      return Result.failure(new GetGameTypesUseCaseError(
        'Unexpected error while retrieving game types',
        GetGameTypesUseCaseErrorCode.UNKNOWN_ERROR,
        error as Error
      ))
    }
  }
}

export class GetGameTypesUseCaseError extends Error {
  constructor(
    message: string,
    public readonly code: GetGameTypesUseCaseErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'GetGameTypesUseCaseError'
  }
}

export enum GetGameTypesUseCaseErrorCode {
  REPOSITORY_ERROR = 'REPOSITORY_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}