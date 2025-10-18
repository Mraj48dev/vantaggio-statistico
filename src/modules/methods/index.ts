/**
 * Methods Module Public API
 *
 * Exports the public interface for the Methods module.
 * This is the main entry point for other modules to interact with betting methods.
 */

// Domain Entities
export { Method, MethodCategory, MethodRiskLevel, createMethodId } from './domain/entities/Method'
export type { MethodId } from './domain/entities/Method'
export { FibonacciMethod } from './domain/entities/FibonacciMethod'

// Domain Services
export { DefaultMethodCalculator } from './domain/services/MethodCalculator'

// Application Use Cases
export { DefaultGetAvailableMethodsUseCase } from './application/use-cases/GetAvailableMethodsUseCase'

export { DefaultCalculateNextBetUseCase } from './application/use-cases/CalculateNextBetUseCase'

export { DefaultGetMethodDetailsUseCase as GetMethodDetailsUseCase } from './application/use-cases/GetMethodDetailsUseCase'

// Infrastructure
export { MethodsContainer } from './infrastructure/di/MethodsContainer'
export { DefaultMethodSeeder as MethodSeeder } from './infrastructure/seeders/MethodSeeder'

// Re-export shared types for convenience
export type { MethodInput, MethodOutput, BettingMethod, MethodConfig } from '@/shared/domain/types/methods'