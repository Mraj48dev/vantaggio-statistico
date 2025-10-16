/**
 * Auth Module - Infrastructure Layer Exports
 *
 * This file exports all the infrastructure layer components for the Auth module.
 * These are the adapters that connect our domain to external services.
 */

// Adapters
export * from './adapters/ClerkAuthAdapter'

// Repositories
export * from './repositories/PrismaUserRepository'