import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const { pathname } = new URL(req.url);

  if (pathname.startsWith("/profile")) {
    if (!token) {
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
  }

  if (pathname.startsWith("/admin")) {
    if (!token || (token as any).role !== "admin") {
      const url = new URL("/", req.url);
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/profile", "/admin/:path*"],
};


