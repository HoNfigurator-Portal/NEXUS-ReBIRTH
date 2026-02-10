import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const publicPaths = ["/", "/login", "/verify", "/pending-verification", "/api/auth", "/api/verify", "/api/register", "/api/check-account-name", "/api/resend-verification"];

export default auth((request) => {
    const { pathname } = request.nextUrl;

    // Redirect Authenticated Users Away From Login Page
    if (pathname === "/login" && request.auth?.user) {
        if (!request.auth.user.userID) {
            return NextResponse.redirect(new URL("/register", request.url));
        }
        if (!request.auth.user.isVerified) {
            return NextResponse.redirect(new URL("/pending-verification", request.url));
        }
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Allow Public Paths And Static Assets
    const isPublicPath = publicPaths.some((path) =>
        pathname === path || pathname.startsWith(`${path}/`)
    );

    if (isPublicPath) {
        return NextResponse.next();
    }

    // Redirect Unauthenticated Users To Login
    if (!request.auth) {
        const loginURL = new URL("/login", request.url);
        loginURL.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginURL);
    }

    // Redirect Authenticated But Unregistered Users To Registration
    // (Users Who Signed In With Discord But Have Not Yet Created A Game Account)
    if (!request.auth.user.userID && pathname !== "/register") {
        return NextResponse.redirect(new URL("/register", request.url));
    }

    // Redirect Registered But Unverified Users To Pending Verification
    // (Users Who Registered But Have Not Yet Clicked The Discord DM Verification Link)
    if (request.auth.user.userID && !request.auth.user.isVerified && pathname !== "/pending-verification") {
        return NextResponse.redirect(new URL("/pending-verification", request.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
