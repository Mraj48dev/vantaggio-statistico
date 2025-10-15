/**
 * CasinoCard Component - Premium luxury card for casino interface
 *
 * A sophisticated card component designed specifically for the casino
 * environment with luxury styling, subtle animations, and premium
 * visual effects that convey trust and elegance.
 */

import React from 'react'
import { cn } from '@/shared/infrastructure/lib/utils'

export interface CasinoCardProps {
  /** Card content */
  children: React.ReactNode

  /** Additional CSS classes */
  className?: string

  /** Card variant for different use cases */
  variant?: 'default' | 'luxury' | 'game' | 'stats' | 'method'

  /** Hover effect intensity */
  hoverEffect?: 'none' | 'subtle' | 'pronounced'

  /** Whether the card is clickable */
  clickable?: boolean

  /** Click handler for interactive cards */
  onClick?: () => void

  /** Whether the card is currently selected/active */
  selected?: boolean

  /** Disable the card */
  disabled?: boolean

  /** Card title for semantic purposes */
  title?: string

  /** Border glow effect */
  glowEffect?: boolean

  /** Loading state */
  loading?: boolean
}

/**
 * CasinoCard - Premium card component for the casino platform
 *
 * Features:
 * - Luxury glass-morphism effect
 * - Subtle gold border animations
 * - Responsive hover states
 * - Multiple variants for different contexts
 * - Accessibility-first design
 * - Touch-friendly for mobile casino gaming
 */
export function CasinoCard({
  children,
  className,
  variant = 'default',
  hoverEffect = 'subtle',
  clickable = false,
  onClick,
  selected = false,
  disabled = false,
  title,
  glowEffect = false,
  loading = false,
}: CasinoCardProps) {
  const Component = clickable || onClick ? 'button' : 'div'

  return (
    <Component
      className={cn(
        // Base card styles
        'relative overflow-hidden rounded-xl transition-all duration-300 ease-out',
        'backdrop-blur-sm border',

        // Variant-specific styling
        {
          // Default card - elegant dark with gold accents
          'bg-gradient-to-br from-casino-dark-50/80 to-casino-dark-100/60 border-casino-gold-500/20':
            variant === 'default',

          // Luxury card - premium glass effect
          'bg-gradient-to-br from-casino-dark-50/90 to-casino-dark-100/70 border-casino-gold-500/40 shadow-luxury':
            variant === 'luxury',

          // Game card - felt-like background for gaming context
          'bg-gradient-to-br from-casino-green-900/60 to-casino-green-800/40 border-casino-green-500/30':
            variant === 'game',

          // Stats card - clean background for data presentation
          'bg-gradient-to-br from-casino-dark-100/70 to-casino-dark-200/50 border-casino-gold-500/25':
            variant === 'stats',

          // Method card - distinctive styling for betting strategies
          'bg-gradient-to-br from-casino-dark-50/85 to-casino-gold-900/20 border-casino-gold-400/35':
            variant === 'method',
        },

        // Hover effects
        {
          'hover:scale-[1.02] hover:shadow-casino': hoverEffect === 'subtle' && !disabled,
          'hover:scale-[1.05] hover:shadow-luxury hover:border-casino-gold-500/60':
            hoverEffect === 'pronounced' && !disabled,
        },

        // Interactive states
        {
          'cursor-pointer focus:outline-none focus:ring-2 focus:ring-casino-gold-500 focus:ring-opacity-50':
            clickable && !disabled,
          'cursor-not-allowed opacity-50': disabled,
        },

        // Selected state
        {
          'border-casino-gold-500 shadow-gold ring-2 ring-casino-gold-500/20': selected,
        },

        // Glow effect
        {
          'shadow-[0_0_30px_rgba(255,183,0,0.3)]': glowEffect,
        },

        // Loading state
        {
          'animate-pulse': loading,
        },

        className
      )}
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      aria-label={title}
      title={title}
    >
      {/* Background pattern overlay for texture */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,183,0,0.05),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.02),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.02),transparent_50%)]" />
      </div>

      {/* Border shimmer effect on hover */}
      {!disabled && hoverEffect !== 'none' && (
        <div className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 hover:opacity-100">
          <div className="absolute inset-[1px] rounded-xl bg-gradient-to-r from-transparent via-casino-gold-500/20 to-transparent" />
        </div>
      )}

      {/* Content wrapper */}
      <div className="relative z-10 p-6">
        {loading ? (
          <div className="space-y-3">
            <div className="h-4 bg-casino-gold-500/20 rounded animate-pulse" />
            <div className="h-4 bg-casino-gold-500/20 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-casino-gold-500/20 rounded animate-pulse w-1/2" />
          </div>
        ) : (
          children
        )}
      </div>

      {/* Corner accent for luxury feel */}
      {variant === 'luxury' && (
        <>
          <div className="absolute top-0 left-0 w-8 h-8">
            <div className="absolute top-2 left-2 w-4 h-[1px] bg-casino-gold-500/60" />
            <div className="absolute top-2 left-2 w-[1px] h-4 bg-casino-gold-500/60" />
          </div>
          <div className="absolute bottom-0 right-0 w-8 h-8">
            <div className="absolute bottom-2 right-2 w-4 h-[1px] bg-casino-gold-500/60" />
            <div className="absolute bottom-2 right-2 w-[1px] h-4 bg-casino-gold-500/60" />
          </div>
        </>
      )}
    </Component>
  )
}

// Specialized card components for specific use cases

/**
 * GameCard - Optimized for game display
 */
export function GameCard(props: Omit<CasinoCardProps, 'variant'>) {
  return <CasinoCard {...props} variant="game" />
}

/**
 * MethodCard - Optimized for betting method display
 */
export function MethodCard(props: Omit<CasinoCardProps, 'variant'>) {
  return <CasinoCard {...props} variant="method" />
}

/**
 * StatsCard - Optimized for statistics and data display
 */
export function StatsCard(props: Omit<CasinoCardProps, 'variant'>) {
  return <CasinoCard {...props} variant="stats" />
}

/**
 * LuxuryCard - Premium card for important content
 */
export function LuxuryCard(props: Omit<CasinoCardProps, 'variant'>) {
  return <CasinoCard {...props} variant="luxury" />
}