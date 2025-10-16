/**
 * User Entity - Auth Module Domain Layer
 *
 * Represents the core User business entity with all its business rules
 * and invariants. This entity is independent of any external framework.
 */

import { Result } from '@/shared/domain/types/common'

export interface UserId {
  readonly value: string
}

export interface UserProps {
  readonly id: UserId
  readonly clerkId: string
  readonly email: string
  readonly packageId: string
  readonly createdAt: Date
  readonly updatedAt: Date
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt'>): Result<User, UserValidationError> {
    const validation = this.validate(props)
    if (!validation.isSuccess) {
      return Result.failure(validation.error)
    }

    const userProps: UserProps = {
      id: { value: crypto.randomUUID() },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...props
    }

    return Result.success(new User(userProps))
  }

  static fromPersistence(props: UserProps): User {
    return new User(props)
  }

  private static validate(props: Omit<UserProps, 'id' | 'createdAt' | 'updatedAt'>): Result<void, UserValidationError> {
    if (!props.clerkId || props.clerkId.trim().length === 0) {
      return Result.failure(new UserValidationError('Clerk ID is required'))
    }

    if (!this.isValidEmail(props.email)) {
      return Result.failure(new UserValidationError('Invalid email format'))
    }

    if (!props.packageId || props.packageId.trim().length === 0) {
      return Result.failure(new UserValidationError('Package ID is required'))
    }

    return Result.success(undefined)
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Getters
  get id(): UserId {
    return this.props.id
  }

  get clerkId(): string {
    return this.props.clerkId
  }

  get email(): string {
    return this.props.email
  }

  get packageId(): string {
    return this.props.packageId
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  get updatedAt(): Date {
    return this.props.updatedAt
  }

  // Business methods
  updatePackage(newPackageId: string): Result<User, UserValidationError> {
    if (!newPackageId || newPackageId.trim().length === 0) {
      return Result.failure(new UserValidationError('Package ID cannot be empty'))
    }

    const updatedProps: UserProps = {
      ...this.props,
      packageId: newPackageId,
      updatedAt: new Date()
    }

    return Result.success(new User(updatedProps))
  }

  updateEmail(newEmail: string): Result<User, UserValidationError> {
    if (!User.isValidEmail(newEmail)) {
      return Result.failure(new UserValidationError('Invalid email format'))
    }

    const updatedProps: UserProps = {
      ...this.props,
      email: newEmail,
      updatedAt: new Date()
    }

    return Result.success(new User(updatedProps))
  }

  // Domain events
  toDomainEvents(): UserDomainEvent[] {
    // Implementation will be added when we implement event sourcing
    return []
  }

  // Persistence
  toPersistence(): UserProps {
    return { ...this.props }
  }
}

export class UserValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'UserValidationError'
  }
}

// Domain Events
export interface UserDomainEvent {
  readonly eventType: string
  readonly userId: UserId
  readonly timestamp: Date
}

export interface UserCreatedEvent extends UserDomainEvent {
  readonly eventType: 'UserCreated'
  readonly email: string
  readonly packageId: string
}

export interface UserPackageUpdatedEvent extends UserDomainEvent {
  readonly eventType: 'UserPackageUpdated'
  readonly oldPackageId: string
  readonly newPackageId: string
}

export interface UserEmailUpdatedEvent extends UserDomainEvent {
  readonly eventType: 'UserEmailUpdated'
  readonly oldEmail: string
  readonly newEmail: string
}