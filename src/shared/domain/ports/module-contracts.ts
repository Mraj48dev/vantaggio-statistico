/**
 * Module port interfaces for Vantaggio Statistico
 *
 * This file defines the ports (interfaces) for all bounded contexts
 * as specified in the roadmap. These contracts ensure loose coupling
 * between modules and enable the modular architecture.
 *
 * Each module exposes its functionality through these standardized
 * interfaces, allowing for independent development and testing.
 */

import {
  Result,
  Money,
  UserId,
  SessionId,
  PaginatedResult,
  DateRange,
  ActivityContext,
} from '../types/common'
import { MethodInput, MethodOutput, BettingMethod } from '../types/methods'

// ================================
// AUTH MODULE PORTS
// ================================

/**
 * Authentication and user management interface
 * Handles Clerk integration and user session management
 */
export interface AuthService {
  /** Get current authenticated user */
  getCurrentUser(): Promise<Result<User | null, AuthError>>

  /** Sync Clerk user with local database */
  syncUserWithDatabase(clerkUser: ClerkUser): Promise<Result<User, AuthError>>

  /** Check if user session is valid */
  checkUserSession(): Promise<Result<boolean, AuthError>>

  /** Get user by ID */
  getUserById(userId: UserId): Promise<Result<User | null, AuthError>>

  /** Update user profile */
  updateUser(userId: UserId, updates: Partial<UserUpdate>): Promise<Result<User, AuthError>>
}

export interface User {
  readonly id: UserId
  readonly clerkId: string
  readonly email: string
  readonly packageId: string
  readonly createdAt: Date
  readonly updatedAt: Date
}

export interface ClerkUser {
  readonly id: string
  readonly emailAddresses: Array<{ emailAddress: string }>
  readonly firstName?: string
  readonly lastName?: string
}

export interface UserUpdate {
  readonly email?: string
  readonly packageId?: string
}

export enum AuthErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_SESSION = 'INVALID_SESSION',
  SYNC_FAILED = 'SYNC_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export interface AuthError {
  readonly code: AuthErrorCode
  readonly message: string
}

// ================================
// PERMISSIONS MODULE PORTS
// ================================

/**
 * Permission and package management interface
 * Handles granular access control and subscription tiers
 */
export interface PermissionService {
  /** Check if user has specific permission */
  checkUserAccess(userId: UserId, permission: string): Promise<Result<boolean, PermissionError>>

  /** Get all packages available to user */
  getUserPackages(userId: UserId): Promise<Result<Package[], PermissionError>>

  /** Assign package to user */
  assignPackageToUser(userId: UserId, packageId: string): Promise<Result<void, PermissionError>>

  /** Create custom package with specific permissions */
  createCustomPackage(permissions: Permission[], limits: PackageLimits): Promise<Result<Package, PermissionError>>

  /** Get package by ID */
  getPackageById(packageId: string): Promise<Result<Package | null, PermissionError>>

  /** Get all permissions for package */
  getPackagePermissions(packageId: string): Promise<Result<Permission[], PermissionError>>
}

export interface Package {
  readonly id: string
  readonly name: string
  readonly displayName: string
  readonly description?: string
  readonly price: Money
  readonly billingPeriod: string
  readonly limits: PackageLimits
  readonly isActive: boolean
}

export interface Permission {
  readonly id: string
  readonly name: string
  readonly category: string
  readonly resourceType?: string
  readonly resourceId?: string
  readonly description?: string
}

export interface PackageLimits {
  readonly maxConcurrentSessions: number
  readonly maxDailyBets: number
  readonly maxSessionDuration: number
  readonly analyticsRetention: number
  readonly exportFormats: string[]
}

export enum PermissionErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PACKAGE_NOT_FOUND = 'PACKAGE_NOT_FOUND',
  INVALID_PACKAGE_CONFIG = 'INVALID_PACKAGE_CONFIG',
  ASSIGNMENT_FAILED = 'ASSIGNMENT_FAILED',
}

export interface PermissionError {
  readonly code: PermissionErrorCode
  readonly message: string
}

// ================================
// GAMES MODULE PORTS
// ================================

/**
 * Game types and configuration management interface
 * Handles different casino games and their rules
 */
export interface GameService {
  /** Get games available to user based on permissions */
  getAvailableGames(userId: UserId): Promise<Result<GameType[], GameError>>

  /** Validate game result format */
  validateGameResult(gameTypeId: string, result: any): Promise<Result<boolean, GameError>>

  /** Parse and normalize game result */
  parseGameResult(gameTypeId: string, rawResult: any): Promise<Result<GameResult, GameError>>

  /** Get game configuration and rules */
  getGameConfiguration(gameTypeId: string): Promise<Result<GameConfig, GameError>>

  /** Calculate payout for specific bet type */
  calculatePayout(gameTypeId: string, betType: string, amount: Money): Promise<Result<Money, GameError>>
}

export interface GameType {
  readonly id: string
  readonly name: string
  readonly displayName: string
  readonly category: string
  readonly config: GameConfig
  readonly isActive: boolean
}

export interface GameConfig {
  readonly type: string
  readonly numbers: number[]
  readonly colors: Record<number, string>
  readonly bets: Record<string, BetTypeConfig>
  readonly minBet: Money
  readonly maxBet: Money
  readonly rules?: Record<string, unknown>
}

export interface BetTypeConfig {
  readonly payout: number
  readonly probability: number
  readonly description?: string
}

export interface GameResult {
  readonly number: number
  readonly color: string
  readonly isEven: boolean
  readonly isHigh: boolean
  readonly isLow: boolean
  readonly dozen?: number
  readonly column?: number
  readonly timestamp: Date
}

export enum GameErrorCode {
  GAME_NOT_FOUND = 'GAME_NOT_FOUND',
  INVALID_RESULT = 'INVALID_RESULT',
  UNSUPPORTED_BET_TYPE = 'UNSUPPORTED_BET_TYPE',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
}

export interface GameError {
  readonly code: GameErrorCode
  readonly message: string
}

// ================================
// METHODS MODULE PORTS
// ================================

/**
 * Betting methods and strategy calculation interface
 * Handles all betting strategies (Fibonacci, Martingale, etc.)
 */
export interface MethodService {
  /** Calculate next bet using specified method */
  calculateNextBet(input: MethodInput): Promise<Result<MethodOutput, MethodError>>

  /** Get methods available to user */
  getAvailableMethods(userId: UserId): Promise<Result<Method[], MethodError>>

  /** Validate method configuration */
  validateMethodConfig(methodId: string, config: any): Promise<Result<boolean, MethodError>>

  /** Reset method progression */
  resetMethodProgression(sessionId: SessionId): Promise<Result<void, MethodError>>

  /** Get method metadata and information */
  getMethodMetadata(methodId: string): Promise<Result<MethodMetadata, MethodError>>

  /** Register new method (for extensibility) */
  registerMethod(method: BettingMethod): Promise<Result<void, MethodError>>
}

export interface Method {
  readonly id: string
  readonly name: string
  readonly displayName: string
  readonly description: string
  readonly category: string
  readonly requiredPackage: string
  readonly configSchema: any
  readonly defaultConfig: any
  readonly isActive: boolean
}

export interface MethodMetadata {
  readonly id: string
  readonly name: string
  readonly description: string
  readonly riskLevel: string
  readonly difficulty: string
  readonly compatibleGames: string[]
  readonly minBankroll: Money
  readonly advantages: string[]
  readonly disadvantages: string[]
}

export enum MethodErrorCode {
  METHOD_NOT_FOUND = 'METHOD_NOT_FOUND',
  INVALID_INPUT = 'INVALID_INPUT',
  CALCULATION_FAILED = 'CALCULATION_FAILED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  STOP_LOSS_REACHED = 'STOP_LOSS_REACHED',
}

export interface MethodError {
  readonly code: MethodErrorCode
  readonly message: string
}

// ================================
// SESSIONS MODULE PORTS
// ================================

/**
 * Session management interface
 * Handles game sessions, bet tracking, and session lifecycle
 */
export interface SessionService {
  /** Create new gaming session */
  createSession(userId: UserId, gameTypeId: string, methodId: string, config: SessionConfig): Promise<Result<Session, SessionError>>

  /** Place bet in active session */
  placeBet(sessionId: SessionId, betData: BetData): Promise<Result<Bet, SessionError>>

  /** End active session */
  endSession(sessionId: SessionId): Promise<Result<SessionResult, SessionError>>

  /** Pause active session */
  pauseSession(sessionId: SessionId): Promise<Result<void, SessionError>>

  /** Resume paused session */
  resumeSession(sessionId: SessionId): Promise<Result<void, SessionError>>

  /** Get session by ID */
  getSessionById(sessionId: SessionId): Promise<Result<Session | null, SessionError>>

  /** Get user's active sessions */
  getActiveSessions(userId: UserId): Promise<Result<Session[], SessionError>>

  /** Get session history */
  getSessionHistory(userId: UserId, params?: PaginationParams): Promise<Result<PaginatedResult<Session>, SessionError>>
}

export interface SessionConfig {
  readonly baseAmount: Money
  readonly stopLoss: Money
  readonly stopWin?: Money
  readonly maxBets?: number
  readonly maxDuration?: number // seconds
  readonly methodConfig: Record<string, unknown>
}

export interface Session {
  readonly id: SessionId
  readonly userId: UserId
  readonly gameTypeId: string
  readonly methodId: string
  readonly config: SessionConfig
  readonly status: SessionStatus
  readonly startedAt: Date
  readonly endedAt?: Date
  readonly totalBets: number
  readonly profitLoss: Money
  readonly currentProgression: number[]
}

export interface BetData {
  readonly betType: string
  readonly betValue?: string
  readonly amount: Money
  readonly gameResult: GameResult
}

export interface Bet {
  readonly id: string
  readonly sessionId: SessionId
  readonly betType: string
  readonly amount: Money
  readonly outcome: string
  readonly profitLoss: Money
  readonly gameResult: GameResult
  readonly timestamp: Date
}

export interface SessionResult {
  readonly sessionId: SessionId
  readonly duration: number
  readonly totalBets: number
  readonly finalProfitLoss: Money
  readonly endReason: string
}

export enum SessionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  ENDED = 'ended',
  CANCELED = 'canceled',
}

export enum SessionErrorCode {
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  SESSION_NOT_ACTIVE = 'SESSION_NOT_ACTIVE',
  INVALID_BET = 'INVALID_BET',
  SESSION_LIMIT_REACHED = 'SESSION_LIMIT_REACHED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
}

export interface SessionError {
  readonly code: SessionErrorCode
  readonly message: string
}

// ================================
// ANALYTICS MODULE PORTS
// ================================

/**
 * Analytics and reporting interface
 * Handles user statistics, performance tracking, and reporting
 */
export interface AnalyticsService {
  /** Generate user performance report */
  generateUserReport(userId: UserId, period: DateRange): Promise<Result<UserReport, AnalyticsError>>

  /** Get method performance statistics */
  getMethodPerformance(methodId: string, period: DateRange): Promise<Result<MethodPerformanceStats, AnalyticsError>>

  /** Get platform-wide statistics */
  getPlatformStats(): Promise<Result<PlatformStats, AnalyticsError>>

  /** Track user activity */
  trackUserActivity(userId: UserId, activity: ActivityContext): Promise<Result<void, AnalyticsError>>

  /** Export user data in specified format */
  exportUserData(userId: UserId, format: string, period?: DateRange): Promise<Result<ExportResult, AnalyticsError>>
}

export interface UserReport {
  readonly userId: UserId
  readonly period: DateRange
  readonly totalSessions: number
  readonly totalBets: number
  readonly winRate: number
  readonly profitLoss: Money
  readonly favoriteMethod: string
  readonly averageSessionDuration: number
  readonly methodBreakdown: MethodBreakdown[]
}

export interface MethodBreakdown {
  readonly methodId: string
  readonly sessions: number
  readonly bets: number
  readonly winRate: number
  readonly profitLoss: Money
}

export interface MethodPerformanceStats {
  readonly methodId: string
  readonly period: DateRange
  readonly totalUsers: number
  readonly totalSessions: number
  readonly averageWinRate: number
  readonly averageProfitLoss: Money
  readonly riskMetrics: RiskMetrics
}

export interface RiskMetrics {
  readonly volatility: number
  readonly maxDrawdown: Money
  readonly sharpeRatio?: number
  readonly calmarRatio?: number
}

export interface PlatformStats {
  readonly totalUsers: number
  readonly activeUsers: number
  readonly totalSessions: number
  readonly totalRevenue: Money
  readonly popularMethods: string[]
  readonly popularGames: string[]
}

export interface ExportResult {
  readonly filename: string
  readonly format: string
  readonly downloadUrl: string
  readonly expiresAt: Date
}

export enum AnalyticsErrorCode {
  INSUFFICIENT_DATA = 'INSUFFICIENT_DATA',
  EXPORT_FAILED = 'EXPORT_FAILED',
  UNSUPPORTED_FORMAT = 'UNSUPPORTED_FORMAT',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
}

export interface AnalyticsError {
  readonly code: AnalyticsErrorCode
  readonly message: string
}

// ================================
// PAYMENTS MODULE PORTS
// ================================

/**
 * Payment and subscription management interface
 * Handles Stripe integration, subscriptions, and billing
 */
export interface PaymentService {
  /** Create new subscription */
  createSubscription(userId: UserId, packageId: string): Promise<Result<Subscription, PaymentError>>

  /** Cancel active subscription */
  cancelSubscription(subscriptionId: string): Promise<Result<void, PaymentError>>

  /** Process Stripe webhook */
  processWebhook(webhookData: StripeWebhook): Promise<Result<void, PaymentError>>

  /** Get subscription status */
  getSubscriptionStatus(userId: UserId): Promise<Result<SubscriptionStatus, PaymentError>>

  /** Update subscription */
  updateSubscription(subscriptionId: string, packageId: string): Promise<Result<Subscription, PaymentError>>

  /** Get payment history */
  getPaymentHistory(userId: UserId): Promise<Result<Payment[], PaymentError>>
}

export interface Subscription {
  readonly id: string
  readonly userId: UserId
  readonly packageId: string
  readonly status: SubscriptionStatus
  readonly startDate: Date
  readonly endDate?: Date
  readonly renewalDate?: Date
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  PENDING = 'pending',
}

export interface Payment {
  readonly id: string
  readonly subscriptionId: string
  readonly amount: Money
  readonly status: PaymentStatus
  readonly paidAt?: Date
}

export enum PaymentStatus {
  PENDING = 'pending',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export interface StripeWebhook {
  readonly type: string
  readonly data: Record<string, unknown>
}

export enum PaymentErrorCode {
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  SUBSCRIPTION_NOT_FOUND = 'SUBSCRIPTION_NOT_FOUND',
  WEBHOOK_PROCESSING_FAILED = 'WEBHOOK_PROCESSING_FAILED',
  STRIPE_ERROR = 'STRIPE_ERROR',
}

export interface PaymentError {
  readonly code: PaymentErrorCode
  readonly message: string
}

// ================================
// CROSS-MODULE EVENT TYPES
// ================================

export interface UserLoggedInEvent {
  readonly eventType: 'UserLoggedIn'
  readonly userId: UserId
  readonly timestamp: Date
}

export interface SessionCreatedEvent {
  readonly eventType: 'SessionCreated'
  readonly sessionId: SessionId
  readonly userId: UserId
  readonly methodId: string
  readonly timestamp: Date
}

export interface BetPlacedEvent {
  readonly eventType: 'BetPlaced'
  readonly sessionId: SessionId
  readonly betId: string
  readonly amount: Money
  readonly outcome: string
  readonly timestamp: Date
}

export interface SubscriptionCreatedEvent {
  readonly eventType: 'SubscriptionCreated'
  readonly userId: UserId
  readonly packageId: string
  readonly timestamp: Date
}

// Union type for all domain events
export type DomainEvent =
  | UserLoggedInEvent
  | SessionCreatedEvent
  | BetPlacedEvent
  | SubscriptionCreatedEvent