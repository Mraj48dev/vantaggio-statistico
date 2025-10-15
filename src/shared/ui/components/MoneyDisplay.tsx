/**
 * MoneyDisplay Component - Professional currency display for casino platform
 *
 * A specialized component for displaying monetary amounts with proper
 * Italian formatting, casino-appropriate styling, and support for
 * profit/loss visualization with color coding and animations.
 */

import React from 'react'
import { cn, formatCurrency } from '@/shared/infrastructure/lib/utils'

export interface MoneyDisplayProps {
  /** Amount in cents to avoid floating point issues */
  amount: number

  /** Currency code (default: EUR) */
  currency?: string

  /** Display variant for different contexts */
  variant?: 'default' | 'large' | 'compact' | 'hero'

  /** Color scheme based on value */
  colorScheme?: 'auto' | 'neutral' | 'positive' | 'negative' | 'gold'

  /** Show trend indicator */
  showTrend?: boolean

  /** Previous amount for trend calculation */
  previousAmount?: number

  /** Additional CSS classes */
  className?: string

  /** Animate value changes */
  animated?: boolean

  /** Show currency symbol */
  showCurrency?: boolean

  /** Format for display */
  format?: 'full' | 'short' | 'minimal'

  /** Loading state */
  loading?: boolean

  /** Prefix text */
  prefix?: string

  /** Suffix text */
  suffix?: string
}

/**
 * MoneyDisplay - Professional money formatting for casino platform
 *
 * Features:
 * - Italian currency formatting (€1.234,56)
 * - Automatic profit/loss color coding
 * - Multiple size variants
 * - Trend indicators with animations
 * - Loading states
 * - Responsive design
 */
export function MoneyDisplay({
  amount,
  currency = 'EUR',
  variant = 'default',
  colorScheme = 'auto',
  showTrend = false,
  previousAmount,
  className,
  animated = true,
  showCurrency = true,
  format = 'full',
  loading = false,
  prefix,
  suffix,
}: MoneyDisplayProps) {
  // Calculate trend if previous amount is provided
  const trend = previousAmount !== undefined ? amount - previousAmount : 0
  const isPositive = amount > 0
  const isNegative = amount < 0
  const hasIncrease = trend > 0
  const hasDecrease = trend < 0

  // Determine color scheme automatically if set to auto
  const finalColorScheme = colorScheme === 'auto'
    ? isPositive
      ? 'positive'
      : isNegative
        ? 'negative'
        : 'neutral'
    : colorScheme

  // Format the amount based on format type
  const formatAmount = (value: number) => {
    if (format === 'minimal') {
      return Math.abs(value / 100).toLocaleString('it-IT', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })
    }

    if (format === 'short' && Math.abs(value) >= 100000) { // €1000+
      const shortened = Math.abs(value) / 100000 // Convert to thousands
      return `${shortened.toLocaleString('it-IT', { maximumFractionDigits: 1 })}k`
    }

    return showCurrency
      ? formatCurrency(Math.abs(value), currency)
      : Math.abs(value / 100).toLocaleString('it-IT', { minimumFractionDigits: 2 })
  }

  const formattedAmount = formatAmount(amount)

  if (loading) {
    return (
      <div className={cn(
        'inline-flex items-center space-x-1',
        {
          'text-lg': variant === 'default',
          'text-2xl': variant === 'large',
          'text-sm': variant === 'compact',
          'text-4xl md:text-5xl': variant === 'hero',
        },
        className
      )}>
        <div className="h-6 w-20 bg-casino-gold-500/20 rounded animate-pulse" />
      </div>
    )
  }

  return (
    <div className={cn(
      'inline-flex items-center space-x-1 font-mono font-bold tracking-wide',

      // Size variants
      {
        'text-lg': variant === 'default',
        'text-2xl': variant === 'large',
        'text-sm': variant === 'compact',
        'text-4xl md:text-5xl font-display': variant === 'hero',
      },

      // Color schemes
      {
        'text-casino-gold-500': finalColorScheme === 'neutral' || finalColorScheme === 'gold',
        'text-casino-green-400': finalColorScheme === 'positive',
        'text-casino-red-400': finalColorScheme === 'negative',
      },

      // Animations
      {
        'transition-all duration-300': animated,
      },

      className
    )}>
      {/* Prefix */}
      {prefix && (
        <span className="text-casino-gold-300 font-normal mr-1">
          {prefix}
        </span>
      )}

      {/* Sign indicator */}
      {isNegative && (
        <span className="text-casino-red-400">-</span>
      )}
      {isPositive && showTrend && (
        <span className="text-casino-green-400">+</span>
      )}

      {/* Amount */}
      <span className={cn(
        'tabular-nums',
        {
          'animate-pulse-gold': animated && hasIncrease,
          'text-shadow-sm': variant === 'hero',
        }
      )}>
        {formattedAmount}
      </span>

      {/* Trend indicator */}
      {showTrend && previousAmount !== undefined && trend !== 0 && (
        <span className={cn(
          'inline-flex items-center text-xs ml-2 px-1.5 py-0.5 rounded-full',
          {
            'bg-casino-green-500/20 text-casino-green-400': hasIncrease,
            'bg-casino-red-500/20 text-casino-red-400': hasDecrease,
          }
        )}>
          <span className="mr-1">
            {hasIncrease ? '↗' : '↘'}
          </span>
          {formatAmount(Math.abs(trend))}
        </span>
      )}

      {/* Suffix */}
      {suffix && (
        <span className="text-casino-gold-300 font-normal ml-1">
          {suffix}
        </span>
      )}
    </div>
  )
}

// Specialized money display components

/**
 * ProfitLossDisplay - Specialized for profit/loss amounts
 */
export function ProfitLossDisplay({
  amount,
  ...props
}: Omit<MoneyDisplayProps, 'colorScheme' | 'showTrend'>) {
  return (
    <MoneyDisplay
      {...props}
      amount={amount}
      colorScheme="auto"
      showTrend={false}
      prefix={amount >= 0 ? '+' : ''}
    />
  )
}

/**
 * BetAmountDisplay - For displaying bet amounts
 */
export function BetAmountDisplay({
  amount,
  ...props
}: Omit<MoneyDisplayProps, 'colorScheme'>) {
  return (
    <MoneyDisplay
      {...props}
      amount={amount}
      colorScheme="gold"
    />
  )
}

/**
 * BalanceDisplay - For account balances
 */
export function BalanceDisplay({
  amount,
  ...props
}: MoneyDisplayProps) {
  return (
    <MoneyDisplay
      {...props}
      amount={amount}
      colorScheme={amount >= 0 ? 'positive' : 'negative'}
    />
  )
}

/**
 * PriceDisplay - For subscription prices
 */
export function PriceDisplay({
  amount,
  period,
  ...props
}: MoneyDisplayProps & { period?: string }) {
  return (
    <div className="inline-flex items-baseline space-x-1">
      <MoneyDisplay
        {...props}
        amount={amount}
        colorScheme="gold"
      />
      {period && (
        <span className="text-sm text-casino-gold-300 font-normal">
          /{period}
        </span>
      )}
    </div>
  )
}