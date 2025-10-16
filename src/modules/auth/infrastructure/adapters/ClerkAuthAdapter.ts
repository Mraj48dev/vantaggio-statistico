/**
 * Clerk Auth Adapter - Auth Module Infrastructure Layer
 *
 * Implements the AuthService interface using Clerk as the authentication provider.
 * This adapter bridges our domain layer with Clerk's external API.
 */

import { auth, currentUser, clerkClient } from '@clerk/nextjs'
import { Result } from '@/shared/domain/types/common'
import { User, UserId } from '../../domain/entities/User'
import {
  AuthService,
  AuthServiceError,
  AuthServiceErrorCode,
  ClerkUserData,
  UserUpdateData,
  AuthStatus
} from '../../domain/services/AuthService'
import { UserRepository } from '../../domain/repositories/UserRepository'
import { SyncUserUseCase } from '../../application/use-cases/SyncUserUseCase'

export class ClerkAuthAdapter implements AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly syncUserUseCase: SyncUserUseCase
  ) {}

  async getCurrentUser(): Promise<Result<User | null, AuthServiceError>> {
    try {
      const { userId } = auth()
      if (!userId) {
        return Result.success(null)
      }

      // Get user from our database first
      const userResult = await this.userRepository.findByClerkId(userId)
      if (!userResult.isSuccess) {
        return Result.failure(new AuthServiceError(
          'Failed to retrieve user from database',
          AuthServiceErrorCode.DATABASE_ERROR,
          userResult.error
        ))
      }

      if (userResult.value) {
        return Result.success(userResult.value)
      }

      // User not in our DB, sync from Clerk
      const clerkUser = await currentUser()
      if (!clerkUser) {
        return Result.success(null)
      }

      const syncResult = await this.syncUserWithDatabase(this.mapClerkUser(clerkUser))
      if (!syncResult.isSuccess) {
        return Result.failure(syncResult.error)
      }

      return Result.success(syncResult.value)
    } catch (error) {
      return Result.failure(new AuthServiceError(
        'Unexpected error getting current user',
        AuthServiceErrorCode.CLERK_ERROR,
        error as Error
      ))
    }
  }

  async syncUserWithDatabase(clerkUser: ClerkUserData): Promise<Result<User, AuthServiceError>> {
    try {
      const syncResult = await this.syncUserUseCase.execute({
        clerkUser,
        defaultPackageId: 'free'
      })

      if (!syncResult.isSuccess) {
        return Result.failure(new AuthServiceError(
          'Failed to sync user with database',
          AuthServiceErrorCode.SYNC_FAILED,
          syncResult.error
        ))
      }

      return Result.success(syncResult.value.user)
    } catch (error) {
      return Result.failure(new AuthServiceError(
        'Unexpected error during user sync',
        AuthServiceErrorCode.SYNC_FAILED,
        error as Error
      ))
    }
  }

  async checkUserSession(): Promise<Result<boolean, AuthServiceError>> {
    try {
      const { userId, sessionId } = auth()
      return Result.success(!!userId && !!sessionId)
    } catch (error) {
      return Result.failure(new AuthServiceError(
        'Failed to check user session',
        AuthServiceErrorCode.CLERK_ERROR,
        error as Error
      ))
    }
  }

  async getUserById(userId: UserId): Promise<Result<User | null, AuthServiceError>> {
    try {
      const userResult = await this.userRepository.findById(userId)
      if (!userResult.isSuccess) {
        return Result.failure(new AuthServiceError(
          'Failed to retrieve user',
          AuthServiceErrorCode.DATABASE_ERROR,
          userResult.error
        ))
      }

      return Result.success(userResult.value)
    } catch (error) {
      return Result.failure(new AuthServiceError(
        'Unexpected error getting user by ID',
        AuthServiceErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async updateUser(userId: UserId, updates: UserUpdateData): Promise<Result<User, AuthServiceError>> {
    try {
      const userResult = await this.userRepository.findById(userId)
      if (!userResult.isSuccess) {
        return Result.failure(new AuthServiceError(
          'Failed to find user',
          AuthServiceErrorCode.USER_NOT_FOUND,
          userResult.error
        ))
      }

      const user = userResult.value
      if (!user) {
        return Result.failure(new AuthServiceError(
          'User not found',
          AuthServiceErrorCode.USER_NOT_FOUND
        ))
      }

      let updatedUser = user

      // Update email if provided
      if (updates.email) {
        const emailUpdateResult = updatedUser.updateEmail(updates.email)
        if (!emailUpdateResult.isSuccess) {
          return Result.failure(new AuthServiceError(
            'Failed to update email',
            AuthServiceErrorCode.VALIDATION_ERROR,
            emailUpdateResult.error
          ))
        }
        updatedUser = emailUpdateResult.value

        // Also update in Clerk
        try {
          await clerkClient.users.updateUser(user.clerkId, {
            primaryEmailAddressID: updates.email
          })
        } catch (clerkError) {
          // Log but don't fail - our DB is source of truth
          console.warn('Failed to update email in Clerk:', clerkError)
        }
      }

      // Update package if provided
      if (updates.packageId) {
        const packageUpdateResult = updatedUser.updatePackage(updates.packageId)
        if (!packageUpdateResult.isSuccess) {
          return Result.failure(new AuthServiceError(
            'Failed to update package',
            AuthServiceErrorCode.VALIDATION_ERROR,
            packageUpdateResult.error
          ))
        }
        updatedUser = packageUpdateResult.value
      }

      // Save to database
      const saveResult = await this.userRepository.update(updatedUser)
      if (!saveResult.isSuccess) {
        return Result.failure(new AuthServiceError(
          'Failed to save user updates',
          AuthServiceErrorCode.DATABASE_ERROR,
          saveResult.error
        ))
      }

      return Result.success(saveResult.value)
    } catch (error) {
      return Result.failure(new AuthServiceError(
        'Unexpected error updating user',
        AuthServiceErrorCode.UNKNOWN_ERROR,
        error as Error
      ))
    }
  }

  async signOut(): Promise<Result<void, AuthServiceError>> {
    try {
      // Clerk handles sign out automatically through their components
      // We don't need to do anything special here
      return Result.success(undefined)
    } catch (error) {
      return Result.failure(new AuthServiceError(
        'Failed to sign out',
        AuthServiceErrorCode.CLERK_ERROR,
        error as Error
      ))
    }
  }

  async getAuthStatus(): Promise<Result<AuthStatus, AuthServiceError>> {
    try {
      const { userId, sessionId } = auth()
      const isAuthenticated = !!userId

      if (!isAuthenticated) {
        return Result.success({
          isAuthenticated: false,
          user: null
        })
      }

      const currentUserResult = await this.getCurrentUser()
      if (!currentUserResult.isSuccess) {
        return Result.failure(currentUserResult.error)
      }

      return Result.success({
        isAuthenticated: true,
        user: currentUserResult.value,
        sessionId: sessionId || undefined,
        lastActivity: new Date()
      })
    } catch (error) {
      return Result.failure(new AuthServiceError(
        'Failed to get auth status',
        AuthServiceErrorCode.CLERK_ERROR,
        error as Error
      ))
    }
  }

  private mapClerkUser(clerkUser: any): ClerkUserData {
    return {
      id: clerkUser.id,
      emailAddresses: clerkUser.emailAddresses || [],
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      username: clerkUser.username,
      imageUrl: clerkUser.imageUrl,
      createdAt: clerkUser.createdAt,
      updatedAt: clerkUser.updatedAt
    }
  }
}