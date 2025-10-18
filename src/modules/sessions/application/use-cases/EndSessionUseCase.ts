/**
 * End Session Use Case - Sessions Module Application Layer
 *
 * Ends an active session and generates a summary report.
 */

import { Result } from '@/shared/domain/types/common'
import { SessionId, SessionEndReason } from '../../domain/entities/Session'
import { SessionRepository } from '../../domain/repositories/SessionRepository'
import { SessionService, SessionResult } from '../../domain/services/SessionService'

export interface EndSessionUseCase {
  execute(request: EndSessionRequest): Promise<Result<EndSessionResponse, EndSessionError>>
}

export interface EndSessionRequest {
  readonly sessionId: SessionId
  readonly reason?: SessionEndReason
}

export interface EndSessionResponse {
  readonly sessionResult: SessionResult
  readonly summary: SessionSummaryData
}

export interface SessionSummaryData {
  readonly sessionId: string
  readonly duration: number // seconds
  readonly totalBets: number
  readonly totalWins: number
  readonly totalLosses: number
  readonly finalProfitLoss: number // in euros
  readonly winRate: number // percentage
  readonly endReason: SessionEndReason
  readonly highWatermark: number // highest profit in euros
  readonly lowWatermark: number // lowest point in euros
  readonly gameType: string
  readonly method: string
  readonly startedAt: Date
  readonly endedAt: Date
}

export class DefaultEndSessionUseCase implements EndSessionUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly sessionService: SessionService
  ) {}

  async execute(request: EndSessionRequest): Promise<Result<EndSessionResponse, EndSessionError>> {
    try {
      const { sessionId, reason = SessionEndReason.USER_REQUEST } = request

      // Validate input
      if (!sessionId?.value) {
        return Result.failure(new EndSessionError(
          'Session ID is required',
          EndSessionErrorCode.INVALID_INPUT
        ))
      }

      // Get current session
      const sessionResult = await this.sessionRepository.findById(sessionId)
      if (!sessionResult.isSuccess) {
        return Result.failure(new EndSessionError(
          'Failed to retrieve session',
          EndSessionErrorCode.REPOSITORY_ERROR,
          sessionResult.error
        ))
      }

      const currentSession = sessionResult.value
      if (!currentSession) {
        return Result.failure(new EndSessionError(
          'Session not found',
          EndSessionErrorCode.SESSION_NOT_FOUND
        ))
      }

      // Check if session can be ended
      if (currentSession.status === 'ended' || currentSession.status === 'canceled') {
        return Result.failure(new EndSessionError(
          'Session is already ended',
          EndSessionErrorCode.SESSION_ALREADY_ENDED
        ))
      }

      // End session using domain service
      const endResult = await this.sessionService.endSession(sessionId, reason)
      if (!endResult.isSuccess) {
        return Result.failure(new EndSessionError(
          `Failed to end session: ${endResult.error.message}`,
          EndSessionErrorCode.SESSION_END_FAILED,
          endResult.error
        ))
      }

      const sessionServiceResult = endResult.value

      // Alternative: End session using domain entity if service isn't fully implemented
      const endedSessionResult = currentSession.end(reason)
      if (!endedSessionResult.isSuccess) {
        return Result.failure(new EndSessionError(
          `Failed to end session: ${endedSessionResult.error.message}`,
          EndSessionErrorCode.SESSION_END_FAILED,
          endedSessionResult.error
        ))
      }

      const endedSession = endedSessionResult.value

      // Save updated session
      const updateResult = await this.sessionRepository.update(endedSession)
      if (!updateResult.isSuccess) {
        return Result.failure(new EndSessionError(
          'Failed to save session updates',
          EndSessionErrorCode.REPOSITORY_ERROR,
          updateResult.error
        ))
      }

      const finalSession = updateResult.value

      // Generate summary data
      const summary: SessionSummaryData = {
        sessionId: finalSession.id.value,
        duration: finalSession.getDuration(),
        totalBets: finalSession.totalBets,
        totalWins: finalSession.totalWins,
        totalLosses: finalSession.totalLosses,
        finalProfitLoss: finalSession.getCurrentBalance(),
        winRate: finalSession.getWinRate(),
        endReason: reason,
        highWatermark: finalSession.highWatermark / 100, // Convert to euros
        lowWatermark: finalSession.lowWatermark / 100, // Convert to euros
        gameType: finalSession.gameTypeId,
        method: finalSession.methodId,
        startedAt: finalSession.startedAt,
        endedAt: finalSession.endedAt || new Date()
      }

      // Create a basic SessionResult if service result isn't available
      const result: SessionResult = sessionServiceResult || {
        session: finalSession,
        summary: {
          sessionId: finalSession.id,
          duration: finalSession.getDuration(),
          totalBets: finalSession.totalBets,
          totalWins: finalSession.totalWins,
          totalLosses: finalSession.totalLosses,
          finalProfitLoss: finalSession.profitLoss,
          winRate: finalSession.getWinRate(),
          endReason: reason,
          highWatermark: finalSession.highWatermark,
          lowWatermark: finalSession.lowWatermark
        }
      }

      return Result.success({
        sessionResult: result,
        summary
      })

    } catch (error) {
      return Result.failure(new EndSessionError(
        'Unexpected error during session ending',
        EndSessionErrorCode.UNKNOWN_ERROR,
        error as Error
      ))
    }
  }
}

export class EndSessionError extends Error {
  constructor(
    message: string,
    public readonly code: EndSessionErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'EndSessionError'
  }
}

export enum EndSessionErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_ALREADY_ENDED = 'SESSION_ALREADY_ENDED',
  SESSION_END_FAILED = 'SESSION_END_FAILED',
  REPOSITORY_ERROR = 'REPOSITORY_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}