/**
 * Method Entity - Methods Module Domain Layer
 *
 * Represents a betting method/strategy with its configuration and metadata.
 * Each method implements a specific betting algorithm (Fibonacci, Martingale, etc.)
 */

import { Result } from '@/shared/domain/types/common'
import { MethodInput, MethodOutput, MethodConfig } from '@/shared/domain/types/methods'

export interface MethodId {
  readonly value: string
}

export class Method {
  constructor(
    public readonly id: MethodId,
    public readonly name: string,
    public readonly displayName: string,
    public readonly description: string,
    public readonly explanation: string,
    public readonly category: MethodCategory,
    public readonly requiredPackage: string,
    public readonly configSchema: MethodConfigSchema,
    public readonly defaultConfig: MethodConfig,
    public readonly algorithm: string,
    public readonly isActive: boolean = true,
    public readonly sortOrder: number = 0,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  /**
   * Validates if the method is compatible with a specific game type
   */
  isCompatibleWith(gameTypeId: string): boolean {
    return this.configSchema.compatibleGames.includes(gameTypeId)
  }

  /**
   * Validates method configuration against schema
   */
  validateConfig(config: MethodConfig): Result<boolean, MethodValidationError> {
    try {
      // Validate required fields
      for (const field of this.configSchema.requiredFields) {
        if (!(field in config)) {
          return Result.failure(new MethodValidationError(
            `Required field '${field}' is missing`,
            MethodValidationErrorCode.MISSING_REQUIRED_FIELD
          ))
        }
      }

      // Validate field types and constraints
      for (const [field, value] of Object.entries(config)) {
        const fieldSchema = this.configSchema.fields[field]
        if (!fieldSchema) continue

        const validationResult = this.validateFieldValue(field, value, fieldSchema)
        if (!validationResult.isSuccess) {
          return Result.failure(validationResult.error)
        }
      }

      return Result.success(true)
    } catch (error) {
      return Result.failure(new MethodValidationError(
        'Unexpected validation error',
        MethodValidationErrorCode.VALIDATION_ERROR,
        error as Error
      ))
    }
  }

  /**
   * Gets the risk level description for this method
   */
  getRiskLevel(): MethodRiskLevel {
    switch (this.category) {
      case MethodCategory.PROGRESSIVE:
        return MethodRiskLevel.HIGH
      case MethodCategory.FLAT:
        return MethodRiskLevel.LOW
      case MethodCategory.SYSTEM:
        return MethodRiskLevel.MEDIUM
      default:
        return MethodRiskLevel.MEDIUM
    }
  }

  /**
   * Gets recommended minimum bankroll for this method
   */
  getRecommendedBankroll(baseBet: number): number {
    // Fibonacci needs bankroll for at least 10 steps in sequence
    if (this.name === 'fibonacci') {
      const fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]
      return baseBet * fibSequence.reduce((sum, step) => sum + step, 0) * 2
    }

    // Default conservative recommendation
    return baseBet * 50
  }

  private validateFieldValue(
    field: string,
    value: any,
    schema: FieldSchema
  ): Result<boolean, MethodValidationError> {
    // Type validation
    if (typeof value !== schema.type) {
      return Result.failure(new MethodValidationError(
        `Field '${field}' must be of type ${schema.type}`,
        MethodValidationErrorCode.INVALID_FIELD_TYPE
      ))
    }

    // Numeric constraints
    if (schema.type === 'number') {
      if (schema.min !== undefined && value < schema.min) {
        return Result.failure(new MethodValidationError(
          `Field '${field}' must be at least ${schema.min}`,
          MethodValidationErrorCode.VALUE_OUT_OF_RANGE
        ))
      }
      if (schema.max !== undefined && value > schema.max) {
        return Result.failure(new MethodValidationError(
          `Field '${field}' must be at most ${schema.max}`,
          MethodValidationErrorCode.VALUE_OUT_OF_RANGE
        ))
      }
    }

    return Result.success(true)
  }
}

export interface MethodConfigSchema {
  readonly compatibleGames: string[]
  readonly requiredFields: string[]
  readonly fields: Record<string, FieldSchema>
}

export interface FieldSchema {
  readonly type: 'number' | 'string' | 'boolean'
  readonly label: string
  readonly description: string
  readonly min?: number
  readonly max?: number
  readonly default?: any
  readonly placeholder?: string
}

export enum MethodCategory {
  PROGRESSIVE = 'progressive',  // Fibonacci, Martingale, D'Alembert
  FLAT = 'flat',               // Fixed betting
  SYSTEM = 'system'            // Complex systems like Labouchere
}

export enum MethodRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export class MethodValidationError extends Error {
  constructor(
    message: string,
    public readonly code: MethodValidationErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'MethodValidationError'
  }
}

export enum MethodValidationErrorCode {
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_FIELD_TYPE = 'INVALID_FIELD_TYPE',
  VALUE_OUT_OF_RANGE = 'VALUE_OUT_OF_RANGE',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

// Helper function to create MethodId
export function createMethodId(value: string): MethodId {
  return { value }
}