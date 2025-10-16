/**
 * Sync User Use Case - Auth Module Application Layer
 *
 * Orchestrates the process of syncing a Clerk user with our local database.
 * This is a key use case that happens during user authentication.
 */

import { Result } from '@/shared/domain/types/common'
import { User, UserValidationError } from '../../domain/entities/User'
import { UserRepository, UserRepositoryError } from '../../domain/repositories/UserRepository'
import { ClerkUserData } from '../../domain/services/AuthService'

export interface SyncUserUseCaseInput {
  readonly clerkUser: ClerkUserData
  readonly defaultPackageId?: string
}

export interface SyncUserUseCaseOutput {
  readonly user: User
  readonly isNewUser: boolean
}

export class SyncUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: SyncUserUseCaseInput): Promise<Result<SyncUserUseCaseOutput, SyncUserUseCaseError>> {
    try {
      // Check if user already exists
      const existingUserResult = await this.userRepository.findByClerkId(input.clerkUser.id)
      if (!existingUserResult.isSuccess) {
        return Result.failure(new SyncUserUseCaseError(
          'Failed to check if user exists',
          SyncUserUseCaseErrorCode.REPOSITORY_ERROR,
          existingUserResult.error
        ))
      }

      const existingUser = existingUserResult.value
      if (existingUser) {
        // User exists, update if necessary
        const updatedUser = await this.updateExistingUser(existingUser, input.clerkUser)
        if (!updatedUser.isSuccess) {
          return Result.failure(updatedUser.error)
        }

        return Result.success({
          user: updatedUser.value,
          isNewUser: false
        })
      }

      // User doesn't exist, create new one
      const newUser = await this.createNewUser(input.clerkUser, input.defaultPackageId || 'free')
      if (!newUser.isSuccess) {
        return Result.failure(newUser.error)
      }

      return Result.success({
        user: newUser.value,
        isNewUser: true
      })
    } catch (error) {
      return Result.failure(new SyncUserUseCaseError(
        'Unexpected error during user sync',
        SyncUserUseCaseErrorCode.UNKNOWN_ERROR,
        error as Error
      ))
    }
  }

  private async createNewUser(
    clerkUser: ClerkUserData,
    packageId: string
  ): Promise<Result<User, SyncUserUseCaseError>> {
    const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress
    if (!primaryEmail) {
      return Result.failure(new SyncUserUseCaseError(
        'Clerk user has no email address',
        SyncUserUseCaseErrorCode.INVALID_CLERK_DATA
      ))
    }

    const userResult = User.create({
      clerkId: clerkUser.id,
      email: primaryEmail,
      packageId
    })

    if (!userResult.isSuccess) {
      return Result.failure(new SyncUserUseCaseError(
        'Failed to create user entity',
        SyncUserUseCaseErrorCode.VALIDATION_ERROR,
        userResult.error
      ))
    }

    const savedUserResult = await this.userRepository.save(userResult.value)
    if (!savedUserResult.isSuccess) {
      return Result.failure(new SyncUserUseCaseError(
        'Failed to save new user',
        SyncUserUseCaseErrorCode.REPOSITORY_ERROR,
        savedUserResult.error
      ))
    }

    return Result.success(savedUserResult.value)
  }

  private async updateExistingUser(
    existingUser: User,
    clerkUser: ClerkUserData
  ): Promise<Result<User, SyncUserUseCaseError>> {
    const primaryEmail = clerkUser.emailAddresses[0]?.emailAddress
    if (!primaryEmail) {
      return Result.failure(new SyncUserUseCaseError(
        'Clerk user has no email address',
        SyncUserUseCaseErrorCode.INVALID_CLERK_DATA
      ))
    }

    // Check if email needs updating
    if (existingUser.email !== primaryEmail) {
      const updatedUserResult = existingUser.updateEmail(primaryEmail)
      if (!updatedUserResult.isSuccess) {
        return Result.failure(new SyncUserUseCaseError(
          'Failed to update user email',
          SyncUserUseCaseErrorCode.VALIDATION_ERROR,
          updatedUserResult.error
        ))
      }

      const savedUserResult = await this.userRepository.update(updatedUserResult.value)
      if (!savedUserResult.isSuccess) {
        return Result.failure(new SyncUserUseCaseError(
          'Failed to save updated user',
          SyncUserUseCaseErrorCode.REPOSITORY_ERROR,
          savedUserResult.error
        ))
      }

      return Result.success(savedUserResult.value)
    }

    return Result.success(existingUser)
  }
}

export class SyncUserUseCaseError extends Error {
  constructor(
    message: string,
    public readonly code: SyncUserUseCaseErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'SyncUserUseCaseError'
  }
}

export enum SyncUserUseCaseErrorCode {
  INVALID_CLERK_DATA = 'INVALID_CLERK_DATA',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REPOSITORY_ERROR = 'REPOSITORY_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}