/**
 * Place Bet Use Case - Sessions Module Application Layer
 *
 * Places a bet in an active session and calculates the next bet suggestion.
 * This is the core use case that integrates Games + Methods + Sessions.
 */

import { Result } from '@/shared/domain/types/common'
import { Session, SessionId, BetData, SessionEndReason } from '../../domain/entities/Session'
import { SessionRepository } from '../../domain/repositories/SessionRepository'
import { SessionService, PlaceBetResult } from '../../domain/services/SessionService'

export interface PlaceBetUseCase {
  execute(request: PlaceBetRequest): Promise<Result<PlaceBetResponse, PlaceBetError>>
}

export interface PlaceBetRequest {
  readonly sessionId: SessionId
  readonly betData: BetData
}

export interface PlaceBetResponse {
  readonly session: Session
  readonly nextBetSuggestion: NextBetSuggestion | null
  readonly sessionEnded: boolean
  readonly endReason?: SessionEndReason
}

export interface NextBetSuggestion {
  readonly shouldBet: boolean
  readonly betType: string
  readonly amount: number
  readonly progression: number[]
  readonly reason: string
  readonly stopSession: boolean
}

export class DefaultPlaceBetUseCase implements PlaceBetUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly sessionService: SessionService
  ) {}

  async execute(request: PlaceBetRequest): Promise<Result<PlaceBetResponse, PlaceBetError>> {
    try {
      const { sessionId, betData } = request

      // Validate input
      if (!sessionId?.value) {
        return Result.failure(new PlaceBetError(
          'Session ID is required',
          PlaceBetErrorCode.INVALID_INPUT
        ))
      }

      if (!betData) {
        return Result.failure(new PlaceBetError(
          'Bet data is required',
          PlaceBetErrorCode.INVALID_INPUT
        ))
      }

      // Get current session
      const sessionResult = await this.sessionRepository.findById(sessionId)
      if (!sessionResult.isSuccess) {
        return Result.failure(new PlaceBetError(
          'Failed to retrieve session',
          PlaceBetErrorCode.REPOSITORY_ERROR,
          sessionResult.error
        ))
      }

      const currentSession = sessionResult.value
      if (!currentSession) {
        return Result.failure(new PlaceBetError(
          'Session not found',
          PlaceBetErrorCode.SESSION_NOT_FOUND
        ))
      }

      // Check if session can accept bets
      const canBetResult = currentSession.canPlaceBet()
      if (!canBetResult.isSuccess) {
        return Result.failure(new PlaceBetError(
          `Cannot place bet: ${canBetResult.error.message}`,
          PlaceBetErrorCode.CANNOT_PLACE_BET,
          canBetResult.error
        ))
      }

      // Place bet using session service
      const placeBetResult = await this.sessionService.placeBet(sessionId, betData)
      if (!placeBetResult.isSuccess) {
        return Result.failure(new PlaceBetError(
          `Failed to place bet: ${placeBetResult.error.message}`,
          PlaceBetErrorCode.BET_PLACEMENT_FAILED,
          placeBetResult.error
        ))
      }

      const result = placeBetResult.value
      let updatedSession = result.session

      // Check if session should be auto-ended
      const autoEndCheck = updatedSession.shouldAutoEnd()
      let sessionEnded = result.shouldEndSession || autoEndCheck.should
      let endReason = result.endReason || autoEndCheck.reason

      // End session if required
      if (sessionEnded && endReason) {
        const endSessionResult = updatedSession.end(endReason)
        if (endSessionResult.isSuccess) {
          updatedSession = endSessionResult.value
        }
      }

      // Save updated session
      const updateResult = await this.sessionRepository.update(updatedSession)
      if (!updateResult.isSuccess) {
        return Result.failure(new PlaceBetError(
          'Failed to save session updates',
          PlaceBetErrorCode.REPOSITORY_ERROR,
          updateResult.error
        ))
      }

      const finalSession = updateResult.value

      // Map next bet suggestion
      const nextBetSuggestion = result.nextBetSuggestion ? {
        shouldBet: result.nextBetSuggestion.shouldBet,
        betType: result.nextBetSuggestion.betType,
        amount: result.nextBetSuggestion.amount,
        progression: result.nextBetSuggestion.progression,
        reason: result.nextBetSuggestion.reason || '',
        stopSession: result.nextBetSuggestion.stopSession
      } : null

      return Result.success({
        session: finalSession,
        nextBetSuggestion,
        sessionEnded,
        endReason
      })

    } catch (error) {
      return Result.failure(new PlaceBetError(
        'Unexpected error during bet placement',
        PlaceBetErrorCode.UNKNOWN_ERROR,
        error as Error
      ))
    }
  }
}

export class PlaceBetError extends Error {
  constructor(
    message: string,
    public readonly code: PlaceBetErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'PlaceBetError'
  }
}

export enum PlaceBetErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  CANNOT_PLACE_BET = 'CANNOT_PLACE_BET',
  BET_PLACEMENT_FAILED = 'BET_PLACEMENT_FAILED',
  REPOSITORY_ERROR = 'REPOSITORY_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}