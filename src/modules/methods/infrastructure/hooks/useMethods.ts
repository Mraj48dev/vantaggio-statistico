/**
 * useMethods Hook - Methods Module Infrastructure Layer
 *
 * React hook for accessing betting methods functionality.
 */

'use client'

import { useState, useEffect } from 'react'
import { Method, GetAvailableMethodsResponse, GetMethodDetailsResponse, LossProgression } from '@/modules/methods'

interface UseMethodsOptions {
  userId?: string
  gameTypeId?: string
  activeOnly?: boolean
}

interface UseMethodsReturn {
  methods: Method[]
  loading: boolean
  error: string | null
  userPackage: string
  totalCount: number
  refreshMethods: () => Promise<void>
}

export function useMethods(options: UseMethodsOptions = {}): UseMethodsReturn {
  const [methods, setMethods] = useState<Method[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userPackage, setUserPackage] = useState<string>('free')
  const [totalCount, setTotalCount] = useState(0)
  const [hasAttempted, setHasAttempted] = useState(false)

  const { userId = 'demo-user', gameTypeId, activeOnly = true } = options

  const fetchMethods = async () => {
    // Only attempt once
    if (hasAttempted) return

    setHasAttempted(true)
    setLoading(true)
    setError(null)

    // Check localStorage cache first
    const cacheKey = `methods-${userId}-${gameTypeId}-${activeOnly}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        const cachedData = JSON.parse(cached)
        setMethods(cachedData.methods || [])
        setUserPackage(cachedData.userPackage || 'free')
        setTotalCount(cachedData.totalCount || 0)
        setLoading(false)
        return
      } catch (e) {
        localStorage.removeItem(cacheKey)
      }
    }

    try {
      // Single API attempt with 2 second timeout
      const controller = new AbortController()
      setTimeout(() => controller.abort(), 2000)

      const response = await fetch('/api/methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          gameTypeId,
          activeOnly
        }),
        signal: controller.signal
      })

      if (response.ok) {
        const methodsData = await response.json()

        // Cache successful result
        localStorage.setItem(cacheKey, JSON.stringify(methodsData))

        setMethods(methodsData.methods || [])
        setUserPackage(methodsData.userPackage || 'free')
        setTotalCount(methodsData.totalCount || 0)
        setLoading(false)
        return
      }
    } catch (apiError) {
      console.warn('Methods API failed, using fallback:', apiError)
    }

    // Immediate fallback - no retries
    console.log('Using immediate methods fallback data')
    setMethods([
      {
        id: { value: 'fibonacci' },
        name: 'fibonacci',
        displayName: 'Fibonacci',
        description: 'Metodo di progressione basato sulla sequenza di Fibonacci',
        explanation: 'Aumenta la puntata seguendo la sequenza di Fibonacci dopo ogni perdita.',
        category: 'progressive',
        requiredPackage: 'free',
        configSchema: {
          compatibleGames: ['european_roulette'],
          requiredFields: ['baseBet', 'stopLoss'],
          fields: {
            baseBet: {
              type: 'number',
              label: 'Puntata Base (€)',
              min: 1,
              max: 100,
              default: 1
            },
            stopLoss: {
              type: 'number',
              label: 'Stop Loss (€)',
              min: 10,
              max: 1000,
              default: 100
            }
          }
        },
        defaultConfig: { baseBet: 1, stopLoss: 100 },
        algorithm: 'fibonacci',
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: { value: 'martingale' },
        name: 'martingale',
        displayName: 'Martingale',
        description: 'Metodo di progressione che raddoppia la puntata ad ogni perdita',
        explanation: 'Strategia aggressiva che raddoppia la puntata dopo ogni perdita per recuperare tutte le perdite precedenti.',
        category: 'progressive',
        requiredPackage: 'premium',
        configSchema: {
          compatibleGames: ['european_roulette'],
          requiredFields: ['baseBet', 'stopLoss', 'maxBet'],
          fields: {
            baseBet: {
              type: 'number',
              label: 'Puntata Base (€)',
              min: 1,
              max: 50,
              default: 1
            },
            stopLoss: {
              type: 'number',
              label: 'Stop Loss (€)',
              min: 10,
              max: 1000,
              default: 100
            },
            maxBet: {
              type: 'number',
              label: 'Puntata Massima (€)',
              min: 10,
              max: 500,
              default: 100
            }
          }
        },
        defaultConfig: { baseBet: 1, stopLoss: 100, maxBet: 100 },
        algorithm: 'martingale',
        isActive: true,
        sortOrder: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: { value: 'dalembert' },
        name: 'dalembert',
        displayName: "D'Alembert",
        description: 'Metodo di progressione aritmetica più conservativo',
        explanation: 'Aumenta di 1 unità dopo una perdita e diminuisce di 1 unità dopo una vincita.',
        category: 'progressive',
        requiredPackage: 'premium',
        configSchema: {
          compatibleGames: ['european_roulette'],
          requiredFields: ['baseBet', 'stopLoss', 'unit'],
          fields: {
            baseBet: {
              type: 'number',
              label: 'Puntata Base (€)',
              min: 1,
              max: 100,
              default: 5
            },
            stopLoss: {
              type: 'number',
              label: 'Stop Loss (€)',
              min: 10,
              max: 1000,
              default: 100
            },
            unit: {
              type: 'number',
              label: 'Unità di Progressione (€)',
              min: 1,
              max: 10,
              default: 1
            }
          }
        },
        defaultConfig: { baseBet: 5, stopLoss: 100, unit: 1 },
        algorithm: 'dalembert',
        isActive: true,
        sortOrder: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: { value: 'labouchere' },
        name: 'labouchere',
        displayName: 'Labouchère',
        description: 'Sistema di cancellazione basato su sequenza numerica',
        explanation: 'Usa una sequenza di numeri e cancella quelli agli estremi ad ogni vincita.',
        category: 'progressive',
        requiredPackage: 'premium',
        configSchema: {
          compatibleGames: ['european_roulette'],
          requiredFields: ['sequence', 'stopLoss'],
          fields: {
            sequence: {
              type: 'text',
              label: 'Sequenza Iniziale',
              default: '1,2,3,4'
            },
            stopLoss: {
              type: 'number',
              label: 'Stop Loss (€)',
              min: 10,
              max: 1000,
              default: 100
            }
          }
        },
        defaultConfig: { sequence: '1,2,3,4', stopLoss: 100 },
        algorithm: 'labouchere',
        isActive: true,
        sortOrder: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: { value: 'paroli' },
        name: 'paroli',
        displayName: 'Paroli',
        description: 'Sistema di progressione positiva',
        explanation: 'Raddoppia la puntata dopo ogni vincita per un numero limitato di volte.',
        category: 'positive',
        requiredPackage: 'premium',
        configSchema: {
          compatibleGames: ['european_roulette'],
          requiredFields: ['baseBet', 'maxWins', 'stopLoss'],
          fields: {
            baseBet: {
              type: 'number',
              label: 'Puntata Base (€)',
              min: 1,
              max: 100,
              default: 5
            },
            maxWins: {
              type: 'number',
              label: 'Massimo Vittorie Consecutive',
              min: 2,
              max: 5,
              default: 3
            },
            stopLoss: {
              type: 'number',
              label: 'Stop Loss (€)',
              min: 10,
              max: 1000,
              default: 100
            }
          }
        },
        defaultConfig: { baseBet: 5, maxWins: 3, stopLoss: 100 },
        algorithm: 'paroli',
        isActive: true,
        sortOrder: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: { value: 'fibonacci_advanced' },
        name: 'fibonacci_advanced',
        displayName: 'Fibonacci Avanzato',
        description: 'Versione avanzata del Fibonacci con step personalizzabile',
        explanation: 'Come il Fibonacci classico ma con possibilità di saltare step nella sequenza per gestione rischio.',
        category: 'progressive',
        requiredPackage: 'premium',
        configSchema: {
          compatibleGames: ['european_roulette'],
          requiredFields: ['baseBet', 'stopLoss', 'stepMultiplier'],
          fields: {
            baseBet: {
              type: 'number',
              label: 'Puntata Base (€)',
              min: 1,
              max: 100,
              default: 1
            },
            stopLoss: {
              type: 'number',
              label: 'Stop Loss (€)',
              min: 10,
              max: 1000,
              default: 100
            },
            stepMultiplier: {
              type: 'number',
              label: 'Moltiplicatore Step',
              min: 1,
              max: 3,
              default: 1
            }
          }
        },
        defaultConfig: { baseBet: 1, stopLoss: 100, stepMultiplier: 1 },
        algorithm: 'fibonacci_advanced',
        isActive: true,
        sortOrder: 6,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: { value: 'fibonacci_reverse' },
        name: 'fibonacci_reverse',
        displayName: 'Fibonacci Inverso',
        description: 'Fibonacci con progressione inversa sulle vincite',
        explanation: 'Aumenta la puntata seguendo Fibonacci dopo una vincita invece che dopo una perdita.',
        category: 'positive',
        requiredPackage: 'premium',
        configSchema: {
          compatibleGames: ['european_roulette'],
          requiredFields: ['baseBet', 'stopWin', 'maxSequence'],
          fields: {
            baseBet: {
              type: 'number',
              label: 'Puntata Base (€)',
              min: 1,
              max: 100,
              default: 1
            },
            stopWin: {
              type: 'number',
              label: 'Stop Win (€)',
              min: 10,
              max: 1000,
              default: 50
            },
            maxSequence: {
              type: 'number',
              label: 'Lunghezza Max Sequenza',
              min: 5,
              max: 20,
              default: 10
            }
          }
        },
        defaultConfig: { baseBet: 1, stopWin: 50, maxSequence: 10 },
        algorithm: 'fibonacci_reverse',
        isActive: true,
        sortOrder: 7,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ] as any)
    setUserPackage('free')
    setTotalCount(7)
    setLoading(false)
    setError(null)
  }

  useEffect(() => {
    fetchMethods()
  }, []) // EMPTY DEPENDENCIES - only run once on mount

  const refreshMethods = async () => {
    await fetchMethods()
  }

  return {
    methods,
    loading,
    error,
    userPackage,
    totalCount,
    refreshMethods
  }
}

interface UseMethodDetailsOptions {
  methodId: string | null
  baseBet?: number
  includeProgression?: boolean
  progressionSteps?: number
}

interface UseMethodDetailsReturn {
  method: Method | null
  lossProgression: LossProgression[]
  recommendedBankroll: number | null
  isAvailable: boolean
  compatibleGames: string[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

export function useMethodDetails(options: UseMethodDetailsOptions): UseMethodDetailsReturn {
  const [method, setMethod] = useState<Method | null>(null)
  const [lossProgression, setLossProgression] = useState<LossProgression[]>([])
  const [recommendedBankroll, setRecommendedBankroll] = useState<number | null>(null)
  const [isAvailable, setIsAvailable] = useState(false)
  const [compatibleGames, setCompatibleGames] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { methodId, baseBet = 10, includeProgression = true, progressionSteps = 10 } = options

  const fetchMethodDetails = async () => {
    if (!methodId) {
      setMethod(null)
      setLossProgression([])
      setRecommendedBankroll(null)
      setIsAvailable(false)
      setCompatibleGames([])
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/methods/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          methodId,
          baseBet,
          includeProgression,
          progressionSteps
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: GetMethodDetailsResponse = await response.json()

      setMethod(data.method)
      setLossProgression(data.lossProgression || [])
      setRecommendedBankroll(data.recommendedBankroll || null)
      setIsAvailable(data.isAvailable)
      setCompatibleGames(data.compatibleGames)
    } catch (err) {
      console.error('Failed to fetch method details:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch method details')

      // Reset state on error
      setMethod(null)
      setLossProgression([])
      setRecommendedBankroll(null)
      setIsAvailable(false)
      setCompatibleGames([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMethodDetails()
  }, [methodId, baseBet, includeProgression, progressionSteps])

  const refresh = async () => {
    await fetchMethodDetails()
  }

  return {
    method,
    lossProgression,
    recommendedBankroll,
    isAvailable,
    compatibleGames,
    loading,
    error,
    refresh
  }
}