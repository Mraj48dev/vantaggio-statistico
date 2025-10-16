/**
 * User Repository Interface - Auth Module Domain Layer
 *
 * Defines the contract for persisting and retrieving User entities.
 * This is a port that will be implemented by the infrastructure layer.
 */

import { Result } from '@/shared/domain/types/common'
import { User, UserId } from '../entities/User'

export interface UserRepository {
  /** Save a user entity to persistence */
  save(user: User): Promise<Result<User, UserRepositoryError>>

  /** Find user by their unique ID */
  findById(id: UserId): Promise<Result<User | null, UserRepositoryError>>

  /** Find user by their Clerk ID */
  findByClerkId(clerkId: string): Promise<Result<User | null, UserRepositoryError>>

  /** Find user by their email address */
  findByEmail(email: string): Promise<Result<User | null, UserRepositoryError>>

  /** Update an existing user */
  update(user: User): Promise<Result<User, UserRepositoryError>>

  /** Delete a user by ID */
  delete(id: UserId): Promise<Result<void, UserRepositoryError>>

  /** Check if user exists by Clerk ID */
  existsByClerkId(clerkId: string): Promise<Result<boolean, UserRepositoryError>>

  /** Get all users with optional pagination */
  findAll(options?: FindAllUsersOptions): Promise<Result<UserListResult, UserRepositoryError>>
}

export interface FindAllUsersOptions {
  readonly page?: number
  readonly limit?: number
  readonly packageId?: string
  readonly sortBy?: 'createdAt' | 'updatedAt' | 'email'
  readonly sortDirection?: 'asc' | 'desc'
}

export interface UserListResult {
  readonly users: User[]
  readonly total: number
  readonly page: number
  readonly limit: number
  readonly hasMore: boolean
}

export class UserRepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: UserRepositoryErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'UserRepositoryError'
  }
}

export enum UserRepositoryErrorCode {
  CONNECTION_FAILED = 'CONNECTION_FAILED',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',
  DUPLICATE_CLERK_ID = 'DUPLICATE_CLERK_ID',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}