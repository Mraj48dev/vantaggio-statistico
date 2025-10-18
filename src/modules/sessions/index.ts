/**
 * Sessions Module Public API
 *
 * Exports the public interface for the Sessions module.
 */

// Domain Entities
export {
  Session,
  SessionStatus,
  Bet,
  BetOutcome,
  SessionEndReason,
  createSessionId,
  createBetId
} from './domain/entities/Session'

// Domain Services
export {
  DefaultSessionService as SessionService
} from './domain/services/SessionService'

// Application Use Cases
export {
  DefaultCreateSessionUseCase as CreateSessionUseCase
} from './application/use-cases/CreateSessionUseCase'

export {
  DefaultPlaceBetUseCase as PlaceBetUseCase
} from './application/use-cases/PlaceBetUseCase'

export {
  DefaultEndSessionUseCase as EndSessionUseCase
} from './application/use-cases/EndSessionUseCase'

export {
  DefaultGetActiveSessionUseCase as GetActiveSessionUseCase
} from './application/use-cases/GetActiveSessionUseCase'

// Infrastructure
export { SessionsContainer } from './infrastructure/di/SessionsContainer'