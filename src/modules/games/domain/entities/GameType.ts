/**
 * GameType Entity - Games Module Domain Layer
 *
 * Represents a casino game type with its configuration and rules.
 * This entity manages the core business logic for game definitions.
 */

import { Result } from '@/shared/domain/types/common'

export interface GameTypeId {
  readonly value: string
}

export interface RouletteConfig {
  readonly type: 'european' | 'american'
  readonly numbers: readonly number[]
  readonly redNumbers: readonly number[]
  readonly blackNumbers: readonly number[]
  readonly greenNumbers: readonly number[]
  readonly payouts: {
    readonly straight: number     // Single number
    readonly split: number        // Two numbers
    readonly street: number       // Three numbers
    readonly corner: number       // Four numbers
    readonly line: number         // Six numbers
    readonly dozen: number        // 1-12, 13-24, 25-36
    readonly column: number       // Column
    readonly even: number         // Even/Odd
    readonly red: number          // Red/Black
    readonly low: number          // 1-18/19-36
  }
  readonly minBet: number
  readonly maxBet: number
  readonly tableLimits: {
    readonly inside: number       // Inside bets limit
    readonly outside: number      // Outside bets limit
  }
}

export interface BlackjackConfig {
  readonly decks: number
  readonly dealerStandsOn: 17 | 'soft17'
  readonly blackjackPayout: number
  readonly doubleAfterSplit: boolean
  readonly surrenderAllowed: boolean
  readonly minBet: number
  readonly maxBet: number
}

export type GameConfig = RouletteConfig | BlackjackConfig

export interface GameTypeProps {
  readonly id: GameTypeId
  readonly name: string
  readonly displayName: string
  readonly category: GameCategory
  readonly config: GameConfig
  readonly isActive: boolean
  readonly sortOrder: number
  readonly createdAt: Date
  readonly updatedAt: Date
}

export enum GameCategory {
  TABLE = 'table',
  SLOTS = 'slots',
  CARD = 'card'
}

export class GameType {
  private constructor(private readonly props: GameTypeProps) {}

  static create(props: Omit<GameTypeProps, 'id' | 'createdAt' | 'updatedAt'>): Result<GameType, GameTypeValidationError> {
    const validation = this.validate(props)
    if (!validation.isSuccess) {
      return Result.failure(validation.error)
    }

    const gameTypeProps: GameTypeProps = {
      id: { value: props.name.toLowerCase().replace(/\s+/g, '_') },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...props
    }

    return Result.success(new GameType(gameTypeProps))
  }

  static fromPersistence(props: GameTypeProps): GameType {
    return new GameType(props)
  }

  private static validate(props: Omit<GameTypeProps, 'id' | 'createdAt' | 'updatedAt'>): Result<void, GameTypeValidationError> {
    if (!props.name || props.name.trim().length === 0) {
      return Result.failure(new GameTypeValidationError('Game name is required'))
    }

    if (!props.displayName || props.displayName.trim().length === 0) {
      return Result.failure(new GameTypeValidationError('Display name is required'))
    }

    if (!Object.values(GameCategory).includes(props.category)) {
      return Result.failure(new GameTypeValidationError('Invalid game category'))
    }

    if (!this.isValidConfig(props.config, props.category)) {
      return Result.failure(new GameTypeValidationError('Invalid game configuration'))
    }

    return Result.success(undefined)
  }

  private static isValidConfig(config: GameConfig, category: GameCategory): boolean {
    if (category === GameCategory.TABLE && 'numbers' in config) {
      // Validate roulette config
      const rouletteConfig = config as RouletteConfig
      return (
        rouletteConfig.numbers.length > 0 &&
        rouletteConfig.minBet > 0 &&
        rouletteConfig.maxBet > rouletteConfig.minBet &&
        rouletteConfig.payouts.straight > 0 &&
        rouletteConfig.tableLimits.inside > 0 &&
        rouletteConfig.tableLimits.outside > 0
      )
    }

    if (category === GameCategory.CARD && 'decks' in config) {
      // Validate blackjack config
      const blackjackConfig = config as BlackjackConfig
      return (
        blackjackConfig.decks > 0 &&
        blackjackConfig.minBet > 0 &&
        blackjackConfig.maxBet > blackjackConfig.minBet &&
        blackjackConfig.blackjackPayout > 0
      )
    }

    return false
  }

  // Getters
  get id(): GameTypeId {
    return this.props.id
  }

  get name(): string {
    return this.props.name
  }

  get displayName(): string {
    return this.props.displayName
  }

  get category(): GameCategory {
    return this.props.category
  }

  get config(): GameConfig {
    return this.props.config
  }

  get isActive(): boolean {
    return this.props.isActive
  }

  get sortOrder(): number {
    return this.props.sortOrder
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  // Business methods
  updateConfig(newConfig: GameConfig): Result<GameType, GameTypeValidationError> {
    if (!GameType.isValidConfig(newConfig, this.props.category)) {
      return Result.failure(new GameTypeValidationError('Invalid game configuration'))
    }

    const updatedProps: GameTypeProps = {
      ...this.props,
      config: newConfig,
      updatedAt: new Date()
    }

    return Result.success(new GameType(updatedProps))
  }

  activate(): GameType {
    const updatedProps: GameTypeProps = {
      ...this.props,
      isActive: true,
      updatedAt: new Date()
    }

    return new GameType(updatedProps)
  }

  deactivate(): GameType {
    const updatedProps: GameTypeProps = {
      ...this.props,
      isActive: false,
      updatedAt: new Date()
    }

    return new GameType(updatedProps)
  }

  updateSortOrder(newSortOrder: number): GameType {
    if (newSortOrder < 0) {
      return this
    }

    const updatedProps: GameTypeProps = {
      ...this.props,
      sortOrder: newSortOrder,
      updatedAt: new Date()
    }

    return new GameType(updatedProps)
  }

  // Type guards
  isRouletteGame(): this is GameType & { config: RouletteConfig } {
    return this.category === GameCategory.TABLE && 'numbers' in this.config
  }

  isBlackjackGame(): this is GameType & { config: BlackjackConfig } {
    return this.category === GameCategory.CARD && 'decks' in this.config
  }

  // Game-specific methods
  getRouletteConfig(): RouletteConfig | null {
    return this.isRouletteGame() ? this.config : null
  }

  getBlackjackConfig(): BlackjackConfig | null {
    return this.isBlackjackGame() ? this.config : null
  }

  // Utility methods
  getMinBet(): number {
    if ('minBet' in this.config) {
      return this.config.minBet
    }
    return 0
  }

  getMaxBet(): number {
    if ('maxBet' in this.config) {
      return this.config.maxBet
    }
    return 0
  }

  // Domain events
  toDomainEvents(): GameTypeDomainEvent[] {
    return []
  }

  // Persistence
  toPersistence(): GameTypeProps {
    return { ...this.props }
  }
}

export class GameTypeValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GameTypeValidationError'
  }
}

// Domain Events
export interface GameTypeDomainEvent {
  readonly eventType: string
  readonly gameTypeId: GameTypeId
  readonly timestamp: Date
}

export interface GameTypeCreatedEvent extends GameTypeDomainEvent {
  readonly eventType: 'GameTypeCreated'
  readonly name: string
  readonly category: GameCategory
}

export interface GameTypeConfigUpdatedEvent extends GameTypeDomainEvent {
  readonly eventType: 'GameTypeConfigUpdated'
  readonly oldConfig: GameConfig
  readonly newConfig: GameConfig
}

export interface GameTypeActivatedEvent extends GameTypeDomainEvent {
  readonly eventType: 'GameTypeActivated'
}

export interface GameTypeDeactivatedEvent extends GameTypeDomainEvent {
  readonly eventType: 'GameTypeDeactivated'
}