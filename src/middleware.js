import { updateSession } from "./lib/supabase/middleware.js";

export async function middleware(request) {
  // update user's auth session
  // console.log("middleware hit");
  return await updateSession(request);
}

export const config = {
  matcher: [
    // "/((?!_next/static|_next/image|favicon.ico|login|register|survey|$|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$)(?=.*dashboard|.*myforms).*)",
    "/((?!_next/static|_next/image|favicon.ico|login|register|^$|$|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
