/**
 * Martingale Method - Methods Module Domain Layer
 *
 * Classic Martingale betting strategy:
 * - Choose between even-money bets (Red/Black, Even/Odd, High/Low)
 * - On loss: double the bet
 * - On win: return to base bet
 * - Most aggressive progression system
 * - High risk, high reward potential
 */

import { Result } from '@/shared/domain/types/common'
import { MethodInput, MethodOutput, BettingMethod, MethodConfig } from '@/shared/domain/types/methods'
import { Method, MethodConfigSchema, MethodCategory, createMethodId } from './Method'

export type BetTarget = 'red' | 'black' | 'even' | 'odd' | 'high' | 'low'

export interface MartingaleConfig extends MethodConfig {
  baseBet: number
  stopLoss: number
  betTarget: BetTarget
  maxDoubleCount: number // Maximum number of consecutive doubles
}

export class MartingaleMethod extends Method implements BettingMethod {
  constructor() {
    super(
      createMethodId('martingale'),
      'martingale',
      'Martingale',
      'Sistema classico: raddoppia su perdita, base su vincita',
      MartingaleMethod.getExplanation(),
      MethodCategory.PROGRESSIVE,
      'premium', // Requires premium package
      MartingaleMethod.getConfigSchema(),
      MartingaleMethod.getDefaultConfig(),
      'martingale_double_on_loss',
      true,
      4
    )
  }

  async execute(input: MethodInput): Promise<Result<MethodOutput, MethodExecutionError>> {
    try {
      const { gameResult, sessionHistory, currentProgression, baseAmount, currentBalance, stopLoss, config } = input
      const martingaleConfig = config as MartingaleConfig

      // Validate input
      const validationResult = this.validateInput(input, martingaleConfig)
      if (!validationResult.isSuccess) {
        return Result.failure(validationResult.error)
      }

      // Check stop loss
      if (currentBalance <= stopLoss) {
        return Result.success({
          shouldBet: false,
          betType: martingaleConfig.betTarget,
          amount: 0,
          progression: currentProgression,
          stopSession: true,
          reason: 'Stop loss raggiunto'
        })
      }

      // Determine current step in Martingale progression
      let currentStep = 0
      let betAmount = baseAmount

      // If we have a previous bet result, determine next bet
      if (sessionHistory.length > 0) {
        const lastBet = sessionHistory[sessionHistory.length - 1]

        if (lastBet.outcome === 'win') {
          // On win: return to base bet
          currentStep = 0
          betAmount = baseAmount
        } else if (lastBet.outcome === 'loss') {
          // On loss: double the bet (up to maximum)
          currentStep = currentProgression.length > 0 ? currentProgression[0] + 1 : 1

          // Check if we've reached maximum double count
          if (currentStep > martingaleConfig.maxDoubleCount) {
            return Result.success({
              shouldBet: false,
              betType: martingaleConfig.betTarget,
              amount: 0,
              progression: currentProgression,
              stopSession: true,
              reason: `Raggiunto limite massimo di raddoppi (${martingaleConfig.maxDoubleCount})`
            })
          }

          betAmount = baseAmount * Math.pow(2, currentStep)
        }
      }

      // Check if we have enough balance
      if (betAmount > currentBalance) {
        return Result.success({
          shouldBet: false,
          betType: martingaleConfig.betTarget,
          amount: 0,
          progression: currentProgression,
          stopSession: true,
          reason: 'Saldo insufficiente per il prossimo raddoppio'
        })
      }

      // Update progression - Store current step
      const newProgression = [currentStep]

      const betTargetDescription = this.getBetTargetDescription(martingaleConfig.betTarget)
      const stepDescription = currentStep === 0
        ? 'puntata base'
        : `${currentStep}° raddoppio (${Math.pow(2, currentStep)}x base)`

      return Result.success({
        shouldBet: true,
        betType: martingaleConfig.betTarget,
        amount: betAmount,
        progression: newProgression,
        stopSession: false,
        reason: `Martingale ${stepDescription}: punta €${betAmount} su ${betTargetDescription}`
      })

    } catch (error) {
      return Result.failure(new MethodExecutionError(
        'Errore durante il calcolo Martingale',
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
   * Calculate potential losses for stop-loss configuration
   */
  static calculateLossProgression(baseBet: number, maxSteps: number = 10): LossProgression[] {
    const progression: LossProgression[] = []
    let totalLoss = 0

    for (let step = 0; step < maxSteps; step++) {
      const multiplier = Math.pow(2, step)
      const betAmount = baseBet * multiplier
      totalLoss += betAmount

      progression.push({
        step: step + 1,
        multiplier,
        betAmount,
        cumulativeLoss: totalLoss
      })
    }

    return progression
  }

  private validateInput(input: MethodInput, config: MartingaleConfig): Result<boolean, MethodExecutionError> {
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
        'Target di puntata non valido per Martingale',
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    if (config.maxDoubleCount < 1 || config.maxDoubleCount > 15) {
      return Result.failure(new MethodExecutionError(
        'Il numero massimo di raddoppi deve essere tra 1 e 15',
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    return Result.success(true)
  }

  private static getExplanation(): string {
    return `
**Come funziona il Martingale:**

1. **Puntate Even-Money**: Funziona solo su puntate che pagano 1:1:
   - **Rosso/Nero**: 48.6% di probabilità di vincita
   - **Pari/Dispari**: 48.6% di probabilità di vincita
   - **Alto/Basso**: 48.6% di probabilità di vincita (1-18 vs 19-36)

2. **Progressione Semplice**:
   - Su perdita: **RADDOPPIA** la puntata
   - Su vincita: **TORNA** alla puntata base

3. **Teoria**: Una singola vincita recupera tutte le perdite precedenti + 1 unità di profitto

**Esempio pratico** (puntata base €10, puntando su Rosso):
- Puntata 1: €10 su Rosso → Perdi → Prossima: €20
- Puntata 2: €20 su Rosso → Perdi → Prossima: €40
- Puntata 3: €40 su Rosso → Perdi → Prossima: €80
- Puntata 4: €80 su Rosso → Vinci → Profitto: €10 (torna a base)

**Vantaggi:**
- Semplice da capire e applicare
- Garantisce profitto ad ogni ciclo vincente
- Funziona bene su sequenze di perdite brevi

**RISCHI ELEVATI:**
- Progressione esponenziale: 10→20→40→80→160→320...
- Richiede bankroll molto elevato
- Limiti del tavolo possono bloccare la progressione
- Una lunga sequenza di perdite può azzerare il conto
- Lo zero fa perdere SEMPRE (2.7% house edge)

**⚠️ ATTENZIONE**: Il Martingale è molto rischioso. Usa sempre stop-loss rigorosi!
    `.trim()
  }

  private static getConfigSchema(): MethodConfigSchema {
    return {
      compatibleGames: ['european_roulette', 'american_roulette'],
      requiredFields: ['baseBet', 'stopLoss', 'betTarget', 'maxDoubleCount'],
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
          min: 50,
          max: 50000,
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
        maxDoubleCount: {
          type: 'number',
          label: 'Massimo Raddoppi',
          description: 'Numero massimo di raddoppi consecutivi (protezione)',
          min: 3,
          max: 12,
          default: 8,
          placeholder: '8'
        }
      }
    }
  }

  private static getDefaultConfig(): MartingaleConfig {
    return {
      baseBet: 10,
      stopLoss: 500,
      betTarget: 'red',
      maxDoubleCount: 8
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