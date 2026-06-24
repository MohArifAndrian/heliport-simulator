import { NextResponse } from "next/server";
import { DOSEN_COOKIE } from "@/lib/dosenAuth";
import { verifyDosenSession } from "@/lib/verifyDosenSession";

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/dosen/login") {
    const token = request.cookies.get(DOSEN_COOKIE)?.value;
    if (await verifyDosenSession(token)) {
      return NextResponse.redirect(new URL("/dosen", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dosen")) {
    const token = request.cookies.get(DOSEN_COOKIE)?.value;
    const session = await verifyDosenSession(token);
    if (!session) {
      return NextResponse.redirect(new URL("/dosen/login", request.url));
    }

    if (pathname.startsWith("/dosen/admin") && session.role !== "admin") {
      return NextResponse.redirect(new URL("/dosen", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dosen/:path*"],
};
