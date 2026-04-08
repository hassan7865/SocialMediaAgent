import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = [
  "/company",
  "/brand-voice",
  "/platforms",
  "/posts",
  "/calendar",
  "/approval-workflow",
  "/approval-queue",
  "/analytics",
];

export function proxy(request: NextRequest) {
  const accessToken = request.cookies.get("access_token");
  const isProtected = protectedPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isProtected && !accessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/company/:path*", "/brand-voice/:path*", "/platforms/:path*", "/posts/:path*", "/calendar/:path*", "/approval-workflow/:path*", "/approval-queue/:path*", "/analytics/:path*"],
};
