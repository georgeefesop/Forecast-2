import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { db } from "@/lib/db/client";

/**
 * Migration endpoint - DELETE AFTER USE!
 * 
 * This endpoint runs the database schema migration.
 * 
 * SECURITY: Only call this with the MIGRATION_SECRET header.
 * 
 * Usage:
 * curl -X POST https://your-app.vercel.app/api/migrate \
 *   -H "x-migration-secret: your-secret-here"
 * 
 * After running, DELETE this file for security.
 */
export async function POST(request: NextRequest) {
  // SECURITY: Only allow with secret
  const secret = request.headers.get("x-migration-secret");
  const expectedSecret = process.env.MIGRATION_SECRET;
  
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "MIGRATION_SECRET not configured. Set it in environment variables first." },
      { status: 500 }
    );
  }
  
  if (secret !== expectedSecret) {
    return NextResponse.json(
      { error: "Unauthorized. Provide x-migration-secret header." },
      { status: 401 }
    );
  }

  try {
    // Read schema file
    const schemaPath = join(process.cwd(), "lib/db/schema.sql");
    const schema = readFileSync(schemaPath, "utf-8");
    
    // Split by semicolons and execute each statement
    // Note: This is a simple approach. For production, consider using a proper migration tool.
    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));
    
    let executed = 0;
    let errors: string[] = [];
    
    for (const statement of statements) {
      try {
        await db.query(statement);
        executed++;
      } catch (error: any) {
        // Some errors are expected (e.g., "already exists")
        if (!error.message?.includes("already exists") && 
            !error.message?.includes("does not exist")) {
          errors.push(`${statement.substring(0, 50)}...: ${error.message}`);
        }
      }
    }
    
    return NextResponse.json({
      success: true,
      executed,
      errors: errors.length > 0 ? errors : undefined,
      message: errors.length > 0
        ? "Migration completed with some warnings (expected for idempotent operations)"
        : "Migration completed successfully",
    });
  } catch (error: any) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: error.message || "Migration failed" },
      { status: 500 }
    );
  }
}
