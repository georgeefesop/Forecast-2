import { auth } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db/client";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ count: 0 });
    }

    try {
        const result = await db.query(
            `SELECT COUNT(DISTINCT event_id) as count 
       FROM event_actions 
       WHERE user_id = $1 AND type IN ('save', 'interested', 'going')`,
            [session.user.id]
        );

        return NextResponse.json({ count: parseInt(result.rows[0].count) });
    } catch (error) {
        console.error("Error fetching saved events count:", error);
        return NextResponse.json({ count: 0 }, { status: 500 });
    }
}
