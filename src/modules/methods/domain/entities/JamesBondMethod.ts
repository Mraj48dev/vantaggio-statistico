/**
 * James Bond Method - Methods Module Domain Layer
 *
 * Fixed James Bond betting strategy:
 * - Multiple simultaneous bets on each spin
 * - €140 on High (19-36) - pays 1:1
 * - €50 on Six Line (13-18) - pays 5:1
 * - €10 on Zero - pays 35:1
 * - Total bet: €200 per spin
 * - Covers 25 out of 37 numbers (67.6% coverage)
 * - Non-progressive system with fixed bet amounts
 */

import { Result } from '@/shared/domain/types/common'
import { MethodInput, MethodOutput, BettingMethod, MethodConfig } from '@/shared/domain/types/methods'
import { Method, MethodConfigSchema, MethodCategory, createMethodId } from './Method'

export interface JamesBondConfig extends MethodConfig {
  unitSize: number // Multiplier for the base James Bond bet
  stopLoss: number
  maxSpins: number // Limit number of spins per session
}

export interface JamesBondBetBreakdown {
  highBet: number    // 19-36
  sixLineBet: number // 13-18
  zeroBet: number    // 0
  totalBet: number
}

export class JamesBondMethod extends Method implements BettingMethod {
  // Standard James Bond ratios (for €200 total)
  private static readonly BASE_HIGH_BET = 140
  private static readonly BASE_SIXLINE_BET = 50
  private static readonly BASE_ZERO_BET = 10
  private static readonly BASE_TOTAL = 200

  constructor() {
    super(
      createMethodId('james_bond'),
      'james_bond',
      'James Bond',
      'Strategia fissa con puntate multiple: High, Six Line e Zero',
      JamesBondMethod.getExplanation(),
      MethodCategory.FLAT,
      'premium', // Requires premium package
      JamesBondMethod.getConfigSchema(),
      JamesBondMethod.getDefaultConfig(),
      'james_bond_multiple_coverage',
      true,
      8
    )
  }

  async execute(input: MethodInput): Promise<Result<MethodOutput, MethodExecutionError>> {
    try {
      const { gameResult, sessionHistory, currentProgression, baseAmount, currentBalance, stopLoss, config } = input
      const bondConfig = config as JamesBondConfig

      // Validate input
      const validationResult = this.validateInput(input, bondConfig)
      if (!validationResult.isSuccess) {
        return Result.failure(validationResult.error)
      }

      // Check stop loss
      if (currentBalance <= stopLoss) {
        return Result.success({
          shouldBet: false,
          betType: 'multiple',
          amount: 0,
          progression: currentProgression,
          stopSession: true,
          reason: 'Stop loss raggiunto'
        })
      }

      // Check maximum spins limit
      const currentSpins = sessionHistory.length
      if (currentSpins >= bondConfig.maxSpins) {
        return Result.success({
          shouldBet: false,
          betType: 'multiple',
          amount: 0,
          progression: currentProgression,
          stopSession: true,
          reason: `Raggiunto limite massimo di ${bondConfig.maxSpins} spin`
        })
      }

      // Calculate bet breakdown based on unit size
      const betBreakdown = this.calculateBetBreakdown(bondConfig.unitSize)

      // Check if we have enough balance for all bets
      if (betBreakdown.totalBet > currentBalance) {
        return Result.success({
          shouldBet: false,
          betType: 'multiple',
          amount: 0,
          progression: currentProgression,
          stopSession: true,
          reason: 'Saldo insufficiente per la strategia James Bond completa'
        })
      }

      // Update progression - Store spin count
      const newProgression = [currentSpins + 1]

      return Result.success({
        shouldBet: true,
        betType: 'multiple',
        amount: betBreakdown.totalBet,
        progression: newProgression,
        stopSession: false,
        reason: `James Bond spin ${currentSpins + 1}: €${betBreakdown.highBet} High + €${betBreakdown.sixLineBet} Six Line + €${betBreakdown.zeroBet} Zero = €${betBreakdown.totalBet}`
      })

    } catch (error) {
      return Result.failure(new MethodExecutionError(
        'Errore durante il calcolo James Bond',
        MethodExecutionErrorCode.CALCULATION_ERROR,
        error as Error
      ))
    }
  }

  private calculateBetBreakdown(unitSize: number): JamesBondBetBreakdown {
    return {
      highBet: JamesBondMethod.BASE_HIGH_BET * unitSize,
      sixLineBet: JamesBondMethod.BASE_SIXLINE_BET * unitSize,
      zeroBet: JamesBondMethod.BASE_ZERO_BET * unitSize,
      totalBet: JamesBondMethod.BASE_TOTAL * unitSize
    }
  }

  /**
   * Calculate the outcome for a James Bond bet based on the game result
   */
  static calculateOutcome(gameResult: { number: number }, betBreakdown: JamesBondBetBreakdown): JamesBondOutcome {
    const { number } = gameResult
    const { highBet, sixLineBet, zeroBet, totalBet } = betBreakdown

    let profit = 0
    let winningBets: string[] = []
    let losingBets: string[] = []

    // Check High bet (19-36)
    if (number >= 19 && number <= 36) {
      profit += highBet // 1:1 payout
      winningBets.push(`High (€${highBet})`)
    } else {
      profit -= highBet
      losingBets.push(`High (€${highBet})`)
    }

    // Check Six Line bet (13-18)
    if (number >= 13 && number <= 18) {
      profit += sixLineBet * 5 // 5:1 payout
      winningBets.push(`Six Line (€${sixLineBet} → €${sixLineBet * 5})`)
    } else {
      profit -= sixLineBet
      losingBets.push(`Six Line (€${sixLineBet})`)
    }

    // Check Zero bet
    if (number === 0) {
      profit += zeroBet * 35 // 35:1 payout
      winningBets.push(`Zero (€${zeroBet} → €${zeroBet * 35})`)
    } else {
      profit -= zeroBet
      losingBets.push(`Zero (€${zeroBet})`)
    }

    const netProfit = profit
    const outcome = netProfit > 0 ? 'win' : netProfit < 0 ? 'loss' : 'push'

    return {
      number,
      outcome,
      netProfit,
      totalBet,
      winningBets,
      losingBets,
      coverage: JamesBondMethod.getCoverage(number)
    }
  }

  private static getCoverage(number: number): string {
    if (number === 0) return 'Zero (covered)'
    if (number >= 1 && number <= 12) return 'Low third (NOT covered)'
    if (number >= 13 && number <= 18) return 'Six Line (covered)'
    if (number >= 19 && number <= 36) return 'High (covered)'
    return 'Unknown'
  }

  /**
   * Calculate the theoretical return and coverage statistics
   */
  static calculateStatistics(): JamesBondStatistics {
    const totalNumbers = 37
    const coveredNumbers = 25 // 0 + 13-18 (6) + 19-36 (18)
    const uncoveredNumbers = 12 // 1-12

    const winProbability = coveredNumbers / totalNumbers
    const lossProbability = uncoveredNumbers / totalNumbers

    // Expected value calculation for base bet (€200)
    const highWinAmount = JamesBondMethod.BASE_HIGH_BET // 1:1 on 18 numbers
    const sixLineWinAmount = JamesBondMethod.BASE_SIXLINE_BET * 5 // 5:1 on 6 numbers
    const zeroWinAmount = JamesBondMethod.BASE_ZERO_BET * 35 // 35:1 on 1 number
    const totalLoss = JamesBondMethod.BASE_TOTAL // Lose all when 1-12 hits

    const expectedValue =
      (18/37) * highWinAmount +  // High wins
      (6/37) * sixLineWinAmount + // Six Line wins
      (1/37) * zeroWinAmount +    // Zero wins
      (12/37) * (-totalLoss)      // Losses on 1-12

    return {
      coverage: (coveredNumbers / totalNumbers) * 100,
      coveredNumbers,
      uncoveredNumbers,
      winProbability: winProbability * 100,
      lossProbability: lossProbability * 100,
      expectedValue,
      houseEdge: (expectedValue / JamesBondMethod.BASE_TOTAL) * 100
    }
  }

  private validateInput(input: MethodInput, config: JamesBondConfig): Result<boolean, MethodExecutionError> {
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

    if (config.unitSize <= 0 || config.unitSize > 10) {
      return Result.failure(new MethodExecutionError(
        'La dimensione unità deve essere tra 0.1 e 10',
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    if (config.maxSpins < 1 || config.maxSpins > 1000) {
      return Result.failure(new MethodExecutionError(
        'Il numero massimo di spin deve essere tra 1 e 1000',
        MethodExecutionErrorCode.INVALID_INPUT
      ))
    }

    // Check if balance is sufficient for at least one James Bond bet
    const minTotalBet = JamesBondMethod.BASE_TOTAL * config.unitSize
    if (input.currentBalance < minTotalBet) {
      return Result.failure(new MethodExecutionError(
        `Saldo insufficiente. Serve almeno €${minTotalBet} per la strategia James Bond`,
        MethodExecutionErrorCode.INSUFFICIENT_BALANCE
      ))
    }

    return Result.success(true)
  }

  private static getExplanation(): string {
    return `
**Come funziona la Strategia James Bond:**

1. **Puntate Multiple Fisse**: Ogni spin piazza 3 puntate simultanee:
   - **€140 su High (19-36)**: Paga 1:1 (18 numeri coperti)
   - **€50 su Six Line (13-18)**: Paga 5:1 (6 numeri coperti)
   - **€10 su Zero**: Paga 35:1 (1 numero coperto)
   - **Totale**: €200 per spin

2. **Copertura**: 25 numeri su 37 (67.6% della ruota):
   - ✅ **Coperti**: 0, 13-36 (25 numeri)
   - ❌ **Scoperti**: 1-12 (12 numeri)

3. **Risultati Possibili**:
   - **19-36**: Vinci €140, perdi €60 → **Profitto netto: +€80**
   - **13-18**: Vinci €250, perdi €150 → **Profitto netto: +€100**
   - **Zero**: Vinci €350, perdi €190 → **Profitto netto: +€160**
   - **1-12**: Perdi tutto → **Perdita netta: -€200**

**Esempio pratico** (unità 1x = €200 totali):
- Spin 1: Esce 25 → Vinci High → +€80
- Spin 2: Esce 15 → Vinci Six Line → +€100
- Spin 3: Esce 7 → Perdi tutto → -€200
- **Bilancio netto**: -€20

**Vantaggi della Strategia James Bond:**
- Alta probabilità di vincita (67.6%)
- Vincite frequenti mantengono il morale alto
- Sistema semplice senza progressioni complesse
- Adatto per sessioni brevi

**Svantaggi:**
- Puntate elevate richieste (€200 base)
- Le perdite su 1-12 sono sostanziose (-€200)
- House edge normale della roulette (-2.7%)
- Non è un sistema progressivo di recupero

**💡 Strategia Consigliata**:
- Usa unità ridotte per iniziare (0.5x = €100 totali)
- Fissa un limite di spin (20-50 per sessione)
- Stop-win a +€500 o stop-loss a -€500

**⚠️ Nota**: James Bond stesso usava questa strategia solo per brevi sessioni nei casinò di Montecarlo!
    `.trim()
  }

  private static getConfigSchema(): MethodConfigSchema {
    return {
      compatibleGames: ['european_roulette', 'american_roulette'],
      requiredFields: ['unitSize', 'stopLoss', 'maxSpins'],
      fields: {
        unitSize: {
          type: 'number',
          label: 'Dimensione Unità',
          description: 'Moltiplicatore per la puntata base (1.0 = €200 totali)',
          min: 0.1,
          max: 5,
          step: 0.1,
          default: 0.5,
          placeholder: '0.5'
        },
        stopLoss: {
          type: 'number',
          label: 'Stop Loss',
          description: 'Perdita massima accettabile in euro',
          min: 200,
          max: 10000,
          default: 1000,
          placeholder: '1000'
        },
        maxSpins: {
          type: 'number',
          label: 'Massimo Spin',
          description: 'Numero massimo di spin per sessione',
          min: 10,
          max: 200,
          default: 50,
          placeholder: '50'
        }
      }
    }
  }

  private static getDefaultConfig(): JamesBondConfig {
    return {
      unitSize: 0.5, // €100 total per spin
      stopLoss: 1000,
      maxSpins: 50
    }
  }
}

export interface JamesBondOutcome {
  readonly number: number
  readonly outcome: 'win' | 'loss' | 'push'
  readonly netProfit: number
  readonly totalBet: number
  readonly winningBets: string[]
  readonly losingBets: string[]
  readonly coverage: string
}

export interface JamesBondStatistics {
  readonly coverage: number // Percentage
  readonly coveredNumbers: number
  readonly uncoveredNumbers: number
  readonly winProbability: number // Percentage
  readonly lossProbability: number // Percentage
  readonly expectedValue: number // Expected profit/loss per bet
  readonly houseEdge: number // Percentage
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