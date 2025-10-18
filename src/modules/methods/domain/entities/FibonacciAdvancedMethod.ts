/**
 * Fibonacci Advanced Method - Methods Module Domain Layer
 *
 * Enhanced Fibonacci betting strategy with user-selectable betting options:
 * - Choose between columns (1st, 2nd, 3rd) or dozens (1-12, 13-24, 25-36)
 * - Use Fibonacci sequence for progression: 1,1,2,3,5,8,13,21,34,55...
 * - On loss: advance to next number in sequence
 * - On win: go back 2 positions in sequence (or restart if at beginning)
 * - Columns pay 2:1, Dozens pay 2:1
 */

import { Result } from '@/shared/domain/types/common'
import { MethodInput, MethodOutput, BettingMethod, MethodConfig } from '@/shared/domain/types/methods'
import { Method, MethodConfigSchema, MethodCategory, createMethodId } from './Method'

export type BetTarget = 'column_1' | 'column_2' | 'column_3' | 'dozen_1' | 'dozen_2' | 'dozen_3'

export interface FibonacciAdvancedConfig extends MethodConfig {
  baseBet: number
  stopLoss: number
  betTarget: BetTarget
  manualBetInput: boolean // Se true, l'utente inserisce manualmente l'importo
}

export class FibonacciAdvancedMethod extends Method implements BettingMethod {
  private static readonly FIBONACCI_SEQUENCE = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610, 987]

  constructor() {
    super(
      createMethodId('fibonacci_advanced'),
      'fibonacci_advanced',
      'Fibonacci Avanzato',
      'Sistema Fibonacci con scelta tra colonne e dozzine',
      FibonacciAdvancedMethod.getExplanation(),
      MethodCategory.PROGRESSIVE,
      'premium', // Requires premium package
      FibonacciAdvancedMethod.getConfigSchema(),
      FibonacciAdvancedMethod.getDefaultConfig(),
      'fibonacci_advanced_customizable',
      true,
      2
    )
  }

  async execute(input: MethodInput): Promise<Result<MethodOutput, MethodExecutionError>> {
    try {
      const { gameResult, sessionHistory, currentProgression, baseAmount, currentBalance, stopLoss, config } = input
      const advancedConfig = config as FibonacciAdvancedConfig

      // Validate input
      const validationResult = this.validateInput(input, advancedConfig)
      if (!validationResult.isSuccess) {
        return Result.failure(validationResult.error)
      }

      // Check stop loss
      if (currentBalance <= stopLoss) {
        return Result.success({
          shouldBet: false,
          betType: advancedConfig.betTarget,
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
          currentPosition = Math.min(currentPosition + 1, FibonacciAdvancedMethod.FIBONACCI_SEQUENCE.length - 1)
        }
      }

      // Get bet amount - either calculated or manual
      let betAmount: number
      let reasonText: string

      if (advancedConfig.manualBetInput) {
        // In modalità manuale, mostra la prossima posizione Fibonacci suggerita
        const fibonacciMultiplier = FibonacciAdvancedMethod.FIBONACCI_SEQUENCE[currentPosition]
        const suggestedAmount = baseAmount * fibonacciMultiplier

        // L'importo effettivo sarà inserito dall'utente
        betAmount = 0 // Placeholder - l'utente inserirà l'importo
        reasonText = `Fibonacci Avanzato pos. ${currentPosition + 1}: inserisci puntata manuale (suggerito: €${suggestedAmount} = ${fibonacciMultiplier}x base)`
      } else {
        // Modalità automatica - calcola dalla sequenza Fibonacci
        const fibonacciMultiplier = FibonacciAdvancedMethod.FIBONACCI_SEQUENCE[currentPosition]
        betAmount = baseAmount * fibonacciMultiplier

        // Check if we have enough balance
        if (betAmount > currentBalance) {
          return Result.success({
            shouldBet: false,
            betType: advancedConfig.betTarget,
            amount: 0,
            progression: currentProgression,
            stopSession: true,
            reason: 'Saldo insufficiente per la puntata richiesta'
          })
        }

        reasonText = `Fibonacci Avanzato pos. ${currentPosition + 1}: punta ${fibonacciMultiplier}x base (€${betAmount})`
      }

      // Update progression
      const newProgression = [...currentProgression]
      if (newProgression.length <= currentPosition) {
        // Extend progression if needed
        for (let i = newProgression.length; i <= currentPosition; i++) {
          newProgression.push(FibonacciAdvancedMethod.FIBONACCI_SEQUENCE[i])
        }
      }

      const betTargetDescription = this.getBetTargetDescription(advancedConfig.betTarget)

      return Result.success({
        shouldBet: true,
        betType: advancedConfig.betTarget,
        amount: betAmount,
        progression: newProgression,
        stopSession: false,
        reason: `${reasonText} su ${betTargetDescription}`,
        metadata: {
          calculatedAt: new Date(),
          methodVersion: '1.1',
          manualInput: advancedConfig.manualBetInput,
          fibonacciPosition: currentPosition + 1,
          debug: {
            currentPosition,
            targetDescription: betTargetDescription
          }
        }
      })

    } catch (error) {
      return Result.failure(new MethodExecutionError(
        'Errore durante il calcolo Fibonacci Avanzato',
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

    for (let i = 0; i < Math.min(steps, FibonacciAdvancedMethod.FIBONACCI_SEQUENCE.length); i++) {
      const multiplier = FibonacciAdvancedMethod.FIBONACCI_SEQUENCE[i]
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

  private validateInput(input: MethodInput, config: FibonacciAdvancedConfig): Result<boolean, MethodExecutionError> {
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
**Come funziona il Fibonacci Avanzato:**

1. **Sequenza**: Utilizza la sequenza di Fibonacci (1,1,2,3,5,8,13,21...)
2. **Scelta del Target**: Puoi scegliere dove puntare:
   - **Colonne**: 1ª, 2ª o 3ª colonna
   - **Dozzine**: 1-12, 13-24, o 25-36
3. **Modalità di Input**:
   - **Automatica**: Il sistema calcola automaticamente l'importo da puntare
   - **Manuale**: Tu inserisci l'importo, il sistema determina vincita/perdita
4. **Progressione**:
   - Inizi con 1x la puntata base
   - Su perdita: avanzi al numero successivo della sequenza
   - Su vincita: torni indietro di 2 posizioni

**Differenze dalle colonne/dozzine:**
- **Colonne**: Numeri verticali (es. 1ª: 1,4,7,10,13,16,19,22,25,28,31,34)
- **Dozzine**: Numeri consecutivi (es. 1ª: 1,2,3...12)
- Entrambe pagano 2:1 e hanno probabilità 32.4%

**Modalità Manuale:**
Il sistema ti suggerisce l'importo Fibonacci ma tu puoi puntare qualsiasi cifra.
Dopo aver inserito numero uscito e importo puntato, il sistema determina automaticamente
se hai vinto o perso basandosi sul target scelto.

**Esempio pratico** (modalità manuale, 1ª Colonna):
- Spin 1: Sistema suggerisce €10 → Tu punti €15 → Esce 7 (1ª col.) → VINCI
- Spin 2: Sistema suggerisce €10 → Tu punti €8 → Esce 14 (2ª col.) → PERDI

**Vantaggi:**
- Massima flessibilità negli importi
- Controllo automatico vincite/perdite
- Progressione Fibonacci come guida
- Adatto a bankroll management personalizzato

**Rischi:**
- Richiede disciplina negli importi manuali
- Probabilità di vincita 32.4% per colonne/dozzine
    `.trim()
  }

  private static getConfigSchema(): MethodConfigSchema {
    return {
      compatibleGames: ['european_roulette', 'american_roulette'],
      requiredFields: ['baseBet', 'stopLoss', 'betTarget', 'manualBetInput'],
      fields: {
        baseBet: {
          type: 'number',
          label: 'Puntata Base',
          description: 'Importo della puntata base in euro (usato per calcolare i suggerimenti)',
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
        },
        manualBetInput: {
          type: 'boolean',
          label: 'Input Manuale Puntata',
          description: 'Se attivo, potrai inserire manualmente l\'importo puntato (il sistema determinerà vincita/perdita automaticamente)',
          default: true
        }
      }
    }
  }

  private static getDefaultConfig(): FibonacciAdvancedConfig {
    return {
      baseBet: 10,
      stopLoss: 100,
      betTarget: 'column_1',
      manualBetInput: true
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