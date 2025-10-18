/**
 * Get Active Session Use Case - Sessions Module Application Layer
 *
 * Retrieves the current active session for a user with next bet suggestion.
 */

import { Result } from '@/shared/domain/types/common'
import { Session } from '../../domain/entities/Session'
import { SessionRepository } from '../../domain/repositories/SessionRepository'
import { SessionService, SessionWithNextBet } from '../../domain/services/SessionService'

export interface GetActiveSessionUseCase {
  execute(request: GetActiveSessionRequest): Promise<Result<GetActiveSessionResponse, GetActiveSessionError>>
}

export interface GetActiveSessionRequest {
  readonly userId: string
}

export interface GetActiveSessionResponse {
  readonly session: Session | null
  readonly nextBetSuggestion: NextBetSuggestion | null
  readonly canPlaceBet: boolean
  readonly autoEndWarning?: AutoEndWarning
}

export interface NextBetSuggestion {
  readonly shouldBet: boolean
  readonly betType: string
  readonly amount: number
  readonly progression: number[]
  readonly reason: string
  readonly stopSession: boolean
}

export interface AutoEndWarning {
  readonly willAutoEnd: boolean
  readonly reason: string
  readonly message: string
}

export class DefaultGetActiveSessionUseCase implements GetActiveSessionUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly sessionService: SessionService
  ) {}

  async execute(request: GetActiveSessionRequest): Promise<Result<GetActiveSessionResponse, GetActiveSessionError>> {
    try {
      const { userId } = request

      // Validate input
      if (!userId) {
        return Result.failure(new GetActiveSessionError(
          'User ID is required',
          GetActiveSessionErrorCode.INVALID_INPUT
        ))
      }

      // Get active sessions for user
      const activeSessionsResult = await this.sessionRepository.findActiveByUserId(userId)
      if (!activeSessionsResult.isSuccess) {
        return Result.failure(new GetActiveSessionError(
          'Failed to retrieve active sessions',
          GetActiveSessionErrorCode.REPOSITORY_ERROR,
          activeSessionsResult.error
        ))
      }

      const activeSessions = activeSessionsResult.value

      // If no active sessions, return null
      if (activeSessions.length === 0) {
        return Result.success({
          session: null,
          nextBetSuggestion: null,
          canPlaceBet: false
        })
      }

      // Get the most recent active session (should be only one, but just in case)
      const session = activeSessions[0]

      // Get session with next bet suggestion using service
      const sessionWithNextBetResult = await this.sessionService.getSessionWithNextBet(session.id)

      let nextBetSuggestion: NextBetSuggestion | null = null
      let canPlaceBet = false

      if (sessionWithNextBetResult.isSuccess) {
        const sessionData = sessionWithNextBetResult.value
        canPlaceBet = sessionData.canPlaceBet

        if (sessionData.nextBetSuggestion) {
          nextBetSuggestion = {
            shouldBet: sessionData.nextBetSuggestion.shouldBet,
            betType: sessionData.nextBetSuggestion.betType,
            amount: sessionData.nextBetSuggestion.amount,
            progression: sessionData.nextBetSuggestion.progression,
            reason: sessionData.nextBetSuggestion.reason || '',
            stopSession: sessionData.nextBetSuggestion.stopSession
          }
        }
      } else {
        // Fallback: check if session can place bet using entity method
        const canBetResult = session.canPlaceBet()
        canPlaceBet = canBetResult.isSuccess
      }

      // Check for auto-end conditions
      const autoEndCheck = session.shouldAutoEnd()
      let autoEndWarning: AutoEndWarning | undefined

      if (autoEndCheck.should && autoEndCheck.reason) {
        autoEndWarning = {
          willAutoEnd: true,
          reason: autoEndCheck.reason,
          message: this.getAutoEndMessage(autoEndCheck.reason, session)
        }
      }

      return Result.success({
        session,
        nextBetSuggestion,
        canPlaceBet,
        autoEndWarning
      })

    } catch (error) {
      return Result.failure(new GetActiveSessionError(
        'Unexpected error retrieving active session',
        GetActiveSessionErrorCode.UNKNOWN_ERROR,
        error as Error
      ))
    }
  }

  private getAutoEndMessage(reason: string, session: Session): string {
    switch (reason) {
      case 'stop_loss':
        return `Stop loss di €${session.config.stopLoss} raggiunto. La sessione verrà terminata automaticamente.`
      case 'stop_win':
        return `Stop win di €${session.config.stopWin} raggiunto. La sessione verrà terminata automaticamente.`
      case 'max_bets':
        return `Limite massimo di ${session.config.maxBets} puntate raggiunto. La sessione verrà terminata automaticamente.`
      case 'max_duration':
        const maxMinutes = Math.floor((session.config.maxDuration || 0) / 60)
        return `Durata massima di ${maxMinutes} minuti raggiunta. La sessione verrà terminata automaticamente.`
      default:
        return 'La sessione verrà terminata automaticamente.'
    }
  }
}

export class GetActiveSessionError extends Error {
  constructor(
    message: string,
    public readonly code: GetActiveSessionErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'GetActiveSessionError'
  }
}

export enum GetActiveSessionErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  REPOSITORY_ERROR = 'REPOSITORY_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}