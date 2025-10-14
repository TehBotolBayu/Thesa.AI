import { updateSession } from "./lib/supabase/middleware.js";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function middleware(request) { 
  // Keep session in sync with Supabase
  const response = await updateSession(request);

  // Create a Supabase client using the cookies from the request
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      global: { headers: { Authorization: request.headers.get("Authorization") } },
    }
  );

  // Get the current user
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  const { pathname } = request.nextUrl;

  // Define routes restricted to unauthenticated users
  const unauthenticatedOnly = ["/", "/login", "/register"];

  // If user is logged in and tries to access unauth-only route → redirect
  if (user && unauthenticatedOnly.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Otherwise, continue
  return response;
}

export const config = {
  matcher: [
    /*
      This applies middleware to all routes *except* static assets and API routes.
      That way, it still runs for /, /login, /register, etc.
    */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)",
  ],
};
