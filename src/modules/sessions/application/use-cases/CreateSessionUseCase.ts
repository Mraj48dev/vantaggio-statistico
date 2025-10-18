/**
 * Create Session Use Case - Sessions Module Application Layer
 *
 * Creates a new gaming session with method and game configuration.
 */

import { Result } from '@/shared/domain/types/common'
import { Session, SessionId, SessionConfig, createSessionId } from '../../domain/entities/Session'
import { SessionRepository } from '../../domain/repositories/SessionRepository'
import { SessionService } from '../../domain/services/SessionService'

export interface CreateSessionUseCase {
  execute(request: CreateSessionRequest): Promise<Result<CreateSessionResponse, CreateSessionError>>
}

export interface CreateSessionRequest {
  readonly userId: string
  readonly gameTypeId: string
  readonly methodId: string
  readonly config: SessionConfig
}

export interface CreateSessionResponse {
  readonly session: Session
  readonly sessionId: SessionId
}

export class DefaultCreateSessionUseCase implements CreateSessionUseCase {
  constructor(
    private readonly sessionRepository: SessionRepository,
    private readonly sessionService: SessionService
  ) {}

  async execute(request: CreateSessionRequest): Promise<Result<CreateSessionResponse, CreateSessionError>> {
    try {
      const { userId, gameTypeId, methodId, config } = request

      // Validate input
      if (!userId) {
        return Result.failure(new CreateSessionError(
          'User ID is required',
          CreateSessionErrorCode.INVALID_INPUT
        ))
      }

      if (!gameTypeId) {
        return Result.failure(new CreateSessionError(
          'Game type ID is required',
          CreateSessionErrorCode.INVALID_INPUT
        ))
      }

      if (!methodId) {
        return Result.failure(new CreateSessionError(
          'Method ID is required',
          CreateSessionErrorCode.INVALID_INPUT
        ))
      }

      // Check if user has active sessions (enforce limits)
      const activeSessionsResult = await this.sessionRepository.findActiveByUserId(userId)
      if (!activeSessionsResult.isSuccess) {
        return Result.failure(new CreateSessionError(
          'Failed to check active sessions',
          CreateSessionErrorCode.REPOSITORY_ERROR,
          activeSessionsResult.error
        ))
      }

      // For now, limit to 1 active session per user (can be made configurable)
      const activeSessions = activeSessionsResult.value
      if (activeSessions.length > 0) {
        return Result.failure(new CreateSessionError(
          'You already have an active session. Please end it before starting a new one.',
          CreateSessionErrorCode.ACTIVE_SESSION_EXISTS
        ))
      }

      // Create session using domain service
      const sessionResult = await this.sessionService.createSession(userId, gameTypeId, methodId, config)
      if (!sessionResult.isSuccess) {
        return Result.failure(new CreateSessionError(
          `Failed to create session: ${sessionResult.error.message}`,
          CreateSessionErrorCode.SESSION_CREATION_FAILED,
          sessionResult.error
        ))
      }

      const session = sessionResult.value

      // Save session to repository
      const saveResult = await this.sessionRepository.save(session)
      if (!saveResult.isSuccess) {
        return Result.failure(new CreateSessionError(
          'Failed to save session',
          CreateSessionErrorCode.REPOSITORY_ERROR,
          saveResult.error
        ))
      }

      const savedSession = saveResult.value

      return Result.success({
        session: savedSession,
        sessionId: savedSession.id
      })

    } catch (error) {
      return Result.failure(new CreateSessionError(
        'Unexpected error during session creation',
        CreateSessionErrorCode.UNKNOWN_ERROR,
        error as Error
      ))
    }
  }
}

export class CreateSessionError extends Error {
  constructor(
    message: string,
    public readonly code: CreateSessionErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'CreateSessionError'
  }
}

export enum CreateSessionErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  ACTIVE_SESSION_EXISTS = 'ACTIVE_SESSION_EXISTS',
  SESSION_CREATION_FAILED = 'SESSION_CREATION_FAILED',
  REPOSITORY_ERROR = 'REPOSITORY_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}