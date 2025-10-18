/**
 * Prisma Method Repository - Methods Module Infrastructure Layer
 *
 * Implements the MethodRepository interface using Prisma ORM.
 */

import { PrismaClient } from '@prisma/client'
import { Result } from '@/shared/domain/types/common'
import { Method, MethodId, MethodCategory, createMethodId, MethodConfigSchema } from '../../domain/entities/Method'
import { MethodRepository, MethodRepositoryError, MethodRepositoryErrorCode } from '../../domain/repositories/MethodRepository'

export class PrismaMethodRepository implements MethodRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: MethodId): Promise<Result<Method | null, MethodRepositoryError>> {
    try {
      const methodData = await this.prisma.method.findUnique({
        where: { id: id.value }
      })

      if (!methodData) {
        return Result.success(null)
      }

      const method = this.mapToMethod(methodData)
      return Result.success(method)
    } catch (error) {
      return Result.failure(new MethodRepositoryError(
        `Failed to find method by ID: ${id.value}`,
        MethodRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async findByName(name: string): Promise<Result<Method | null, MethodRepositoryError>> {
    try {
      const methodData = await this.prisma.method.findUnique({
        where: { name }
      })

      if (!methodData) {
        return Result.success(null)
      }

      const method = this.mapToMethod(methodData)
      return Result.success(method)
    } catch (error) {
      return Result.failure(new MethodRepositoryError(
        `Failed to find method by name: ${name}`,
        MethodRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async findAllActive(): Promise<Result<Method[], MethodRepositoryError>> {
    try {
      const methodsData = await this.prisma.method.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' }
      })

      const methods = methodsData.map(data => this.mapToMethod(data))
      return Result.success(methods)
    } catch (error) {
      return Result.failure(new MethodRepositoryError(
        'Failed to find active methods',
        MethodRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async findByPackage(packageId: string): Promise<Result<Method[], MethodRepositoryError>> {
    try {
      const methodsData = await this.prisma.method.findMany({
        where: {
          requiredPackage: packageId,
          isActive: true
        },
        orderBy: { sortOrder: 'asc' }
      })

      const methods = methodsData.map(data => this.mapToMethod(data))
      return Result.success(methods)
    } catch (error) {
      return Result.failure(new MethodRepositoryError(
        `Failed to find methods for package: ${packageId}`,
        MethodRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async findByGameType(gameTypeId: string): Promise<Result<Method[], MethodRepositoryError>> {
    try {
      // Get methods that are compatible with the game type
      const methodsData = await this.prisma.method.findMany({
        include: {
          gameTypes: {
            where: { gameTypeId }
          }
        },
        where: {
          isActive: true,
          gameTypes: {
            some: { gameTypeId }
          }
        },
        orderBy: { sortOrder: 'asc' }
      })

      const methods = methodsData.map(data => this.mapToMethod(data))
      return Result.success(methods)
    } catch (error) {
      return Result.failure(new MethodRepositoryError(
        `Failed to find methods for game type: ${gameTypeId}`,
        MethodRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async findAvailableToUser(userId: string): Promise<Result<Method[], MethodRepositoryError>> {
    try {
      let userPackage = 'free' // Default to free package

      // Try to get user's package, but don't fail if user doesn't exist
      try {
        const userData = await this.prisma.user.findUnique({
          where: { id: userId },
          select: { packageId: true }
        })

        if (userData) {
          userPackage = userData.packageId
        }
      } catch (userError) {
        // Log warning but continue with free package
        console.warn(`Could not find user ${userId}, defaulting to free package`)
      }

      // Get methods available for user's package or free package
      const methodsData = await this.prisma.method.findMany({
        where: {
          isActive: true,
          OR: [
            { requiredPackage: userPackage },
            { requiredPackage: 'free' }
          ]
        },
        orderBy: { sortOrder: 'asc' }
      })

      const methods = methodsData.map(data => this.mapToMethod(data))
      return Result.success(methods)
    } catch (error) {
      return Result.failure(new MethodRepositoryError(
        `Failed to find methods available to user: ${userId}`,
        MethodRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async save(method: Method): Promise<Result<Method, MethodRepositoryError>> {
    try {
      const methodData = await this.prisma.method.create({
        data: {
          id: method.id.value,
          name: method.name,
          displayName: method.displayName,
          description: method.description,
          category: method.category,
          requiredPackage: method.requiredPackage,
          configSchema: method.configSchema as any,
          defaultConfig: method.defaultConfig as any,
          algorithm: method.algorithm,
          isActive: method.isActive,
          sortOrder: method.sortOrder
        }
      })

      const savedMethod = this.mapToMethod(methodData)
      return Result.success(savedMethod)
    } catch (error) {
      // Check for unique constraint violations
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        return Result.failure(new MethodRepositoryError(
          `Method with this identifier already exists`,
          MethodRepositoryErrorCode.DUPLICATE_METHOD,
          error
        ))
      }

      return Result.failure(new MethodRepositoryError(
        'Failed to save method',
        MethodRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async update(method: Method): Promise<Result<Method, MethodRepositoryError>> {
    try {
      const methodData = await this.prisma.method.update({
        where: { id: method.id.value },
        data: {
          name: method.name,
          displayName: method.displayName,
          description: method.description,
          category: method.category,
          requiredPackage: method.requiredPackage,
          configSchema: method.configSchema as any,
          defaultConfig: method.defaultConfig as any,
          algorithm: method.algorithm,
          isActive: method.isActive,
          sortOrder: method.sortOrder,
          updatedAt: new Date()
        }
      })

      const updatedMethod = this.mapToMethod(methodData)
      return Result.success(updatedMethod)
    } catch (error) {
      return Result.failure(new MethodRepositoryError(
        `Failed to update method: ${method.id.value}`,
        MethodRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async delete(id: MethodId): Promise<Result<void, MethodRepositoryError>> {
    try {
      await this.prisma.method.delete({
        where: { id: id.value }
      })

      return Result.success(undefined)
    } catch (error) {
      return Result.failure(new MethodRepositoryError(
        `Failed to delete method: ${id.value}`,
        MethodRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async exists(id: MethodId): Promise<Result<boolean, MethodRepositoryError>> {
    try {
      const count = await this.prisma.method.count({
        where: { id: id.value }
      })

      return Result.success(count > 0)
    } catch (error) {
      return Result.failure(new MethodRepositoryError(
        `Failed to check if method exists: ${id.value}`,
        MethodRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async countByPackage(packageId: string): Promise<Result<number, MethodRepositoryError>> {
    try {
      const count = await this.prisma.method.count({
        where: {
          requiredPackage: packageId,
          isActive: true
        }
      })

      return Result.success(count)
    } catch (error) {
      return Result.failure(new MethodRepositoryError(
        `Failed to count methods for package: ${packageId}`,
        MethodRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  private mapToMethod(data: any): Method {
    return new Method(
      createMethodId(data.id),
      data.name,
      data.displayName,
      data.description || '',
      data.description || '', // Using description as explanation for now
      data.category as MethodCategory,
      data.requiredPackage,
      data.configSchema as MethodConfigSchema,
      data.defaultConfig || {},
      data.algorithm,
      data.isActive,
      data.sortOrder,
      data.createdAt,
      data.updatedAt
    )
  }
}