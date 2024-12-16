import { NextResponse } from "next/server";

export function middleware(req) {
  const isAuthenticated = req.cookies.get("isAuthenticated") === "true";

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}
