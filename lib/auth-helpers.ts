import { auth } from "@/app/api/auth/[...nextauth]/route";

/**
 * Get the current session in API routes (NextAuth v5 compatible)
 */
export async function getSession() {
  try {
    const session = await auth();
    return session;
  } catch (error) {
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
