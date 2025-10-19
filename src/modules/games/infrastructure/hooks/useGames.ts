/**
 * Games Module React Hooks - Infrastructure Layer
 *
 * React hooks that provide easy access to games functionality
 * with proper error handling and loading states.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Result } from '@/shared/domain/types/common'

// Domain & Application imports
import { GameType, GameCategory } from '../../domain/entities/GameType'
import { BetInput, SpinResult } from '../../domain/services/RouletteGameEngine'
import {
  GetGameTypesUseCaseInput,
  GetGameTypesUseCaseOutput,
  GetGameTypesUseCaseError
} from '../../application/use-cases/GetGameTypesUseCase'
import {
  PlayRouletteUseCaseInput,
  PlayRouletteUseCaseOutput,
  PlayRouletteUseCaseError
} from '../../application/use-cases/PlayRouletteUseCase'

// Infrastructure
import { GamesContainer } from '../di/GamesContainer'

// Hook return types
interface UseGamesState {
  gameTypes: GameType[]
  loading: boolean
  error: string | null
}

interface UseRouletteState {
  playing: boolean
  lastResult: SpinResult | null
  error: string | null
}

/**
 * Hook for managing game types
 */
export function useGames(input: GetGameTypesUseCaseInput = {}) {
  const [state, setState] = useState<UseGamesState>({
    gameTypes: [],
    loading: true,
    error: null
  })
  const [retryCount, setRetryCount] = useState(0)
  const [circuitBreakerOpen, setCircuitBreakerOpen] = useState(false)

  const MAX_RETRIES = 1 // Solo 1 retry, poi fallback immediato
  const CIRCUIT_BREAKER_TIMEOUT = 30000 // 30 secondi prima di riprovare

  const loadGameTypes = useCallback(async () => {
    // Circuit breaker: se aperto, usa subito fallback
    if (circuitBreakerOpen) {
      console.log('Circuit breaker open, using immediate fallback')
      setState({
        gameTypes: [{
          id: { value: 'european_roulette' },
          name: 'european_roulette',
          displayName: 'Roulette Europea (Fallback)',
          category: 'table',
          config: { type: 'european', minBet: 1, maxBet: 100 },
          isActive: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          getMinBet: () => 1,
          getMaxBet: () => 100,
          isRouletteGame: () => true,
          isBlackjackGame: () => false,
          getRouletteConfig: () => ({ type: 'european', minBet: 1, maxBet: 100 }),
          getBlackjackConfig: () => null
        }] as any,
        loading: false,
        error: null
      })
      return
    }

    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // First try API, if fails use static fallback
      let gameTypes: any[] = []

      try {
        // Build query parameters
        const params = new URLSearchParams()
        if (input.activeOnly) params.append('activeOnly', 'true')
        if (input.category) params.append('category', input.category)

        // Call API endpoint with timeout
        const controller = new AbortController()
        setTimeout(() => controller.abort(), 3000) // Ridotto a 3 secondi

        const response = await fetch(`/api/games?${params.toString()}`, {
          signal: controller.signal,
          // Aggiungi cache-control per evitare richieste multiple
          cache: 'force-cache'
        })
        const data = await response.json()

        if (response.ok && data.success) {
          gameTypes = data.data.gameTypes
          // Reset retry count on success
          setRetryCount(0)
        } else {
          throw new Error('API failed, using fallback')
        }
      } catch (apiError) {
        console.warn('Games API failed, using static fallback:', apiError)

        // Increment retry count
        const newRetryCount = retryCount + 1
        setRetryCount(newRetryCount)

        // Se troppi errori, apri circuit breaker
        if (newRetryCount >= MAX_RETRIES) {
          console.warn('Max retries reached, opening circuit breaker')
          setCircuitBreakerOpen(true)
          // Chiudi circuit breaker dopo timeout
          setTimeout(() => {
            setCircuitBreakerOpen(false)
            setRetryCount(0)
          }, CIRCUIT_BREAKER_TIMEOUT)
        }

        // Static fallback data
        gameTypes = [{
          id: 'european_roulette',
          name: 'european_roulette',
          displayName: 'Roulette Europea',
          category: 'table',
          config: {
            type: 'european',
            numbers: Array.from({length: 37}, (_, i) => i),
            minBet: 1,
            maxBet: 100,
            payouts: { straight: 35, column: 2 }
          },
          isActive: true,
          sortOrder: 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          minBet: 1,
          maxBet: 100,
          isRouletteGame: true,
          isBlackjackGame: false
        }]
      }

      // Convert to domain objects
      const domainGameTypes = gameTypes.map((gt: any) => ({
        id: { value: gt.id },
        name: gt.name,
        displayName: gt.displayName,
        category: gt.category,
        config: gt.config,
        isActive: gt.isActive,
        sortOrder: gt.sortOrder,
        createdAt: new Date(gt.createdAt),
        updatedAt: new Date(gt.updatedAt),
        // Add helper methods
        getMinBet: () => gt.minBet || 1,
        getMaxBet: () => gt.maxBet || 100,
        isRouletteGame: () => gt.isRouletteGame || gt.category === 'table',
        isBlackjackGame: () => gt.isBlackjackGame || false,
        getRouletteConfig: () => gt.isRouletteGame ? gt.config : null,
        getBlackjackConfig: () => gt.isBlackjackGame ? gt.config : null
      }))

      setState({
        gameTypes: domainGameTypes,
        loading: false,
        error: null
      })
    } catch (error) {
      // Final fallback
      setState({
        gameTypes: [{
          id: { value: 'european_roulette' },
          name: 'european_roulette',
          displayName: 'Roulette Europea (Fallback)',
          category: 'table',
          config: { type: 'european', minBet: 1, maxBet: 100 },
          isActive: true,
          sortOrder: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
          getMinBet: () => 1,
          getMaxBet: () => 100,
          isRouletteGame: () => true,
          isBlackjackGame: () => false,
          getRouletteConfig: () => ({ type: 'european', minBet: 1, maxBet: 100 }),
          getBlackjackConfig: () => null
        }] as any,
        loading: false,
        error: null // Don't show error, just use fallback
      })
    }
  }, [input, retryCount]) // Solo aggiungi retryCount come dipendenza

  useEffect(() => {
    // Solo esegui se non abbiamo già dati o se è la prima chiamata
    if (state.gameTypes.length === 0 && !circuitBreakerOpen) {
      loadGameTypes()
    }
  }, [loadGameTypes, state.gameTypes.length, circuitBreakerOpen])

  return {
    ...state,
    refetch: loadGameTypes
  }
}

/**
 * Hook for roulette gameplay
 */
export function useRoulette() {
  const [state, setState] = useState<UseRouletteState>({
    playing: false,
    lastResult: null,
    error: null
  })

  const playRoulette = useCallback(async (input: PlayRouletteUseCaseInput): Promise<Result<PlayRouletteUseCaseOutput, PlayRouletteUseCaseError>> => {
    setState(prev => ({ ...prev, playing: true, error: null }))

    try {
      // For now, this still needs server-side implementation
      // TODO: Create /api/games/play endpoint for roulette gameplay
      const errorMessage = 'Roulette play endpoint not implemented yet. Use /test-games page instead.'
      setState({
        playing: false,
        lastResult: null,
        error: errorMessage
      })

      return Result.failure({
        message: errorMessage,
        code: 'NOT_IMPLEMENTED'
      } as PlayRouletteUseCaseError)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setState({
        playing: false,
        lastResult: null,
        error: errorMessage
      })

      return Result.failure({
        message: errorMessage,
        code: 'UNKNOWN_ERROR'
      } as PlayRouletteUseCaseError)
    }
  }, [])

  const clearResult = useCallback(() => {
    setState(prev => ({ ...prev, lastResult: null, error: null }))
  }, [])

  return {
    ...state,
    playRoulette,
    clearResult
  }
}

/**
 * Hook for getting a specific game type
 */
export function useGameType(gameTypeId: string) {
  const [gameType, setGameType] = useState<GameType | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadGameType = async () => {
      setLoading(true)
      setError(null)

      try {
        // For single game type, fetch all and filter
        // TODO: Create dedicated /api/games/{id} endpoint
        const response = await fetch('/api/games?activeOnly=false')
        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Failed to fetch game type')
        }

        const foundGameType = data.data.gameTypes.find((gt: any) => gt.id === gameTypeId)
        if (foundGameType) {
          // Convert to domain-like object
          const gameType = {
            id: { value: foundGameType.id },
            name: foundGameType.name,
            displayName: foundGameType.displayName,
            category: foundGameType.category,
            config: foundGameType.config,
            isActive: foundGameType.isActive,
            sortOrder: foundGameType.sortOrder,
            createdAt: new Date(foundGameType.createdAt),
            updatedAt: new Date(foundGameType.updatedAt),
            getMinBet: () => foundGameType.minBet,
            getMaxBet: () => foundGameType.maxBet,
            isRouletteGame: () => foundGameType.isRouletteGame,
            isBlackjackGame: () => foundGameType.isBlackjackGame
          }
          setGameType(gameType as any)
        } else {
          setError('Game type not found')
        }
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Unknown error occurred')
      } finally {
        setLoading(false)
      }
    }

    if (gameTypeId) {
      loadGameType()
    }
  }, [gameTypeId])

  return {
    gameType,
    loading,
    error
  }
}

/**
 * Hook for filtering games by category
 */
export function useGamesByCategory(category?: GameCategory) {
  return useGames({
    category,
    activeOnly: true
  })
}

/**
 * Hook for getting active roulette games only
 */
export function useRouletteGames() {
  return useGames({
    category: GameCategory.TABLE,
    activeOnly: true
  })
}