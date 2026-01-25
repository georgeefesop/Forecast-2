import { NextRequest, NextResponse } from "next/server";
import { ingestEvents } from "@/lib/ingest";

export async function POST(request: NextRequest) {
  try {
    // Verify secret header for security
    const secret = request.headers.get("x-vercel-cron-secret");
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting event ingestion...");
    const results = await ingestEvents();

    return NextResponse.json({
      success: true,
      results: {
        total: results.total,
        created: results.created,
        updated: results.updated,
        errors: results.errors,
      },
    });
  } catch (error: any) {
    console.error("Ingestion error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

// Allow GET for manual testing (remove in production)
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }

  try {
    const results = await ingestEvents();
    return NextResponse.json({
      success: true,
      results: {
        total: results.total,
        created: results.created,
        updated: results.updated,
        errors: results.errors,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
