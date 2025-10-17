/**
 * Health Check API Endpoint
 *
 * Verifies that all cloud environment variables and services are working
 * URL: /api/health
 */

import { NextResponse } from 'next/server'
import { authContainer } from '@/modules/auth/infrastructure/di/AuthContainer'

export async function GET() {
  try {
    console.log('🔍 Health check started...')

    // Check environment variables
    const envCheck = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      CLERK_PUBLISHABLE_KEY: !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
      CLERK_SECRET_KEY: !!process.env.CLERK_SECRET_KEY,
      APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET
    }

    console.log('Environment variables:', envCheck)

    // Check Auth Module health
    const authHealth = await authContainer().healthCheck()
    console.log('Auth module health:', authHealth)

    // Overall status
    const allEnvVarsPresent = Object.values(envCheck).every(Boolean)
    const authHealthy = authHealth.status === 'healthy'
    const isHealthy = allEnvVarsPresent && authHealthy

    const response = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || 'development',
      url: process.env.NEXT_PUBLIC_APP_URL,
      checks: {
        environmentVariables: {
          status: allEnvVarsPresent ? 'healthy' : 'unhealthy',
          details: envCheck
        },
        authModule: authHealth,
        database: {
          status: authHealth.components.database ? 'healthy' : 'unhealthy',
          connection: authHealth.components.database
        }
      }
    }

    console.log('Health check completed:', response)

    return NextResponse.json(response, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })

  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.VERCEL_ENV || 'development'
    }, {
      status: 503,
      headers: {
        'Cache-Control': 'no-store, max-age=0'
      }
    })
  }
}