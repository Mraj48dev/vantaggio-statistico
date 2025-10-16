/**
 * Package Entity - Permissions Module Domain Layer
 *
 * Represents a subscription package with its permissions and limits.
 * This is the core entity for managing user access levels.
 */

import { Result } from '@/shared/domain/types/common'

export interface PackageId {
  readonly value: string
}

export interface PackageLimits {
  readonly maxConcurrentSessions: number
  readonly maxDailyBets: number
  readonly maxSessionDuration: number // in seconds
  readonly analyticsRetention: number // in days
  readonly exportFormats: string[]
}

export interface PackageProps {
  readonly id: PackageId
  readonly name: string
  readonly displayName: string
  readonly description?: string
  readonly price: number // in cents
  readonly billingPeriod: BillingPeriod
  readonly limits: PackageLimits
  readonly isActive: boolean
  readonly sortOrder: number
  readonly createdAt: Date
  readonly updatedAt: Date
}

export enum BillingPeriod {
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  LIFETIME = 'lifetime',
  FREE = 'free'
}

export class Package {
  private constructor(private readonly props: PackageProps) {}

  static create(props: Omit<PackageProps, 'id' | 'createdAt' | 'updatedAt'>): Result<Package, PackageValidationError> {
    const validation = this.validate(props)
    if (!validation.isSuccess) {
      return Result.failure(validation.error)
    }

    const packageProps: PackageProps = {
      id: { value: props.name.toLowerCase().replace(/\s+/g, '_') },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...props
    }

    return Result.success(new Package(packageProps))
  }

  static fromPersistence(props: PackageProps): Package {
    return new Package(props)
  }

  private static validate(props: Omit<PackageProps, 'id' | 'createdAt' | 'updatedAt'>): Result<void, PackageValidationError> {
    if (!props.name || props.name.trim().length === 0) {
      return Result.failure(new PackageValidationError('Package name is required'))
    }

    if (!props.displayName || props.displayName.trim().length === 0) {
      return Result.failure(new PackageValidationError('Display name is required'))
    }

    if (props.price < 0) {
      return Result.failure(new PackageValidationError('Price cannot be negative'))
    }

    if (!this.isValidLimits(props.limits)) {
      return Result.failure(new PackageValidationError('Invalid package limits'))
    }

    return Result.success(undefined)
  }

  private static isValidLimits(limits: PackageLimits): boolean {
    return (
      limits.maxConcurrentSessions > 0 &&
      limits.maxDailyBets > 0 &&
      limits.maxSessionDuration > 0 &&
      limits.analyticsRetention > 0 &&
      Array.isArray(limits.exportFormats)
    )
  }

  // Getters
  get id(): PackageId {
    return this.props.id
  }

  get name(): string {
    return this.props.name
  }

  get displayName(): string {
    return this.props.displayName
  }

  get description(): string | undefined {
    return this.props.description
  }

  get price(): number {
    return this.props.price
  }

  get billingPeriod(): BillingPeriod {
    return this.props.billingPeriod
  }

  get limits(): PackageLimits {
    return this.props.limits
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
  updateLimits(newLimits: PackageLimits): Result<Package, PackageValidationError> {
    if (!Package.isValidLimits(newLimits)) {
      return Result.failure(new PackageValidationError('Invalid package limits'))
    }

    const updatedProps: PackageProps = {
      ...this.props,
      limits: newLimits,
      updatedAt: new Date()
    }

    return Result.success(new Package(updatedProps))
  }

  updatePrice(newPrice: number, newBillingPeriod?: BillingPeriod): Result<Package, PackageValidationError> {
    if (newPrice < 0) {
      return Result.failure(new PackageValidationError('Price cannot be negative'))
    }

    const updatedProps: PackageProps = {
      ...this.props,
      price: newPrice,
      billingPeriod: newBillingPeriod || this.props.billingPeriod,
      updatedAt: new Date()
    }

    return Result.success(new Package(updatedProps))
  }

  activate(): Package {
    const updatedProps: PackageProps = {
      ...this.props,
      isActive: true,
      updatedAt: new Date()
    }

    return new Package(updatedProps)
  }

  deactivate(): Package {
    const updatedProps: PackageProps = {
      ...this.props,
      isActive: false,
      updatedAt: new Date()
    }

    return new Package(updatedProps)
  }

  // Utility methods
  isFree(): boolean {
    return this.props.price === 0 || this.props.billingPeriod === BillingPeriod.FREE
  }

  isPremium(): boolean {
    return !this.isFree()
  }

  // Domain events
  toDomainEvents(): PackageDomainEvent[] {
    return []
  }

  // Persistence
  toPersistence(): PackageProps {
    return { ...this.props }
  }
}

export class PackageValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PackageValidationError'
  }
}

// Domain Events
export interface PackageDomainEvent {
  readonly eventType: string
  readonly packageId: PackageId
  readonly timestamp: Date
}

export interface PackageCreatedEvent extends PackageDomainEvent {
  readonly eventType: 'PackageCreated'
  readonly name: string
  readonly price: number
}

export interface PackageLimitsUpdatedEvent extends PackageDomainEvent {
  readonly eventType: 'PackageLimitsUpdated'
  readonly oldLimits: PackageLimits
  readonly newLimits: PackageLimits
}

export interface PackagePriceUpdatedEvent extends PackageDomainEvent {
  readonly eventType: 'PackagePriceUpdated'
  readonly oldPrice: number
  readonly newPrice: number
}