/**
 * Get Method Details Use Case - Methods Module Application Layer
 *
 * Retrieves detailed information about a method including loss progression and configuration.
 */

import { Result } from '@/shared/domain/types/common'
import { Method, MethodId } from '../../domain/entities/Method'
import { MethodRepository } from '../../domain/repositories/MethodRepository'
import { MethodCalculator } from '../../domain/services/MethodCalculator'
import { LossProgression } from '../../domain/entities/FibonacciMethod'

export interface GetMethodDetailsUseCase {
  execute(request: GetMethodDetailsRequest): Promise<Result<GetMethodDetailsResponse, GetMethodDetailsError>>
}

export interface GetMethodDetailsRequest {
  readonly methodId: string
  readonly baseBet?: number
  readonly includeProgression?: boolean
  readonly progressionSteps?: number
}

export interface GetMethodDetailsResponse {
  readonly method: Method
  readonly lossProgression?: LossProgression[]
  readonly recommendedBankroll?: number
  readonly isAvailable: boolean
  readonly compatibleGames: string[]
}

export class DefaultGetMethodDetailsUseCase implements GetMethodDetailsUseCase {
  constructor(
    private readonly methodRepository: MethodRepository,
    private readonly methodCalculator: MethodCalculator
  ) {}

  async execute(
    request: GetMethodDetailsRequest
  ): Promise<Result<GetMethodDetailsResponse, GetMethodDetailsError>> {
    try {
      const { methodId, baseBet = 10, includeProgression = true, progressionSteps = 10 } = request

      // Get method from repository
      const methodResult = await this.methodRepository.findById({ value: methodId })
      if (!methodResult.isSuccess) {
        return Result.failure(new GetMethodDetailsError(
          'Failed to retrieve method',
          GetMethodDetailsErrorCode.REPOSITORY_ERROR,
          methodResult.error
        ))
      }

      const method = methodResult.value
      if (!method) {
        return Result.failure(new GetMethodDetailsError(
          `Method with ID ${methodId} not found`,
          GetMethodDetailsErrorCode.METHOD_NOT_FOUND
        ))
      }

      let lossProgression: LossProgression[] | undefined
      let recommendedBankroll: number | undefined

      // Calculate loss progression if requested
      if (includeProgression) {
        const progressionResult = this.methodCalculator.calculateLossProgression(
          methodId,
          baseBet,
          progressionSteps
        )

        if (progressionResult.isSuccess) {
          lossProgression = progressionResult.value
        }
        // Don't fail if progression calculation fails - it's optional
      }

      // Calculate recommended bankroll
      try {
        recommendedBankroll = this.methodCalculator.getRecommendedBankroll(method, baseBet)
      } catch (error) {
        // Don't fail if bankroll calculation fails - it's optional
        console.warn(`Failed to calculate recommended bankroll for method ${methodId}:`, error)
      }

      // Get compatible games from method configuration
      const compatibleGames = method.configSchema.compatibleGames

      return Result.success({
        method,
        lossProgression,
        recommendedBankroll,
        isAvailable: method.isActive,
        compatibleGames
      })

    } catch (error) {
      return Result.failure(new GetMethodDetailsError(
        'Unexpected error retrieving method details',
        GetMethodDetailsErrorCode.UNKNOWN_ERROR,
        error as Error
      ))
    }
  }
}

export class GetMethodDetailsError extends Error {
  constructor(
    message: string,
    public readonly code: GetMethodDetailsErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'GetMethodDetailsError'
  }
}

export enum GetMethodDetailsErrorCode {
  METHOD_NOT_FOUND = 'METHOD_NOT_FOUND',
  REPOSITORY_ERROR = 'REPOSITORY_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}