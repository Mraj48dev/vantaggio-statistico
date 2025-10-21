/**
 * DevLog Module Container - Dependency Injection Container
 *
 * Provides configured instances of DevLog module components.
 */

import { PrismaClient } from '@prisma/client'
import { PrismaDevLogRepository } from './infrastructure/prisma/PrismaDevLogRepository'
import { DefaultCreateDevLogUseCase, CreateDevLogUseCase } from './application/use-cases/CreateDevLogUseCase'
import { DefaultGetDevLogsUseCase, GetDevLogsUseCase } from './application/use-cases/GetDevLogsUseCase'
import { DevLogRepository } from './domain/repositories/DevLogRepository'

export class DevLogContainer {
  private static instance: DevLogContainer | null = null
  private devLogRepository: DevLogRepository | null = null
  private createDevLogUseCase: CreateDevLogUseCase | null = null
  private getDevLogsUseCase: GetDevLogsUseCase | null = null

  private constructor(private readonly prisma: PrismaClient) {}

  static getInstance(prisma: PrismaClient): DevLogContainer {
    if (!DevLogContainer.instance) {
      DevLogContainer.instance = new DevLogContainer(prisma)
    }
    return DevLogContainer.instance
  }

  getDevLogRepository(): DevLogRepository {
    if (!this.devLogRepository) {
      this.devLogRepository = new PrismaDevLogRepository(this.prisma)
    }
    return this.devLogRepository
  }

  getCreateDevLogUseCase(): CreateDevLogUseCase {
    if (!this.createDevLogUseCase) {
      this.createDevLogUseCase = new DefaultCreateDevLogUseCase(
        this.getDevLogRepository()
      )
    }
    return this.createDevLogUseCase
  }

  getGetDevLogsUseCase(): GetDevLogsUseCase {
    if (!this.getDevLogsUseCase) {
      this.getDevLogsUseCase = new DefaultGetDevLogsUseCase(
        this.getDevLogRepository()
      )
    }
    return this.getDevLogsUseCase
  }
}

// Export types for external use
export type { DevLog } from './domain/entities/DevLog'
export type { CreateDevLogRequest, CreateDevLogResponse } from './application/use-cases/CreateDevLogUseCase'
export type { GetDevLogsRequest, GetDevLogsResponse } from './application/use-cases/GetDevLogsUseCase'