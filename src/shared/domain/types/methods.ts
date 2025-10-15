/**
 * Method module contracts and interfaces
 *
 * This file implements the standardized METHOD INPUT/OUTPUT interface
 * from the roadmap, ensuring all betting strategies (Fibonacci, Martingale,
 * etc.) use the same contract for seamless interoperability.
 */

import { Result, Option, Money, UserId, SessionId } from './common'

// ================================
// CORE METHOD CONTRACTS - As specified in roadmap
// ================================

/**
 * Standardized input for ALL betting methods
 * This contract ensures method interoperability and modular design
 */
export interface MethodInput {
  /** Current game result that triggered the calculation */
  readonly gameResult: GameResult

  /** Complete session history for progression calculations */
  readonly sessionHistory: BetResult[]

  /** Current method progression state (e.g., Fibonacci sequence position) */
  readonly currentProgression: number[]

  /** Base betting amount in cents */
  readonly baseAmount: number

  /** Current user balance in cents */
  readonly currentBalance: number

  /** Stop loss limit in cents */
  readonly stopLoss: number

  /** Optional stop win limit in cents */
  readonly stopWin?: number

  /** Session metadata for context */
  readonly sessionContext: SessionContext
}

/**
 * Standardized output from ALL betting methods
 * Provides consistent interface for bet calculation results
 */
export interface MethodOutput {
  /** Whether the method recommends placing a bet */
  readonly shouldBet: boolean

  /** Type of bet to place (red, black, even, odd, etc.) */
  readonly betType: BetType

  /** Specific bet value for number bets */
  readonly betValue?: string

  /** Recommended bet amount in cents */
  readonly amount: number

  /** Updated progression state after this calculation */
  readonly progression: number[]

  /** Whether to stop the session (stop-loss/win reached) */
  readonly stopSession: boolean

  /** Reason for the betting decision */
  readonly reason?: string

  /** Additional metadata about the calculation */
  readonly metadata?: MethodCalculationMetadata
}

// ================================
// GAME RESULT STRUCTURE
// ================================

export interface GameResult {
  /** Number that came up (0-36 for European roulette) */
  readonly number: number

  /** Color of the number */
  readonly color: 'red' | 'black' | 'green'

  /** Whether the number is even */
  readonly isEven: boolean

  /** Whether the number is high (19-36) */
  readonly isHigh: boolean

  /** Whether the number is low (1-18) */
  readonly isLow: boolean

  /** Which dozen the number belongs to */
  readonly dozen?: 1 | 2 | 3

  /** Which column the number belongs to */
  readonly column?: 1 | 2 | 3

  /** Timestamp when the result occurred */
  readonly timestamp: Date
}

// ================================
// BET STRUCTURE
// ================================

export interface BetResult {
  readonly id: string
  readonly sessionId: SessionId
  readonly betType: BetType
  readonly betValue?: string
  readonly amount: number
  readonly gameResult: GameResult
  readonly outcome: BetOutcome
  readonly profitLoss: number
  readonly progression: number[]
  readonly timestamp: Date
}

export enum BetType {
  RED = 'red',
  BLACK = 'black',
  EVEN = 'even',
  ODD = 'odd',
  HIGH = 'high',
  LOW = 'low',
  NUMBER = 'number',
  DOZEN_1 = 'dozen_1',
  DOZEN_2 = 'dozen_2',
  DOZEN_3 = 'dozen_3',
  COLUMN_1 = 'column_1',
  COLUMN_2 = 'column_2',
  COLUMN_3 = 'column_3',
}

export enum BetOutcome {
  WIN = 'win',
  LOSS = 'loss',
  PUSH = 'push',
}

// ================================
// SESSION CONTEXT
// ================================

export interface SessionContext {
  readonly sessionId: SessionId
  readonly userId: UserId
  readonly methodId: string
  readonly gameTypeId: string
  readonly startedAt: Date
  readonly totalBets: number
  readonly currentStreak: number // Consecutive wins/losses
  readonly sessionDuration: number // in seconds
}

// ================================
// METHOD CALCULATION METADATA
// ================================

export interface MethodCalculationMetadata {
  /** Calculation timestamp */
  readonly calculatedAt: Date

  /** Method version used for calculation */
  readonly methodVersion: string

  /** Confidence score of the recommendation (0-100) */
  readonly confidence?: number

  /** Risk assessment of the recommended bet */
  readonly riskLevel?: 'low' | 'medium' | 'high'

  /** Expected value of the bet */
  readonly expectedValue?: number

  /** Probability of winning the recommended bet */
  readonly winProbability?: number

  /** Alternative betting options considered */
  readonly alternatives?: AlternativeBet[]

  /** Debug information for method analysis */
  readonly debug?: Record<string, unknown>
}

export interface AlternativeBet {
  readonly betType: BetType
  readonly amount: number
  readonly expectedValue: number
  readonly winProbability: number
  readonly reason: string
}

// ================================
// METHOD INTERFACE - Contract for all betting strategies
// ================================

/**
 * Core interface that ALL betting methods must implement
 * This ensures modular design and easy addition of new strategies
 */
export interface BettingMethod {
  /** Unique identifier for the method */
  readonly id: string

  /** Human-readable name */
  readonly name: string

  /** Method category (progression, flat, system) */
  readonly category: MethodCategory

  /** Calculate next bet based on game state */
  calculateNextBet(input: MethodInput): Promise<Result<MethodOutput, MethodError>>

  /** Validate method configuration */
  validateConfig(config: MethodConfig): Result<void, ValidationError[]>

  /** Reset progression to initial state */
  resetProgression(): number[]

  /** Get method metadata and description */
  getMetadata(): MethodMetadata

  /** Check if method should stop based on current state */
  shouldStop(input: MethodInput): boolean
}

// ================================
// METHOD CONFIGURATION
// ================================

export interface MethodConfig {
  /** Base betting amount in cents */
  readonly baseAmount: number

  /** Stop loss limit in cents */
  readonly stopLoss: number

  /** Optional stop win limit in cents */
  readonly stopWin?: number

  /** Method-specific parameters */
  readonly parameters: Record<string, unknown>

  /** Risk management settings */
  readonly riskManagement?: RiskManagementConfig
}

export interface RiskManagementConfig {
  /** Maximum bet amount in cents */
  readonly maxBetAmount: number

  /** Maximum number of consecutive losses before stopping */
  readonly maxConsecutiveLosses?: number

  /** Maximum session duration in seconds */
  readonly maxSessionDuration?: number

  /** Bankroll percentage to risk per bet */
  readonly bankrollPercentage?: number
}

// ================================
// METHOD METADATA
// ================================

export interface MethodMetadata {
  readonly id: string
  readonly name: string
  readonly displayName: string
  readonly description: string
  readonly category: MethodCategory
  readonly difficulty: MethodDifficulty
  readonly riskLevel: MethodRiskLevel
  readonly minBankroll: Money
  readonly recommendedBankroll: Money
  readonly advantages: string[]
  readonly disadvantages: string[]
  readonly compatibleGames: string[]
  readonly configSchema: MethodConfigSchema
  readonly version: string
  readonly author?: string
  readonly createdAt: Date
  readonly updatedAt: Date
}

export enum MethodCategory {
  PROGRESSION = 'progression',
  FLAT = 'flat',
  SYSTEM = 'system',
  CUSTOM = 'custom',
}

export enum MethodDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  EXPERT = 'expert',
}

export enum MethodRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EXTREME = 'extreme',
}

// ================================
// METHOD CONFIGURATION SCHEMA
// ================================

export interface MethodConfigSchema {
  readonly type: 'object'
  readonly properties: Record<string, SchemaProperty>
  readonly required: string[]
  readonly additionalProperties?: boolean
}

export interface SchemaProperty {
  readonly type: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object'
  readonly minimum?: number
  readonly maximum?: number
  readonly minLength?: number
  readonly maxLength?: number
  readonly enum?: (string | number)[]
  readonly default?: unknown
  readonly description?: string
  readonly title?: string
}

// ================================
// METHOD ERRORS
// ================================

export interface MethodError {
  readonly code: MethodErrorCode
  readonly message: string
  readonly details?: Record<string, unknown>
  readonly recoverable: boolean
}

export enum MethodErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_CONFIG = 'INVALID_CONFIG',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  STOP_LOSS_REACHED = 'STOP_LOSS_REACHED',
  STOP_WIN_REACHED = 'STOP_WIN_REACHED',
  MAX_BET_EXCEEDED = 'MAX_BET_EXCEEDED',
  PROGRESSION_LIMIT_REACHED = 'PROGRESSION_LIMIT_REACHED',
  METHOD_NOT_SUPPORTED = 'METHOD_NOT_SUPPORTED',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
}

export interface ValidationError {
  readonly field: string
  readonly code: string
  readonly message: string
  readonly value?: unknown
}

// ================================
// METHOD PERFORMANCE TRACKING
// ================================

export interface MethodPerformance {
  readonly methodId: string
  readonly gameTypeId: string
  readonly period: PerformancePeriod
  readonly startDate: Date
  readonly endDate: Date
  readonly totalSessions: number
  readonly totalBets: number
  readonly totalWins: number
  readonly totalLosses: number
  readonly winRate: number
  readonly totalProfitLoss: Money
  readonly averageSessionDuration: number
  readonly averageBetAmount: Money
  readonly maxWinStreak: number
  readonly maxLossStreak: number
  readonly sharpeRatio?: number
  readonly volatility?: number
}

export enum PerformancePeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

// ================================
// METHOD REGISTRY - For dynamic method loading
// ================================

export interface MethodRegistry {
  /** Register a new betting method */
  register(method: BettingMethod): Result<void, Error>

  /** Get a method by ID */
  getMethod(id: string): Option<BettingMethod>

  /** Get all available methods */
  getAllMethods(): BettingMethod[]

  /** Get methods by category */
  getMethodsByCategory(category: MethodCategory): BettingMethod[]

  /** Check if method is registered */
  hasMethod(id: string): boolean

  /** Unregister a method */
  unregister(id: string): Result<void, Error>
}