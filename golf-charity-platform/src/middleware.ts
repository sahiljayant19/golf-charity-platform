import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('sb-access-token')?.value

  // Protected routes
  const protectedPaths = ['/dashboard', '/profile', '/scores', '/admin']
  const adminPaths = ['/admin']

  const { pathname } = req.nextUrl

  // Check if the path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isAdminPath = adminPaths.some(path => pathname.startsWith(path))

  if (isProtectedPath && !token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isAdminPath && token) {
    // Get user from token
    const { data: { user } } = await supabase.auth.getUser(token)
    
    if (user) {
      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/profile/:path*', '/scores/:path*', '/admin/:path*'],
}
