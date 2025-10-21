/**
 * Get DevLogs Use Case - DevLog Module Application Layer
 *
 * Retrieves development logs for display.
 */

import { Result } from '@/shared/domain/types/common'
import { DevLog } from '../../domain/entities/DevLog'
import { DevLogRepository } from '../../domain/repositories/DevLogRepository'

export interface GetDevLogsUseCase {
  execute(request: GetDevLogsRequest): Promise<Result<GetDevLogsResponse, GetDevLogsError>>
}

export interface GetDevLogsRequest {
  readonly limit?: number
  readonly offset?: number
  readonly environment?: string
  readonly orderBy?: 'deployTime' | 'createdAt'
  readonly order?: 'asc' | 'desc'
}

export interface GetDevLogsResponse {
  readonly devLogs: DevLog[]
  readonly totalCount: number
}

export class DefaultGetDevLogsUseCase implements GetDevLogsUseCase {
  constructor(
    private readonly devLogRepository: DevLogRepository
  ) {}

  async execute(
    request: GetDevLogsRequest
  ): Promise<Result<GetDevLogsResponse, GetDevLogsError>> {
    try {
      const { limit = 50, offset = 0, environment, orderBy = 'deployTime', order = 'desc' } = request

      const devLogsResult = await this.devLogRepository.findAll({
        limit,
        offset,
        environment,
        orderBy,
        order
      })

      if (!devLogsResult.isSuccess) {
        return Result.failure(new GetDevLogsError(
          'Failed to retrieve dev logs',
          GetDevLogsErrorCode.REPOSITORY_ERROR,
          devLogsResult.error
        ))
      }

      const countResult = await this.devLogRepository.count()

      if (!countResult.isSuccess) {
        return Result.failure(new GetDevLogsError(
          'Failed to count dev logs',
          GetDevLogsErrorCode.REPOSITORY_ERROR,
          countResult.error
        ))
      }

      return Result.success({
        devLogs: devLogsResult.value,
        totalCount: countResult.value
      })

    } catch (error) {
      return Result.failure(new GetDevLogsError(
        'Unexpected error retrieving dev logs',
        GetDevLogsErrorCode.UNKNOWN_ERROR,
        error as Error
      ))
    }
  }
}

export class GetDevLogsError extends Error {
  constructor(
    message: string,
    public readonly code: GetDevLogsErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'GetDevLogsError'
  }
}

export enum GetDevLogsErrorCode {
  REPOSITORY_ERROR = 'REPOSITORY_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}