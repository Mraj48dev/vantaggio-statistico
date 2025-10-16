/**
 * Permission Service Interface - Permissions Module Domain Layer
 *
 * Defines the contract for permission checking and package management.
 * This service handles the core business logic around access control.
 */

import { Result } from '@/shared/domain/types/common'
import { UserId } from '../../../auth/domain/entities/User'
import { Package, PackageId } from '../entities/Package'
import { Permission, PermissionId } from '../entities/Permission'

export interface PermissionService {
  /** Check if user has specific permission */
  checkUserAccess(userId: UserId, permissionId: string): Promise<Result<boolean, PermissionServiceError>>

  /** Check if user has access to a specific resource */
  checkResourceAccess(
    userId: UserId,
    resourceType: string,
    resourceId: string,
    action: string
  ): Promise<Result<boolean, PermissionServiceError>>

  /** Get all packages available to user */
  getUserPackages(userId: UserId): Promise<Result<Package[], PermissionServiceError>>

  /** Get user's current active package */
  getUserActivePackage(userId: UserId): Promise<Result<Package | null, PermissionServiceError>>

  /** Assign package to user */
  assignPackageToUser(userId: UserId, packageId: PackageId): Promise<Result<void, PermissionServiceError>>

  /** Remove package from user */
  removePackageFromUser(userId: UserId, packageId: PackageId): Promise<Result<void, PermissionServiceError>>

  /** Create custom package with specific permissions */
  createCustomPackage(
    packageData: CreatePackageData,
    permissions: PermissionId[]
  ): Promise<Result<Package, PermissionServiceError>>

  /** Get package by ID */
  getPackageById(packageId: PackageId): Promise<Result<Package | null, PermissionServiceError>>

  /** Get all permissions for package */
  getPackagePermissions(packageId: PackageId): Promise<Result<Permission[], PermissionServiceError>>

  /** Add permission to package */
  addPermissionToPackage(packageId: PackageId, permissionId: PermissionId): Promise<Result<void, PermissionServiceError>>

  /** Remove permission from package */
  removePermissionFromPackage(packageId: PackageId, permissionId: PermissionId): Promise<Result<void, PermissionServiceError>>

  /** Get all available permissions */
  getAllPermissions(): Promise<Result<Permission[], PermissionServiceError>>

  /** Check if user has reached package limits */
  checkPackageLimit(userId: UserId, limitType: PackageLimitType): Promise<Result<PackageLimitCheck, PermissionServiceError>>
}

export interface CreatePackageData {
  readonly name: string
  readonly displayName: string
  readonly description?: string
  readonly price: number
  readonly billingPeriod: string
  readonly limits: PackageLimitsData
}

export interface PackageLimitsData {
  readonly maxConcurrentSessions: number
  readonly maxDailyBets: number
  readonly maxSessionDuration: number
  readonly analyticsRetention: number
  readonly exportFormats: string[]
}

export enum PackageLimitType {
  CONCURRENT_SESSIONS = 'concurrent_sessions',
  DAILY_BETS = 'daily_bets',
  SESSION_DURATION = 'session_duration',
  ANALYTICS_RETENTION = 'analytics_retention',
  EXPORT_FORMATS = 'export_formats'
}

export interface PackageLimitCheck {
  readonly isWithinLimit: boolean
  readonly currentUsage: number
  readonly limit: number
  readonly limitType: PackageLimitType
}

export class PermissionServiceError extends Error {
  constructor(
    message: string,
    public readonly code: PermissionServiceErrorCode,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'PermissionServiceError'
  }
}

export enum PermissionServiceErrorCode {
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  PACKAGE_NOT_FOUND = 'PACKAGE_NOT_FOUND',
  PERMISSION_NOT_FOUND = 'PERMISSION_NOT_FOUND',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  INVALID_PACKAGE_CONFIG = 'INVALID_PACKAGE_CONFIG',
  ASSIGNMENT_FAILED = 'ASSIGNMENT_FAILED',
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Domain Events related to permissions
export interface PermissionDomainEvent {
  readonly eventType: string
  readonly userId?: UserId
  readonly timestamp: Date
}

export interface PermissionGrantedEvent extends PermissionDomainEvent {
  readonly eventType: 'PermissionGranted'
  readonly userId: UserId
  readonly permissionId: string
  readonly packageId: PackageId
}

export interface PermissionRevokedEvent extends PermissionDomainEvent {
  readonly eventType: 'PermissionRevoked'
  readonly userId: UserId
  readonly permissionId: string
  readonly packageId: PackageId
}

export interface PackageAssignedEvent extends PermissionDomainEvent {
  readonly eventType: 'PackageAssigned'
  readonly userId: UserId
  readonly packageId: PackageId
  readonly assignedBy?: UserId
}

export interface PackageRemovedEvent extends PermissionDomainEvent {
  readonly eventType: 'PackageRemoved'
  readonly userId: UserId
  readonly packageId: PackageId
  readonly removedBy?: UserId
}

export interface PackageLimitExceededEvent extends PermissionDomainEvent {
  readonly eventType: 'PackageLimitExceeded'
  readonly userId: UserId
  readonly limitType: PackageLimitType
  readonly currentUsage: number
  readonly limit: number
}