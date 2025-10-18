/**
 * Fibonacci Inverse Method - Methods Module Domain Layer
 *
 * Modified Fibonacci strategy with custom win progression:
 * - Choose between columns (1st, 2nd, 3rd) or dozens (1-12, 13-24, 25-36)
 * - Use Fibonacci sequence for progression: 1,1,2,3,5,8,13,21,34,55...
 * - On loss: advance to next number in sequence
 * - On win: ALWAYS go back EXACTLY 2 positions (key difference from standard)
 * - If at position 0 or 1, restart from position 0
 * - More aggressive win recovery than standard Fibonacci
 */

import { Result } from '@/shared/domain/types/common'
import { MethodInput, MethodOutput, BettingMethod, MethodConfig } from '@/shared/domain/types/methods'
import { Method, MethodConfigSchema, MethodCategory, createMethodId } from './Method'

export type BetTarget = 'column_1' | 'column_2' | 'column_3' | 'dozen_1' | 'dozen_2' | 'dozen_3'

export interface FibonacciInverseConfig extends MethodConfig {
  baseBet: number
  stopLoss: number
  betTarget: BetTarget
}

export class FibonacciInverseMethod extends Method implements BettingMethod {
  private static readonly FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987]

  constructor() {
    super(
      createMethodId('fibonacci_inverse'),
      'fibonacci_inverse',
      'Fibonacci Inverso',
      'Fibonacci con discesa fissa di 2 posizioni ad ogni vincita',
      FibonacciInverseMethod.getExplanation(),
      MethodCategory.PROGRESSIVE,
      'premium', // Requires premium package
      FibonacciInverseMethod.getConfigSchema(),
      FibonacciInverseMethod.getDefaultConfig(),
      'fibonacci_inverse_two_step_back',
      true,
      3
    )
  }

  async execute(input: MethodInput): Promise<Result<MethodOutput, MethodExecutionError>> {
    try {
      const { gameResult, sessionHistory, currentProgression, baseAmount, currentBalance, stopLoss, config } = input
      const inverseConfig = config as FibonacciInverseConfig

      // Validate input
      const validationResult = this.validateInput(input, inverseConfig)
      if (!validationResult.isSuccess) {
        return Result.failure(validationResult.error)
      }

      // Check stop loss
      if (currentBalance <= stopLoss) {
        return Result.success({
          shouldBet: false,
          betType: inverseConfig.betTarget,
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
          // FIBONACCI INVERSE: ALWAYS go back EXACTLY 2 positions on win
          if (currentPosition >= 2) {
            currentPosition = currentPosition - 2
          } else {
            // If position is 0 or 1, restart from beginning
            currentPosition = 0
          }
        } else if (lastBet.outcome === 'loss') {
          // Advance to next position on loss (same as standard Fibonacci)
          currentPosition = Math.min(currentPosition + 1, FibonacciInverseMethod.FIBONACCI_SEQUENCE.length - 1)
        }
      }

      // Get bet amount from Fibonacci sequence
      const fibonacciMultiplier = FibonacciInverseMethod.FIBONACCI_SEQUENCE[currentPosition]
      const betAmount = baseAmount * fibonacciMultiplier

      // Check if we have enough balance
      if (betAmount > currentBalance) {
        return Result.success({
          shouldBet: false,
          betType: inverseConfig.betTarget,
          amount: 0,
          progression: currentProgression,
          stopSession: true,
          reason: 'Saldo insufficiente per la puntata richiesta'
        })
      }

      // Update progression - Store the actual position index
      const newProgression = [currentPosition]

      const betTargetDescription = this.getBetTargetDescription(inverseConfig.betTarget)

      return Result.success({
        shouldBet: true,
        betType: inverseConfig.betTarget,
        amount: betAmount,
        progression: newProgression,
        stopSession: false,
        reason: `Fibonacci Inverso pos. ${currentPosition + 1}: punta ${fibonacciMultiplier}x base su ${betTargetDescription} (€${betAmount})`
      })

    } catch (error) {
      return Result.failure(new MethodExecutionError(
        'Errore durante il calcolo Fibonacci Inverso',
        MethodExecutionErrorCode.CALCULATION_ERROR,
        error as Error
      ))
    }
  }

  private getBetTargetDescription(betTarget: BetTarget): string {
    const descriptions: Record<BetTarget, string> = {
      'column_1': '1ª Colonna (1,4,7,10,13,16,19,22,25,28,31,34)',
      'column_2': '2ª Colonna (2,5,8,11,14,17,20,23,26,29,32,35)',
      'column_3': '3ª Colonna (3,6,9,12,15,18,21,24,27,30,33,36)',
      'dozen_1': '1ª Dozzina (1-12)',
      'dozen_2': '2ª Dozzina (13-24)',
      'dozen_3': '3ª Dozzina (25-36)'
    }
    return descriptions[betTarget]
  }

  /**
   * Calculate if a bet wins based on the game result
   */
  static calculateWin(gameResult: { number: number }, betTarget: BetTarget): boolean {
    const { number } = gameResult

    // Zero never wins on columns or dozens
    if (number === 0) return false

    switch (betTarget) {
      case 'column_1':
        return [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].includes(number)
      case 'column_2':
        return [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35].includes(number)
      case 'column_3':
        return [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36].includes(number)
      case 'dozen_1':
        return number >= 1 && number <= 12
      case 'dozen_2':
        return number >= 13 && number <= 24
      case 'dozen_3':
        return number >= 25 && number <= 36
      default:
        return false
    }
  }

  /**
   * Calculate potential losses for stop-loss configuration
   */
  static calculateLossProgression(baseBet: number, steps: number = 10): LossProgression[] {
    const progression: LossProgression[] = []
    let totalLoss = 0

    for (let i = 0; i < Math.min(steps, FibonacciInverseMethod.FIBONACCI_SEQUENCE.length); i++) {
      const multiplier = FibonacciInverseMethod.FIBONACCI_SEQUENCE[i]
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

  private validateInput(input: MethodInput, config: FibonacciInverseConfig): Result<boolean, MethodExecutionError> {
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

    if (!config.betTarget) {
      return Result.failure(new MethodExecutionError(
        'Devi selezionare una colonna o dozzina su cui puntare',
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    const validTargets: BetTarget[] = ['column_1', 'column_2', 'column_3', 'dozen_1', 'dozen_2', 'dozen_3']
    if (!validTargets.includes(config.betTarget)) {
      return Result.failure(new MethodExecutionError(
        'Target di puntata non valido',
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    return Result.success(true)
  }

  private static getExplanation(): string {
    return `
**Come funziona il Fibonacci Inverso:**

1. **Sequenza**: Utilizza la sequenza di Fibonacci (1,1,2,3,5,8,13,21...)
2. **Scelta del Target**: Puoi scegliere dove puntare:
   - **Colonne**: 1ª, 2ª o 3ª colonna
   - **Dozzine**: 1-12, 13-24, o 25-36
3. **Progressione INVERSA**:
   - Su perdita: avanzi al numero successivo (come Fibonacci normale)
   - Su vincita: **SEMPRE torni indietro di ESATTAMENTE 2 posizioni**
   - Se sei alla posizione 0 o 1, ricominci da 0

**Differenza dal Fibonacci Standard:**
- **Standard**: Su vincita torna indietro fino a un minimo
- **Inverso**: Su vincita VA SEMPRE INDIETRO DI 2 POSIZIONI

**Esempio pratico** (puntata base €10, 1ª Colonna):
- Pos. 0: €10 → Perdi → Pos. 1
- Pos. 1: €10 → Perdi → Pos. 2
- Pos. 2: €20 → Perdi → Pos. 3
- Pos. 3: €30 → Perdi → Pos. 4
- Pos. 4: €50 → Vinci → Pos. 2 (indietro di 2)
- Pos. 2: €20 → Vinci → Pos. 0 (indietro di 2)

**Vantaggi del Fibonacci Inverso:**
- Discesa più rapida dopo le vincite
- Meno aggressivo del Fibonacci standard
- Riduce l'esposizione al rischio
- Mantiene posizioni basse più a lungo

**Rischi:**
- Richiede più vincite per recuperare grosse perdite
- Sequenze di perdite crescono rapidamente
- Necessita disciplina nella gestione
    `.trim()
  }

  private static getConfigSchema(): MethodConfigSchema {
    return {
      compatibleGames: ['european_roulette', 'american_roulette'],
      requiredFields: ['baseBet', 'stopLoss', 'betTarget'],
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
        },
        betTarget: {
          type: 'select',
          label: 'Target di Puntata',
          description: 'Scegli dove puntare: colonne o dozzine',
          options: [
            { value: 'column_1', label: '1ª Colonna (1,4,7,10,13,16,19,22,25,28,31,34)' },
            { value: 'column_2', label: '2ª Colonna (2,5,8,11,14,17,20,23,26,29,32,35)' },
            { value: 'column_3', label: '3ª Colonna (3,6,9,12,15,18,21,24,27,30,33,36)' },
            { value: 'dozen_1', label: '1ª Dozzina (1-12)' },
            { value: 'dozen_2', label: '2ª Dozzina (13-24)' },
            { value: 'dozen_3', label: '3ª Dozzina (25-36)' }
          ],
          default: 'column_1'
        }
      }
    }
  }

  private static getDefaultConfig(): FibonacciInverseConfig {
    return {
      baseBet: 10,
      stopLoss: 100,
      betTarget: 'column_1'
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