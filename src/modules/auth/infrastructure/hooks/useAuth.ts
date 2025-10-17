/**
 * useAuth Hook - Auth Module Presentation Layer
 *
 * React hook that provides clean access to Auth Module functionality.
 * This hook bridges the React component layer with our Clean Architecture.
 *
 * Following the roadmap's emphasis on proper separation of concerns,
 * this hook encapsulates all authentication business logic.
 */

import { useState, useEffect, useCallback } from 'react'
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs'
import { authServices } from '../di/AuthContainer'
import { User } from '../../domain/entities/User'
import { AuthStatus } from '../../domain/services/AuthService'
import { Result } from '@/shared/domain/types/common'

export interface UseAuthReturn {
  // User state
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean

  // Auth status
  authStatus: AuthStatus | null

  // Actions
  refetch: () => Promise<void>
  signOut: () => Promise<void>

  // Error handling
  error: string | null
  clearError: () => void
}

/**
 * Main authentication hook for the Vantaggio Statistico platform
 *
 * This hook:
 * - Syncs Clerk authentication with our Auth Module
 * - Provides reactive user state
 * - Handles automatic user synchronization
 * - Manages loading and error states
 *
 * @returns UseAuthReturn object with user state and actions
 */
export function useAuth(): UseAuthReturn {
  // Local state
  const [user, setUser] = useState<User | null>(null)
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Clerk hooks
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const { signOut: clerkSignOut } = useClerkAuth()

  // Auth services
  const authService = authServices.getAuthService()

  /**
   * Fetch current user from our Auth Module
   */
  const fetchCurrentUser = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)
      setError(null)

      // Get current user through our Auth Module
      const userResult = await authService.getCurrentUser()

      if (userResult.isSuccess) {
        setUser(userResult.value)
      } else {
        setError(userResult.error.message)
        setUser(null)
      }

      // Get auth status
      const statusResult = await authService.getAuthStatus()
      if (statusResult.isSuccess) {
        setAuthStatus(statusResult.value)
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication error')
      setUser(null)
      setAuthStatus(null)
    } finally {
      setIsLoading(false)
    }
  }, [authService])

  /**
   * Sync Clerk user with our database if needed
   */
  const syncClerkUser = useCallback(async (): Promise<void> => {
    if (!clerkUser) return

    try {
      const clerkUserData = {
        id: clerkUser.id,
        emailAddresses: clerkUser.emailAddresses || [],
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        username: clerkUser.username,
        imageUrl: clerkUser.imageUrl,
        createdAt: clerkUser.createdAt,
        updatedAt: clerkUser.updatedAt
      }

      const syncResult = await authService.syncUserWithDatabase(clerkUserData)

      if (syncResult.isSuccess) {
        setUser(syncResult.value)
      } else {
        console.warn('User sync failed:', syncResult.error)
        // Don't set error for sync failures - user can still continue
      }
    } catch (err) {
      console.warn('User sync error:', err)
      // Don't block user experience for sync issues
    }
  }, [clerkUser, authService])

  /**
   * Sign out function
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true)

      // Sign out through our Auth Module first
      await authService.signOut()

      // Then sign out from Clerk
      await clerkSignOut()

      // Clear local state
      setUser(null)
      setAuthStatus(null)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign out failed')
    } finally {
      setIsLoading(false)
    }
  }, [authService, clerkSignOut])

  /**
   * Clear error state
   */
  const clearError = useCallback((): void => {
    setError(null)
  }, [])

  /**
   * Effect: Handle Clerk user changes
   */
  useEffect(() => {
    if (!clerkLoaded) return

    if (clerkUser) {
      // User is signed in with Clerk, sync and fetch
      syncClerkUser().then(() => {
        fetchCurrentUser()
      })
    } else {
      // User is signed out
      setUser(null)
      setAuthStatus({ isAuthenticated: false, user: null })
      setIsLoading(false)
    }
  }, [clerkUser, clerkLoaded, syncClerkUser, fetchCurrentUser])

  /**
   * Effect: Initial load
   */
  useEffect(() => {
    if (clerkLoaded && !clerkUser) {
      setIsLoading(false)
    }
  }, [clerkLoaded, clerkUser])

  return {
    // State
    user,
    isLoading: isLoading || !clerkLoaded,
    isAuthenticated: !!user && !!clerkUser,
    authStatus,

    // Actions
    refetch: fetchCurrentUser,
    signOut,

    // Error handling
    error,
    clearError
  }
}

/**
 * Hook for checking specific permissions
 *
 * @param permission - Permission to check
 * @returns boolean indicating if user has permission
 */
export function usePermission(permission: string): boolean {
  const { user } = useAuth()

  // TODO: Implement permission checking logic
  // This will integrate with the Permissions Module
  if (!user) return false

  // For now, check basic package permissions
  if (permission === 'access_method_fibonacci') {
    return true // Free tier has access
  }

  if (permission.startsWith('access_method_') && user.packageId === 'premium') {
    return true // Premium has access to all methods
  }

  return false
}

/**
 * Hook for getting user package information
 *
 * @returns User package data and limits
 */
export function useUserPackage() {
  const { user } = useAuth()

  return {
    packageId: user?.packageId || 'free',
    isPremium: user?.packageId === 'premium',
    isFree: user?.packageId === 'free' || !user?.packageId
  }
}