/**
 * Shared domain exports for Vantaggio Statistico
 *
 * This file provides a clean API for accessing all shared domain types,
 * contracts, and utilities across the modular casino platform.
 */

// Common types and utilities
export * from './types/common'

// Method types (avoid conflicts with common types)
export type {
  MethodInput,
  MethodOutput,
  BettingMethod,
  MethodConfig,
  MethodMetadata,
  MethodError,
  MethodRegistry,
} from './types/methods'

// Re-export specific enums with prefixes to avoid conflicts
export {
  MethodCategory,
  MethodDifficulty,
  MethodRiskLevel,
  MethodErrorCode,
  PerformancePeriod,
} from './types/methods'

// Module port contracts (selective exports to avoid conflicts)
export type {
  AuthService,
  PermissionService,
  GameService,
  MethodService,
  SessionService,
  AnalyticsService,
  PaymentService,
  User,
  Package,
  Permission,
  GameType,
  Method,
  Session,
  Subscription,
} from './ports/module-contracts'

// Type guards and utility functions
export {
  isSuccess,
  isFailure,
  isSome,
  isNone,
  Ok,
  Err,
  Some,
  None,
} from './types/common'