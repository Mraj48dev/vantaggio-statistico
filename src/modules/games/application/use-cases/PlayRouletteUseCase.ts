/**
 * Play Roulette Use Case - Games Module Application Layer
 *
 * Orchestrates a complete roulette game round including bet validation,
 * spin execution, and result calculation using the roulette game engine.
 */

import { Result } from '@/shared/domain/types/common'
import { GameType, GameTypeId } from '../../domain/entities/GameType'
import { GameTypeRepository, GameTypeRepositoryError } from '../../domain/repositories/GameTypeRepository'
import {
  RouletteGameEngine,
  BetInput,
  SpinResult,
  RouletteGameError
} from '../../domain/services/RouletteGameEngine'

export interface PlayRouletteUseCaseInput {
  readonly gameTypeId: GameTypeId
  readonly bets: readonly BetInput[]
  readonly userId?: string  // For future session tracking
}

export interface PlayRouletteUseCaseOutput {
  readonly gameType: GameType
  readonly spinResult: SpinResult
  readonly sessionInfo: {
    readonly totalBetAmount: number
    readonly totalWinAmount: number
    readonly totalNetGain: number
    readonly winningPercentage: number
  }
}

export class PlayRouletteUseCase {
  constructor(private readonly gameTypeRepository: GameTypeRepository) {}

  async execute(input: PlayRouletteUseCaseInput): Promise<Result<PlayRouletteUseCaseOutput, PlayRouletteUseCaseError>> {
    try {
      // Validate input
      if (!input.bets || input.bets.length === 0) {
        return Result.failure(new PlayRouletteUseCaseError(
          'At least one bet is required',
          PlayRouletteUseCaseErrorCode.INVALID_INPUT
        ))
      }

      // Get game type
      const gameTypeResult = await this.gameTypeRepository.findById(input.gameTypeId)
      if (!gameTypeResult.isSuccess) {
        return Result.failure(new PlayRouletteUseCaseError(
          'Failed to retrieve game type',
          PlayRouletteUseCaseErrorCode.REPOSITORY_ERROR,
          gameTypeResult.error
        ))
      }

      const gameType = gameTypeResult.value
      if (!gameType) {
        return Result.failure(new PlayRouletteUseCaseError(
          'Game type not found',
          PlayRouletteUseCaseErrorCode.GAME_TYPE_NOT_FOUND
        ))
      }

      if (!gameType.isActive) {
        return Result.failure(new PlayRouletteUseCaseError(
          'Game type is not active',
          PlayRouletteUseCaseErrorCode.GAME_TYPE_INACTIVE
        ))
      }

      // Verify it's a roulette game
      if (!gameType.isRouletteGame()) {
        return Result.failure(new PlayRouletteUseCaseError(
          'Game type is not a roulette game',
          PlayRouletteUseCaseErrorCode.INVALID_GAME_TYPE
        ))
      }

      // Create game engine with game configuration
      const rouletteConfig = gameType.getRouletteConfig()!
      const gameEngine = new RouletteGameEngine(rouletteConfig)

      // Execute the spin
      const spinResult = gameEngine.spin(input.bets)
      if (!spinResult.isSuccess) {
        return Result.failure(new PlayRouletteUseCaseError(
          'Failed to execute roulette spin',
          PlayRouletteUseCaseErrorCode.GAME_ENGINE_ERROR,
          spinResult.error
        ))
      }

      // Calculate session info
      const totalBetAmount = input.bets.reduce((sum, bet) => sum + bet.amount, 0)
      const winningBetsCount = spinResult.value.betResults.filter(result => result.isWinning).length
      const winningPercentage = input.bets.length > 0 ? (winningBetsCount / input.bets.length) * 100 : 0

      const sessionInfo = {
        totalBetAmount,
        totalWinAmount: spinResult.value.totalWinAmount,
        totalNetGain: spinResult.value.totalNetGain,
        winningPercentage
      }

      return Result.success({
        gameType,
        spinResult: spinResult.value,
        sessionInfo
      })
    } catch (error) {
      return Result.failure(new PlayRouletteUseCaseError(
        'Unexpected error during roulette play',
        PlayRouletteUseCaseErrorCode.UNKNOWN_ERROR,
        error as Error
      ))
    }
  }
}

export class PlayRouletteUseCaseError extends Error {
  constructor(
    message: string,
    public readonly code: PlayRouletteUseCaseErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'PlayRouletteUseCaseError'
  }
}

export enum PlayRouletteUseCaseErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  GAME_TYPE_NOT_FOUND = 'GAME_TYPE_NOT_FOUND',
  GAME_TYPE_INACTIVE = 'GAME_TYPE_INACTIVE',
  INVALID_GAME_TYPE = 'INVALID_GAME_TYPE',
  REPOSITORY_ERROR = 'REPOSITORY_ERROR',
  GAME_ENGINE_ERROR = 'GAME_ENGINE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}