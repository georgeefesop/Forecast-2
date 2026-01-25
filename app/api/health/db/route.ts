import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";

/**
 * Database health check endpoint
 * GET /api/health/db
 */
export async function GET() {
  try {
    // Check if DATABASE_URL is configured
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          status: "not_configured",
          message: "DATABASE_URL is not set in environment variables",
          connected: false,
        },
        { status: 503 }
      );
    }

    // Try a simple query to verify connection
    const result = await db.query("SELECT 1 as health_check");
    
    // Try to check if tables exist
    const tablesResult = await db.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    const tables = tablesResult.rows.map((row: any) => row.table_name);
    const expectedTables = [
      "profiles",
      "venues",
      "events",
      "event_actions",
      "event_counters",
      "vibe_checks",
      "comments",
      "reports",
      "submissions",
      "campaigns",
      "placements",
      "orders",
      "newsletter_subscribers",
      "verification_tokens",
    ];

    const missingTables = expectedTables.filter(
      (table) => !tables.includes(table)
    );

    return NextResponse.json({
      status: "connected",
      connected: true,
      tables: {
        found: tables.length,
        expected: expectedTables.length,
        list: tables,
        missing: missingTables,
      },
      schema_migrated: missingTables.length === 0,
      message:
        missingTables.length === 0
          ? "Database connected and schema is up to date"
          : `Database connected but schema migration needed. Missing tables: ${missingTables.join(", ")}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: "error",
        connected: false,
        message: error.message || "Database connection failed",
        error: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 503 }
    );
  }
}
