/**
 * Games Module - Infrastructure Layer Exports
 *
 * This file exports all the infrastructure layer components for the Games module.
 * These are the adapters that connect our domain to external services.
 */

// Repositories
export * from './repositories/PrismaGameTypeRepository'

// Dependency Injection
export * from './di/GamesContainer'

// React Hooks
export * from './hooks/useGames'