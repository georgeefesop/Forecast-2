
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { FadeIn } from "@/components/ui/fade-in";
import { LiveEventFeed } from "@/components/home/live-event-feed";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db/client";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function getSavedEvents(userId: string) {
    const query = `
    SELECT DISTINCT ON (e.id)
      e.*,
      v.name as venue_name,
      v.slug as venue_slug,
      v.city as venue_city,
      (COALESCE(ec.interested_count, 0) + COALESCE(ec.going_count, 0) + COALESCE(ec.saves_count, 0)) as saved_count,
      CASE WHEN $1::text IS NOT NULL THEN
        EXISTS(
          SELECT 1 FROM event_actions ea 
          WHERE ea.event_id = e.id AND ea.user_id = $1 AND ea.type IN ('save', 'interested', 'going')
        )
      ELSE false END as user_saved
    FROM events e
    JOIN event_actions ea ON e.id = ea.event_id
    LEFT JOIN venues v ON e.venue_id = v.id
    LEFT JOIN event_counters ec ON e.id = ec.event_id
    WHERE ea.user_id = $1
      AND ea.type IN ('save', 'interested', 'going')
      AND e.status = 'published'
    ORDER BY e.id, e.start_at ASC
  `;

    const result = await db.query(query, [userId]);

    return result.rows.map((row) => ({
        ...row,
        venue: row.venue_name
            ? {
                name: row.venue_name,
                slug: row.venue_slug,
                city: row.venue_city,
            }
            : undefined,
        counters: {
            interested_count: row.interested_count || 0,
            going_count: row.going_count || 0,
            saves_count: row.saves_count || 0,
        },
        saved_count: parseInt(row.saved_count) || 0,
        user_saved: !!row.user_saved,
    }));
}

export default async function SavedPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/auth/signin?callbackUrl=/saved");
    }

    const events = await getSavedEvents(session.user.id);

    return (
        <div className="flex min-h-screen flex-col">
            <MainNav />
            <main className="flex-1">
                <div className="mx-auto max-w-[1248px] px-4 py-8 md:py-12 sm:px-6 lg:px-8">
                    <FadeIn delay={0.1}>
                        <h1 className="font-serif font-medium text-[clamp(28px,2.8vw,42px)] leading-[1.1] text-text-primary tracking-tight mb-8">
                            Saved Events
                        </h1>
                    </FadeIn>

                    {events.length === 0 ? (
                        <FadeIn delay={0.2}>
                            <div className="py-12 text-center border rounded-2xl border-dashed border-border-default">
                                <p className="text-text-secondary">You haven't saved any events yet.</p>
                                <a href="/explore" className="mt-4 inline-block text-brand-accent hover:underline font-medium">
                                    Explore events
                                </a>
                            </div>
                        </FadeIn>
                    ) : (
                        <div className="mb-16">
                            <LiveEventFeed initialEvents={events} />
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
