/**
 * Prisma User Repository - Auth Module Infrastructure Layer
 *
 * Implements the UserRepository interface using Prisma ORM.
 * This adapter provides persistence for User entities.
 */

import { PrismaClient } from '@prisma/client'
import { Result } from '@/shared/domain/types/common'
import { User, UserId } from '../../domain/entities/User'
import {
  UserRepository,
  UserRepositoryError,
  UserRepositoryErrorCode,
  FindAllUsersOptions,
  UserListResult
} from '../../domain/repositories/UserRepository'

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(user: User): Promise<Result<User, UserRepositoryError>> {
    try {
      const userData = user.toPersistence()

      const savedUser = await this.prisma.user.create({
        data: {
          id: userData.id.value,
          clerkId: userData.clerkId,
          email: userData.email,
          packageId: userData.packageId,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt
        }
      })

      return Result.success(this.mapToDomain(savedUser))
    } catch (error: any) {
      if (error.code === 'P2002') {
        if (error.meta?.target?.includes('email')) {
          return Result.failure(new UserRepositoryError(
            'Email already exists',
            UserRepositoryErrorCode.DUPLICATE_EMAIL,
            error
          ))
        }
        if (error.meta?.target?.includes('clerk_id')) {
          return Result.failure(new UserRepositoryError(
            'Clerk ID already exists',
            UserRepositoryErrorCode.DUPLICATE_CLERK_ID,
            error
          ))
        }
      }

      return Result.failure(new UserRepositoryError(
        'Failed to save user',
        UserRepositoryErrorCode.UNKNOWN_ERROR,
        error
      ))
    }
  }

  async findById(id: UserId): Promise<Result<User | null, UserRepositoryError>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: id.value }
      })

      return Result.success(user ? this.mapToDomain(user) : null)
    } catch (error) {
      return Result.failure(new UserRepositoryError(
        'Failed to find user by ID',
        UserRepositoryErrorCode.CONNECTION_FAILED,
        error as Error
      ))
    }
  }

  async findByClerkId(clerkId: string): Promise<Result<User | null, UserRepositoryError>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { clerkId }
      })

      return Result.success(user ? this.mapToDomain(user) : null)
    } catch (error) {
      return Result.failure(new UserRepositoryError(
        'Failed to find user by Clerk ID',
        UserRepositoryErrorCode.CONNECTION_FAILED,
        error as Error
      ))
    }
  }

  async findByEmail(email: string): Promise<Result<User | null, UserRepositoryError>> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email }
      })

      return Result.success(user ? this.mapToDomain(user) : null)
    } catch (error) {
      return Result.failure(new UserRepositoryError(
        'Failed to find user by email',
        UserRepositoryErrorCode.CONNECTION_FAILED,
        error as Error
      ))
    }
  }

  async update(user: User): Promise<Result<User, UserRepositoryError>> {
    try {
      const userData = user.toPersistence()

      const updatedUser = await this.prisma.user.update({
        where: { id: userData.id.value },
        data: {
          email: userData.email,
          packageId: userData.packageId,
          updatedAt: userData.updatedAt
        }
      })

      return Result.success(this.mapToDomain(updatedUser))
    } catch (error: any) {
      if (error.code === 'P2025') {
        return Result.failure(new UserRepositoryError(
          'User not found',
          UserRepositoryErrorCode.USER_NOT_FOUND,
          error
        ))
      }

      if (error.code === 'P2002') {
        return Result.failure(new UserRepositoryError(
          'Email already exists',
          UserRepositoryErrorCode.DUPLICATE_EMAIL,
          error
        ))
      }

      return Result.failure(new UserRepositoryError(
        'Failed to update user',
        UserRepositoryErrorCode.UNKNOWN_ERROR,
        error
      ))
    }
  }

  async delete(id: UserId): Promise<Result<void, UserRepositoryError>> {
    try {
      await this.prisma.user.delete({
        where: { id: id.value }
      })

      return Result.success(undefined)
    } catch (error: any) {
      if (error.code === 'P2025') {
        return Result.failure(new UserRepositoryError(
          'User not found',
          UserRepositoryErrorCode.USER_NOT_FOUND,
          error
        ))
      }

      return Result.failure(new UserRepositoryError(
        'Failed to delete user',
        UserRepositoryErrorCode.UNKNOWN_ERROR,
        error
      ))
    }
  }

  async existsByClerkId(clerkId: string): Promise<Result<boolean, UserRepositoryError>> {
    try {
      const count = await this.prisma.user.count({
        where: { clerkId }
      })

      return Result.success(count > 0)
    } catch (error) {
      return Result.failure(new UserRepositoryError(
        'Failed to check if user exists',
        UserRepositoryErrorCode.CONNECTION_FAILED,
        error as Error
      ))
    }
  }

  async findAll(options: FindAllUsersOptions = {}): Promise<Result<UserListResult, UserRepositoryError>> {
    try {
      const {
        page = 1,
        limit = 10,
        packageId,
        sortBy = 'createdAt',
        sortDirection = 'desc'
      } = options

      const skip = (page - 1) * limit

      const where = packageId ? { packageId } : {}

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortDirection }
        }),
        this.prisma.user.count({ where })
      ])

      const mappedUsers = users.map(user => this.mapToDomain(user))
      const hasMore = skip + users.length < total

      return Result.success({
        users: mappedUsers,
        total,
        page,
        limit,
        hasMore
      })
    } catch (error) {
      return Result.failure(new UserRepositoryError(
        'Failed to find users',
        UserRepositoryErrorCode.CONNECTION_FAILED,
        error as Error
      ))
    }
  }

  private mapToDomain(prismaUser: any): User {
    return User.fromPersistence({
      id: { value: prismaUser.id },
      clerkId: prismaUser.clerkId,
      email: prismaUser.email,
      packageId: prismaUser.packageId,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt
    })
  }
}