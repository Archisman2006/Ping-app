import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt';
export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET 
    });
    const url = request.nextUrl;

    // Logged-in user without a username → must finish onboarding
    if (token && !token.username) {
        // Allow access to finish-onboarding and API routes
        if (
            url.pathname.startsWith('/finish-onboarding') ||
            url.pathname.startsWith('/api/')
        ) {
            return NextResponse.next();
        }
        // Redirect everywhere else to finish-onboarding
        return NextResponse.redirect(new URL('/finish-onboarding', request.url));
    }

    // Logged-in user with a username trying to access finish-onboarding → dashboard
    if (token && token.username && url.pathname.startsWith('/finish-onboarding')) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // redirect logged in users to dashboard.
    if (
        token &&
        (url.pathname.startsWith('/sign-in') ||
        url.pathname.startsWith('/sign-up') ||
        url.pathname.startsWith('/verify') ||
        url.pathname.startsWith('/forgot-password') ||
        url.pathname.startsWith('/reset-password') ||
        url.pathname === '/')
    ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (!token && url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    if (!token && url.pathname.startsWith('/finish-onboarding')) {
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/sign-in',
        '/sign-up',
        '/',
        '/dashboard/:path*',
        '/verify/:path*',
        '/forgot-password',
        '/reset-password',
        '/finish-onboarding'
    ]
}