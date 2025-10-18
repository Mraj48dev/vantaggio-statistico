/**
 * Method Calculator Service - Methods Module Domain Layer
 *
 * Orchestrates method execution and calculations.
 * This service manages the execution of different betting methods
 * and provides utilities for method-related calculations.
 */

import { Result } from '@/shared/domain/types/common'
import { MethodInput, MethodOutput, BettingMethod } from '@/shared/domain/types/methods'
import { Method } from '../entities/Method'
import { FibonacciMethod, LossProgression } from '../entities/FibonacciMethod'

export interface MethodCalculator {
  /** Execute a method calculation */
  calculateNextBet(method: BettingMethod, input: MethodInput): Promise<Result<MethodOutput, MethodCalculatorError>>

  /** Validate method configuration */
  validateMethodConfig(method: Method, config: Record<string, any>): Result<boolean, MethodCalculatorError>

  /** Calculate loss progression for a method */
  calculateLossProgression(methodId: string, baseBet: number, steps?: number): Result<LossProgression[], MethodCalculatorError>

  /** Get recommended bankroll for a method */
  getRecommendedBankroll(method: Method, baseBet: number): number
}

export class DefaultMethodCalculator implements MethodCalculator {
  async calculateNextBet(
    method: BettingMethod,
    input: MethodInput
  ): Promise<Result<MethodOutput, MethodCalculatorError>> {
    try {
      // Validate input
      const inputValidation = this.validateInput(input)
      if (!inputValidation.isSuccess) {
        return Result.failure(new MethodCalculatorError(
          `Invalid input: ${inputValidation.error.message}`,
          MethodCalculatorErrorCode.INVALID_INPUT,
          inputValidation.error
        ))
      }

      // Execute method calculation
      const result = await method.execute(input)
      if (!result.isSuccess) {
        return Result.failure(new MethodCalculatorError(
          `Method execution failed: ${result.error.message}`,
          MethodCalculatorErrorCode.METHOD_EXECUTION_FAILED,
          result.error
        ))
      }

      // Validate output
      const outputValidation = this.validateOutput(result.value)
      if (!outputValidation.isSuccess) {
        return Result.failure(new MethodCalculatorError(
          `Invalid method output: ${outputValidation.error.message}`,
          MethodCalculatorErrorCode.INVALID_OUTPUT,
          outputValidation.error
        ))
      }

      return Result.success(result.value)
    } catch (error) {
      return Result.failure(new MethodCalculatorError(
        'Unexpected error during method calculation',
        MethodCalculatorErrorCode.CALCULATION_ERROR,
        error as Error
      ))
    }
  }

  validateMethodConfig(
    method: Method,
    config: Record<string, any>
  ): Result<boolean, MethodCalculatorError> {
    try {
      const validationResult = method.validateConfig(config)
      if (!validationResult.isSuccess) {
        return Result.failure(new MethodCalculatorError(
          `Configuration validation failed: ${validationResult.error.message}`,
          MethodCalculatorErrorCode.INVALID_CONFIGURATION,
          validationResult.error
        ))
      }

      return Result.success(true)
    } catch (error) {
      return Result.failure(new MethodCalculatorError(
        'Unexpected error during configuration validation',
        MethodCalculatorErrorCode.VALIDATION_ERROR,
        error as Error
      ))
    }
  }

  calculateLossProgression(
    methodId: string,
    baseBet: number,
    steps: number = 10
  ): Result<LossProgression[], MethodCalculatorError> {
    try {
      if (baseBet <= 0) {
        return Result.failure(new MethodCalculatorError(
          'Base bet must be greater than 0',
          MethodCalculatorErrorCode.INVALID_INPUT
        ))
      }

      if (steps <= 0 || steps > 20) {
        return Result.failure(new MethodCalculatorError(
          'Steps must be between 1 and 20',
          MethodCalculatorErrorCode.INVALID_INPUT
        ))
      }

      switch (methodId) {
        case 'fibonacci':
          return Result.success(FibonacciMethod.calculateLossProgression(baseBet, steps))

        default:
          return Result.failure(new MethodCalculatorError(
            `Loss progression calculation not supported for method: ${methodId}`,
            MethodCalculatorErrorCode.UNSUPPORTED_METHOD
          ))
      }
    } catch (error) {
      return Result.failure(new MethodCalculatorError(
        'Unexpected error during loss progression calculation',
        MethodCalculatorErrorCode.CALCULATION_ERROR,
        error as Error
      ))
    }
  }

  getRecommendedBankroll(method: Method, baseBet: number): number {
    if (baseBet <= 0) {
      throw new Error('Base bet must be greater than 0')
    }

    return method.getRecommendedBankroll(baseBet)
  }

  private validateInput(input: MethodInput): Result<boolean, ValidationError> {
    if (!input.gameResult) {
      return Result.failure(new ValidationError('Game result is required'))
    }

    if (input.baseAmount <= 0) {
      return Result.failure(new ValidationError('Base amount must be greater than 0'))
    }

    if (input.currentBalance <= 0) {
      return Result.failure(new ValidationError('Current balance must be greater than 0'))
    }

    if (input.stopLoss < 0) {
      return Result.failure(new ValidationError('Stop loss cannot be negative'))
    }

    if (input.stopLoss >= input.currentBalance) {
      return Result.failure(new ValidationError('Stop loss must be less than current balance'))
    }

    if (!Array.isArray(input.sessionHistory)) {
      return Result.failure(new ValidationError('Session history must be an array'))
    }

    if (!Array.isArray(input.currentProgression)) {
      return Result.failure(new ValidationError('Current progression must be an array'))
    }

    // Validate game result structure
    const { gameResult } = input
    if (typeof gameResult.number !== 'number' || gameResult.number < 0 || gameResult.number > 36) {
      return Result.failure(new ValidationError('Game result number must be between 0 and 36'))
    }

    if (!['red', 'black', 'green'].includes(gameResult.color)) {
      return Result.failure(new ValidationError('Game result color must be red, black, or green'))
    }

    if (typeof gameResult.isEven !== 'boolean') {
      return Result.failure(new ValidationError('Game result isEven must be a boolean'))
    }

    if (typeof gameResult.isHigh !== 'boolean') {
      return Result.failure(new ValidationError('Game result isHigh must be a boolean'))
    }

    return Result.success(true)
  }

  private validateOutput(output: MethodOutput): Result<boolean, ValidationError> {
    if (typeof output.shouldBet !== 'boolean') {
      return Result.failure(new ValidationError('shouldBet must be a boolean'))
    }

    if (typeof output.amount !== 'number' || output.amount < 0) {
      return Result.failure(new ValidationError('amount must be a non-negative number'))
    }

    if (typeof output.betType !== 'string' || !output.betType) {
      return Result.failure(new ValidationError('betType must be a non-empty string'))
    }

    if (!Array.isArray(output.progression)) {
      return Result.failure(new ValidationError('progression must be an array'))
    }

    if (typeof output.stopSession !== 'boolean') {
      return Result.failure(new ValidationError('stopSession must be a boolean'))
    }

    // If shouldBet is true, amount should be greater than 0
    if (output.shouldBet && output.amount <= 0) {
      return Result.failure(new ValidationError('amount must be greater than 0 when shouldBet is true'))
    }

    return Result.success(true)
  }
}

export class MethodCalculatorError extends Error {
  constructor(
    message: string,
    public readonly code: MethodCalculatorErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'MethodCalculatorError'
  }
}

export enum MethodCalculatorErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  INVALID_OUTPUT = 'INVALID_OUTPUT',
  INVALID_CONFIGURATION = 'INVALID_CONFIGURATION',
  METHOD_EXECUTION_FAILED = 'METHOD_EXECUTION_FAILED',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNSUPPORTED_METHOD = 'UNSUPPORTED_METHOD'
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}