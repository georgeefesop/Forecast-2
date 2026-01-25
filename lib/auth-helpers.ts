import { auth } from "@/app/api/auth/[...nextauth]/route";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import { db } from "@/lib/db/client";

/**
 * Get the current session in API routes (NextAuth v5 compatible)
 * Tries auth() first, then falls back to reading JWT token from request cookies
 */
export async function getSession(request?: NextRequest) {
  try {
    // Try auth() first (should work in NextAuth v5)
    let session = await auth();
    
    // If auth() doesn't work and we have a request, try reading token from cookies
    if (!session && request) {
      try {
        const cookieHeader = request.headers.get('cookie') || '';
        
        if (cookieHeader) {
          const token = await getToken({
            req: {
              headers: {
                cookie: cookieHeader,
              },
            } as any,
            secret: process.env.NEXTAUTH_SECRET,
          });

          if (token && token.id) {
            // Fetch user profile to build session
            const profile = await db.query(
              "SELECT user_id, email, handle, avatar_url, is_admin, is_organizer FROM profiles WHERE user_id = $1",
              [token.id as string]
            );

            if (profile.rows.length > 0) {
              const user = profile.rows[0];
              session = {
                user: {
                  id: user.user_id,
                  email: user.email,
                  handle: user.handle,
                  avatarUrl: user.avatar_url,
                  isAdmin: user.is_admin,
                  isOrganizer: user.is_organizer,
                },
                expires: token.exp ? new Date(token.exp * 1000).toISOString() : new Date().toISOString(),
              } as any;
            }
          }
        }
      } catch (cookieError) {
        console.log("Could not read token from cookies:", cookieError);
      }
    }
    
    return session;
  } catch (error) {
    console.error("getSession error:", error);
    return null;
  }
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}
