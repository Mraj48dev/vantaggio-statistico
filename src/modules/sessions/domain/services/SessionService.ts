/**
 * Session Service - Sessions Module Domain Layer
 *
 * Orchestrates session management with Games and Methods modules.
 * This is the core service that coordinates gaming sessions.
 */

import { Result } from '@/shared/domain/types/common'
import { MethodInput, MethodOutput } from '@/shared/domain/types/methods'
import { Session, SessionId, SessionConfig, BetData, SessionError, SessionErrorCode, SessionEndReason } from '../entities/Session'

export interface SessionService {
  /** Create a new gaming session */
  createSession(
    userId: string,
    gameTypeId: string,
    methodId: string,
    config: SessionConfig
  ): Promise<Result<Session, SessionServiceError>>

  /** Place a bet in an active session and calculate next bet suggestion */
  placeBet(
    sessionId: SessionId,
    betData: BetData
  ): Promise<Result<PlaceBetResult, SessionServiceError>>

  /** End an active session */
  endSession(
    sessionId: SessionId,
    reason?: SessionEndReason
  ): Promise<Result<SessionResult, SessionServiceError>>

  /** Pause an active session */
  pauseSession(sessionId: SessionId): Promise<Result<Session, SessionServiceError>>

  /** Resume a paused session */
  resumeSession(sessionId: SessionId): Promise<Result<Session, SessionServiceError>>

  /** Get current session state with next bet suggestion */
  getSessionWithNextBet(sessionId: SessionId): Promise<Result<SessionWithNextBet, SessionServiceError>>

  /** Validate session configuration */
  validateSessionConfig(
    gameTypeId: string,
    methodId: string,
    config: SessionConfig
  ): Promise<Result<boolean, SessionServiceError>>
}

export interface PlaceBetResult {
  readonly session: Session
  readonly nextBetSuggestion: MethodOutput | null
  readonly shouldEndSession: boolean
  readonly endReason?: SessionEndReason
}

export interface SessionResult {
  readonly session: Session
  readonly summary: SessionSummary
}

export interface SessionSummary {
  readonly sessionId: SessionId
  readonly duration: number
  readonly totalBets: number
  readonly totalWins: number
  readonly totalLosses: number
  readonly finalProfitLoss: number
  readonly winRate: number
  readonly endReason: SessionEndReason
  readonly highWatermark: number
  readonly lowWatermark: number
}

export interface SessionWithNextBet {
  readonly session: Session
  readonly nextBetSuggestion: MethodOutput | null
  readonly canPlaceBet: boolean
  readonly autoEndReason?: SessionEndReason
}

export class DefaultSessionService implements SessionService {
  constructor(
    private readonly methodService: any, // Will be injected from Methods Module
    private readonly gameService: any    // Will be injected from Games Module
  ) {}

  async createSession(
    userId: string,
    gameTypeId: string,
    methodId: string,
    config: SessionConfig
  ): Promise<Result<Session, SessionServiceError>> {
    try {
      // Validate session configuration
      const validationResult = await this.validateSessionConfig(gameTypeId, methodId, config)
      if (!validationResult.isSuccess) {
        return Result.failure(validationResult.error)
      }

      // Create new session
      const sessionId = { value: crypto.randomUUID() }
      const session = new Session(
        sessionId,
        userId,
        gameTypeId,
        methodId,
        config,
        'active' as any, // Will be properly typed
        new Date()
      )

      return Result.success(session)

    } catch (error) {
      return Result.failure(new SessionServiceError(
        'Failed to create session',
        SessionServiceErrorCode.CREATION_FAILED,
        error as Error
      ))
    }
  }

  async placeBet(
    sessionId: SessionId,
    betData: BetData
  ): Promise<Result<PlaceBetResult, SessionServiceError>> {
    try {
      // This will be implemented with repository integration
      // For now, return a placeholder structure
      return Result.failure(new SessionServiceError(
        'Not implemented - requires repository integration',
        SessionServiceErrorCode.NOT_IMPLEMENTED
      ))

    } catch (error) {
      return Result.failure(new SessionServiceError(
        'Failed to place bet',
        SessionServiceErrorCode.BET_PLACEMENT_FAILED,
        error as Error
      ))
    }
  }

  async endSession(
    sessionId: SessionId,
    reason: SessionEndReason = SessionEndReason.USER_REQUEST
  ): Promise<Result<SessionResult, SessionServiceError>> {
    try {
      // This will be implemented with repository integration
      return Result.failure(new SessionServiceError(
        'Not implemented - requires repository integration',
        SessionServiceErrorCode.NOT_IMPLEMENTED
      ))

    } catch (error) {
      return Result.failure(new SessionServiceError(
        'Failed to end session',
        SessionServiceErrorCode.SESSION_END_FAILED,
        error as Error
      ))
    }
  }

  async pauseSession(sessionId: SessionId): Promise<Result<Session, SessionServiceError>> {
    try {
      // This will be implemented with repository integration
      return Result.failure(new SessionServiceError(
        'Not implemented - requires repository integration',
        SessionServiceErrorCode.NOT_IMPLEMENTED
      ))

    } catch (error) {
      return Result.failure(new SessionServiceError(
        'Failed to pause session',
        SessionServiceErrorCode.SESSION_PAUSE_FAILED,
        error as Error
      ))
    }
  }

  async resumeSession(sessionId: SessionId): Promise<Result<Session, SessionServiceError>> {
    try {
      // This will be implemented with repository integration
      return Result.failure(new SessionServiceError(
        'Not implemented - requires repository integration',
        SessionServiceErrorCode.NOT_IMPLEMENTED
      ))

    } catch (error) {
      return Result.failure(new SessionServiceError(
        'Failed to resume session',
        SessionServiceErrorCode.SESSION_RESUME_FAILED,
        error as Error
      ))
    }
  }

  async getSessionWithNextBet(sessionId: SessionId): Promise<Result<SessionWithNextBet, SessionServiceError>> {
    try {
      // This will be implemented with repository integration
      return Result.failure(new SessionServiceError(
        'Not implemented - requires repository integration',
        SessionServiceErrorCode.NOT_IMPLEMENTED
      ))

    } catch (error) {
      return Result.failure(new SessionServiceError(
        'Failed to get session with next bet',
        SessionServiceErrorCode.CALCULATION_FAILED,
        error as Error
      ))
    }
  }

  async validateSessionConfig(
    gameTypeId: string,
    methodId: string,
    config: SessionConfig
  ): Promise<Result<boolean, SessionServiceError>> {
    try {
      // Validate base amount
      if (config.baseAmount <= 0) {
        return Result.failure(new SessionServiceError(
          'Base amount must be greater than 0',
          SessionServiceErrorCode.INVALID_CONFIGURATION
        ))
      }

      // Validate stop loss
      if (config.stopLoss <= 0) {
        return Result.failure(new SessionServiceError(
          'Stop loss must be greater than 0',
          SessionServiceErrorCode.INVALID_CONFIGURATION
        ))
      }

      // Validate stop loss is not too small compared to base amount
      if (config.stopLoss < config.baseAmount) {
        return Result.failure(new SessionServiceError(
          'Stop loss should be at least equal to base amount',
          SessionServiceErrorCode.INVALID_CONFIGURATION
        ))
      }

      // Validate stop win if provided
      if (config.stopWin && config.stopWin <= 0) {
        return Result.failure(new SessionServiceError(
          'Stop win must be greater than 0 if specified',
          SessionServiceErrorCode.INVALID_CONFIGURATION
        ))
      }

      // Validate max bets if provided
      if (config.maxBets && config.maxBets <= 0) {
        return Result.failure(new SessionServiceError(
          'Max bets must be greater than 0 if specified',
          SessionServiceErrorCode.INVALID_CONFIGURATION
        ))
      }

      // Validate max duration if provided
      if (config.maxDuration && config.maxDuration <= 0) {
        return Result.failure(new SessionServiceError(
          'Max duration must be greater than 0 if specified',
          SessionServiceErrorCode.INVALID_CONFIGURATION
        ))
      }

      return Result.success(true)

    } catch (error) {
      return Result.failure(new SessionServiceError(
        'Failed to validate session configuration',
        SessionServiceErrorCode.VALIDATION_FAILED,
        error as Error
      ))
    }
  }

  /**
   * Calculate next bet suggestion for a session
   * This is the core integration point with the Methods Module
   */
  private async calculateNextBetSuggestion(session: Session): Promise<Result<MethodOutput | null, SessionServiceError>> {
    try {
      if (!this.methodService) {
        return Result.success(null)
      }

      // Build method input from session state
      const lastBet = session.bets[session.bets.length - 1]
      const gameResult = lastBet?.gameResult

      if (!gameResult) {
        // First bet - create a dummy game result or return null
        return Result.success(null)
      }

      const methodInput: MethodInput = {
        gameResult: {
          number: gameResult.number,
          color: gameResult.color,
          isEven: gameResult.isEven,
          isHigh: gameResult.isHigh
        },
        sessionHistory: session.bets.map(bet => ({
          betType: bet.betType,
          amount: bet.amount,
          outcome: bet.outcome === 'win' ? 'win' : bet.outcome === 'loss' ? 'loss' : 'push',
          profitLoss: bet.profitLoss,
          gameResult: bet.gameResult,
          timestamp: bet.createdAt
        })),
        currentProgression: session.currentProgression,
        baseAmount: session.config.baseAmount,
        currentBalance: (session.profitLoss / 100) + (session.config.stopLoss), // Rough approximation
        stopLoss: session.config.stopLoss
      }

      // Call Methods Module to calculate next bet
      const calculationResult = await this.methodService.calculateNextBet({
        methodId: session.methodId,
        input: methodInput
      })

      if (!calculationResult.isSuccess) {
        return Result.failure(new SessionServiceError(
          `Method calculation failed: ${calculationResult.error.message}`,
          SessionServiceErrorCode.CALCULATION_FAILED,
          calculationResult.error
        ))
      }

      return Result.success(calculationResult.value.output)

    } catch (error) {
      return Result.failure(new SessionServiceError(
        'Failed to calculate next bet suggestion',
        SessionServiceErrorCode.CALCULATION_FAILED,
        error as Error
      ))
    }
  }
}

export class SessionServiceError extends Error {
  constructor(
    message: string,
    public readonly code: SessionServiceErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'SessionServiceError'
  }
}

export enum SessionServiceErrorCode {
  CREATION_FAILED = 'CREATION_FAILED',
  BET_PLACEMENT_FAILED = 'BET_PLACEMENT_FAILED',
  SESSION_END_FAILED = 'SESSION_END_FAILED',
  SESSION_PAUSE_FAILED = 'SESSION_PAUSE_FAILED',
  SESSION_RESUME_FAILED = 'SESSION_RESUME_FAILED',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  CALCULATION_FAILED = 'CALCULATION_FAILED',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
  REPOSITORY_ERROR = 'REPOSITORY_ERROR'
}