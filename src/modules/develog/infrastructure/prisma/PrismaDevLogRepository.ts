/**
 * Prisma DevLog Repository Implementation - DevLog Module Infrastructure
 *
 * Prisma implementation of the DevLog repository interface.
 */

import { PrismaClient } from '@prisma/client'
import { Result } from '@/shared/domain/types/common'
import { DevLog } from '../../domain/entities/DevLog'
import { DevLogRepository } from '../../domain/repositories/DevLogRepository'

export class PrismaDevLogRepository implements DevLogRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(devLog: DevLog): Promise<Result<DevLog, Error>> {
    try {
      const data = devLog.toPersistence()

      const saved = await this.prisma.devLog.create({
        data: {
          id: data.id,
          commitHash: data.commitHash,
          deployTime: data.deployTime,
          buildTime: data.buildTime,
          version: data.version,
          environment: data.environment,
          vercelUrl: data.vercelUrl,
          description: data.description,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        }
      })

      return Result.success(DevLog.fromPersistence({
        id: saved.id,
        commitHash: saved.commitHash,
        deployTime: saved.deployTime,
        buildTime: saved.buildTime,
        version: saved.version,
        environment: saved.environment,
        vercelUrl: saved.vercelUrl || undefined,
        description: saved.description,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      }))

    } catch (error) {
      return Result.failure(error as Error)
    }
  }

  async findById(id: string): Promise<Result<DevLog | null, Error>> {
    try {
      const found = await this.prisma.devLog.findUnique({
        where: { id }
      })

      if (!found) {
        return Result.success(null)
      }

      return Result.success(DevLog.fromPersistence({
        id: found.id,
        commitHash: found.commitHash,
        deployTime: found.deployTime,
        buildTime: found.buildTime,
        version: found.version,
        environment: found.environment,
        vercelUrl: found.vercelUrl || undefined,
        description: found.description,
        createdAt: found.createdAt,
        updatedAt: found.updatedAt,
      }))

    } catch (error) {
      return Result.failure(error as Error)
    }
  }

  async findAll(options?: {
    limit?: number
    offset?: number
    environment?: string
    orderBy?: 'deployTime' | 'createdAt'
    order?: 'asc' | 'desc'
  }): Promise<Result<DevLog[], Error>> {
    try {
      const {
        limit = 50,
        offset = 0,
        environment,
        orderBy = 'deployTime',
        order = 'desc'
      } = options || {}

      const where = environment ? { environment } : undefined

      const found = await this.prisma.devLog.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: {
          [orderBy]: order
        }
      })

      const devLogs = found.map(item => DevLog.fromPersistence({
        id: item.id,
        commitHash: item.commitHash,
        deployTime: item.deployTime,
        buildTime: item.buildTime,
        version: item.version,
        environment: item.environment,
        vercelUrl: item.vercelUrl || undefined,
        description: item.description,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }))

      return Result.success(devLogs)

    } catch (error) {
      return Result.failure(error as Error)
    }
  }

  async findLatest(limit = 10): Promise<Result<DevLog[], Error>> {
    return this.findAll({
      limit,
      orderBy: 'deployTime',
      order: 'desc'
    })
  }

  async findByEnvironment(environment: string): Promise<Result<DevLog[], Error>> {
    return this.findAll({
      environment,
      orderBy: 'deployTime',
      order: 'desc'
    })
  }

  async count(): Promise<Result<number, Error>> {
    try {
      const count = await this.prisma.devLog.count()
      return Result.success(count)
    } catch (error) {
      return Result.failure(error as Error)
    }
  }
}