import { NextResponse } from 'next/server'

export async function GET() {
  const buildInfo = {
    buildTime: process.env.BUILD_TIME || new Date().toISOString(),
    commitHash: process.env.VERCEL_GIT_COMMIT_SHA || 'local-dev',
    deployTime: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    vercelUrl: process.env.VERCEL_URL,
    lastUpdate: '2025-10-21T15:30:00.000Z - Deploy Widget Added'
  }

  return NextResponse.json(buildInfo)
}