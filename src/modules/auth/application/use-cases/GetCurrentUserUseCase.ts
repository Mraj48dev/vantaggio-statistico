/**
 * Get Current User Use Case - Auth Module Application Layer
 *
 * Retrieves the currently authenticated user with all their details.
 * This is a frequently used operation throughout the application.
 */

import { Result } from '@/shared/domain/types/common'
import { User, UserId } from '../../domain/entities/User'
import { UserRepository } from '../../domain/repositories/UserRepository'
import { AuthService, AuthServiceError } from '../../domain/services/AuthService'

export interface GetCurrentUserUseCaseOutput {
  readonly user: User | null
  readonly isAuthenticated: boolean
}

export class GetCurrentUserUseCase {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepository: UserRepository
  ) {}

  async execute(): Promise<Result<GetCurrentUserUseCaseOutput, GetCurrentUserUseCaseError>> {
    try {
      // Check authentication status
      const authStatusResult = await this.authService.getAuthStatus()
      if (!authStatusResult.isSuccess) {
        return Result.failure(new GetCurrentUserUseCaseError(
          'Failed to get authentication status',
          GetCurrentUserUseCaseErrorCode.AUTH_SERVICE_ERROR,
          authStatusResult.error
        ))
      }

      const authStatus = authStatusResult.value
      if (!authStatus.isAuthenticated || !authStatus.user) {
        return Result.success({
          user: null,
          isAuthenticated: false
        })
      }

      // Get fresh user data from repository
      const userResult = await this.userRepository.findById(authStatus.user.id)
      if (!userResult.isSuccess) {
        return Result.failure(new GetCurrentUserUseCaseError(
          'Failed to retrieve user from database',
          GetCurrentUserUseCaseErrorCode.REPOSITORY_ERROR,
          userResult.error
        ))
      }

      return Result.success({
        user: userResult.value,
        isAuthenticated: true
      })
    } catch (error) {
      return Result.failure(new GetCurrentUserUseCaseError(
        'Unexpected error while getting current user',
        GetCurrentUserUseCaseErrorCode.UNKNOWN_ERROR,
        error as Error
      ))
    }
  }
}

export class GetCurrentUserUseCaseError extends Error {
  constructor(
    message: string,
    public readonly code: GetCurrentUserUseCaseErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'GetCurrentUserUseCaseError'
  }
}

export enum GetCurrentUserUseCaseErrorCode {
  AUTH_SERVICE_ERROR = 'AUTH_SERVICE_ERROR',
  REPOSITORY_ERROR = 'REPOSITORY_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}