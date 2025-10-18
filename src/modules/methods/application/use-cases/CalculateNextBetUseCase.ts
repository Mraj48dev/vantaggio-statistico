/**
 * Calculate Next Bet Use Case - Methods Module Application Layer
 *
 * Orchestrates the calculation of the next bet using a specific method.
 */

import { Result } from '@/shared/domain/types/common'
import { MethodInput, MethodOutput, BettingMethod } from '@/shared/domain/types/methods'
import { Method, MethodId } from '../../domain/entities/Method'
import { MethodRepository } from '../../domain/repositories/MethodRepository'
import { MethodCalculator } from '../../domain/services/MethodCalculator'

export interface CalculateNextBetUseCase {
  execute(request: CalculateNextBetRequest): Promise<Result<CalculateNextBetResponse, CalculateNextBetError>>
}

export interface CalculateNextBetRequest {
  readonly methodId: string
  readonly input: MethodInput
  readonly validateConfig?: boolean
}

export interface CalculateNextBetResponse {
  readonly output: MethodOutput
  readonly method: Method
  readonly calculationTime: number
}

export class DefaultCalculateNextBetUseCase implements CalculateNextBetUseCase {
  constructor(
    private readonly methodRepository: MethodRepository,
    private readonly methodCalculator: MethodCalculator,
    private readonly methodRegistry: Map<string, BettingMethod>
  ) {}

  async execute(
    request: CalculateNextBetRequest
  ): Promise<Result<CalculateNextBetResponse, CalculateNextBetError>> {
    const startTime = Date.now()

    try {
      const { methodId, input, validateConfig = true } = request

      // Get method from repository
      const methodResult = await this.methodRepository.findById({ value: methodId })
      if (!methodResult.isSuccess) {
        return Result.failure(new CalculateNextBetError(
          'Failed to retrieve method',
          CalculateNextBetErrorCode.METHOD_NOT_FOUND,
          methodResult.error
        ))
      }

      const method = methodResult.value
      if (!method) {
        return Result.failure(new CalculateNextBetError(
          `Method with ID ${methodId} not found`,
          CalculateNextBetErrorCode.METHOD_NOT_FOUND
        ))
      }

      // Check if method is active
      if (!method.isActive) {
        return Result.failure(new CalculateNextBetError(
          `Method ${methodId} is not active`,
          CalculateNextBetErrorCode.METHOD_INACTIVE
        ))
      }

      // Get betting method implementation from registry
      const bettingMethod = this.methodRegistry.get(methodId)
      if (!bettingMethod) {
        return Result.failure(new CalculateNextBetError(
          `Method implementation for ${methodId} not registered`,
          CalculateNextBetErrorCode.METHOD_NOT_IMPLEMENTED
        ))
      }

      // Validate configuration if requested
      if (validateConfig) {
        const configValidation = this.methodCalculator.validateMethodConfig(method, {
          baseBet: input.baseAmount,
          stopLoss: input.stopLoss
        })
        if (!configValidation.isSuccess) {
          return Result.failure(new CalculateNextBetError(
            `Invalid method configuration: ${configValidation.error.message}`,
            CalculateNextBetErrorCode.INVALID_CONFIGURATION,
            configValidation.error
          ))
        }
      }

      // Calculate next bet
      const calculationResult = await this.methodCalculator.calculateNextBet(bettingMethod, input)
      if (!calculationResult.isSuccess) {
        return Result.failure(new CalculateNextBetError(
          `Calculation failed: ${calculationResult.error.message}`,
          CalculateNextBetErrorCode.CALCULATION_FAILED,
          calculationResult.error
        ))
      }

      const calculationTime = Date.now() - startTime

      return Result.success({
        output: calculationResult.value,
        method,
        calculationTime
      })

    } catch (error) {
      return Result.failure(new CalculateNextBetError(
        'Unexpected error during bet calculation',
        CalculateNextBetErrorCode.UNKNOWN_ERROR,
        error as Error
      ))
    }
  }
}

export class CalculateNextBetError extends Error {
  constructor(
    message: string,
    public readonly code: CalculateNextBetErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'CalculateNextBetError'
  }
}

export enum CalculateNextBetErrorCode {
  METHOD_NOT_FOUND = 'METHOD_NOT_FOUND',
  METHOD_INACTIVE = 'METHOD_INACTIVE',
  METHOD_NOT_IMPLEMENTED = 'METHOD_NOT_IMPLEMENTED',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  CALCULATION_FAILED = 'CALCULATION_FAILED',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}