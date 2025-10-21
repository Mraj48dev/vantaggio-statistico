/**
 * Get Available Methods Use Case - Methods Module Application Layer
 *
 * Retrieves methods available to a user based on their package and permissions.
 */

import { Result } from '@/shared/domain/types/common'
import { Method } from '../../domain/entities/Method'
import { MethodRepository } from '../../domain/repositories/MethodRepository'

export interface GetAvailableMethodsUseCase {
  execute(request: GetAvailableMethodsRequest): Promise<Result<GetAvailableMethodsResponse, GetAvailableMethodsError>>
}

export interface GetAvailableMethodsRequest {
  readonly userId: string
  readonly gameTypeId?: string
  readonly activeOnly?: boolean
  readonly showAllMethods?: boolean
}

export interface GetAvailableMethodsResponse {
  readonly methods: Method[]
  readonly userPackage: string
  readonly totalCount: number
}

export class DefaultGetAvailableMethodsUseCase implements GetAvailableMethodsUseCase {
  constructor(
    private readonly methodRepository: MethodRepository
  ) {}

  async execute(
    request: GetAvailableMethodsRequest
  ): Promise<Result<GetAvailableMethodsResponse, GetAvailableMethodsError>> {
    try {
      const { userId, gameTypeId, activeOnly = true, showAllMethods = false } = request

      // Choose which methods to retrieve based on showAllMethods flag
      const methodsResult = showAllMethods
        ? await this.methodRepository.findAllActive()
        : await this.methodRepository.findAvailableToUser(userId)

      if (!methodsResult.isSuccess) {
        return Result.failure(new GetAvailableMethodsError(
          'Failed to retrieve available methods',
          GetAvailableMethodsErrorCode.REPOSITORY_ERROR,
          methodsResult.error
        ))
      }

      let methods = methodsResult.value

      // Filter by game type if specified
      if (gameTypeId) {
        methods = methods.filter(method => method.isCompatibleWith(gameTypeId))
      }

      // Filter by active status if requested
      if (activeOnly) {
        methods = methods.filter(method => method.isActive)
      }

      // Sort by sort order
      methods = methods.sort((a, b) => a.sortOrder - b.sortOrder)

      // For this implementation, we'll assume the user has 'free' package
      // In a real implementation, you'd fetch this from the user service/repository
      const userPackage = 'free' // TODO: Get from user service

      return Result.success({
        methods,
        userPackage,
        totalCount: methods.length
      })

    } catch (error) {
      return Result.failure(new GetAvailableMethodsError(
        'Unexpected error retrieving available methods',
        GetAvailableMethodsErrorCode.UNKNOWN_ERROR,
        error as Error
      ))
    }
  }
}

export class GetAvailableMethodsError extends Error {
  constructor(
    message: string,
    public readonly code: GetAvailableMethodsErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'GetAvailableMethodsError'
  }
}

export enum GetAvailableMethodsErrorCode {
  REPOSITORY_ERROR = 'REPOSITORY_ERROR',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}