/**
 * Common types and interfaces used across all modules
 *
 * This file defines the foundational types that ensure consistency
 * and type safety across the entire Vantaggio Statistico platform.
 * Following the roadmap's emphasis on modular architecture with
 * strong contracts between bounded contexts.
 */

// ================================
// RESULT PATTERN - Error as Data
// ================================

/**
 * Result type for error handling without exceptions
 * Follows the roadmap's requirement for "errors as data"
 */
export type Result<T, E = Error> = Success<T> | Failure<E>

export interface Success<T> {
  readonly isSuccess: true
  readonly value: T
}

export interface Failure<E> {
  readonly isSuccess: false
  readonly error: E
}

export class Result<T, E = Error> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly value?: T,
    public readonly error?: E
  ) {}

  static success<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(true, value, undefined)
  }

  static failure<T, E = Error>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error)
  }
}

export const Ok = <T>(data: T): Success<T> => ({ isSuccess: true, value: data })
export const Err = <E>(error: E): Failure<E> => ({ isSuccess: false, error })

/**
 * Option type for nullable values
 */
export type Option<T> = Some<T> | None

export interface Some<T> {
  readonly isSome: true
  readonly value: T
}

export interface None {
  readonly isSome: false
}

export const Some = <T>(value: T): Some<T> => ({ isSome: true, value })
export const None: None = { isSome: false }

// ================================
// DOMAIN PRIMITIVES - Value Objects
// ================================

/**
 * Money value object for casino transactions
 * Always stored in cents to avoid floating point issues
 */
export interface Money {
  readonly amount: number // Amount in cents
  readonly currency: string // ISO currency code (EUR, USD, etc.)
}

/**
 * Email value object with validation
 */
export interface Email {
  readonly value: string
}

/**
 * User ID value object
 */
export interface UserId {
  readonly value: string
}

/**
 * Session ID value object
 */
export interface SessionId {
  readonly value: string
}

// ================================
// PAGINATION AND FILTERING
// ================================

export interface PaginationParams {
  readonly page: number
  readonly limit: number
  readonly offset?: number
}

export interface PaginatedResult<T> {
  readonly items: T[]
  readonly total: number
  readonly page: number
  readonly limit: number
  readonly hasNext: boolean
  readonly hasPrevious: boolean
}

export interface SortParams {
  readonly field: string
  readonly direction: 'asc' | 'desc'
}

export interface FilterParams {
  readonly [key: string]: string | number | boolean | string[] | number[]
}

// ================================
// DATE AND TIME
// ================================

export interface DateRange {
  readonly startDate: Date
  readonly endDate: Date
}

export interface TimeSlot {
  readonly start: Date
  readonly end: Date
  readonly duration: number // Duration in seconds
}

// ================================
// EVENTS - Domain Events for Communication Between Modules
// ================================

/**
 * Base interface for all domain events
 * Used for event-driven communication between bounded contexts
 */
export interface DomainEvent {
  readonly eventId: string
  readonly eventType: string
  readonly aggregateId: string
  readonly aggregateType: string
  readonly occurredAt: Date
  readonly version: number
  readonly metadata?: Record<string, unknown>
}

/**
 * Event handler interface for processing domain events
 */
export interface EventHandler<T extends DomainEvent> {
  readonly eventType: string
  handle(event: T): Promise<Result<void, Error>>
}

// ================================
// AUDIT AND TRACKING
// ================================

export interface AuditInfo {
  readonly createdAt: Date
  readonly createdBy: UserId
  readonly updatedAt: Date
  readonly updatedBy: UserId
  readonly version: number
}

export interface ActivityContext {
  readonly userId: UserId
  readonly sessionId?: string
  readonly ipAddress?: string
  readonly userAgent?: string
  readonly action: string
  readonly resource: string
  readonly resourceId?: string
  readonly metadata?: Record<string, unknown>
}

// ================================
// CONFIGURATION AND LIMITS
// ================================

export interface PackageLimits {
  readonly maxConcurrentSessions: number
  readonly maxDailyBets: number
  readonly maxSessionDuration: number // seconds
  readonly analyticsRetention: number // days
  readonly exportFormats: string[]
}

export interface SystemLimits {
  readonly minBetAmount: Money
  readonly maxBetAmount: Money
  readonly maxSessionDuration: number
  readonly maxConcurrentUsers: number
}

// ================================
// API CONTRACTS
// ================================

export interface ApiResponse<T> {
  readonly success: boolean
  readonly data?: T
  readonly error?: {
    readonly code: string
    readonly message: string
    readonly details?: Record<string, unknown>
  }
  readonly timestamp: Date
}

export interface CommandResult {
  readonly success: boolean
  readonly id?: string
  readonly message?: string
}

export interface QueryResult<T> {
  readonly success: boolean
  readonly data?: T
  readonly total?: number
}

// ================================
// VALIDATION
// ================================

export interface ValidationError {
  readonly field: string
  readonly code: string
  readonly message: string
  readonly value?: unknown
}

export interface ValidationResult {
  readonly isValid: boolean
  readonly errors: ValidationError[]
}

// ================================
// CONFIGURATION OBJECTS
// ================================

export interface ModuleConfig {
  readonly name: string
  readonly version: string
  readonly enabled: boolean
  readonly settings: Record<string, unknown>
}

export interface DatabaseConfig {
  readonly connectionString: string
  readonly poolSize: number
  readonly timeout: number
  readonly retries: number
}

export interface CacheConfig {
  readonly ttl: number // Time to live in seconds
  readonly maxSize: number
  readonly strategy: 'lru' | 'fifo' | 'lfu'
}

// ================================
// TYPE GUARDS AND UTILITIES
// ================================

export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> =>
  result.success === true

export const isFailure = <T, E>(result: Result<T, E>): result is Failure<E> =>
  result.success === false

export const isSome = <T>(option: Option<T>): option is Some<T> =>
  option.isSome === true

export const isNone = <T>(option: Option<T>): option is None =>
  option.isSome === false

// ================================
// CASINO-SPECIFIC ENUMS
// ================================

export enum BetType {
  RED = 'red',
  BLACK = 'black',
  EVEN = 'even',
  ODD = 'odd',
  HIGH = 'high', // 19-36
  LOW = 'low', // 1-18
  NUMBER = 'number',
  COLUMN = 'column',
  DOZEN = 'dozen',
}

export enum GameResult {
  WIN = 'win',
  LOSS = 'loss',
  PUSH = 'push', // Tie/Draw
}

export enum SessionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
  CANCELED = 'canceled',
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  PENDING = 'pending',
  PAUSED = 'paused',
}

// ================================
// FEATURE FLAGS
// ================================

export interface FeatureFlag {
  readonly name: string
  readonly enabled: boolean
  readonly rolloutPercentage: number
  readonly conditions?: Record<string, unknown>
}

export interface FeatureFlagContext {
  readonly userId?: string
  readonly packageId?: string
  readonly environment: string
  readonly metadata?: Record<string, unknown>
}