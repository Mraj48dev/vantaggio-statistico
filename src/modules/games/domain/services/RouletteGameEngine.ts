/**
 * Roulette Game Engine - Games Module Domain Service
 *
 * Core business logic for European roulette game mechanics,
 * bet validation, outcome calculation, and payout determination.
 */

import { Result } from '@/shared/domain/types/common'
import { RouletteConfig } from '../entities/GameType'

// Roulette Numbers Configuration
export const EUROPEAN_ROULETTE_NUMBERS = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36
] as const

export const RED_NUMBERS = [
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
] as const

export const BLACK_NUMBERS = [
  2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35
] as const

export const GREEN_NUMBERS = [0] as const

// Bet Types
export enum BetType {
  // Inside Bets
  STRAIGHT = 'straight',           // Single number
  SPLIT = 'split',                 // Two adjacent numbers
  STREET = 'street',               // Three numbers in a row
  CORNER = 'corner',               // Four numbers in a square
  LINE = 'line',                   // Six numbers (two rows)

  // Outside Bets
  RED = 'red',                     // All red numbers
  BLACK = 'black',                 // All black numbers
  EVEN = 'even',                   // All even numbers (2,4,6...)
  ODD = 'odd',                     // All odd numbers (1,3,5...)
  LOW = 'low',                     // 1-18
  HIGH = 'high',                   // 19-36
  DOZEN_1 = 'dozen_1',             // 1-12
  DOZEN_2 = 'dozen_2',             // 13-24
  DOZEN_3 = 'dozen_3',             // 25-36
  COLUMN_1 = 'column_1',           // 1,4,7,10,13,16,19,22,25,28,31,34
  COLUMN_2 = 'column_2',           // 2,5,8,11,14,17,20,23,26,29,32,35
  COLUMN_3 = 'column_3'            // 3,6,9,12,15,18,21,24,27,30,33,36
}

export interface BetInput {
  readonly type: BetType
  readonly numbers?: readonly number[]  // For inside bets with specific numbers
  readonly amount: number
}

export interface BetResult {
  readonly bet: BetInput
  readonly isWinning: boolean
  readonly payout: number
  readonly winAmount: number           // Amount won (including original bet if winning)
  readonly netGain: number             // Net gain/loss (payout - bet amount)
}

export interface SpinResult {
  readonly winningNumber: number
  readonly color: 'red' | 'black' | 'green'
  readonly isEven: boolean
  readonly isLow: boolean             // 1-18
  readonly dozen: 1 | 2 | 3 | null
  readonly column: 1 | 2 | 3 | null
  readonly betResults: readonly BetResult[]
  readonly totalWinAmount: number
  readonly totalNetGain: number
}

export class RouletteGameEngine {
  private readonly config: RouletteConfig

  constructor(config: RouletteConfig) {
    this.config = config
  }

  /**
   * Validates a bet according to game rules and limits
   */
  validateBet(bet: BetInput): Result<void, RouletteGameError> {
    if (bet.amount <= 0) {
      return Result.failure(new RouletteGameError('Bet amount must be positive'))
    }

    if (bet.amount < this.config.minBet) {
      return Result.failure(new RouletteGameError(`Minimum bet is ${this.config.minBet}`))
    }

    if (bet.amount > this.config.maxBet) {
      return Result.failure(new RouletteGameError(`Maximum bet is ${this.config.maxBet}`))
    }

    // Validate inside vs outside bet limits
    if (this.isInsideBet(bet.type) && bet.amount > this.config.tableLimits.inside) {
      return Result.failure(new RouletteGameError(`Inside bet limit is ${this.config.tableLimits.inside}`))
    }

    if (this.isOutsideBet(bet.type) && bet.amount > this.config.tableLimits.outside) {
      return Result.failure(new RouletteGameError(`Outside bet limit is ${this.config.tableLimits.outside}`))
    }

    // Validate bet-specific rules
    const betValidation = this.validateBetSpecificRules(bet)
    if (!betValidation.isSuccess) {
      return betValidation
    }

    return Result.success(undefined)
  }

  /**
   * Calculates bet results for a known winning number
   */
  calculateResultsForNumber(bets: readonly BetInput[], winningNumber: number): Result<SpinResult, RouletteGameError> {
    // Validate all bets first
    for (const bet of bets) {
      const validation = this.validateBet(bet)
      if (!validation.isSuccess) {
        return Result.failure(validation.error)
      }
    }

    // Validate the winning number
    if (!this.config.numbers.includes(winningNumber)) {
      return Result.failure(new RouletteGameError(`Invalid winning number: ${winningNumber}`))
    }

    const numberInfo = this.getNumberInfo(winningNumber)

    // Calculate results for each bet
    const betResults = bets.map(bet => this.calculateBetResult(bet, winningNumber))

    // Calculate totals
    const totalWinAmount = betResults.reduce((sum, result) => sum + result.winAmount, 0)
    const totalNetGain = betResults.reduce((sum, result) => sum + result.netGain, 0)

    const spinResult: SpinResult = {
      winningNumber,
      color: numberInfo.color,
      isEven: numberInfo.isEven,
      isLow: numberInfo.isLow,
      dozen: numberInfo.dozen,
      column: numberInfo.column,
      betResults,
      totalWinAmount,
      totalNetGain
    }

    return Result.success(spinResult)
  }

  /**
   * Simulates a roulette spin and calculates all bet results
   */
  spin(bets: readonly BetInput[]): Result<SpinResult, RouletteGameError> {
    // Validate all bets first
    for (const bet of bets) {
      const validation = this.validateBet(bet)
      if (!validation.isSuccess) {
        return Result.failure(validation.error)
      }
    }

    // Generate random winning number
    const winningNumber = this.generateWinningNumber()
    const numberInfo = this.getNumberInfo(winningNumber)

    // Calculate results for each bet
    const betResults = bets.map(bet => this.calculateBetResult(bet, winningNumber))

    // Calculate totals
    const totalWinAmount = betResults.reduce((sum, result) => sum + result.winAmount, 0)
    const totalNetGain = betResults.reduce((sum, result) => sum + result.netGain, 0)

    const spinResult: SpinResult = {
      winningNumber,
      color: numberInfo.color,
      isEven: numberInfo.isEven,
      isLow: numberInfo.isLow,
      dozen: numberInfo.dozen,
      column: numberInfo.column,
      betResults,
      totalWinAmount,
      totalNetGain
    }

    return Result.success(spinResult)
  }

  /**
   * Calculates the result for a single bet
   */
  private calculateBetResult(bet: BetInput, winningNumber: number): BetResult {
    const isWinning = this.isBetWinning(bet, winningNumber)
    const payout = isWinning ? this.calculatePayout(bet) : 0
    const winAmount = isWinning ? payout : 0
    const netGain = winAmount - bet.amount

    return {
      bet,
      isWinning,
      payout,
      winAmount,
      netGain
    }
  }

  /**
   * Determines if a bet wins for the given winning number
   */
  private isBetWinning(bet: BetInput, winningNumber: number): boolean {
    switch (bet.type) {
      case BetType.STRAIGHT:
        return bet.numbers?.[0] === winningNumber

      case BetType.SPLIT:
        return bet.numbers?.includes(winningNumber) ?? false

      case BetType.STREET:
      case BetType.CORNER:
      case BetType.LINE:
        return bet.numbers?.includes(winningNumber) ?? false

      case BetType.RED:
        return RED_NUMBERS.includes(winningNumber as any)

      case BetType.BLACK:
        return BLACK_NUMBERS.includes(winningNumber as any)

      case BetType.EVEN:
        return winningNumber > 0 && winningNumber % 2 === 0

      case BetType.ODD:
        return winningNumber > 0 && winningNumber % 2 === 1

      case BetType.LOW:
        return winningNumber >= 1 && winningNumber <= 18

      case BetType.HIGH:
        return winningNumber >= 19 && winningNumber <= 36

      case BetType.DOZEN_1:
        return winningNumber >= 1 && winningNumber <= 12

      case BetType.DOZEN_2:
        return winningNumber >= 13 && winningNumber <= 24

      case BetType.DOZEN_3:
        return winningNumber >= 25 && winningNumber <= 36

      case BetType.COLUMN_1:
        return [1,4,7,10,13,16,19,22,25,28,31,34].includes(winningNumber)

      case BetType.COLUMN_2:
        return [2,5,8,11,14,17,20,23,26,29,32,35].includes(winningNumber)

      case BetType.COLUMN_3:
        return [3,6,9,12,15,18,21,24,27,30,33,36].includes(winningNumber)

      default:
        return false
    }
  }

  /**
   * Calculates the payout for a winning bet
   */
  private calculatePayout(bet: BetInput): number {
    const multiplier = this.getPayoutMultiplier(bet.type)
    return bet.amount * multiplier
  }

  /**
   * Gets the payout multiplier for each bet type
   */
  private getPayoutMultiplier(betType: BetType): number {
    switch (betType) {
      case BetType.STRAIGHT:
        return this.config.payouts.straight

      case BetType.SPLIT:
        return this.config.payouts.split

      case BetType.STREET:
        return this.config.payouts.street

      case BetType.CORNER:
        return this.config.payouts.corner

      case BetType.LINE:
        return this.config.payouts.line

      case BetType.DOZEN_1:
      case BetType.DOZEN_2:
      case BetType.DOZEN_3:
        return this.config.payouts.dozen

      case BetType.COLUMN_1:
      case BetType.COLUMN_2:
      case BetType.COLUMN_3:
        return this.config.payouts.column

      case BetType.RED:
      case BetType.BLACK:
        return this.config.payouts.red

      case BetType.EVEN:
      case BetType.ODD:
        return this.config.payouts.even

      case BetType.LOW:
      case BetType.HIGH:
        return this.config.payouts.low

      default:
        return 0
    }
  }

  /**
   * Generates a random winning number
   */
  private generateWinningNumber(): number {
    const randomIndex = Math.floor(Math.random() * this.config.numbers.length)
    return this.config.numbers[randomIndex]
  }

  /**
   * Gets detailed information about a number
   */
  private getNumberInfo(number: number) {
    const color: 'red' | 'black' | 'green' =
      RED_NUMBERS.includes(number as any) ? 'red' :
      BLACK_NUMBERS.includes(number as any) ? 'black' : 'green'

    const isEven = number > 0 && number % 2 === 0
    const isLow = number >= 1 && number <= 18

    const dozen: 1 | 2 | 3 | null =
      number >= 1 && number <= 12 ? 1 :
      number >= 13 && number <= 24 ? 2 :
      number >= 25 && number <= 36 ? 3 : null

    const column: 1 | 2 | 3 | null =
      [1,4,7,10,13,16,19,22,25,28,31,34].includes(number) ? 1 :
      [2,5,8,11,14,17,20,23,26,29,32,35].includes(number) ? 2 :
      [3,6,9,12,15,18,21,24,27,30,33,36].includes(number) ? 3 : null

    return {
      color,
      isEven,
      isLow,
      dozen,
      column
    }
  }

  /**
   * Validates bet-specific rules
   */
  private validateBetSpecificRules(bet: BetInput): Result<void, RouletteGameError> {
    switch (bet.type) {
      case BetType.STRAIGHT:
        if (!bet.numbers || bet.numbers.length !== 1) {
          return Result.failure(new RouletteGameError('Straight bet must specify exactly one number'))
        }
        if (!this.config.numbers.includes(bet.numbers[0])) {
          return Result.failure(new RouletteGameError('Invalid number for straight bet'))
        }
        break

      case BetType.SPLIT:
        if (!bet.numbers || bet.numbers.length !== 2) {
          return Result.failure(new RouletteGameError('Split bet must specify exactly two numbers'))
        }
        // Additional validation for adjacent numbers could be added here
        break

      case BetType.STREET:
        if (!bet.numbers || bet.numbers.length !== 3) {
          return Result.failure(new RouletteGameError('Street bet must specify exactly three numbers'))
        }
        break

      case BetType.CORNER:
        if (!bet.numbers || bet.numbers.length !== 4) {
          return Result.failure(new RouletteGameError('Corner bet must specify exactly four numbers'))
        }
        break

      case BetType.LINE:
        if (!bet.numbers || bet.numbers.length !== 6) {
          return Result.failure(new RouletteGameError('Line bet must specify exactly six numbers'))
        }
        break
    }

    return Result.success(undefined)
  }

  /**
   * Determines if a bet type is an inside bet
   */
  private isInsideBet(betType: BetType): boolean {
    return [
      BetType.STRAIGHT,
      BetType.SPLIT,
      BetType.STREET,
      BetType.CORNER,
      BetType.LINE
    ].includes(betType)
  }

  /**
   * Determines if a bet type is an outside bet
   */
  private isOutsideBet(betType: BetType): boolean {
    return !this.isInsideBet(betType)
  }
}

export class RouletteGameError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'RouletteGameError'
  }
}

// Factory function for creating European roulette configuration
export function createEuropeanRouletteConfig(): RouletteConfig {
  return {
    type: 'european',
    numbers: EUROPEAN_ROULETTE_NUMBERS,
    redNumbers: RED_NUMBERS,
    blackNumbers: BLACK_NUMBERS,
    greenNumbers: GREEN_NUMBERS,
    payouts: {
      straight: 36,     // 35:1 + original bet = 36x
      split: 18,        // 17:1 + original bet = 18x
      street: 12,       // 11:1 + original bet = 12x
      corner: 9,        // 8:1 + original bet = 9x
      line: 6,          // 5:1 + original bet = 6x
      dozen: 3,         // 2:1 + original bet = 3x
      column: 3,        // 2:1 + original bet = 3x
      even: 2,          // 1:1 + original bet = 2x
      red: 2,           // 1:1 + original bet = 2x
      low: 2            // 1:1 + original bet = 2x
    },
    minBet: 1,
    maxBet: 1000,
    tableLimits: {
      inside: 100,
      outside: 500
    }
  }
}