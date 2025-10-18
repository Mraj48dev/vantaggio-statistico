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

  const { userId = 'demo-user', gameTypeId, activeOnly = true } = options

  const fetchMethods = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          gameTypeId,
          activeOnly
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: GetAvailableMethodsResponse = await response.json()

      setMethods(data.methods)
      setUserPackage(data.userPackage)
      setTotalCount(data.totalCount)
    } catch (err) {
      console.error('Failed to fetch methods:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch methods')

      // Fallback to empty state
      setMethods([])
      setUserPackage('free')
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMethods()
  }, [userId, gameTypeId, activeOnly])

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