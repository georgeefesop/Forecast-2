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

    if (session) {
      console.log("[getSession] auth() returned session for user:", session.user?.id);
      return session;
    }

    console.log("[getSession] auth() returned null, trying cookie fallback");

    // If auth() doesn't work and we have a request, try reading token from cookies
    if (!session && request) {
      try {
        const cookieHeader = request.headers.get('cookie') || '';
        console.log("[getSession] Cookie header:", cookieHeader ? `${cookieHeader.substring(0, 100)}...` : "EMPTY");

        // Check for NextAuth v5 cookie names
        const hasAuthjsCookie = cookieHeader.includes('authjs.session-token') || cookieHeader.includes('__Secure-authjs.session-token');
        const hasNextAuthCookie = cookieHeader.includes('next-auth.session-token');
        console.log("[getSession] Has authjs cookie:", hasAuthjsCookie, "Has next-auth cookie:", hasNextAuthCookie);

        if (cookieHeader) {
          const token = await getToken({
            req: {
              headers: {
                cookie: cookieHeader,
              },
            } as any,
            secret: process.env.NEXTAUTH_SECRET,
          });

          console.log("[getSession] getToken result:", token ? `Token found, keys: ${Object.keys(token).join(', ')}, id: ${token.id || 'MISSING'}` : "No token");

          // Check for token.id or try to extract from token.sub (NextAuth v5 might use 'sub' instead of 'id')
          const userId = token?.id || (token as any)?.sub || null;

          if (token && userId) {
            // Fetch user profile to build session
            const profile = await db.query(
              "SELECT user_id, email, handle, avatar_url, is_admin, is_organizer FROM profiles WHERE user_id = $1",
              [userId]
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
              console.log("[getSession] Built session from token for user:", user.user_id);
            } else {
              console.log("[getSession] Token found but no profile in database for user:", userId);
            }
          } else if (token && !userId) {
            console.log("[getSession] Token found but missing user ID. Token keys:", Object.keys(token));
          }
        } else {
          console.log("[getSession] No cookie header in request");
        }
      } catch (cookieError) {
        console.error("[getSession] Error reading token from cookies:", cookieError);
      }
    } else if (!request) {
      console.log("[getSession] No request object provided");
    }

    if (!session) {
      console.log("[getSession] Final result: No session found");
    }

    return session;
  } catch (error) {
    console.error("[getSession] Fatal error:", error);
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
