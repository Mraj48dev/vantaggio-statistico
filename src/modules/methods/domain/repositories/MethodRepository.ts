/**
 * Method Repository Interface - Methods Module Domain Layer
 *
 * Defines the contract for method persistence and retrieval.
 * This interface abstracts data access for betting methods.
 */

import { Result } from '@/shared/domain/types/common'
import { Method, MethodId } from '../entities/Method'

export interface MethodRepository {
  /** Find method by ID */
  findById(id: MethodId): Promise<Result<Method | null, MethodRepositoryError>>

  /** Find method by name */
  findByName(name: string): Promise<Result<Method | null, MethodRepositoryError>>

  /** Get all active methods */
  findAllActive(): Promise<Result<Method[], MethodRepositoryError>>

  /** Get methods available for a specific package */
  findByPackage(packageId: string): Promise<Result<Method[], MethodRepositoryError>>

  /** Get methods compatible with a game type */
  findByGameType(gameTypeId: string): Promise<Result<Method[], MethodRepositoryError>>

  /** Get methods available to a user (considering their package) */
  findAvailableToUser(userId: string): Promise<Result<Method[], MethodRepositoryError>>

  /** Save a method */
  save(method: Method): Promise<Result<Method, MethodRepositoryError>>

  /** Update a method */
  update(method: Method): Promise<Result<Method, MethodRepositoryError>>

  /** Delete a method */
  delete(id: MethodId): Promise<Result<void, MethodRepositoryError>>

  /** Check if a method exists */
  exists(id: MethodId): Promise<Result<boolean, MethodRepositoryError>>

  /** Get method count by package */
  countByPackage(packageId: string): Promise<Result<number, MethodRepositoryError>>
}

export class MethodRepositoryError extends Error {
  constructor(
    message: string,
    public readonly code: MethodRepositoryErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'MethodRepositoryError'
  }
}

export enum MethodRepositoryErrorCode {
  METHOD_NOT_FOUND = 'METHOD_NOT_FOUND',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DUPLICATE_METHOD = 'DUPLICATE_METHOD',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}