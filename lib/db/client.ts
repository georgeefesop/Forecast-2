import { sql } from "@vercel/postgres";

// Note: @vercel/postgres is deprecated. Consider migrating to Neon Postgres.
// For now, this wrapper provides type-safe query helpers.

// Check if database is configured
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL is not set. Database operations will fail.");
}

export const db = sql;

/**
 * Execute a query and return results
 */
export async function query<T = any>(
  queryText: string,
  params?: any[]
): Promise<T[]> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  const result = await sql.query(queryText, params);
  return result.rows as T[];
}

/**
 * Execute a query and return a single row
 */
export async function queryOne<T = any>(
  queryText: string,
  params?: any[]
): Promise<T | null> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  const result = await sql.query(queryText, params);
  return (result.rows[0] as T) || null;
}

/**
 * Execute a query that doesn't return rows (INSERT, UPDATE, DELETE)
 */
export async function execute(
  queryText: string,
  params?: any[]
): Promise<{ rowCount: number }> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }
  const result = await sql.query(queryText, params);
  return { rowCount: result.rowCount || 0 };
}
