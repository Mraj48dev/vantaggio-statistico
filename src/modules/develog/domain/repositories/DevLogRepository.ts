/**
 * DevLog Repository Interface - Development Log Domain
 *
 * Repository interface for managing development logs.
 */

import { Result } from '@/shared/domain/types/common'
import { DevLog } from '../entities/DevLog'

export interface DevLogRepository {
  save(devLog: DevLog): Promise<Result<DevLog, Error>>

  findById(id: string): Promise<Result<DevLog | null, Error>>

  findAll(options?: {
    limit?: number
    offset?: number
    environment?: string
    orderBy?: 'deployTime' | 'createdAt'
    order?: 'asc' | 'desc'
  }): Promise<Result<DevLog[], Error>>

  findLatest(limit?: number): Promise<Result<DevLog[], Error>>

  findByEnvironment(environment: string): Promise<Result<DevLog[], Error>>

  count(): Promise<Result<number, Error>>
}