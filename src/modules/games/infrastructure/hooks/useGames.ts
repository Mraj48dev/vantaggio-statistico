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

  const loadGameTypes = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    try {
      // Create container with new PrismaClient instance
      // In a real app, this should be managed by a global container
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      const container = GamesContainer.getInstance(prisma)
      const useCase = container.getGameTypesUseCase
      const result = await useCase.execute(input)

      if (result.isSuccess) {
        setState({
          gameTypes: result.value.gameTypes as GameType[],
          loading: false,
          error: null
        })
      } else {
        setState({
          gameTypes: [],
          loading: false,
          error: result.error.message
        })
      }
    } catch (error) {
      setState({
        gameTypes: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    }
  }, [input])

  useEffect(() => {
    loadGameTypes()
  }, [loadGameTypes])

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
      // Create container with new PrismaClient instance
      // In a real app, this should be managed by a global container
      const { PrismaClient } = await import('@prisma/client')
      const prisma = new PrismaClient()

      const container = GamesContainer.getInstance(prisma)
      const useCase = container.playRouletteUseCase
      const result = await useCase.execute(input)

      if (result.isSuccess) {
        setState({
          playing: false,
          lastResult: result.value.spinResult,
          error: null
        })
      } else {
        setState({
          playing: false,
          lastResult: null,
          error: result.error.message
        })
      }

      return result
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
        // Create container with new PrismaClient instance
        // In a real app, this should be managed by a global container
        const { PrismaClient } = await import('@prisma/client')
        const prisma = new PrismaClient()

        const container = GamesContainer.getInstance(prisma)
        const repository = container.gameTypeRepository
        const result = await repository.findById({ value: gameTypeId })

        if (result.isSuccess) {
          setGameType(result.value)
        } else {
          setError(result.error.message)
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