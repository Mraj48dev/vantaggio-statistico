/**
 * Games Module - Main Export File
 *
 * This file provides the main public API for the Games module.
 * External modules should import from this file to access Games functionality.
 */

// Domain Layer - Core business logic
export {
  // Entities
  GameType,
  GameTypeId,
  GameCategory,
  GameTypeValidationError,

  // Roulette Engine
  RouletteGameEngine,
  BetType,
  createEuropeanRouletteConfig,
  RouletteGameError,

  // Repository Interface
  GameTypeRepositoryError,
  GameTypeRepositoryErrorCode
} from './domain'

export type {
  RouletteConfig,
  BlackjackConfig,
  GameConfig,
  GameTypeProps,
  BetInput,
  BetResult,
  SpinResult,
  GameTypeRepository
} from './domain'

// Application Layer - Use cases
export {
  // Get Game Types
  GetGameTypesUseCase,
  GetGameTypesUseCaseError,
  GetGameTypesUseCaseErrorCode,

  // Play Roulette
  PlayRouletteUseCase,
  PlayRouletteUseCaseError,
  PlayRouletteUseCaseErrorCode,

  // Create Game Type
  CreateGameTypeUseCase,
  CreateGameTypeUseCaseError,
  CreateGameTypeUseCaseErrorCode
} from './application'

export type {
  GetGameTypesUseCaseInput,
  GetGameTypesUseCaseOutput,
  PlayRouletteUseCaseInput,
  PlayRouletteUseCaseOutput,
  CreateGameTypeUseCaseInput,
  CreateGameTypeUseCaseOutput
} from './application'

// Infrastructure Layer - External adapters
export {
  // Repository Implementation
  PrismaGameTypeRepository,

  // Dependency Injection
  GamesContainer,

  // React Hooks
  useGames,
  useRoulette,
  useGameType,
  useGamesByCategory,
  useRouletteGames
} from './infrastructure'

// Re-export constants for convenience
export {
  EUROPEAN_ROULETTE_NUMBERS,
  RED_NUMBERS,
  BLACK_NUMBERS,
  GREEN_NUMBERS
} from './domain/services/RouletteGameEngine'