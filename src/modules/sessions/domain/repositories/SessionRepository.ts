/**
 * Session Repository Interface - Sessions Module Domain Layer
 *
 * Defines the contract for session persistence and retrieval.
 */

import { Result } from '@/shared/domain/types/common'
import { Session, SessionId, SessionStatus } from '../entities/Session'

export interface SessionRepository {
  /** Find session by ID */
  findById(id: SessionId): Promise<Result<Session | null, SessionRepositoryError>>

  /** Get active sessions for a user */
  findActiveByUserId(userId: string): Promise<Result<Session[], SessionRepositoryError>>

  /** Get session history for a user */
  findByUserId(
    userId: string,
    options?: {
      status?: SessionStatus
      limit?: number
      offset?: number
      orderBy?: 'createdAt' | 'updatedAt'
      order?: 'asc' | 'desc'
    }
  ): Promise<Result<Session[], SessionRepositoryError>>

  /** Save a new session */
  save(session: Session): Promise<Result<Session, SessionRepositoryError>>

  /** Update an existing session */
  update(session: Session): Promise<Result<Session, SessionRepositoryError>>

  /** Delete a session */
  delete(id: SessionId): Promise<Result<void, SessionRepositoryError>>

  /** Check if a session exists */
  exists(id: SessionId): Promise<Result<boolean, SessionRepositoryError>>

  /** Count sessions by user and status */
  countByUserAndStatus(userId: string, status: SessionStatus): Promise<Result<number, SessionRepositoryError>>

  /** Get sessions by game type */
  findByGameType(gameTypeId: string, limit?: number): Promise<Result<Session[], SessionRepositoryError>>

  /** Get sessions by method */
  findByMethod(methodId: string, limit?: number): Promise<Result<Session[], SessionRepositoryError>>

  /** Find sessions that should be auto-ended (exceeded limits) */
  findSessionsToAutoEnd(): Promise<Result<Session[], SessionRepositoryError>>
}

export class SessionRepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: SessionRepositoryErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'SessionRepositoryError'
  }
}

export enum SessionRepositoryErrorCode {
  SESSION_NOT_FOUND = 'SESSION_NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_SESSION = 'DUPLICATE_SESSION',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}