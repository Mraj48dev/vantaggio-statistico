/**
 * Middleware - Next.js Middleware with Clerk Auth
 *
 * This middleware runs on every request and handles:
 * - Authentication via Clerk
 * - Route protection
 * - User sync with database
 */

import { authMiddleware } from '@clerk/nextjs'

export default authMiddleware({
  // Routes that don't require authentication
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks/(.*)',
    '/api/health',
  ],

  // Routes that are always accessible, even when signed out
  ignoredRoutes: [
    '/api/health',
    '/_next/(.*)',
    '/favicon.ico',
    '/site.webmanifest',
  ],

  // After authentication, redirect users here
  afterAuth(auth, req) {
    // If user is signed in and on a public route, redirect to dashboard
    if (auth.userId && req.nextUrl.pathname === '/') {
      const dashboardUrl = new URL('/dashboard', req.url)
      return Response.redirect(dashboardUrl)
    }

    // If user is not signed in and trying to access protected route
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url)
      signInUrl.searchParams.set('redirect_url', req.url)
      return Response.redirect(signInUrl)
    }

    // Allow the request to proceed
    return null
  },
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}