import { NextRequest, NextResponse } from "next/server";
import { runIngestion, getActiveAdapters } from "@/lib/ingest";

/**
 * Ingestion API endpoint
 * Protected by INGEST_SECRET environment variable
 * 
 * Usage:
 *   POST /api/ingest/run-all
 *   Headers: x-ingest-secret: <INGEST_SECRET>
 * 
 * Or via query param (for cron):
 *   POST /api/ingest/run-all?secret=<INGEST_SECRET>
 */
export async function POST(request: NextRequest) {
  try {
    // Verify secret
    // Allow Vercel Cron requests (they set x-vercel-cron header)
    const isVercelCron = request.headers.get("x-vercel-cron") === "1";
    const secret = request.headers.get("x-ingest-secret") || 
                   request.nextUrl.searchParams.get("secret");
    const expectedSecret = process.env.INGEST_SECRET;

    // If secret is configured, require it (unless it's Vercel Cron)
    if (expectedSecret && !isVercelCron && secret !== expectedSecret) {
      return NextResponse.json(
        { error: "Unauthorized - Invalid secret" },
        { status: 401 }
      );
    }

    console.log("[API] Starting event ingestion...");
    const startTime = Date.now();

    // Get active adapters
    const adapters = getActiveAdapters();
    console.log(`[API] Running ${adapters.length} source adapters`);

    // Run ingestion
    const results = await runIngestion(adapters);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    return NextResponse.json({
      success: true,
      duration: `${duration}s`,
      results: {
        total: results.total,
        created: results.created,
        updated: results.updated,
        errors: results.errors.length,
        errorDetails: results.errors.slice(0, 10), // First 10 errors
        sourceResults: results.sourceResults,
      },
    });
  } catch (error: any) {
    console.error("[API] Ingestion error:", error);
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        success: false,
      },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing (only in development)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "GET not allowed in production. Use POST with secret." },
      { status: 403 }
    );
  }

  // In dev, allow without secret for testing
  try {
    const adapters = getActiveAdapters();
    const results = await runIngestion(adapters);

    return NextResponse.json({
      success: true,
      results: {
        total: results.total,
        created: results.created,
        updated: results.updated,
        errors: results.errors.length,
        errorDetails: results.errors,
        sourceResults: results.sourceResults,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
