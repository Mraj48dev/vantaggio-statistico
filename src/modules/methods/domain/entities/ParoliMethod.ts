/**
 * Paroli Method - Methods Module Domain Layer
 *
 * Positive progression Paroli betting strategy:
 * - Choose between even-money bets (Red/Black, Even/Odd, High/Low)
 * - On win: double the bet (up to target wins)
 * - On loss: return to base bet
 * - Opposite of Martingale - capitalizes on winning streaks
 * - Lower risk than Martingale
 */

import { Result } from '@/shared/domain/types/common'
import { MethodInput, MethodOutput, BettingMethod, MethodConfig } from '@/shared/domain/types/methods'
import { Method, MethodConfigSchema, MethodCategory, createMethodId } from './Method'

export type BetTarget = 'red' | 'black' | 'even' | 'odd' | 'high' | 'low'

export interface ParoliConfig extends MethodConfig {
  baseBet: number
  stopLoss: number
  betTarget: BetTarget
  targetWins: number // Number of consecutive wins before reset
}

export class ParoliMethod extends Method implements BettingMethod {
  constructor() {
    super(
      createMethodId('paroli'),
      'paroli',
      'Paroli',
      'Progressione positiva: raddoppia su vincita fino al target',
      ParoliMethod.getExplanation(),
      MethodCategory.PROGRESSIVE,
      'premium', // Requires premium package
      ParoliMethod.getConfigSchema(),
      ParoliMethod.getDefaultConfig(),
      'paroli_positive_progression',
      true,
      5
    )
  }

  async execute(input: MethodInput): Promise<Result<MethodOutput, MethodExecutionError>> {
    try {
      const { gameResult, sessionHistory, currentProgression, baseAmount, currentBalance, stopLoss, config } = input
      const paroliConfig = config as ParoliConfig

      // Validate input
      const validationResult = this.validateInput(input, paroliConfig)
      if (!validationResult.isSuccess) {
        return Result.failure(validationResult.error)
      }

      // Check stop loss
      if (currentBalance <= stopLoss) {
        return Result.success({
          shouldBet: false,
          betType: paroliConfig.betTarget,
          amount: 0,
          progression: currentProgression,
          stopSession: true,
          reason: 'Stop loss raggiunto'
        })
      }

      // Determine current win streak
      let currentWinStreak = 0
      let betAmount = baseAmount

      // If we have a previous bet result, determine next bet
      if (sessionHistory.length > 0) {
        const lastBet = sessionHistory[sessionHistory.length - 1]

        if (lastBet.outcome === 'win') {
          // On win: check if we should continue the streak or reset
          currentWinStreak = currentProgression.length > 0 ? currentProgression[0] + 1 : 1

          if (currentWinStreak >= paroliConfig.targetWins) {
            // Reached target wins - reset to base bet
            currentWinStreak = 0
            betAmount = baseAmount
          } else {
            // Continue streak - double the bet
            betAmount = baseAmount * Math.pow(2, currentWinStreak)
          }
        } else if (lastBet.outcome === 'loss') {
          // On loss: reset to base bet
          currentWinStreak = 0
          betAmount = baseAmount
        }
      }

      // Check if we have enough balance
      if (betAmount > currentBalance) {
        return Result.success({
          shouldBet: false,
          betType: paroliConfig.betTarget,
          amount: 0,
          progression: currentProgression,
          stopSession: true,
          reason: 'Saldo insufficiente per continuare la progressione'
        })
      }

      // Update progression - Store current win streak
      const newProgression = [currentWinStreak]

      const betTargetDescription = this.getBetTargetDescription(paroliConfig.betTarget)
      const streakDescription = currentWinStreak === 0
        ? 'puntata base'
        : `${currentWinStreak}ª vincita consecutiva (${Math.pow(2, currentWinStreak)}x base)`

      return Result.success({
        shouldBet: true,
        betType: paroliConfig.betTarget,
        amount: betAmount,
        progression: newProgression,
        stopSession: false,
        reason: `Paroli ${streakDescription}: punta €${betAmount} su ${betTargetDescription}`
      })

    } catch (error) {
      return Result.failure(new MethodExecutionError(
        'Errore durante il calcolo Paroli',
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
   * Calculate potential wins for a successful streak
   */
  static calculateWinProgression(baseBet: number, targetWins: number): WinProgression[] {
    const progression: WinProgression[] = []
    let totalProfit = 0

    for (let win = 1; win <= targetWins; win++) {
      const multiplier = Math.pow(2, win - 1)
      const betAmount = baseBet * multiplier
      const winAmount = betAmount * 2 // 1:1 payout, so you get back 2x
      const profit = winAmount - betAmount
      totalProfit += profit

      progression.push({
        winNumber: win,
        multiplier,
        betAmount,
        winAmount,
        profit,
        cumulativeProfit: totalProfit
      })
    }

    return progression
  }

  private validateInput(input: MethodInput, config: ParoliConfig): Result<boolean, MethodExecutionError> {
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
        'Target di puntata non valido per Paroli',
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    if (config.targetWins < 2 || config.targetWins > 8) {
      return Result.failure(new MethodExecutionError(
        'Il numero di vincite target deve essere tra 2 e 8',
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    return Result.success(true)
  }

  private static getExplanation(): string {
    return `
**Come funziona il Paroli:**

1. **Progressione Positiva**: Aumenta le puntate SOLO quando vinci:
   - **Puntate Even-Money**: Rosso/Nero, Pari/Dispari, Alto/Basso (48.6% probabilità)
   - Su vincita: **RADDOPPIA** la puntata
   - Su perdita: **TORNA** alla puntata base

2. **Target di Vincite**: Scegli quante vincite consecutive vuoi raggiungere
   - Tipicamente 3-4 vincite consecutive
   - Dopo aver raggiunto il target, torna alla puntata base

3. **Filosofia**: Cavalca le serie vincenti, limita le perdite

**Esempio pratico** (puntata base €10, target 3 vincite, su Rosso):
- Puntata 1: €10 su Rosso → Vinci €10 → Prossima: €20
- Puntata 2: €20 su Rosso → Vinci €20 → Prossima: €40
- Puntata 3: €40 su Rosso → Vinci €40 → TARGET RAGGIUNTO!
- **Profitto totale**: €70, **rischiato**: solo €10 iniziali
- Puntata 4: Ricomincia con €10

**Se perdi durante la serie**:
- Puntata 1: €10 → Vinci → Prossima: €20
- Puntata 2: €20 → Perdi → Prossima: €10 (reset)
- **Perdita netta**: €10

**Vantaggi del Paroli:**
- Rischio limitato: perdi al massimo la puntata base
- Sfrutta le serie vincenti
- Progressione controllata e limitata
- Meno stressante del Martingale

**Svantaggi:**
- Richiede serie vincenti per essere redditizio
- Le serie di 3+ vincite consecutive sono rare (~12.5%)
- I profitti crescono lentamente
- Lo zero interrompe sempre le serie

**💡 Strategia**: Il Paroli è perfetto per chi vuole limitare i rischi ma sfruttare i momenti fortunati!
    `.trim()
  }

  private static getConfigSchema(): MethodConfigSchema {
    return {
      compatibleGames: ['european_roulette', 'american_roulette'],
      requiredFields: ['baseBet', 'stopLoss', 'betTarget', 'targetWins'],
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
          min: 20,
          max: 10000,
          default: 200,
          placeholder: '200'
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
        targetWins: {
          type: 'number',
          label: 'Vincite Consecutive Target',
          description: 'Quante vincite consecutive prima di resettare',
          min: 2,
          max: 6,
          default: 3,
          placeholder: '3'
        }
      }
    }
  }

  private static getDefaultConfig(): ParoliConfig {
    return {
      baseBet: 10,
      stopLoss: 200,
      betTarget: 'red',
      targetWins: 3
    }
  }
}

export interface WinProgression {
  readonly winNumber: number
  readonly multiplier: number
  readonly betAmount: number
  readonly winAmount: number
  readonly profit: number
  readonly cumulativeProfit: number
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