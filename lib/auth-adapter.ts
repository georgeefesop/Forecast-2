import type { Adapter } from "next-auth/adapters";
import { db } from "@/lib/db/client";

/**
 * Custom NextAuth adapter for raw SQL (Vercel Postgres)
 * Implements minimal adapter interface for Email provider
 */
export function createAdapter(): Adapter {
  return {
    async createVerificationToken(data) {
      try {
        await db.query(
          `INSERT INTO verification_tokens (identifier, token, expires)
           VALUES ($1, $2, $3)
           ON CONFLICT (identifier, token) 
           DO UPDATE SET expires = $3`,
          [data.identifier, data.token, data.expires]
        );
        return data;
      } catch (error) {
        console.error("Error creating verification token:", error);
        throw error;
      }
    },

    async useVerificationToken(params) {
      try {
        const result = await db.query(
          `DELETE FROM verification_tokens
           WHERE identifier = $1 AND token = $2 AND expires > NOW()
           RETURNING identifier, token, expires`,
          [params.identifier, params.token]
        );

        if (result.rows.length === 0) {
          return null;
        }

        const row = result.rows[0];
        return {
          identifier: row.identifier,
          token: row.token,
          expires: new Date(row.expires),
        };
      } catch (error) {
        console.error("Error using verification token:", error);
        return null;
      }
    },

    // Minimal user methods (required by adapter interface)
    async createUser(data) {
      const userId = data.id || data.email || `user_${Date.now()}`;
      const handle = data.name || `user_${Date.now()}`;
      
      try {
        const result = await db.query(
          `INSERT INTO profiles (user_id, handle, email)
           VALUES ($1, $2, $3)
           ON CONFLICT (user_id) DO UPDATE SET email = COALESCE(EXCLUDED.email, profiles.email)
           RETURNING user_id, handle, email`,
          [userId, handle, data.email]
        );
        const row = result.rows[0];
        return {
          id: row.user_id,
          email: row.email,
          emailVerified: null,
          name: row.handle,
          image: null,
        };
      } catch (error) {
        console.error("Error creating user:", error);
        throw error;
      }
    },

    async getUser(id) {
      const result = await db.query(
        `SELECT user_id, handle, email FROM profiles WHERE user_id = $1`,
        [id]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.user_id,
        email: row.email,
        emailVerified: null,
        name: row.handle,
        image: null,
      };
    },

    async getUserByEmail(email) {
      const result = await db.query(
        `SELECT user_id, handle, email FROM profiles WHERE email = $1`,
        [email]
      );
      if (result.rows.length === 0) return null;
      const row = result.rows[0];
      return {
        id: row.user_id,
        email: row.email,
        emailVerified: null,
        name: row.handle,
        image: null,
      };
    },

    async getUserByAccount({ providerAccountId, providerId }) {
      // For email provider, account is the same as user
      return null;
    },

    async linkAccount() {
      // Not needed for email provider
      return undefined;
    },

    async createSession() {
      // Not used with JWT strategy
      return {} as any;
    },

    async getSessionAndUser() {
      // Not used with JWT strategy
      return null;
    },

    async updateSession() {
      // Not used with JWT strategy
      return {} as any;
    },

    async deleteSession() {
      // Not used with JWT strategy
      return undefined;
    },

    async updateUser() {
      // Minimal implementation
      return {} as any;
    },

    async deleteUser() {
      // Optional
      return undefined;
    },

    async unlinkAccount() {
      // Not needed for email provider
      return undefined;
    },
  };
}
