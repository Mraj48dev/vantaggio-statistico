/**
 * Permission Entity - Permissions Module Domain Layer
 *
 * Represents a granular permission that can be granted to users or packages.
 * Permissions control access to specific features and resources.
 */

import { Result } from '@/shared/domain/types/common'

export interface PermissionId {
  readonly value: string
}

export interface PermissionProps {
  readonly id: PermissionId
  readonly name: string
  readonly category: PermissionCategory
  readonly resourceType?: string
  readonly resourceId?: string
  readonly description?: string
  readonly createdAt: Date
}

export enum PermissionCategory {
  GAMES = 'games',
  METHODS = 'methods',
  ANALYTICS = 'analytics',
  SESSIONS = 'sessions',
  ADMIN = 'admin',
  BILLING = 'billing'
}

export class Permission {
  private constructor(private readonly props: PermissionProps) {}

  static create(props: Omit<PermissionProps, 'id' | 'createdAt'>): Result<Permission, PermissionValidationError> {
    const validation = this.validate(props)
    if (!validation.isSuccess) {
      return Result.failure(validation.error)
    }

    const permissionProps: PermissionProps = {
      id: { value: this.generatePermissionId(props.category, props.name, props.resourceType, props.resourceId) },
      createdAt: new Date(),
      ...props
    }

    return Result.success(new Permission(permissionProps))
  }

  static fromPersistence(props: PermissionProps): Permission {
    return new Permission(props)
  }

  private static validate(props: Omit<PermissionProps, 'id' | 'createdAt'>): Result<void, PermissionValidationError> {
    if (!props.name || props.name.trim().length === 0) {
      return Result.failure(new PermissionValidationError('Permission name is required'))
    }

    if (!Object.values(PermissionCategory).includes(props.category)) {
      return Result.failure(new PermissionValidationError('Invalid permission category'))
    }

    return Result.success(undefined)
  }

  private static generatePermissionId(
    category: PermissionCategory,
    name: string,
    resourceType?: string,
    resourceId?: string
  ): string {
    const baseId = `${category}_${name}`.toLowerCase().replace(/\s+/g, '_')

    if (resourceType && resourceId) {
      return `${baseId}_${resourceType}_${resourceId}`
    }

    if (resourceType) {
      return `${baseId}_${resourceType}`
    }

    return baseId
  }

  // Getters
  get id(): PermissionId {
    return this.props.id
  }

  get name(): string {
    return this.props.name
  }

  get category(): PermissionCategory {
    return this.props.category
  }

  get resourceType(): string | undefined {
    return this.props.resourceType
  }

  get resourceId(): string | undefined {
    return this.props.resourceId
  }

  get description(): string | undefined {
    return this.props.description
  }

  get createdAt(): Date {
    return this.props.createdAt
  }

  // Business methods
  isResourceSpecific(): boolean {
    return this.props.resourceType !== undefined || this.props.resourceId !== undefined
  }

  matchesResource(resourceType: string, resourceId?: string): boolean {
    if (!this.isResourceSpecific()) {
      return true // Global permission
    }

    if (this.props.resourceType !== resourceType) {
      return false
    }

    if (this.props.resourceId && resourceId && this.props.resourceId !== resourceId) {
      return false
    }

    return true
  }

  isAdminPermission(): boolean {
    return this.props.category === PermissionCategory.ADMIN
  }

  // Static factory methods for common permissions
  static createGameAccess(gameId: string): Result<Permission, PermissionValidationError> {
    return Permission.create({
      name: 'access',
      category: PermissionCategory.GAMES,
      resourceType: 'game',
      resourceId: gameId,
      description: `Access to game: ${gameId}`
    })
  }

  static createMethodAccess(methodId: string): Result<Permission, PermissionValidationError> {
    return Permission.create({
      name: 'access',
      category: PermissionCategory.METHODS,
      resourceType: 'method',
      resourceId: methodId,
      description: `Access to method: ${methodId}`
    })
  }

  static createAnalyticsAccess(feature: string): Result<Permission, PermissionValidationError> {
    return Permission.create({
      name: feature,
      category: PermissionCategory.ANALYTICS,
      description: `Access to analytics feature: ${feature}`
    })
  }

  // Persistence
  toPersistence(): PermissionProps {
    return { ...this.props }
  }
}

export class PermissionValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PermissionValidationError'
  }
}

// Pre-defined permission constants
export const PERMISSIONS = {
  // Game permissions
  GAMES: {
    ACCESS_ROULETTE: 'games_access_game_roulette_classica',
    ACCESS_ALL_GAMES: 'games_access_all',
  },

  // Method permissions
  METHODS: {
    ACCESS_FIBONACCI: 'methods_access_method_fibonacci',
    ACCESS_MARTINGALE: 'methods_access_method_martingale',
    ACCESS_PAROLI: 'methods_access_method_paroli',
    ACCESS_DALEMBERT: 'methods_access_method_dalembert',
    ACCESS_LABOUCHERE: 'methods_access_method_labouchere',
    ACCESS_ALL_METHODS: 'methods_access_all',
  },

  // Analytics permissions
  ANALYTICS: {
    VIEW_BASIC_STATS: 'analytics_view_basic',
    VIEW_ADVANCED_STATS: 'analytics_view_advanced',
    EXPORT_DATA: 'analytics_export_data',
    VIEW_PERFORMANCE_REPORTS: 'analytics_view_performance',
  },

  // Session permissions
  SESSIONS: {
    CREATE_SESSION: 'sessions_create',
    UNLIMITED_SESSIONS: 'sessions_unlimited',
    EXTENDED_DURATION: 'sessions_extended_duration',
  },

  // Admin permissions
  ADMIN: {
    MANAGE_USERS: 'admin_manage_users',
    MANAGE_PACKAGES: 'admin_manage_packages',
    VIEW_PLATFORM_STATS: 'admin_view_platform_stats',
    MANAGE_CONTENT: 'admin_manage_content',
  }
} as const