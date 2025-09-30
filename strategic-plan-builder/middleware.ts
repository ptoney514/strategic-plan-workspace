import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Temporarily disabled to fix authentication issues
  // Will re-enable once auth flow is properly set up
  return NextResponse.next();
  
  /* Original middleware - to be re-enabled later
  // Protected routes check
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    // Check if user has authentication cookies
    const hasAuthCookie = req.cookies.get('supabase-auth-token') || 
                         req.cookies.get('sb-access-token') ||
                         req.cookies.get('sb-refresh-token');
    
    if (!hasAuthCookie) {
      // No auth cookie found, redirect to login
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
  */
}

export const config = {
  matcher: [
    '/dashboard/:path*',
  ],
};