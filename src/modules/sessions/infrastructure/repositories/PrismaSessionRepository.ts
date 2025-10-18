/**
 * Prisma Session Repository - Sessions Module Infrastructure Layer
 *
 * Implements the SessionRepository interface using Prisma ORM.
 */

import { PrismaClient } from '@prisma/client'
import { Result } from '@/shared/domain/types/common'
import {
  Session,
  SessionId,
  SessionStatus,
  SessionConfig,
  Bet,
  BetOutcome,
  createSessionId,
  createBetId
} from '../../domain/entities/Session'
import { SessionRepository, SessionRepositoryError, SessionRepositoryErrorCode } from '../../domain/repositories/SessionRepository'

export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: SessionId): Promise<Result<Session | null, SessionRepositoryError>> {
    try {
      const sessionData = await this.prisma.session.findUnique({
        where: { id: id.value },
        include: {
          bets: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })

      if (!sessionData) {
        return Result.success(null)
      }

      const session = this.mapToSession(sessionData)
      return Result.success(session)
    } catch (error) {
      return Result.failure(new SessionRepositoryError(
        `Failed to find session by ID: ${id.value}`,
        SessionRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async findActiveByUserId(userId: string): Promise<Result<Session[], SessionRepositoryError>> {
    try {
      const sessionsData = await this.prisma.session.findMany({
        where: {
          userId,
          status: 'ACTIVE'
        },
        include: {
          bets: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { startedAt: 'desc' }
      })

      const sessions = sessionsData.map(data => this.mapToSession(data))
      return Result.success(sessions)
    } catch (error) {
      return Result.failure(new SessionRepositoryError(
        `Failed to find active sessions for user: ${userId}`,
        SessionRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async findByUserId(
    userId: string,
    options?: {
      status?: SessionStatus
      limit?: number
      offset?: number
      orderBy?: 'createdAt' | 'updatedAt'
      order?: 'asc' | 'desc'
    }
  ): Promise<Result<Session[], SessionRepositoryError>> {
    try {
      const {
        status,
        limit = 50,
        offset = 0,
        orderBy = 'createdAt',
        order = 'desc'
      } = options || {}

      const where: any = { userId }
      if (status) {
        where.status = this.mapSessionStatusToPrisma(status)
      }

      const orderByField = orderBy === 'createdAt' ? 'startedAt' : 'updatedAt'

      const sessionsData = await this.prisma.session.findMany({
        where,
        include: {
          bets: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { [orderByField]: order },
        take: limit,
        skip: offset
      })

      const sessions = sessionsData.map(data => this.mapToSession(data))
      return Result.success(sessions)
    } catch (error) {
      return Result.failure(new SessionRepositoryError(
        `Failed to find sessions for user: ${userId}`,
        SessionRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async save(session: Session): Promise<Result<Session, SessionRepositoryError>> {
    try {
      const sessionData = await this.prisma.session.create({
        data: {
          id: session.id.value,
          userId: session.userId,
          gameTypeId: session.gameTypeId,
          methodId: session.methodId,
          config: session.config as any,
          progression: session.currentProgression,
          status: this.mapSessionStatusToPrisma(session.status),
          startedAt: session.startedAt,
          endedAt: session.endedAt,
          pausedAt: session.pausedAt,
          totalBets: session.totalBets,
          totalWins: session.totalWins,
          totalLosses: session.totalLosses,
          profitLoss: session.profitLoss,
          highWatermark: session.highWatermark,
          lowWatermark: session.lowWatermark
        },
        include: {
          bets: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })

      const savedSession = this.mapToSession(sessionData)
      return Result.success(savedSession)
    } catch (error) {
      // Check for unique constraint violations
      if (error instanceof Error && 'code' in error && error.code === 'P2002') {
        return Result.failure(new SessionRepositoryError(
          'Session with this ID already exists',
          SessionRepositoryErrorCode.DUPLICATE_SESSION,
          error
        ))
      }

      return Result.failure(new SessionRepositoryError(
        'Failed to save session',
        SessionRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async update(session: Session): Promise<Result<Session, SessionRepositoryError>> {
    try {
      // Update session data
      const sessionData = await this.prisma.session.update({
        where: { id: session.id.value },
        data: {
          config: session.config as any,
          progression: session.currentProgression,
          status: this.mapSessionStatusToPrisma(session.status),
          endedAt: session.endedAt,
          pausedAt: session.pausedAt,
          totalBets: session.totalBets,
          totalWins: session.totalWins,
          totalLosses: session.totalLosses,
          profitLoss: session.profitLoss,
          highWatermark: session.highWatermark,
          lowWatermark: session.lowWatermark,
          updatedAt: new Date()
        }
      })

      // Handle bets - for simplicity, we'll recreate them
      // In a real implementation, you might want to only add new bets
      if (session.bets.length > 0) {
        // Delete existing bets
        await this.prisma.bet.deleteMany({
          where: { sessionId: session.id.value }
        })

        // Create new bets
        const betData = session.bets.map(bet => ({
          id: bet.id.value,
          sessionId: session.id.value,
          betType: bet.betType,
          betValue: bet.betValue,
          amount: bet.amount,
          result: bet.outcome ? this.mapBetOutcomeToPrisma(bet.outcome) : null,
          outcome: bet.outcome || null,
          profitLoss: bet.profitLoss,
          gameResult: bet.gameResult as any,
          progression: bet.progression,
          createdAt: bet.createdAt
        }))

        await this.prisma.bet.createMany({
          data: betData
        })
      }

      // Fetch updated session with bets
      const updatedSessionData = await this.prisma.session.findUnique({
        where: { id: session.id.value },
        include: {
          bets: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })

      if (!updatedSessionData) {
        return Result.failure(new SessionRepositoryError(
          'Session not found after update',
          SessionRepositoryErrorCode.SESSION_NOT_FOUND
        ))
      }

      const updatedSession = this.mapToSession(updatedSessionData)
      return Result.success(updatedSession)
    } catch (error) {
      return Result.failure(new SessionRepositoryError(
        `Failed to update session: ${session.id.value}`,
        SessionRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async delete(id: SessionId): Promise<Result<void, SessionRepositoryError>> {
    try {
      await this.prisma.session.delete({
        where: { id: id.value }
      })

      return Result.success(undefined)
    } catch (error) {
      return Result.failure(new SessionRepositoryError(
        `Failed to delete session: ${id.value}`,
        SessionRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async exists(id: SessionId): Promise<Result<boolean, SessionRepositoryError>> {
    try {
      const count = await this.prisma.session.count({
        where: { id: id.value }
      })

      return Result.success(count > 0)
    } catch (error) {
      return Result.failure(new SessionRepositoryError(
        `Failed to check if session exists: ${id.value}`,
        SessionRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async countByUserAndStatus(userId: string, status: SessionStatus): Promise<Result<number, SessionRepositoryError>> {
    try {
      const count = await this.prisma.session.count({
        where: {
          userId,
          status: this.mapSessionStatusToPrisma(status)
        }
      })

      return Result.success(count)
    } catch (error) {
      return Result.failure(new SessionRepositoryError(
        `Failed to count sessions for user ${userId} with status ${status}`,
        SessionRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async findByGameType(gameTypeId: string, limit: number = 50): Promise<Result<Session[], SessionRepositoryError>> {
    try {
      const sessionsData = await this.prisma.session.findMany({
        where: { gameTypeId },
        include: {
          bets: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { startedAt: 'desc' },
        take: limit
      })

      const sessions = sessionsData.map(data => this.mapToSession(data))
      return Result.success(sessions)
    } catch (error) {
      return Result.failure(new SessionRepositoryError(
        `Failed to find sessions for game type: ${gameTypeId}`,
        SessionRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async findByMethod(methodId: string, limit: number = 50): Promise<Result<Session[], SessionRepositoryError>> {
    try {
      const sessionsData = await this.prisma.session.findMany({
        where: { methodId },
        include: {
          bets: {
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { startedAt: 'desc' },
        take: limit
      })

      const sessions = sessionsData.map(data => this.mapToSession(data))
      return Result.success(sessions)
    } catch (error) {
      return Result.failure(new SessionRepositoryError(
        `Failed to find sessions for method: ${methodId}`,
        SessionRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  async findSessionsToAutoEnd(): Promise<Result<Session[], SessionRepositoryError>> {
    try {
      // Find active sessions that might need auto-ending
      // This is a simplified implementation - in practice you'd check various conditions
      const sessionsData = await this.prisma.session.findMany({
        where: {
          status: 'ACTIVE'
        },
        include: {
          bets: {
            orderBy: { createdAt: 'asc' }
          }
        }
      })

      const sessions = sessionsData.map(data => this.mapToSession(data))
      const sessionsToEnd = sessions.filter(session => session.shouldAutoEnd().should)

      return Result.success(sessionsToEnd)
    } catch (error) {
      return Result.failure(new SessionRepositoryError(
        'Failed to find sessions to auto-end',
        SessionRepositoryErrorCode.DATABASE_ERROR,
        error as Error
      ))
    }
  }

  private mapToSession(data: any): Session {
    const bets = data.bets?.map((betData: any) => new Bet(
      createBetId(),
      createSessionId(),
      betData.betType,
      betData.betValue,
      betData.amount,
      betData.gameResult,
      betData.progression || [],
      betData.createdAt,
      betData.outcome as BetOutcome,
      betData.profitLoss
    )) || []

    return new Session(
      { value: data.id },
      data.userId,
      data.gameTypeId,
      data.methodId,
      data.config as SessionConfig,
      this.mapSessionStatusFromPrisma(data.status),
      data.startedAt,
      data.endedAt,
      data.pausedAt,
      data.totalBets,
      data.totalWins,
      data.totalLosses,
      data.profitLoss,
      data.highWatermark,
      data.lowWatermark,
      data.progression || [],
      bets,
      data.updatedAt
    )
  }

  private mapSessionStatusToPrisma(status: SessionStatus): string {
    switch (status) {
      case SessionStatus.ACTIVE: return 'ACTIVE'
      case SessionStatus.PAUSED: return 'PAUSED'
      case SessionStatus.ENDED: return 'ENDED'
      case SessionStatus.CANCELED: return 'CANCELED'
      default: return 'ACTIVE'
    }
  }

  private mapSessionStatusFromPrisma(status: string): SessionStatus {
    switch (status) {
      case 'ACTIVE': return SessionStatus.ACTIVE
      case 'PAUSED': return SessionStatus.PAUSED
      case 'ENDED': return SessionStatus.ENDED
      case 'CANCELED': return SessionStatus.CANCELED
      default: return SessionStatus.ACTIVE
    }
  }

  private mapBetOutcomeToPrisma(outcome: BetOutcome): string {
    switch (outcome) {
      case BetOutcome.WIN: return 'WIN'
      case BetOutcome.LOSS: return 'LOSS'
      case BetOutcome.PUSH: return 'PUSH'
      default: return 'LOSS'
    }
  }
}