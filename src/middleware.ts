import { NextRequest, NextResponse } from 'next/server'
import { verifyTokenForMiddleware, canAccessAdminPanelRole, hasRolePermission } from '@/lib/middleware-auth'

// Define protected routes with required roles
const routePermissions = {
  '/admin': ['ADMIN', 'MANAGER', 'EMPLOYEE'], // Admin panel access
  '/admin/users': ['ADMIN'], // User management (Admin only)
  '/admin/cost-analysis': ['ADMIN', 'MANAGER'], // Financial reports (Admin & Manager)
  '/admin/purchases': ['ADMIN', 'MANAGER'], // Purchase management (Admin & Manager)
  '/admin/gardens': ['ADMIN', 'MANAGER'], // Garden management (Admin & Manager)
  '/admin/import': ['ADMIN', 'MANAGER'], // Data import (Admin & Manager)
}

const adminRoutes = ['/admin']
const protectedRoutes = [...adminRoutes]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log('Middleware checking path:', pathname)

  // Skip middleware for login page and test pages
  if (pathname === '/admin/login' || pathname.startsWith('/test-')) {
    console.log('Skipping middleware for:', pathname)
    return NextResponse.next()
  }

  // Check if the route needs protection
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  console.log('Is protected route:', isProtectedRoute)

  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Get token from cookie
  const token = request.cookies.get('token')?.value

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verify token
    console.log('Verifying token:', token)
    const tokenPayload = await verifyTokenForMiddleware(token)
    console.log('Token payload:', tokenPayload)

    if (!tokenPayload) {
      console.log('Token verification failed - redirecting to login')
      // Invalid token, redirect to login
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const response = NextResponse.redirect(loginUrl)
      
      // Clear invalid token
      response.cookies.set({
        name: 'token',
        value: '',
        httpOnly: true,
        maxAge: 0,
        path: '/'
      })
      
      return response
    }

    console.log('Token valid - user:', tokenPayload.email, 'role:', tokenPayload.role)

    // Check specific route permissions
    const matchedRoute = Object.keys(routePermissions).find(route => 
      pathname.startsWith(route)
    )
    
    if (matchedRoute) {
      const allowedRoles = routePermissions[matchedRoute as keyof typeof routePermissions]
      if (!hasRolePermission(tokenPayload.role, allowedRoles)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }
    
    // Check general admin panel access
    if (adminRoutes.some(route => pathname.startsWith(route))) {
      if (!canAccessAdminPanelRole(tokenPayload.role)) {
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    // Add user info to request headers (optional)
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', tokenPayload.userId)
    requestHeaders.set('x-user-role', tokenPayload.role)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })

  } catch (error) {
    console.error('Middleware error:', error)
    console.log('Token that failed:', token)
    
    // On error, redirect to login
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    const response = NextResponse.redirect(loginUrl)
    
    // Clear token on error
    response.cookies.set({
      name: 'token',
      value: '',
      httpOnly: true,
      maxAge: 0,
      path: '/'
    })
    
    return response
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/admin/:path*',
    // Add other protected routes here
  ]
}