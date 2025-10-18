/**
 * D'Alembert Method - Methods Module Domain Layer
 *
 * Balanced progression D'Alembert betting strategy:
 * - Choose between even-money bets (Red/Black, Even/Odd, High/Low)
 * - On loss: increase bet by 1 unit
 * - On win: decrease bet by 1 unit
 * - More conservative than Martingale
 * - Based on equilibrium theory
 */

import { Result } from '@/shared/domain/types/common'
import { MethodInput, MethodOutput, BettingMethod, MethodConfig } from '@/shared/domain/types/methods'
import { Method, MethodConfigSchema, MethodCategory, createMethodId } from './Method'

export type BetTarget = 'red' | 'black' | 'even' | 'odd' | 'high' | 'low'

export interface DAlembertConfig extends MethodConfig {
  baseBet: number
  stopLoss: number
  betTarget: BetTarget
  unitSize: number // Size of each increase/decrease
  maxUnits: number // Maximum units to bet
}

export class DAlembertMethod extends Method implements BettingMethod {
  constructor() {
    super(
      createMethodId('dalembert'),
      'dalembert',
      "D'Alembert",
      'Progressione equilibrata: +1 unità su perdita, -1 su vincita',
      DAlembertMethod.getExplanation(),
      MethodCategory.PROGRESSIVE,
      'premium', // Requires premium package
      DAlembertMethod.getConfigSchema(),
      DAlembertMethod.getDefaultConfig(),
      'dalembert_balanced_progression',
      true,
      6
    )
  }

  async execute(input: MethodInput): Promise<Result<MethodOutput, MethodExecutionError>> {
    try {
      const { gameResult, sessionHistory, currentProgression, baseAmount, currentBalance, stopLoss, config } = input
      const dalembertConfig = config as DAlembertConfig

      // Validate input
      const validationResult = this.validateInput(input, dalembertConfig)
      if (!validationResult.isSuccess) {
        return Result.failure(validationResult.error)
      }

      // Check stop loss
      if (currentBalance <= stopLoss) {
        return Result.success({
          shouldBet: false,
          betType: dalembertConfig.betTarget,
          amount: 0,
          progression: currentProgression,
          stopSession: true,
          reason: 'Stop loss raggiunto'
        })
      }

      // Determine current units to bet
      let currentUnits = 1 // Start with 1 unit (base bet)

      // If we have progression history, get current units
      if (currentProgression.length > 0) {
        currentUnits = currentProgression[0]
      }

      // If we have a previous bet result, adjust units
      if (sessionHistory.length > 0) {
        const lastBet = sessionHistory[sessionHistory.length - 1]

        if (lastBet.outcome === 'win') {
          // On win: decrease by 1 unit (minimum 1)
          currentUnits = Math.max(1, currentUnits - 1)
        } else if (lastBet.outcome === 'loss') {
          // On loss: increase by 1 unit (up to maximum)
          currentUnits = Math.min(currentUnits + 1, dalembertConfig.maxUnits)
        }
      }

      // Calculate bet amount
      const betAmount = baseAmount + (currentUnits - 1) * dalembertConfig.unitSize

      // Check if we have enough balance
      if (betAmount > currentBalance) {
        return Result.success({
          shouldBet: false,
          betType: dalembertConfig.betTarget,
          amount: 0,
          progression: currentProgression,
          stopSession: true,
          reason: 'Saldo insufficiente per la puntata richiesta'
        })
      }

      // Check if we've hit the maximum units
      if (currentUnits >= dalembertConfig.maxUnits) {
        return Result.success({
          shouldBet: false,
          betType: dalembertConfig.betTarget,
          amount: 0,
          progression: currentProgression,
          stopSession: true,
          reason: `Raggiunto limite massimo di ${dalembertConfig.maxUnits} unità`
        })
      }

      // Update progression - Store current units
      const newProgression = [currentUnits]

      const betTargetDescription = this.getBetTargetDescription(dalembertConfig.betTarget)
      const unitsDescription = currentUnits === 1
        ? 'puntata base (1 unità)'
        : `${currentUnits} unità`

      return Result.success({
        shouldBet: true,
        betType: dalembertConfig.betTarget,
        amount: betAmount,
        progression: newProgression,
        stopSession: false,
        reason: `D'Alembert ${unitsDescription}: punta €${betAmount} su ${betTargetDescription}`
      })

    } catch (error) {
      return Result.failure(new MethodExecutionError(
        "Errore durante il calcolo D'Alembert",
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
   * Calculate potential progression for analysis
   */
  static calculateProgression(baseBet: number, unitSize: number, maxUnits: number): ProgressionStep[] {
    const progression: ProgressionStep[] = []

    for (let units = 1; units <= maxUnits; units++) {
      const betAmount = baseBet + (units - 1) * unitSize

      progression.push({
        units,
        betAmount,
        potentialWin: betAmount, // 1:1 payout
        potentialLoss: betAmount
      })
    }

    return progression
  }

  private validateInput(input: MethodInput, config: DAlembertConfig): Result<boolean, MethodExecutionError> {
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
        "Target di puntata non valido per D'Alembert",
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    if (config.unitSize <= 0 || config.unitSize > 100) {
      return Result.failure(new MethodExecutionError(
        'La dimensione unità deve essere tra 1 e 100 euro',
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    if (config.maxUnits < 3 || config.maxUnits > 20) {
      return Result.failure(new MethodExecutionError(
        'Il numero massimo di unità deve essere tra 3 e 20',
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    return Result.success(true)
  }

  private static getExplanation(): string {
    return `
**Come funziona il D'Alembert:**

1. **Progressione Equilibrata**: Sistema basato sull'equilibrio naturale:
   - **Puntate Even-Money**: Rosso/Nero, Pari/Dispari, Alto/Basso (48.6% probabilità)
   - Su perdita: **AUMENTA** di 1 unità
   - Su vincita: **DIMINUISCI** di 1 unità

2. **Sistema a Unità**: Definisci la dimensione dell'unità:
   - Unità base: €5 (esempio)
   - 1 unità = puntata base
   - 2 unità = puntata base + €5
   - 3 unità = puntata base + €10

3. **Teoria dell'Equilibrio**: Nel lungo termine, vincite e perdite si bilanciano

**Esempio pratico** (puntata base €10, unità €5, su Rosso):
- 1 unità: €10 → Perdi → Prossima: 2 unità (€15)
- 2 unità: €15 → Perdi → Prossima: 3 unità (€20)
- 3 unità: €20 → Vinci → Prossima: 2 unità (€15)
- 2 unità: €15 → Vinci → Prossima: 1 unità (€10)

**Vantaggi del D'Alembert:**
- Progressione molto più dolce del Martingale
- Non richiede bankroll enormi
- Ritorna sempre verso la puntata base
- Teoricamente profittevole a lungo termine
- Rischio controllato e prevedibile

**Svantaggi:**
- Recupero lento delle perdite
- Necessita equilibrio tra vincite e perdite
- Lo zero crea sempre svantaggio (-2.7%)
- Progressione può durare a lungo
- Profitti limitati per sessione

**📊 Matematica**: Se vinci e perdi lo stesso numero di volte, dovresti essere in profitto!

**💡 Ideale per**: Giocatori conservativi che vogliono progressione controllata senza rischi estremi.
    `.trim()
  }

  private static getConfigSchema(): MethodConfigSchema {
    return {
      compatibleGames: ['european_roulette', 'american_roulette'],
      requiredFields: ['baseBet', 'stopLoss', 'betTarget', 'unitSize', 'maxUnits'],
      fields: {
        baseBet: {
          type: 'number',
          label: 'Puntata Base',
          description: 'Importo della puntata base in euro (1 unità)',
          min: 1,
          max: 1000,
          default: 10,
          placeholder: '10'
        },
        stopLoss: {
          type: 'number',
          label: 'Stop Loss',
          description: 'Perdita massima accettabile in euro',
          min: 50,
          max: 10000,
          default: 300,
          placeholder: '300'
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
        unitSize: {
          type: 'number',
          label: 'Dimensione Unità',
          description: 'Importo aggiunto/sottratto per ogni unità in euro',
          min: 1,
          max: 50,
          default: 5,
          placeholder: '5'
        },
        maxUnits: {
          type: 'number',
          label: 'Massimo Unità',
          description: 'Numero massimo di unità da raggiungere',
          min: 5,
          max: 15,
          default: 10,
          placeholder: '10'
        }
      }
    }
  }

  private static getDefaultConfig(): DAlembertConfig {
    return {
      baseBet: 10,
      stopLoss: 300,
      betTarget: 'red',
      unitSize: 5,
      maxUnits: 10
    }
  }
}

export interface ProgressionStep {
  readonly units: number
  readonly betAmount: number
  readonly potentialWin: number
  readonly potentialLoss: number
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