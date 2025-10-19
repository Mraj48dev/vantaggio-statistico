/**
 * Simple Roulette Engine - Versione semplice e funzionante
 * Ispirata al bot Telegram funzionante
 */

export interface SimpleBet {
  type: string  // 'red', 'black', 'even', 'odd', 'low', 'high', 'dozen_1', 'dozen_2', 'dozen_3', 'column_1', 'column_2', 'column_3'
  amount: number
}

export interface SimpleResult {
  bet: SimpleBet
  won: boolean
  payout: number  // 0 se perso, amount * multiplier se vinto
}

export class SimpleRouletteEngine {

  /**
   * Verifica se una scommessa ha vinto per il numero dato
   */
  static checkWin(betType: string, number: number): boolean {
    if (number < 0 || number > 36) return false

    switch (betType.toLowerCase()) {
      // Even-money bets (1:1)
      case 'red':
        return [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(number)

      case 'black':
        return [2,4,6,8,10,11,13,15,17,20,22,24,26,28,29,31,33,35].includes(number)

      case 'even':
        return number > 0 && number % 2 === 0

      case 'odd':
        return number > 0 && number % 2 === 1

      case 'low':
        return number >= 1 && number <= 18

      case 'high':
        return number >= 19 && number <= 36

      // Dozens (2:1)
      case 'dozen_1':
        return number >= 1 && number <= 12

      case 'dozen_2':
        return number >= 13 && number <= 24

      case 'dozen_3':
        return number >= 25 && number <= 36

      // Columns (2:1)
      case 'column_1':
        return number > 0 && number % 3 === 1

      case 'column_2':
        return number > 0 && number % 3 === 2

      case 'column_3':
        return number > 0 && number % 3 === 0

      default:
        return false
    }
  }

  /**
   * Ottieni il moltiplicatore di payout per il tipo di scommessa
   */
  static getPayoutMultiplier(betType: string): number {
    switch (betType.toLowerCase()) {
      case 'red':
      case 'black':
      case 'even':
      case 'odd':
      case 'low':
      case 'high':
        return 2  // 1:1 + original bet = 2x

      case 'dozen_1':
      case 'dozen_2':
      case 'dozen_3':
      case 'column_1':
      case 'column_2':
      case 'column_3':
        return 3  // 2:1 + original bet = 3x

      default:
        return 0
    }
  }

  /**
   * Calcola il risultato per una singola scommessa
   */
  static calculateBet(bet: SimpleBet, number: number): SimpleResult {
    const won = this.checkWin(bet.type, number)
    const payout = won ? bet.amount * this.getPayoutMultiplier(bet.type) : 0

    return {
      bet,
      won,
      payout
    }
  }

  /**
   * Calcola i risultati per multiple scommesse
   */
  static calculateBets(bets: SimpleBet[], number: number): SimpleResult[] {
    return bets.map(bet => this.calculateBet(bet, number))
  }

  /**
   * Funzione helper: controlla se almeno una scommessa ha vinto
   */
  static hasWon(bets: SimpleBet[], number: number): boolean {
    return bets.some(bet => this.checkWin(bet.type, number))
  }

  /**
   * Funzione helper: ottieni solo le scommesse vincenti
   */
  static getWinningBets(bets: SimpleBet[], number: number): SimpleBet[] {
    return bets.filter(bet => this.checkWin(bet.type, number))
  }

  /**
   * Test automatico per verificare la correttezza
   */
  static runTests(): { passed: boolean; errors: string[] } {
    const errors: string[] = []

    // Test cases critici
    const tests = [
      { number: 2, betType: 'column_2', shouldWin: true, description: 'Number 2 should win Column 2' },
      { number: 17, betType: 'column_2', shouldWin: true, description: 'Number 17 should win Column 2' },
      { number: 17, betType: 'dozen_2', shouldWin: true, description: 'Number 17 should win Dozen 2' },
      { number: 1, betType: 'dozen_2', shouldWin: false, description: 'Number 1 should NOT win Dozen 2' },
      { number: 1, betType: 'column_2', shouldWin: false, description: 'Number 1 should NOT win Column 2' },
      { number: 0, betType: 'red', shouldWin: false, description: 'Number 0 should NOT win Red' },
      { number: 18, betType: 'low', shouldWin: true, description: 'Number 18 should win Low' },
      { number: 19, betType: 'high', shouldWin: true, description: 'Number 19 should win High' },
    ]

    for (const test of tests) {
      const result = this.checkWin(test.betType, test.number)
      if (result !== test.shouldWin) {
        errors.push(`❌ ${test.description}: expected ${test.shouldWin}, got ${result}`)
      }
    }

    return {
      passed: errors.length === 0,
      errors
    }
  }
}

// Test automatico all'import
const testResult = SimpleRouletteEngine.runTests()
if (testResult.passed) {
  console.log('✅ SimpleRouletteEngine: All tests passed!')
} else {
  console.error('❌ SimpleRouletteEngine tests failed:')
  testResult.errors.forEach(error => console.error(error))
}