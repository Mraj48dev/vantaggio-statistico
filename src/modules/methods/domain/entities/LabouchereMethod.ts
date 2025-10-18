/**
 * Labouchere Method - Methods Module Domain Layer
 *
 * Advanced Labouchere (Cancellation) betting strategy:
 * - Choose between even-money bets (Red/Black, Even/Odd, High/Low)
 * - Use a list of numbers (e.g., 1,2,3,4)
 * - Bet = first number + last number from the list
 * - On win: remove first and last numbers from list
 * - On loss: add the lost bet amount to the end of the list
 * - Complete the cycle when all numbers are crossed out
 * - Flexible and mathematical approach
 */

import { Result } from '@/shared/domain/types/common'
import { MethodInput, MethodOutput, BettingMethod, MethodConfig } from '@/shared/domain/types/methods'
import { Method, MethodConfigSchema, MethodCategory, createMethodId } from './Method'

export type BetTarget = 'red' | 'black' | 'even' | 'odd' | 'high' | 'low'

export interface LabouchereConfig extends MethodConfig {
  baseBet: number
  stopLoss: number
  betTarget: BetTarget
  initialSequence: number[] // Starting sequence of numbers
  maxSequenceLength: number // Protection against runaway sequences
}

export class LabouchereMethod extends Method implements BettingMethod {
  constructor() {
    super(
      createMethodId('labouchere'),
      'labouchere',
      'Labouchere',
      'Sistema di cancellazione: lista numeri, punta primo+ultimo',
      LabouchereMethod.getExplanation(),
      MethodCategory.PROGRESSIVE,
      'premium', // Requires premium package
      LabouchereMethod.getConfigSchema(),
      LabouchereMethod.getDefaultConfig(),
      'labouchere_cancellation_system',
      true,
      7
    )
  }

  async execute(input: MethodInput): Promise<Result<MethodOutput, MethodExecutionError>> {
    try {
      const { gameResult, sessionHistory, currentProgression, baseAmount, currentBalance, stopLoss, config } = input
      const labouchereConfig = config as LabouchereConfig

      // Validate input
      const validationResult = this.validateInput(input, labouchereConfig)
      if (!validationResult.isSuccess) {
        return Result.failure(validationResult.error)
      }

      // Check stop loss
      if (currentBalance <= stopLoss) {
        return Result.success({
          shouldBet: false,
          betType: labouchereConfig.betTarget,
          amount: 0,
          progression: currentProgression,
          stopSession: true,
          reason: 'Stop loss raggiunto'
        })
      }

      // Initialize or get current sequence
      let currentSequence = [...labouchereConfig.initialSequence]

      // If we have progression history, use it
      if (currentProgression.length > 0) {
        currentSequence = [...currentProgression]
      }

      // If we have a previous bet result, update sequence
      if (sessionHistory.length > 0) {
        const lastBet = sessionHistory[sessionHistory.length - 1]

        if (lastBet.outcome === 'win') {
          // On win: remove first and last numbers
          if (currentSequence.length > 2) {
            currentSequence = currentSequence.slice(1, -1)
          } else if (currentSequence.length === 2) {
            currentSequence = []
          } else if (currentSequence.length === 1) {
            currentSequence = []
          }
        } else if (lastBet.outcome === 'loss') {
          // On loss: add the lost bet amount to the end
          const lostAmount = Math.abs(lastBet.profitLoss) / 100 // Convert from cents to euros
          const unitAmount = lostAmount / baseAmount // Convert to units
          currentSequence.push(Math.round(unitAmount))
        }
      }

      // Check if sequence is complete (goal achieved)
      if (currentSequence.length === 0) {
        return Result.success({
          shouldBet: false,
          betType: labouchereConfig.betTarget,
          amount: 0,
          progression: [],
          stopSession: true,
          reason: 'Sequenza completata! Obiettivo raggiunto. Riavvia con nuova sequenza se desideri.'
        })
      }

      // Check if sequence is too long (protection)
      if (currentSequence.length > labouchereConfig.maxSequenceLength) {
        return Result.success({
          shouldBet: false,
          betType: labouchereConfig.betTarget,
          amount: 0,
          progression: currentSequence,
          stopSession: true,
          reason: `Sequenza troppo lunga (${currentSequence.length} elementi). Stop per protezione.`
        })
      }

      // Calculate bet amount
      let betAmount: number
      if (currentSequence.length === 1) {
        // Only one number left
        betAmount = baseAmount * currentSequence[0]
      } else {
        // First + Last numbers
        const firstNumber = currentSequence[0]
        const lastNumber = currentSequence[currentSequence.length - 1]
        betAmount = baseAmount * (firstNumber + lastNumber)
      }

      // Check if we have enough balance
      if (betAmount > currentBalance) {
        return Result.success({
          shouldBet: false,
          betType: labouchereConfig.betTarget,
          amount: 0,
          progression: currentSequence,
          stopSession: true,
          reason: 'Saldo insufficiente per la puntata richiesta'
        })
      }

      const betTargetDescription = this.getBetTargetDescription(labouchereConfig.betTarget)
      const sequenceDescription = this.getSequenceDescription(currentSequence)

      return Result.success({
        shouldBet: true,
        betType: labouchereConfig.betTarget,
        amount: betAmount,
        progression: currentSequence,
        stopSession: false,
        reason: `Labouchere ${sequenceDescription}: punta €${betAmount} su ${betTargetDescription}`
      })

    } catch (error) {
      return Result.failure(new MethodExecutionError(
        'Errore durante il calcolo Labouchere',
        MethodExecutionErrorCode.CALCULATION_ERROR,
        error as Error
      ))
    }
  }

  private getBetTargetDescription(betTarget: BetTarget): string {
    const descriptions: Record<BetTarget, string> = {
      'red': 'Rosso',
      'black': 'Nero',
      'even': 'Pari',
      'odd': 'Dispari',
      'high': 'Alto (19-36)',
      'low': 'Basso (1-18)'
    }
    return descriptions[betTarget]
  }

  private getSequenceDescription(sequence: number[]): string {
    if (sequence.length === 0) {
      return 'sequenza vuota'
    }
    if (sequence.length === 1) {
      return `[${sequence[0]}] solo numero rimasto`
    }

    const first = sequence[0]
    const last = sequence[sequence.length - 1]
    const middle = sequence.length > 2 ? `...` : ''

    return `[${first}${middle}${last}] (${first}+${last}=${first + last} unità)`
  }

  /**
   * Calculate if a bet wins based on the game result
   */
  static calculateWin(gameResult: { number: number; color: string; isEven: boolean; isHigh: boolean }, betTarget: BetTarget): boolean {
    const { number, color, isEven, isHigh } = gameResult

    // Zero loses on all even-money bets
    if (number === 0) return false

    switch (betTarget) {
      case 'red':
        return color === 'red'
      case 'black':
        return color === 'black'
      case 'even':
        return isEven
      case 'odd':
        return !isEven
      case 'high':
        return isHigh
      case 'low':
        return !isHigh
      default:
        return false
    }
  }

  /**
   * Calculate the profit goal for a given sequence
   */
  static calculateProfitGoal(sequence: number[], unitValue: number): number {
    return sequence.reduce((sum, num) => sum + num, 0) * unitValue
  }

  /**
   * Simulate a sequence to show potential outcomes
   */
  static simulateSequence(initialSequence: number[], unitValue: number, maxSteps: number = 20): SequenceSimulation[] {
    const simulation: SequenceSimulation[] = []
    let currentSequence = [...initialSequence]
    let step = 0

    while (currentSequence.length > 0 && step < maxSteps) {
      step++

      let betAmount: number
      if (currentSequence.length === 1) {
        betAmount = unitValue * currentSequence[0]
      } else {
        const first = currentSequence[0]
        const last = currentSequence[currentSequence.length - 1]
        betAmount = unitValue * (first + last)
      }

      simulation.push({
        step,
        sequence: [...currentSequence],
        betAmount,
        remainingGoal: LabouchereMethod.calculateProfitGoal(currentSequence, unitValue)
      })

      // For simulation, assume win (remove first and last)
      if (currentSequence.length > 2) {
        currentSequence = currentSequence.slice(1, -1)
      } else {
        currentSequence = []
      }
    }

    return simulation
  }

  private validateInput(input: MethodInput, config: LabouchereConfig): Result<boolean, MethodExecutionError> {
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
        'Devi selezionare un tipo di puntata even-money',
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    const validTargets: BetTarget[] = ['red', 'black', 'even', 'odd', 'high', 'low']
    if (!validTargets.includes(config.betTarget)) {
      return Result.failure(new MethodExecutionError(
        'Target di puntata non valido per Labouchere',
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    if (!config.initialSequence || config.initialSequence.length === 0) {
      return Result.failure(new MethodExecutionError(
        'Devi specificare una sequenza iniziale',
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    if (config.initialSequence.some(num => num <= 0 || num > 20)) {
      return Result.failure(new MethodExecutionError(
        'Tutti i numeri della sequenza devono essere tra 1 e 20',
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    if (config.maxSequenceLength < 10 || config.maxSequenceLength > 50) {
      return Result.failure(new MethodExecutionError(
        'La lunghezza massima della sequenza deve essere tra 10 e 50',
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    return Result.success(true)
  }

  private static getExplanation(): string {
    return `
**Come funziona il Labouchere:**

1. **Sequenza di Numeri**: Scegli una lista di numeri (es. 1,2,3,4):
   - Rappresentano unità di profitto che vuoi guadagnare
   - Somma totale = obiettivo di profitto (1+2+3+4 = 10 unità)

2. **Calcolo Puntata**:
   - Punta = (Primo numero + Ultimo numero) × puntata base
   - Esempio: [1,2,3,4] → punta (1+4) = 5 unità

3. **Aggiornamento Sequenza**:
   - **Su vincita**: Cancella primo e ultimo numero
   - **Su perdita**: Aggiungi l'importo perso (in unità) alla fine

**Esempio pratico** (sequenza [1,2,3,4], base €10, su Rosso):
- Sequenza: [1,2,3,4] → Punta 5×€10 = €50
- **Vinci**: [2,3] → Punta 5×€10 = €50
- **Vinci**: [] → COMPLETATO! Profitto: €100

**Se perdi durante il ciclo**:
- Sequenza: [1,2,3,4] → Punta €50 → **Perdi**
- Sequenza: [1,2,3,4,5] → Punta 6×€10 = €60

**Vantaggi del Labouchere:**
- Obiettivo di profitto chiaramente definito
- Flessibile: puoi scegliere la tua sequenza
- Non richiede vincite consecutive
- Matematicamente equilibrato

**Svantaggi:**
- Le sequenze possono diventare molto lunghe
- Richiede discipline mentale
- Puntate possono crescere rapidamente
- Necessita di buon bankroll management

**💡 Strategia**: Sequenze corte (3-5 numeri) sono più sicure per principianti!

**Sequenze popolari**:
- Conservativa: [1,1,1] (obiettivo: 3 unità)
- Equilibrata: [1,2,3] (obiettivo: 6 unità)
- Aggressiva: [1,2,3,4,5] (obiettivo: 15 unità)
    `.trim()
  }

  private static getConfigSchema(): MethodConfigSchema {
    return {
      compatibleGames: ['european_roulette', 'american_roulette'],
      requiredFields: ['baseBet', 'stopLoss', 'betTarget', 'initialSequence', 'maxSequenceLength'],
      fields: {
        baseBet: {
          type: 'number',
          label: 'Puntata Base (Unità)',
          description: 'Valore di 1 unità in euro',
          min: 1,
          max: 100,
          default: 10,
          placeholder: '10'
        },
        stopLoss: {
          type: 'number',
          label: 'Stop Loss',
          description: 'Perdita massima accettabile in euro',
          min: 100,
          max: 10000,
          default: 500,
          placeholder: '500'
        },
        betTarget: {
          type: 'select',
          label: 'Tipo di Puntata',
          description: 'Scegli il tipo di puntata even-money (50/50)',
          options: [
            { value: 'red', label: 'Rosso (Paga 1:1)' },
            { value: 'black', label: 'Nero (Paga 1:1)' },
            { value: 'even', label: 'Pari (Paga 1:1)' },
            { value: 'odd', label: 'Dispari (Paga 1:1)' },
            { value: 'high', label: 'Alto 19-36 (Paga 1:1)' },
            { value: 'low', label: 'Basso 1-18 (Paga 1:1)' }
          ],
          default: 'red'
        },
        initialSequence: {
          type: 'text',
          label: 'Sequenza Iniziale',
          description: 'Lista di numeri separati da virgola (es: 1,2,3,4)',
          default: '1,2,3',
          placeholder: '1,2,3'
        },
        maxSequenceLength: {
          type: 'number',
          label: 'Lunghezza Max Sequenza',
          description: 'Protezione: ferma se la sequenza supera questo limite',
          min: 10,
          max: 30,
          default: 20,
          placeholder: '20'
        }
      }
    }
  }

  private static getDefaultConfig(): LabouchereConfig {
    return {
      baseBet: 10,
      stopLoss: 500,
      betTarget: 'red',
      initialSequence: [1, 2, 3],
      maxSequenceLength: 20
    }
  }
}

export interface SequenceSimulation {
  readonly step: number
  readonly sequence: number[]
  readonly betAmount: number
  readonly remainingGoal: number
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