import { NextResponse } from "next/server";

export function middleware(request) {
  // Get the user cookie
  const userToken = request.cookies.get("user")?.value;

  // Redirect to login if no token is found
  if (!userToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  // Allow the request to proceed if token exists
  return NextResponse.next();
}

// Apply middleware to the /dashboard route and related API endpoints
export const config = {
  matcher: [
    "/dashboard/:path*", // Matches /dashboard and its subroutes
    "/api/sem/:path*", // Matches /api/sem and its subroutes
    "/api/data/:path*", // Matches /api/data and its subroutes
  ],
};
