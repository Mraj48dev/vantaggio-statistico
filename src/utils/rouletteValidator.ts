/**
 * Validatore automatico per la logica della roulette
 * Garantisce che la logica di vincita sia sempre corretta
 */

import { RouletteGameEngine, BetType, createEuropeanRouletteConfig, type BetInput } from '@/modules/games/domain/services/RouletteGameEngine'

// Test cases per la validazione
interface TestCase {
  number: number
  betType: string
  shouldWin: boolean
  description: string
}

export const ROULETTE_TEST_CASES: TestCase[] = [
  // Casi specifici problematici
  { number: 2, betType: 'column_2', shouldWin: true, description: 'Number 2 should win Column 2' },
  { number: 17, betType: 'column_2', shouldWin: true, description: 'Number 17 should win Column 2' },
  { number: 17, betType: 'dozen_2', shouldWin: true, description: 'Number 17 should win Dozen 2' },
  { number: 1, betType: 'dozen_2', shouldWin: false, description: 'Number 1 should NOT win Dozen 2' },
  { number: 1, betType: 'column_2', shouldWin: false, description: 'Number 1 should NOT win Column 2' },

  // Edge cases
  { number: 0, betType: 'red', shouldWin: false, description: 'Number 0 should NOT win Red' },
  { number: 0, betType: 'black', shouldWin: false, description: 'Number 0 should NOT win Black' },
  { number: 0, betType: 'even', shouldWin: false, description: 'Number 0 should NOT win Even' },
  { number: 0, betType: 'column_1', shouldWin: false, description: 'Number 0 should NOT win any Column' },

  // Boundary cases
  { number: 18, betType: 'low', shouldWin: true, description: 'Number 18 should win Low (1-18)' },
  { number: 19, betType: 'high', shouldWin: true, description: 'Number 19 should win High (19-36)' },
  { number: 12, betType: 'dozen_1', shouldWin: true, description: 'Number 12 should win Dozen 1' },
  { number: 13, betType: 'dozen_2', shouldWin: true, description: 'Number 13 should win Dozen 2' },

  // Color cases
  { number: 1, betType: 'red', shouldWin: true, description: 'Number 1 should win Red' },
  { number: 2, betType: 'black', shouldWin: true, description: 'Number 2 should win Black' },
]

const engine = new RouletteGameEngine(createEuropeanRouletteConfig())

const mapUIBetToBetType = (uiBet: string): BetType | null => {
  const betMap: Record<string, BetType> = {
    'red': BetType.RED,
    'black': BetType.BLACK,
    'even': BetType.EVEN,
    'odd': BetType.ODD,
    'high': BetType.HIGH,
    'low': BetType.LOW,
    'dozen_1': BetType.DOZEN_1,
    'dozen_2': BetType.DOZEN_2,
    'dozen_3': BetType.DOZEN_3,
    'column_1': BetType.COLUMN_1,
    'column_2': BetType.COLUMN_2,
    'column_3': BetType.COLUMN_3
  }
  return betMap[uiBet] || null
}

export function validateRouletteLogic(): { success: boolean; errors: string[] } {
  const errors: string[] = []

  for (const testCase of ROULETTE_TEST_CASES) {
    const betType = mapUIBetToBetType(testCase.betType)

    if (!betType) {
      errors.push(`❌ Invalid bet type: ${testCase.betType}`)
      continue
    }

    const bet: BetInput = { type: betType, amount: 1 }
    const result = engine.calculateResultsForNumber([bet], testCase.number)

    if (!result.isSuccess) {
      errors.push(`❌ Engine error for ${testCase.description}: ${result.error}`)
      continue
    }

    const actualWin = result.value.betResults[0].isWinning

    if (actualWin !== testCase.shouldWin) {
      errors.push(`❌ ${testCase.description}: expected ${testCase.shouldWin}, got ${actualWin}`)
    }
  }

  return {
    success: errors.length === 0,
    errors
  }
}

// Funzione per test automatico all'avvio
export function runRouletteValidation() {
  console.log('🧪 Running Roulette Logic Validation...')

  const validation = validateRouletteLogic()

  if (validation.success) {
    console.log('✅ Roulette logic validation PASSED - All tests OK!')
  } else {
    console.error('❌ Roulette logic validation FAILED:')
    validation.errors.forEach(error => console.error(error))
    console.error('🚨 Fix these issues before continuing!')
  }

  return validation.success
}