/**
 * Session Entity - Sessions Module Domain Layer
 *
 * Represents a gaming session where a user plays using a specific method.
 * Tracks bets, progression state, and session lifecycle.
 */

import { Result } from '@/shared/domain/types/common'
import { MethodInput, MethodOutput } from '@/shared/domain/types/methods'

export interface SessionId {
  readonly value: string
}

export interface SessionConfig {
  readonly baseAmount: number
  readonly stopLoss: number
  readonly stopWin?: number
  readonly maxBets?: number
  readonly maxDuration?: number // seconds
  readonly methodConfig: Record<string, unknown>
}

export class Session {
  constructor(
    public readonly id: SessionId,
    public readonly userId: string,
    public readonly gameTypeId: string,
    public readonly methodId: string,
    public readonly config: SessionConfig,
    public readonly status: SessionStatus,
    public readonly startedAt: Date,
    public readonly endedAt: Date | null = null,
    public readonly pausedAt: Date | null = null,
    public readonly totalBets: number = 0,
    public readonly totalWins: number = 0,
    public readonly totalLosses: number = 0,
    public readonly profitLoss: number = 0, // In cents
    public readonly highWatermark: number = 0, // Highest profit reached
    public readonly lowWatermark: number = 0, // Lowest point reached
    public readonly currentProgression: number[] = [],
    public readonly bets: Bet[] = [],
    public readonly updatedAt: Date = new Date()
  ) {}

  /**
   * Check if session can accept new bets
   */
  canPlaceBet(): Result<boolean, SessionError> {
    if (this.status !== SessionStatus.ACTIVE) {
      return Result.failure(new SessionError(
        'Session is not active',
        SessionErrorCode.SESSION_NOT_ACTIVE
      ))
    }

    // Check stop loss
    if (this.profitLoss <= -Math.abs(this.config.stopLoss * 100)) { // Convert to cents
      return Result.failure(new SessionError(
        'Stop loss reached',
        SessionErrorCode.STOP_LOSS_REACHED
      ))
    }

    // Check stop win if configured
    if (this.config.stopWin && this.profitLoss >= this.config.stopWin * 100) {
      return Result.failure(new SessionError(
        'Stop win reached',
        SessionErrorCode.STOP_WIN_REACHED
      ))
    }

    // Check max bets if configured
    if (this.config.maxBets && this.totalBets >= this.config.maxBets) {
      return Result.failure(new SessionError(
        'Maximum number of bets reached',
        SessionErrorCode.MAX_BETS_REACHED
      ))
    }

    // Check max duration if configured
    if (this.config.maxDuration) {
      const sessionDuration = (Date.now() - this.startedAt.getTime()) / 1000
      if (sessionDuration >= this.config.maxDuration) {
        return Result.failure(new SessionError(
          'Maximum session duration reached',
          SessionErrorCode.MAX_DURATION_REACHED
        ))
      }
    }

    return Result.success(true)
  }

  /**
   * Place a new bet in the session
   */
  placeBet(betData: BetData): Result<Session, SessionError> {
    const canBetResult = this.canPlaceBet()
    if (!canBetResult.isSuccess) {
      return Result.failure(canBetResult.error)
    }

    const bet = new Bet(
      createBetId(),
      this.id,
      betData.betType,
      betData.betValue,
      betData.amount,
      betData.gameResult,
      this.currentProgression,
      new Date()
    )

    // Calculate outcome and profit/loss
    const outcome = this.calculateBetOutcome(bet, betData.gameResult)
    const profitLoss = this.calculateProfitLoss(bet, outcome)

    const updatedBet = bet.withOutcome(outcome, profitLoss)

    // Update session state
    const newTotalBets = this.totalBets + 1
    const newTotalWins = outcome === BetOutcome.WIN ? this.totalWins + 1 : this.totalWins
    const newTotalLosses = outcome === BetOutcome.LOSS ? this.totalLosses + 1 : this.totalLosses
    const newProfitLoss = this.profitLoss + profitLoss
    const newHighWatermark = Math.max(this.highWatermark, newProfitLoss)
    const newLowWatermark = Math.min(this.lowWatermark, newProfitLoss)

    return Result.success(new Session(
      this.id,
      this.userId,
      this.gameTypeId,
      this.methodId,
      this.config,
      this.status,
      this.startedAt,
      this.endedAt,
      this.pausedAt,
      newTotalBets,
      newTotalWins,
      newTotalLosses,
      newProfitLoss,
      newHighWatermark,
      newLowWatermark,
      this.currentProgression, // Will be updated by method calculation
      [...this.bets, updatedBet],
      new Date()
    ))
  }

  /**
   * Update session with new progression state from method calculation
   */
  updateProgression(newProgression: number[]): Session {
    return new Session(
      this.id,
      this.userId,
      this.gameTypeId,
      this.methodId,
      this.config,
      this.status,
      this.startedAt,
      this.endedAt,
      this.pausedAt,
      this.totalBets,
      this.totalWins,
      this.totalLosses,
      this.profitLoss,
      this.highWatermark,
      this.lowWatermark,
      newProgression,
      this.bets,
      new Date()
    )
  }

  /**
   * Pause the session
   */
  pause(): Result<Session, SessionError> {
    if (this.status !== SessionStatus.ACTIVE) {
      return Result.failure(new SessionError(
        'Can only pause active sessions',
        SessionErrorCode.INVALID_STATUS_TRANSITION
      ))
    }

    return Result.success(new Session(
      this.id,
      this.userId,
      this.gameTypeId,
      this.methodId,
      this.config,
      SessionStatus.PAUSED,
      this.startedAt,
      this.endedAt,
      new Date(),
      this.totalBets,
      this.totalWins,
      this.totalLosses,
      this.profitLoss,
      this.highWatermark,
      this.lowWatermark,
      this.currentProgression,
      this.bets,
      new Date()
    ))
  }

  /**
   * Resume the session
   */
  resume(): Result<Session, SessionError> {
    if (this.status !== SessionStatus.PAUSED) {
      return Result.failure(new SessionError(
        'Can only resume paused sessions',
        SessionErrorCode.INVALID_STATUS_TRANSITION
      ))
    }

    return Result.success(new Session(
      this.id,
      this.userId,
      this.gameTypeId,
      this.methodId,
      this.config,
      SessionStatus.ACTIVE,
      this.startedAt,
      this.endedAt,
      null, // Clear paused timestamp
      this.totalBets,
      this.totalWins,
      this.totalLosses,
      this.profitLoss,
      this.highWatermark,
      this.lowWatermark,
      this.currentProgression,
      this.bets,
      new Date()
    ))
  }

  /**
   * End the session
   */
  end(reason: SessionEndReason): Result<Session, SessionError> {
    if (this.status === SessionStatus.ENDED || this.status === SessionStatus.CANCELED) {
      return Result.failure(new SessionError(
        'Session is already ended',
        SessionErrorCode.INVALID_STATUS_TRANSITION
      ))
    }

    return Result.success(new Session(
      this.id,
      this.userId,
      this.gameTypeId,
      this.methodId,
      this.config,
      SessionStatus.ENDED,
      this.startedAt,
      new Date(),
      this.pausedAt,
      this.totalBets,
      this.totalWins,
      this.totalLosses,
      this.profitLoss,
      this.highWatermark,
      this.lowWatermark,
      this.currentProgression,
      this.bets,
      new Date()
    ))
  }

  /**
   * Get session duration in seconds
   */
  getDuration(): number {
    const endTime = this.endedAt || new Date()
    return Math.floor((endTime.getTime() - this.startedAt.getTime()) / 1000)
  }

  /**
   * Get win rate as percentage
   */
  getWinRate(): number {
    if (this.totalBets === 0) return 0
    return (this.totalWins / this.totalBets) * 100
  }

  /**
   * Get current balance (profit/loss in euros)
   */
  getCurrentBalance(): number {
    return this.profitLoss / 100 // Convert cents to euros
  }

  /**
   * Check if session should be automatically ended
   */
  shouldAutoEnd(): { should: boolean; reason?: SessionEndReason } {
    // Check stop loss
    if (this.profitLoss <= -Math.abs(this.config.stopLoss * 100)) {
      return { should: true, reason: SessionEndReason.STOP_LOSS }
    }

    // Check stop win
    if (this.config.stopWin && this.profitLoss >= this.config.stopWin * 100) {
      return { should: true, reason: SessionEndReason.STOP_WIN }
    }

    // Check max bets
    if (this.config.maxBets && this.totalBets >= this.config.maxBets) {
      return { should: true, reason: SessionEndReason.MAX_BETS }
    }

    // Check max duration
    if (this.config.maxDuration) {
      const sessionDuration = this.getDuration()
      if (sessionDuration >= this.config.maxDuration) {
        return { should: true, reason: SessionEndReason.MAX_DURATION }
      }
    }

    return { should: false }
  }

  private calculateBetOutcome(bet: Bet, gameResult: GameResult): BetOutcome {
    // For column bets (1-34), check if the number is in the first column
    if (bet.betType === 'column_1') {
      // First column numbers: 1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34
      const firstColumnNumbers = [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
      return firstColumnNumbers.includes(gameResult.number) ? BetOutcome.WIN : BetOutcome.LOSS
    }

    // Add other bet types as needed
    return BetOutcome.LOSS
  }

  private calculateProfitLoss(bet: Bet, outcome: BetOutcome): number {
    if (outcome === BetOutcome.WIN) {
      // Column bet pays 2:1
      if (bet.betType === 'column_1') {
        return bet.amount * 2 // Win back 2x the bet
      }
    }

    return -bet.amount // Lose the bet amount
  }
}

export interface BetData {
  readonly betType: string
  readonly betValue?: string
  readonly amount: number
  readonly gameResult: GameResult
}

export interface GameResult {
  readonly number: number
  readonly color: string
  readonly isEven: boolean
  readonly isHigh: boolean
  readonly timestamp?: Date
}

export class Bet {
  constructor(
    public readonly id: BetId,
    public readonly sessionId: SessionId,
    public readonly betType: string,
    public readonly betValue: string | null,
    public readonly amount: number,
    public readonly gameResult: GameResult,
    public readonly progression: number[],
    public readonly createdAt: Date,
    public readonly outcome?: BetOutcome,
    public readonly profitLoss: number = 0
  ) {}

  withOutcome(outcome: BetOutcome, profitLoss: number): Bet {
    return new Bet(
      this.id,
      this.sessionId,
      this.betType,
      this.betValue,
      this.amount,
      this.gameResult,
      this.progression,
      this.createdAt,
      outcome,
      profitLoss
    )
  }
}

export interface BetId {
  readonly value: string
}

export enum SessionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
  CANCELED = 'canceled'
}

export enum BetOutcome {
  WIN = 'win',
  LOSS = 'loss',
  PUSH = 'push'
}

export enum SessionEndReason {
  USER_REQUEST = 'user_request',
  STOP_LOSS = 'stop_loss',
  STOP_WIN = 'stop_win',
  MAX_BETS = 'max_bets',
  MAX_DURATION = 'max_duration',
  SYSTEM = 'system'
}

export class SessionError extends Error {
  constructor(
    message: string,
    public readonly code: SessionErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'SessionError'
  }
}

export enum SessionErrorCode {
  SESSION_NOT_ACTIVE = 'SESSION_NOT_ACTIVE',
  STOP_LOSS_REACHED = 'STOP_LOSS_REACHED',
  STOP_WIN_REACHED = 'STOP_WIN_REACHED',
  MAX_BETS_REACHED = 'MAX_BETS_REACHED',
  MAX_DURATION_REACHED = 'MAX_DURATION_REACHED',
  INVALID_STATUS_TRANSITION = 'INVALID_STATUS_TRANSITION',
  INVALID_BET_DATA = 'INVALID_BET_DATA'
}

// Helper functions
export function createSessionId(): SessionId {
  return { value: crypto.randomUUID() }
}

export function createBetId(): BetId {
  return { value: crypto.randomUUID() }
}