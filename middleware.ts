import { NextRequest, NextResponse } from 'next/server'
import { isMaintenanceMode } from '@/lib/settings'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip maintenance check for admin routes, API routes, and static files
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/maintenance'
  ) {
    return NextResponse.next()
  }

  // Check if maintenance mode is enabled
  try {
    const maintenanceEnabled = await isMaintenanceMode()
    
    if (maintenanceEnabled) {
      // Redirect to maintenance page
      return NextResponse.redirect(new URL('/maintenance', request.url))
    }
  } catch (error) {
    console.error('Middleware error checking maintenance mode:', error)
    // Continue normally if there's an error checking maintenance mode
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 