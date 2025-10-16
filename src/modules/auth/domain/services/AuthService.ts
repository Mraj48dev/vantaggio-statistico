/**
 * Auth Service Interface - Auth Module Domain Layer
 *
 * Defines the contract for authentication operations.
 * This service handles the core business logic around authentication.
 */

import { Result } from '@/shared/domain/types/common'
import { User, UserId } from '../entities/User'

export interface AuthService {
  /** Get the currently authenticated user */
  getCurrentUser(): Promise<Result<User | null, AuthServiceError>>

  /** Sync a Clerk user with our local database */
  syncUserWithDatabase(clerkUser: ClerkUserData): Promise<Result<User, AuthServiceError>>

  /** Check if the current user session is valid */
  checkUserSession(): Promise<Result<boolean, AuthServiceError>>

  /** Get user by their ID */
  getUserById(userId: UserId): Promise<Result<User | null, AuthServiceError>>

  /** Update user information */
  updateUser(userId: UserId, updates: UserUpdateData): Promise<Result<User, AuthServiceError>>

  /** Sign out the current user */
  signOut(): Promise<Result<void, AuthServiceError>>

  /** Get authentication status */
  getAuthStatus(): Promise<Result<AuthStatus, AuthServiceError>>
}

export interface ClerkUserData {
  readonly id: string
  readonly emailAddresses: Array<{ emailAddress: string; id: string }>
  readonly firstName?: string
  readonly lastName?: string
  readonly username?: string
  readonly imageUrl?: string
  readonly createdAt?: number
  readonly updatedAt?: number
}

export interface UserUpdateData {
  readonly email?: string
  readonly packageId?: string
}

export interface AuthStatus {
  readonly isAuthenticated: boolean
  readonly user: User | null
  readonly sessionId?: string
  readonly lastActivity?: Date
}

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly code: AuthServiceErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'AuthServiceError'
  }
}

export enum AuthServiceErrorCode {
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_SESSION = 'INVALID_SESSION',
  SYNC_FAILED = 'SYNC_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  CLERK_ERROR = 'CLERK_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Domain Events related to authentication
export interface AuthDomainEvent {
  readonly eventType: string
  readonly userId?: UserId
  readonly timestamp: Date
}

export interface UserSignedInEvent extends AuthDomainEvent {
  readonly eventType: 'UserSignedIn'
  readonly userId: UserId
  readonly sessionId: string
  readonly ipAddress?: string
  readonly userAgent?: string
}

export interface UserSignedOutEvent extends AuthDomainEvent {
  readonly eventType: 'UserSignedOut'
  readonly userId: UserId
  readonly sessionId: string
}

export interface UserSyncedEvent extends AuthDomainEvent {
  readonly eventType: 'UserSynced'
  readonly userId: UserId
  readonly clerkId: string
  readonly email: string
}