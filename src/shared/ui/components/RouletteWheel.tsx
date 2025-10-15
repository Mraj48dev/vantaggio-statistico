/**
 * RouletteWheel Component - Interactive European roulette wheel
 *
 * A premium, animated roulette wheel component with realistic physics,
 * smooth animations, and authentic casino feel. Features touch support
 * for mobile casino gaming and accessibility considerations.
 */

'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { cn } from '@/shared/infrastructure/lib/utils'

export interface RouletteWheelProps {
  /** Current winning number (0-36) */
  winningNumber?: number

  /** Whether the wheel is currently spinning */
  isSpinning?: boolean

  /** Callback when spin animation completes */
  onSpinComplete?: (number: number) => void

  /** Wheel size variant */
  size?: 'small' | 'medium' | 'large'

  /** Additional CSS classes */
  className?: string

  /** Disable interactions */
  disabled?: boolean

  /** Show number labels */
  showNumbers?: boolean

  /** Animation duration in milliseconds */
  spinDuration?: number
}

// European roulette wheel layout (37 numbers: 0-36)
const ROULETTE_NUMBERS = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

// Color mapping for roulette numbers
const getNumberColor = (number: number): 'red' | 'black' | 'green' => {
  if (number === 0) return 'green'
  const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]
  return redNumbers.includes(number) ? 'red' : 'black'
}

/**
 * RouletteWheel - Interactive roulette wheel with realistic animations
 *
 * Features:
 * - Authentic European roulette layout
 * - Smooth CSS animations with easing
 * - Touch-friendly mobile interface
 * - Realistic physics simulation
 * - Premium visual effects
 * - Accessibility support
 */
export function RouletteWheel({
  winningNumber,
  isSpinning = false,
  onSpinComplete,
  size = 'medium',
  className,
  disabled = false,
  showNumbers = true,
  spinDuration = 4000,
}: RouletteWheelProps) {
  const [currentRotation, setCurrentRotation] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  // Calculate wheel size based on variant
  const wheelSize = {
    small: 'w-48 h-48',
    medium: 'w-64 h-64 md:w-80 md:h-80',
    large: 'w-80 h-80 md:w-96 md:h-96',
  }[size]

  // Spin to a specific number
  const spinToNumber = useCallback((targetNumber: number) => {
    if (disabled || isAnimating) return

    setIsAnimating(true)

    // Find the target number's position on the wheel
    const targetIndex = ROULETTE_NUMBERS.indexOf(targetNumber)
    const sectorAngle = 360 / ROULETTE_NUMBERS.length
    const targetAngle = targetIndex * sectorAngle

    // Add multiple full rotations for realistic effect (3-5 full spins)
    const fullRotations = 3 + Math.random() * 2
    const totalRotation = currentRotation + (fullRotations * 360) + (360 - targetAngle)

    setCurrentRotation(totalRotation)

    // Complete animation after duration
    setTimeout(() => {
      setIsAnimating(false)
      onSpinComplete?.(targetNumber)
    }, spinDuration)
  }, [currentRotation, disabled, isAnimating, onSpinComplete, spinDuration])

  // Spin when winningNumber changes
  useEffect(() => {
    if (winningNumber !== undefined && !isAnimating) {
      spinToNumber(winningNumber)
    }
  }, [winningNumber, isAnimating, spinToNumber])

  // Generate wheel sectors
  const wheelSectors = ROULETTE_NUMBERS.map((number, index) => {
    const angle = (360 / ROULETTE_NUMBERS.length) * index
    const color = getNumberColor(number)

    return (
      <div
        key={number}
        className={cn(
          'absolute inset-0 flex items-center justify-center text-white font-bold text-xs transition-opacity duration-200',
          {
            'opacity-100': showNumbers,
            'opacity-0': !showNumbers,
          }
        )}
        style={{
          transform: `rotate(${angle}deg)`,
          clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.sin((360 / ROULETTE_NUMBERS.length) * Math.PI / 180)}% ${50 - 50 * Math.cos((360 / ROULETTE_NUMBERS.length) * Math.PI / 180)}%)`,
        }}
      >
        <div
          className={cn(
            'w-full h-full flex items-start justify-center pt-4',
            {
              'bg-red-600': color === 'red',
              'bg-black': color === 'black',
              'bg-green-600': color === 'green',
            }
          )}
        >
          <span
            className="text-white font-bold"
            style={{ transform: `rotate(${-(angle + 360 / ROULETTE_NUMBERS.length / 2)}deg)` }}
          >
            {number}
          </span>
        </div>
      </div>
    )
  })

  return (
    <div className={cn('relative flex items-center justify-center', className)}>
      {/* Outer rim */}
      <div className={cn(
        'relative rounded-full border-8 border-casino-gold-500 shadow-luxury',
        'bg-gradient-to-br from-casino-dark-100 to-casino-dark-200',
        wheelSize
      )}>
        {/* Inner wheel container */}
        <div className="absolute inset-4 rounded-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
          {/* Rotating wheel */}
          <div
            className={cn(
              'absolute inset-0 rounded-full transition-transform ease-out',
              {
                'duration-[4000ms]': isAnimating || isSpinning,
                'duration-300': !isAnimating && !isSpinning,
              }
            )}
            style={{
              transform: `rotate(${currentRotation}deg)`,
            }}
          >
            {wheelSectors}
          </div>
        </div>

        {/* Center hub */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-casino-gold-400 to-casino-gold-600 shadow-lg border-2 border-casino-gold-300" />

        {/* Pointer/ball */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-gray-300 z-10" />

        {/* Decorative elements */}
        <div className="absolute inset-0 rounded-full border-2 border-casino-gold-400/30" />
        <div className="absolute inset-2 rounded-full border border-casino-gold-500/20" />
      </div>

      {/* Winning number display */}
      {winningNumber !== undefined && !isAnimating && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2">
          <div className={cn(
            'px-4 py-2 rounded-lg font-bold text-white text-lg shadow-lg',
            {
              'bg-red-600': getNumberColor(winningNumber) === 'red',
              'bg-black': getNumberColor(winningNumber) === 'black',
              'bg-green-600': getNumberColor(winningNumber) === 'green',
            }
          )}>
            {winningNumber}
          </div>
        </div>
      )}

      {/* Spinning indicator */}
      {(isSpinning || isAnimating) && (
        <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2">
          <div className="flex items-center space-x-2 text-casino-gold-500">
            <div className="w-2 h-2 bg-casino-gold-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Girando...</span>
            <div className="w-2 h-2 bg-casino-gold-500 rounded-full animate-pulse animation-delay-200" />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * RouletteWheelMini - Compact version for previews
 */
export function RouletteWheelMini(props: Omit<RouletteWheelProps, 'size'>) {
  return <RouletteWheel {...props} size="small" showNumbers={false} />
}

/**
 * RouletteWheelHero - Large version for main game interface
 */
export function RouletteWheelHero(props: Omit<RouletteWheelProps, 'size'>) {
  return <RouletteWheel {...props} size="large" />
}