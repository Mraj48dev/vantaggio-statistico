/**
 * Shared domain exports for Vantaggio Statistico
 *
 * This file provides a clean API for accessing all shared domain types,
 * contracts, and utilities across the modular casino platform.
 */

// Common types and utilities
export * from './types/common'
export * from './types/methods'

// Module port contracts
export * from './ports/module-contracts'

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