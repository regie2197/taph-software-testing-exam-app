import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  try {
    const {
      data: { session },
      error
    } = await supabase.auth.getSession()

    // Handle auth errors (like invalid refresh token)
    if (error) {
      console.error('Auth error in middleware:', error.message)
      
      // If there's an auth error and user is trying to access protected routes,
      // redirect to login with an error message
      if (req.nextUrl.pathname.startsWith('/dashboard')) {
        const loginUrl = new URL('/login', req.url)
        loginUrl.searchParams.set('error', 'session_expired')
        loginUrl.searchParams.set('redirect', req.nextUrl.pathname)
        
        // Create a new response to clear cookies
        const redirectRes = NextResponse.redirect(loginUrl)
        
        // Clear the supabase-auth-token cookie to prevent future issues
        redirectRes.cookies.delete('sb-refresh-token')
        redirectRes.cookies.delete('sb-access-token')
        
        return redirectRes
      }
    }

    // If no session and trying to access protected routes
    if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
      const redirectUrl = new URL('/login', req.url)
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is logged in and trying to access auth pages
    if (session && (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register'))) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
  } catch (err) {
    console.error('Middleware error:', err)
    
    // For any unexpected errors, clear auth state and redirect to login
    if (req.nextUrl.pathname.startsWith('/dashboard')) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('error', 'auth_error')
      
      const redirectRes = NextResponse.redirect(loginUrl)
      
      // Clear auth cookies
      redirectRes.cookies.delete('sb-refresh-token')
      redirectRes.cookies.delete('sb-access-token')
      
      return redirectRes
    }
    
    return res
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
}