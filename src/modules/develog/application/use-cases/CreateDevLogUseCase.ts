/**
 * Create DevLog Use Case - DevLog Module Application Layer
 *
 * Creates a new development log entry.
 */

import { Result } from '@/shared/domain/types/common'
import { DevLog } from '../../domain/entities/DevLog'
import { DevLogRepository } from '../../domain/repositories/DevLogRepository'

export interface CreateDevLogUseCase {
  execute(request: CreateDevLogRequest): Promise<Result<CreateDevLogResponse, CreateDevLogError>>
}

export interface CreateDevLogRequest {
  readonly commitHash: string
  readonly buildTime: string
  readonly version: string
  readonly environment: string
  readonly vercelUrl?: string
  readonly description: string
}

export interface CreateDevLogResponse {
  readonly devLog: DevLog
}

export class DefaultCreateDevLogUseCase implements CreateDevLogUseCase {
  constructor(
    private readonly devLogRepository: DevLogRepository
  ) {}

  async execute(
    request: CreateDevLogRequest
  ): Promise<Result<CreateDevLogResponse, CreateDevLogError>> {
    try {
      const devLog = DevLog.create({
        commitHash: request.commitHash,
        deployTime: new Date(),
        buildTime: request.buildTime,
        version: request.version,
        environment: request.environment,
        vercelUrl: request.vercelUrl,
        description: request.description,
      })

      const saveResult = await this.devLogRepository.save(devLog)

      if (!saveResult.isSuccess) {
        return Result.failure(new CreateDevLogError(
          'Failed to save dev log',
          CreateDevLogErrorCode.REPOSITORY_ERROR,
          saveResult.error
        ))
      }

      return Result.success({
        devLog: saveResult.value
      })

    } catch (error) {
      return Result.failure(new CreateDevLogError(
        'Unexpected error creating dev log',
        CreateDevLogErrorCode.UNKNOWN_ERROR,
        error as Error
      ))
    }
  }
}

export class CreateDevLogError extends Error {
  constructor(
    message: string,
    public readonly code: CreateDevLogErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'CreateDevLogError'
  }
}

export enum CreateDevLogErrorCode {
  REPOSITORY_ERROR = 'REPOSITORY_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}