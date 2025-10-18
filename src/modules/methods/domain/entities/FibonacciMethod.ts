/**
 * Fibonacci Method - Methods Module Domain Layer
 *
 * Implements the Fibonacci betting strategy:
 * - Bet on first column (1-34)
 * - Use Fibonacci sequence for progression: 1,1,2,3,5,8,13,21,34,55...
 * - On loss: advance to next number in sequence
 * - On win: go back 2 positions in sequence (or restart if at beginning)
 */

import { Result } from '@/shared/domain/types/common'
import { MethodInput, MethodOutput, BettingMethod, MethodConfig } from '@/shared/domain/types/methods'
import { Method, MethodConfigSchema, MethodCategory, createMethodId } from './Method'

export class FibonacciMethod extends Method implements BettingMethod {
  private static readonly FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987]

  constructor() {
    super(
      createMethodId('fibonacci'),
      'fibonacci',
      'Metodo Fibonacci',
      'Sistema di progressione basato sulla sequenza di Fibonacci',
      FibonacciMethod.getExplanation(),
      MethodCategory.PROGRESSIVE,
      'free', // Available in free package
      FibonacciMethod.getConfigSchema(),
      FibonacciMethod.getDefaultConfig(),
      'fibonacci_progression_first_column',
      true,
      1
    )
  }

  async execute(input: MethodInput): Promise<Result<MethodOutput, MethodExecutionError>> {
    try {
      const { gameResult, sessionHistory, currentProgression, baseAmount, currentBalance, stopLoss } = input

      // Validate input
      const validationResult = this.validateInput(input)
      if (!validationResult.isSuccess) {
        return Result.failure(validationResult.error)
      }

      // Check stop loss
      if (currentBalance <= stopLoss) {
        return Result.success({
          shouldBet: false,
          betType: 'column_1',
          amount: 0,
          progression: currentProgression,
          stopSession: true,
          reason: 'Stop loss raggiunto'
        })
      }

      // Determine current position in Fibonacci sequence
      let currentPosition = Math.max(0, currentProgression.length - 1)

      // If we have a previous bet result, adjust position
      if (sessionHistory.length > 0) {
        const lastBet = sessionHistory[sessionHistory.length - 1]

        if (lastBet.outcome === 'win') {
          // Go back 2 positions on win (or restart)
          currentPosition = Math.max(0, currentPosition - 2)
        } else if (lastBet.outcome === 'loss') {
          // Advance to next position on loss
          currentPosition = Math.min(currentPosition + 1, FibonacciMethod.FIBONACCI_SEQUENCE.length - 1)
        }
      }

      // Get bet amount from Fibonacci sequence
      const fibonacciMultiplier = FibonacciMethod.FIBONACCI_SEQUENCE[currentPosition]
      const betAmount = baseAmount * fibonacciMultiplier

      // Check if we have enough balance
      if (betAmount > currentBalance) {
        return Result.success({
          shouldBet: false,
          betType: 'column_1',
          amount: 0,
          progression: currentProgression,
          stopSession: true,
          reason: 'Saldo insufficiente per la puntata richiesta'
        })
      }

      // Update progression
      const newProgression = [...currentProgression]
      if (newProgression.length <= currentPosition) {
        // Extend progression if needed
        for (let i = newProgression.length; i <= currentPosition; i++) {
          newProgression.push(FibonacciMethod.FIBONACCI_SEQUENCE[i])
        }
      }

      return Result.success({
        shouldBet: true,
        betType: 'column_1', // Always bet on first column
        amount: betAmount,
        progression: newProgression,
        stopSession: false,
        reason: `Fibonacci posizione ${currentPosition + 1}: punta ${fibonacciMultiplier}x base (€${betAmount})`
      })

    } catch (error) {
      return Result.failure(new MethodExecutionError(
        'Errore durante il calcolo Fibonacci',
        MethodExecutionErrorCode.CALCULATION_ERROR,
        error as Error
      ))
    }
  }

  /**
   * Calculate potential losses for stop-loss configuration
   */
  static calculateLossProgression(baseBet: number, steps: number = 10): LossProgression[] {
    const progression: LossProgression[] = []
    let totalLoss = 0

    for (let i = 0; i < Math.min(steps, FibonacciMethod.FIBONACCI_SEQUENCE.length); i++) {
      const multiplier = FibonacciMethod.FIBONACCI_SEQUENCE[i]
      const betAmount = baseBet * multiplier
      totalLoss += betAmount

      progression.push({
        step: i + 1,
        multiplier,
        betAmount,
        cumulativeLoss: totalLoss
      })
    }

    return progression
  }

  private validateInput(input: MethodInput): Result<boolean, MethodExecutionError> {
    if (input.baseAmount <= 0) {
      return Result.failure(new MethodExecutionError(
        'La puntata base deve essere maggiore di 0',
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    if (input.currentBalance <= 0) {
      return Result.failure(new MethodExecutionError(
        'Il saldo deve essere maggiore di 0',
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    if (input.stopLoss >= input.currentBalance) {
      return Result.failure(new MethodExecutionError(
        'Lo stop loss deve essere inferiore al saldo attuale',
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    return Result.success(true)
  }

  private static getExplanation(): string {
    return `
**Come funziona il Metodo Fibonacci:**

1. **Sequenza**: Utilizza la famosa sequenza di Fibonacci (1,1,2,3,5,8,13,21...)
2. **Puntata**: Sempre sulla prima colonna (numeri 1-34)
3. **Progressione**:
   - Inizi con 1x la puntata base
   - Su perdita: avanzi al numero successivo della sequenza
   - Su vincita: torni indietro di 2 posizioni

**Esempio pratico** (puntata base €10):
- Puntata 1: €10 (1x) → Perdi → Prossima: €10
- Puntata 2: €10 (1x) → Perdi → Prossima: €20
- Puntata 3: €20 (2x) → Perdi → Prossima: €30
- Puntata 4: €30 (3x) → Vinci → Prossima: €10 (torna indietro 2 pos.)

**Vantaggi:**
- Progressione più dolce rispetto al Martingale
- Recupera le perdite con una vincita
- Adatto ai principianti

**Rischi:**
- Richiede comunque un bankroll adeguato
- Le perdite consecutive possono accumularsi rapidamente
- La colonna paga 2:1 ma ha probabilità 32.4% di vincita
    `.trim()
  }

  private static getConfigSchema(): MethodConfigSchema {
    return {
      compatibleGames: ['european_roulette', 'american_roulette'],
      requiredFields: ['baseBet', 'stopLoss'],
      fields: {
        baseBet: {
          type: 'number',
          label: 'Puntata Base',
          description: 'Importo della puntata base in euro',
          min: 1,
          max: 1000,
          default: 10,
          placeholder: '10'
        },
        stopLoss: {
          type: 'number',
          label: 'Stop Loss',
          description: 'Perdita massima accettabile in euro',
          min: 10,
          max: 10000,
          default: 100,
          placeholder: '100'
        }
      }
    }
  }

  private static getDefaultConfig(): MethodConfig {
    return {
      baseBet: 10,
      stopLoss: 100
    }
  }
}

export interface LossProgression {
  readonly step: number
  readonly multiplier: number
  readonly betAmount: number
  readonly cumulativeLoss: number
}

export class MethodExecutionError extends Error {
  constructor(
    message: string,
    public readonly code: MethodExecutionErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'MethodExecutionError'
  }
}

export enum MethodExecutionErrorCode {
  INVALID_INPUT = 'INVALID_INPUT',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  CALCULATION_ERROR = 'CALCULATION_ERROR',
  STOP_LOSS_REACHED = 'STOP_LOSS_REACHED'
}