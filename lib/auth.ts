import NextAuth, { NextAuthConfig } from "next-auth";
import EmailProvider from "next-auth/providers/email";
import { db } from "@/lib/db/client";
import { createAdapter } from "@/lib/auth-adapter";

// Note: Phone OTP requires a provider like Twilio
// For MVP, we'll use email magic links and add phone later

// Only enable Email provider if SMTP is fully configured AND database is available
// This prevents the "MissingAdapter" error when database isn't set up yet
const hasSMTP = process.env.SMTP_HOST && 
                process.env.SMTP_USER && 
                process.env.SMTP_PASSWORD &&
                process.env.SMTP_HOST !== 'smtp.example.com';
const hasDatabase = !!process.env.DATABASE_URL;
const shouldUseEmailProvider = hasSMTP && hasDatabase;

export const authConfig: NextAuthConfig = {
  // Trust host for local development
  trustHost: true,
  // Add adapter for Email provider (required for verification tokens)
  // Only add adapter if Email provider will be used
  ...(shouldUseEmailProvider ? { adapter: createAdapter() } : {}),
  providers: [
    ...(shouldUseEmailProvider
      ? [
          EmailProvider({
            server: {
              host: process.env.SMTP_HOST!,
              port: Number(process.env.SMTP_PORT) || 587,
              auth: {
                user: process.env.SMTP_USER!,
                pass: process.env.SMTP_PASSWORD!,
              },
            },
            from: process.env.EMAIL_FROM || "noreply@forecast.app",
          }),
        ]
      : []),
    // TODO: Add phone OTP provider (Twilio or similar)
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Always allow sign in
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        // Ensure profile exists
        try {
          await ensureProfile(user.id, user.email || user.name || "User");
        } catch (error) {
          console.error("Error ensuring profile:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        // Fetch profile data
        try {
          const profile = await getProfile(token.id as string);
          if (profile) {
            session.user.handle = profile.handle;
            session.user.avatarUrl = profile.avatar_url;
            session.user.isAdmin = profile.is_admin;
            session.user.isOrganizer = profile.is_organizer;
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify",
  },
};

async function ensureProfile(userId: string, emailOrName: string) {
  const existing = await db.query(
    "SELECT user_id FROM profiles WHERE user_id = $1",
    [userId]
  );

  if (existing.rows.length === 0) {
    // Generate a random handle
    const handle = generateHandle(emailOrName);
    await db.query(
      `INSERT INTO profiles (user_id, handle) VALUES ($1, $2)
       ON CONFLICT (user_id) DO NOTHING`,
      [userId, handle]
    );
  }
}

async function getProfile(userId: string) {
  const result = await db.query(
    "SELECT handle, avatar_url, is_admin, is_organizer FROM profiles WHERE user_id = $1",
    [userId]
  );
  return result.rows[0] || null;
}

function generateHandle(emailOrName: string): string {
  // Generate a random handle based on email/name
  const emailPart = emailOrName.split("@")[0];
  const base = emailPart || "user";
  const random = Math.random().toString(36).substring(2, 8);
  return `${base}_${random}`;
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      handle?: string;
      avatarUrl?: string | null;
      isAdmin?: boolean;
      isOrganizer?: boolean;
    };
  }
  interface User {
    id: string;
  }
}
