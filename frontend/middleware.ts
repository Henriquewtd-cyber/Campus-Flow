import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

type JWTPayload = {
    sub: string;
    role: "admin" | "user";
};

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    const publicRoutes = [
        "/",
        "/_next",
        "/favicon.ico",
        "/login",
        "/eventos",
        "/slides",
    ];

    if (publicRoutes.some(route => pathname.startsWith(route))) {
        return NextResponse.next();
    }

    const token = request.cookies.get("session")?.value;

    if (!token) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const { payload } = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.SECRET_KEY!)
        );

        const role = (payload as JWTPayload).role;

        const adminRoutes = [
            "/add_evento",
            "/edit_evento",
            "/admin",
        ];

        const isAdminRoute = adminRoutes.some(route =>
            pathname.startsWith(route)
        );

        if (isAdminRoute && role !== "admin") {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL("/login", request.url));
    }
}