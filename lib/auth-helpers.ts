import { auth } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest } from "next/server";

/**
 * Get the current session in API routes (NextAuth v5 compatible)
 */
export async function getSession(request?: NextRequest) {
  try {
    // In NextAuth v5, auth() can be called without request in most cases
    // But for API routes, we may need to pass headers
    const session = await auth();
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
