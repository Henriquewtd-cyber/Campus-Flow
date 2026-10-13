import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCurrentUser } from "./app/utils";


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

    const isPublicRoute =
        pathname === "/" ||
        publicRoutes
            .filter(route => route !== "/")
            .some(route =>
                pathname === route || pathname.startsWith(`${route}/`)
            );

    if (isPublicRoute) {
        return NextResponse.next();
    }

    try {
        const user = await getCurrentUser();

        console.log("Role do usuário:", user);

        if (!user) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        if (!user.role) {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        const adminRoutes = [
            "/add_evento",
            "/edit_evento",
            "/admin",
        ];

        const isAdminRoute = adminRoutes.some(route =>
            pathname.startsWith(route)
        );

        if (isAdminRoute && user.role !== "admin") {
            return NextResponse.redirect(new URL("/login", request.url));
        }

        return NextResponse.next();
    } catch {
        return NextResponse.redirect(new URL("/login", request.url));
    }
}