/**
 * Static Games Data - No API calls, no loops, just data!
 */

export const STATIC_GAMES = [
  {
    id: { value: 'european_roulette' },
    name: 'european_roulette',
    displayName: 'Roulette Europea',
    category: 'table',
    config: {
      type: 'european',
      numbers: Array.from({length: 37}, (_, i) => i),
      redNumbers: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
      blackNumbers: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
      greenNumbers: [0],
      payouts: {
        straight: 35,
        split: 17,
        street: 11,
        corner: 8,
        line: 5,
        dozen: 2,
        column: 2,
        even: 1,
        red: 1,
        low: 1
      },
      minBet: 1,
      maxBet: 100,
      tableLimits: {
        inside: 100,
        outside: 500
      }
    },
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Helper methods
    getMinBet: () => 1,
    getMaxBet: () => 100,
    isRouletteGame: () => true,
    isBlackjackGame: () => false,
    getRouletteConfig: function() { return this.config },
    getBlackjackConfig: () => null
  }
]

export const STATIC_METHODS = [
  {
    id: { value: 'fibonacci' },
    name: 'fibonacci',
    displayName: 'Fibonacci',
    description: 'Metodo di progressione basato sulla sequenza di Fibonacci',
    explanation: 'Aumenta la puntata seguendo la sequenza di Fibonacci dopo ogni perdita. Su vincita, torna indietro di 2 posizioni nella sequenza.',
    category: 'progressive',
    requiredPackage: 'free',
    configSchema: {
      compatibleGames: ['european_roulette'],
      requiredFields: ['baseBet', 'stopLoss'],
      fields: {
        baseBet: {
          type: 'number',
          label: 'Puntata Base (€)',
          description: 'Importo iniziale della puntata',
          min: 1,
          max: 100,
          default: 1,
          placeholder: '1'
        },
        stopLoss: {
          type: 'number',
          label: 'Stop Loss (€)',
          description: 'Limite massimo di perdita',
          min: 10,
          max: 1000,
          default: 100,
          placeholder: '100'
        }
      }
    },
    defaultConfig: { baseBet: 1, stopLoss: 100 },
    algorithm: 'fibonacci',
    isActive: true,
    sortOrder: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    // Helper methods
    isCompatibleWith: (gameId: string) => gameId === 'european_roulette',
    validateConfig: () => ({ isSuccess: true }),
    getRiskLevel: () => 'high',
    getRecommendedBankroll: (baseBet: number) => baseBet * 50
  }
]