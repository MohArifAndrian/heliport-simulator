import { NextResponse } from "next/server";
import { DOSEN_COOKIE } from "@/lib/dosenAuth";
import { verifyDosenSession } from "@/lib/verifyDosenSession";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/login" || pathname === "/dosen/login") {
    const token = request.cookies.get(DOSEN_COOKIE)?.value;
    if (await verifyDosenSession(token)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (pathname === "/dosen/login") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dosen")) {
    const next = pathname.replace(/^\/dosen/, "/dashboard");
    return NextResponse.redirect(new URL(`${next}${request.nextUrl.search}`, request.url));
  }

  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get(DOSEN_COOKIE)?.value;
    const session = await verifyDosenSession(token);
    if (!session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (pathname.startsWith("/dashboard/admin") && session.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/dosen/:path*", "/login"],
};
