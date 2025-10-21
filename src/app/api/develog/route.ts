/**
 * DevLog API Route - Development Log Management
 *
 * API endpoints for creating and retrieving development logs.
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/shared/infrastructure/database/prisma'
import { DevLogContainer } from '@/modules/develog'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { commitHash, buildTime, version, environment, vercelUrl, description } = body

    if (!commitHash || !buildTime || !version || !environment || !description) {
      return NextResponse.json(
        { error: 'Missing required fields: commitHash, buildTime, version, environment, description' },
        { status: 400 }
      )
    }

    // Initialize DevLog container
    const devLogContainer = DevLogContainer.getInstance(prisma)
    const createDevLogUseCase = devLogContainer.getCreateDevLogUseCase()

    // Execute use case
    const result = await createDevLogUseCase.execute({
      commitHash,
      buildTime,
      version,
      environment,
      vercelUrl,
      description
    })

    if (!result.isSuccess) {
      console.error('Failed to create dev log:', result.error)
      return NextResponse.json(
        { error: 'Failed to create dev log' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      devLog: {
        id: result.value.devLog.id,
        commitHash: result.value.devLog.commitHash,
        deployTime: result.value.devLog.deployTime.toISOString(),
        buildTime: result.value.devLog.buildTime,
        version: result.value.devLog.version,
        environment: result.value.devLog.environment,
        vercelUrl: result.value.devLog.vercelUrl,
        description: result.value.devLog.description
      }
    })

  } catch (error) {
    console.error('DevLog API POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const environment = searchParams.get('environment') || undefined
    const orderBy = (searchParams.get('orderBy') as 'deployTime' | 'createdAt') || 'deployTime'
    const order = (searchParams.get('order') as 'asc' | 'desc') || 'desc'

    // Initialize DevLog container
    const devLogContainer = DevLogContainer.getInstance(prisma)
    const getDevLogsUseCase = devLogContainer.getGetDevLogsUseCase()

    // Execute use case
    const result = await getDevLogsUseCase.execute({
      limit,
      offset,
      environment,
      orderBy,
      order
    })

    if (!result.isSuccess) {
      console.error('Failed to get dev logs:', result.error)
      return NextResponse.json(
        { error: 'Failed to retrieve dev logs' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      devLogs: result.value.devLogs.map(devLog => ({
        id: devLog.id,
        commitHash: devLog.commitHash,
        shortCommitHash: devLog.shortCommitHash,
        deployTime: devLog.deployTime.toISOString(),
        formattedDeployTime: devLog.formattedDeployTime,
        buildTime: devLog.buildTime,
        version: devLog.version,
        environment: devLog.environment,
        vercelUrl: devLog.vercelUrl,
        description: devLog.description,
        isProduction: devLog.isProduction,
        isRecent: devLog.isRecent(),
        createdAt: devLog.createdAt.toISOString()
      })),
      totalCount: result.value.totalCount,
      pagination: {
        limit,
        offset,
        hasMore: offset + limit < result.value.totalCount
      }
    })

  } catch (error) {
    console.error('DevLog API GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}