
import { NextResponse } from "next/server";
import { getVenueFacets } from "@/lib/db/queries/venues";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const facets = await getVenueFacets();
        return NextResponse.json(facets);
    } catch (error) {
        console.error("Error fetching venue facets:", error);
        return NextResponse.json({ cities: [], types: [] }, { status: 500 });
    }
}
