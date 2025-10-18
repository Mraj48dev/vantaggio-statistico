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
    displayName: 'Fibonacci Base',
    description: 'Metodo di progressione Fibonacci con reset su vincita',
    explanation: 'Aumenta la puntata seguendo la sequenza di Fibonacci dopo ogni perdita. Su vincita, reset completo alla puntata base.',
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
  },
  {
    id: { value: 'fibonacci_advanced' },
    name: 'fibonacci_advanced',
    displayName: 'Fibonacci Avanzato',
    description: 'Sistema Fibonacci con scelta personalizzabile tra colonne e dozzine',
    explanation: 'Versione avanzata del Fibonacci che permette di scegliere tra diverse opzioni di puntata: colonne (1ª, 2ª, 3ª) o dozzine (1-12, 13-24, 25-36). Mantiene la stessa progressione Fibonacci ma con maggiore flessibilità strategica.',
    category: 'progressive',
    requiredPackage: 'premium',
    configSchema: {
      compatibleGames: ['european_roulette'],
      requiredFields: ['baseBet', 'stopLoss', 'betTarget'],
      fields: {
        baseBet: {
          type: 'number',
          label: 'Puntata Base (€)',
          description: 'Importo della puntata base',
          min: 1,
          max: 1000,
          default: 10,
          placeholder: '10'
        },
        stopLoss: {
          type: 'number',
          label: 'Stop Loss (€)',
          description: 'Perdita massima accettabile',
          min: 10,
          max: 10000,
          default: 100,
          placeholder: '100'
        },
        betTarget: {
          type: 'select',
          label: 'Target di Puntata',
          description: 'Scegli dove puntare',
          options: [
            { value: 'column_1', label: '1ª Colonna (1,4,7,10,13,16,19,22,25,28,31,34)' },
            { value: 'column_2', label: '2ª Colonna (2,5,8,11,14,17,20,23,26,29,32,35)' },
            { value: 'column_3', label: '3ª Colonna (3,6,9,12,15,18,21,24,27,30,33,36)' },
            { value: 'dozen_1', label: '1ª Dozzina (1-12)' },
            { value: 'dozen_2', label: '2ª Dozzina (13-24)' },
            { value: 'dozen_3', label: '3ª Dozzina (25-36)' }
          ],
          default: 'column_1'
        }
      }
    },
    defaultConfig: { baseBet: 10, stopLoss: 100, betTarget: 'column_1' },
    algorithm: 'fibonacci_advanced',
    isActive: true,
    sortOrder: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    isCompatibleWith: (gameId: string) => gameId === 'european_roulette',
    validateConfig: () => ({ isSuccess: true }),
    getRiskLevel: () => 'high',
    getRecommendedBankroll: (baseBet: number) => baseBet * 50
  },
  {
    id: { value: 'fibonacci_inverse' },
    name: 'fibonacci_inverse',
    displayName: 'Fibonacci Inverso',
    description: 'Fibonacci modificato che scende sempre di 2 posizioni dopo ogni vincita',
    explanation: 'Versione più conservativa del Fibonacci dove ogni vincita fa retrocedere di ESATTAMENTE 2 posizioni nella sequenza, riducendo l\'esposizione al rischio e mantenendo le puntate più basse più a lungo.',
    category: 'progressive',
    requiredPackage: 'premium',
    configSchema: {
      compatibleGames: ['european_roulette'],
      requiredFields: ['baseBet', 'stopLoss', 'betTarget'],
      fields: {
        baseBet: {
          type: 'number',
          label: 'Puntata Base (€)',
          description: 'Importo della puntata base',
          min: 1,
          max: 1000,
          default: 10,
          placeholder: '10'
        },
        stopLoss: {
          type: 'number',
          label: 'Stop Loss (€)',
          description: 'Perdita massima accettabile',
          min: 10,
          max: 10000,
          default: 100,
          placeholder: '100'
        },
        betTarget: {
          type: 'select',
          label: 'Target di Puntata',
          description: 'Scegli dove puntare',
          options: [
            { value: 'column_1', label: '1ª Colonna' },
            { value: 'column_2', label: '2ª Colonna' },
            { value: 'column_3', label: '3ª Colonna' },
            { value: 'dozen_1', label: '1ª Dozzina (1-12)' },
            { value: 'dozen_2', label: '2ª Dozzina (13-24)' },
            { value: 'dozen_3', label: '3ª Dozzina (25-36)' }
          ],
          default: 'column_1'
        }
      }
    },
    defaultConfig: { baseBet: 10, stopLoss: 100, betTarget: 'column_1' },
    algorithm: 'fibonacci_inverse',
    isActive: true,
    sortOrder: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
    isCompatibleWith: (gameId: string) => gameId === 'european_roulette',
    validateConfig: () => ({ isSuccess: true }),
    getRiskLevel: () => 'medium',
    getRecommendedBankroll: (baseBet: number) => baseBet * 40
  },
  {
    id: { value: 'martingale' },
    name: 'martingale',
    displayName: 'Martingale',
    description: 'Sistema classico aggressivo: raddoppia su perdita, torna alla base su vincita',
    explanation: 'Il sistema più famoso e aggressivo del casino. Raddoppi la puntata dopo ogni perdita fino a vincere. Una singola vincita recupera tutte le perdite precedenti. ATTENZIONE: Richiede bankroll molto elevato e ha rischi enormi.',
    category: 'progressive',
    requiredPackage: 'premium',
    configSchema: {
      compatibleGames: ['european_roulette'],
      requiredFields: ['baseBet', 'stopLoss', 'betTarget', 'maxDoubleCount'],
      fields: {
        baseBet: {
          type: 'number',
          label: 'Puntata Base (€)',
          description: 'Importo della puntata base',
          min: 1,
          max: 1000,
          default: 10,
          placeholder: '10'
        },
        stopLoss: {
          type: 'number',
          label: 'Stop Loss (€)',
          description: 'Perdita massima accettabile',
          min: 50,
          max: 50000,
          default: 500,
          placeholder: '500'
        },
        betTarget: {
          type: 'select',
          label: 'Tipo di Puntata',
          description: 'Puntata even-money (50/50)',
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
          description: 'Numero massimo di raddoppi consecutivi',
          min: 3,
          max: 12,
          default: 8,
          placeholder: '8'
        }
      }
    },
    defaultConfig: { baseBet: 10, stopLoss: 500, betTarget: 'red', maxDoubleCount: 8 },
    algorithm: 'martingale',
    isActive: true,
    sortOrder: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
    isCompatibleWith: (gameId: string) => gameId === 'european_roulette',
    validateConfig: () => ({ isSuccess: true }),
    getRiskLevel: () => 'extreme',
    getRecommendedBankroll: (baseBet: number) => baseBet * 500
  },
  {
    id: { value: 'paroli' },
    name: 'paroli',
    displayName: 'Paroli',
    description: 'Progressione positiva che cavalca le serie vincenti',
    explanation: 'Sistema opposto al Martingale: aumenti le puntate SOLO quando vinci. Raddoppi su vincita fino a raggiungere un target, poi reset. Rischio limitato e sfrutta i momenti fortunati.',
    category: 'progressive',
    requiredPackage: 'premium',
    configSchema: {
      compatibleGames: ['european_roulette'],
      requiredFields: ['baseBet', 'stopLoss', 'betTarget', 'targetWins'],
      fields: {
        baseBet: {
          type: 'number',
          label: 'Puntata Base (€)',
          description: 'Importo della puntata base',
          min: 1,
          max: 1000,
          default: 10,
          placeholder: '10'
        },
        stopLoss: {
          type: 'number',
          label: 'Stop Loss (€)',
          description: 'Perdita massima accettabile',
          min: 20,
          max: 10000,
          default: 200,
          placeholder: '200'
        },
        betTarget: {
          type: 'select',
          label: 'Tipo di Puntata',
          description: 'Puntata even-money (50/50)',
          options: [
            { value: 'red', label: 'Rosso' },
            { value: 'black', label: 'Nero' },
            { value: 'even', label: 'Pari' },
            { value: 'odd', label: 'Dispari' },
            { value: 'high', label: 'Alto 19-36' },
            { value: 'low', label: 'Basso 1-18' }
          ],
          default: 'red'
        },
        targetWins: {
          type: 'number',
          label: 'Vincite Consecutive Target',
          description: 'Quante vincite prima di resettare',
          min: 2,
          max: 6,
          default: 3,
          placeholder: '3'
        }
      }
    },
    defaultConfig: { baseBet: 10, stopLoss: 200, betTarget: 'red', targetWins: 3 },
    algorithm: 'paroli',
    isActive: true,
    sortOrder: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
    isCompatibleWith: (gameId: string) => gameId === 'european_roulette',
    validateConfig: () => ({ isSuccess: true }),
    getRiskLevel: () => 'low',
    getRecommendedBankroll: (baseBet: number) => baseBet * 30
  },
  {
    id: { value: 'dalembert' },
    name: 'dalembert',
    displayName: 'D\'Alembert',
    description: 'Sistema equilibrato: +1 unità su perdita, -1 unità su vincita',
    explanation: 'Sistema basato sulla teoria dell\'equilibrio. Aumenti di 1 unità quando perdi, diminuisci di 1 quando vinci. Progressione molto più dolce del Martingale con rischi controllati.',
    category: 'progressive',
    requiredPackage: 'premium',
    configSchema: {
      compatibleGames: ['european_roulette'],
      requiredFields: ['baseBet', 'stopLoss', 'betTarget', 'unitSize', 'maxUnits'],
      fields: {
        baseBet: {
          type: 'number',
          label: 'Puntata Base (€)',
          description: 'Importo della puntata base (1 unità)',
          min: 1,
          max: 1000,
          default: 10,
          placeholder: '10'
        },
        stopLoss: {
          type: 'number',
          label: 'Stop Loss (€)',
          description: 'Perdita massima accettabile',
          min: 50,
          max: 10000,
          default: 300,
          placeholder: '300'
        },
        betTarget: {
          type: 'select',
          label: 'Tipo di Puntata',
          description: 'Puntata even-money (50/50)',
          options: [
            { value: 'red', label: 'Rosso' },
            { value: 'black', label: 'Nero' },
            { value: 'even', label: 'Pari' },
            { value: 'odd', label: 'Dispari' },
            { value: 'high', label: 'Alto 19-36' },
            { value: 'low', label: 'Basso 1-18' }
          ],
          default: 'red'
        },
        unitSize: {
          type: 'number',
          label: 'Dimensione Unità (€)',
          description: 'Importo aggiunto/sottratto per unità',
          min: 1,
          max: 50,
          default: 5,
          placeholder: '5'
        },
        maxUnits: {
          type: 'number',
          label: 'Massimo Unità',
          description: 'Numero massimo di unità',
          min: 5,
          max: 15,
          default: 10,
          placeholder: '10'
        }
      }
    },
    defaultConfig: { baseBet: 10, stopLoss: 300, betTarget: 'red', unitSize: 5, maxUnits: 10 },
    algorithm: 'dalembert',
    isActive: true,
    sortOrder: 6,
    createdAt: new Date(),
    updatedAt: new Date(),
    isCompatibleWith: (gameId: string) => gameId === 'european_roulette',
    validateConfig: () => ({ isSuccess: true }),
    getRiskLevel: () => 'medium',
    getRecommendedBankroll: (baseBet: number) => baseBet * 60
  },
  {
    id: { value: 'labouchere' },
    name: 'labouchere',
    displayName: 'Labouchere',
    description: 'Sistema di cancellazione avanzato con lista numeri personalizzabile',
    explanation: 'Sistema sofisticato: crei una lista di numeri, punti primo+ultimo. Su vincita cancelli primo e ultimo, su perdita aggiungi la puntata persa. Obiettivo di profitto definito matematicamente.',
    category: 'progressive',
    requiredPackage: 'premium',
    configSchema: {
      compatibleGames: ['european_roulette'],
      requiredFields: ['baseBet', 'stopLoss', 'betTarget', 'initialSequence', 'maxSequenceLength'],
      fields: {
        baseBet: {
          type: 'number',
          label: 'Puntata Base (€)',
          description: 'Valore di 1 unità',
          min: 1,
          max: 100,
          default: 10,
          placeholder: '10'
        },
        stopLoss: {
          type: 'number',
          label: 'Stop Loss (€)',
          description: 'Perdita massima accettabile',
          min: 100,
          max: 10000,
          default: 500,
          placeholder: '500'
        },
        betTarget: {
          type: 'select',
          label: 'Tipo di Puntata',
          description: 'Puntata even-money (50/50)',
          options: [
            { value: 'red', label: 'Rosso' },
            { value: 'black', label: 'Nero' },
            { value: 'even', label: 'Pari' },
            { value: 'odd', label: 'Dispari' },
            { value: 'high', label: 'Alto 19-36' },
            { value: 'low', label: 'Basso 1-18' }
          ],
          default: 'red'
        },
        initialSequence: {
          type: 'text',
          label: 'Sequenza Iniziale',
          description: 'Lista numeri separati da virgola (es: 1,2,3)',
          default: '1,2,3',
          placeholder: '1,2,3'
        },
        maxSequenceLength: {
          type: 'number',
          label: 'Lunghezza Max Sequenza',
          description: 'Protezione: ferma se supera questo limite',
          min: 10,
          max: 30,
          default: 20,
          placeholder: '20'
        }
      }
    },
    defaultConfig: { baseBet: 10, stopLoss: 500, betTarget: 'red', initialSequence: '1,2,3', maxSequenceLength: 20 },
    algorithm: 'labouchere',
    isActive: true,
    sortOrder: 7,
    createdAt: new Date(),
    updatedAt: new Date(),
    isCompatibleWith: (gameId: string) => gameId === 'european_roulette',
    validateConfig: () => ({ isSuccess: true }),
    getRiskLevel: () => 'high',
    getRecommendedBankroll: (baseBet: number) => baseBet * 100
  },
  {
    id: { value: 'james_bond' },
    name: 'james_bond',
    displayName: 'James Bond',
    description: 'Strategia leggendaria di 007: puntate multiple con 67.6% di copertura',
    explanation: 'La strategia preferita di James Bond: €140 su High (19-36), €50 su Six Line (13-18), €10 su Zero. Copre 25 numeri su 37 con alta probabilità di vincita ma puntate elevate.',
    category: 'flat',
    requiredPackage: 'premium',
    configSchema: {
      compatibleGames: ['european_roulette'],
      requiredFields: ['unitSize', 'stopLoss', 'maxSpins'],
      fields: {
        unitSize: {
          type: 'number',
          label: 'Dimensione Unità',
          description: 'Moltiplicatore (1.0 = €200 totali)',
          min: 0.1,
          max: 5,
          step: 0.1,
          default: 0.5,
          placeholder: '0.5'
        },
        stopLoss: {
          type: 'number',
          label: 'Stop Loss (€)',
          description: 'Perdita massima accettabile',
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
    },
    defaultConfig: { unitSize: 0.5, stopLoss: 1000, maxSpins: 50 },
    algorithm: 'james_bond',
    isActive: true,
    sortOrder: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
    isCompatibleWith: (gameId: string) => gameId === 'european_roulette',
    validateConfig: () => ({ isSuccess: true }),
    getRiskLevel: () => 'high',
    getRecommendedBankroll: (unitSize: number) => 200 * unitSize * 10
  }
]