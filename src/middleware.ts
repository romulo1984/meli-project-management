import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { CLERK_AUTH_ENABLED } from '@/config/features'

// Legacy Clerk route matcher — preserved for when CLERK_AUTH_ENABLED is restored.
const isProtectedRoute = createRouteMatcher(['/new'])

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  // Anonymous mode: no routes are auth-gated and nothing goes through Clerk.
  if (!CLERK_AUTH_ENABLED) {
    return NextResponse.next()
  }

  // Clerk is built lazily so it is never invoked while auth is disabled.
  const handler = clerkMiddleware((auth, request) => {
    if (isProtectedRoute(request)) auth().protect()
  })
  return handler(req, event)
}

export const config = {
  matcher: ['/new', '/(api|trpc)(.*)'],
}
