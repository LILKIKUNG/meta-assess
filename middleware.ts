import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Create an unmodified response for the initial client creation to bind cookies to
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    // KEY FIX: We must call getUser() to validate the session and refresh cookies if needed
    const { data: { user } } = await supabase.auth.getUser()

    const path = request.nextUrl.pathname

    // Protected Routes
    if (path.startsWith('/dashboard')) {
        if (!user) {
            console.log("Middleware: No session found for /dashboard, redirecting to login")
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Auth Routes (redirect if already logged in)
    if (path.startsWith('/login')) {
        if (user) {
            console.log("Middleware: valid session found for /login, redirecting to dashboard")
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
