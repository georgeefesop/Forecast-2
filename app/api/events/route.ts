import { NextRequest, NextResponse } from "next/server";
import { getEvents } from "@/lib/db/queries/events";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const searchParams = request.nextUrl.searchParams;

        const city = searchParams.get("city") || undefined;
        const category = searchParams.get("category") || undefined;
        const date = searchParams.get("date") || undefined;
        const free = searchParams.get("free") === "true";
        const language = searchParams.get("language") || undefined;
        const sourcesStr = searchParams.get("sources");
        const sources = sourcesStr ? sourcesStr.split(",") : undefined;
        const limit = parseInt(searchParams.get("limit") || "40");
        const primaryOnly = searchParams.get("primaryOnly") === "true";

        const events = await getEvents({
            city,
            category,
            date,
            free,
            language,
            sources,
            limit,
            primaryOnly,
            viewerId: session?.user?.id,
        });

        return NextResponse.json({
            success: true,
            events,
        });
    } catch (error: any) {
        console.error("[API] Events fetch error:", error);
        return NextResponse.json(
            { error: error.message || "Internal server error", success: false },
            { status: 500 }
        );
    }
}
