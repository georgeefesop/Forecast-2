import { notFound } from "next/navigation";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { getEventBySlug, getSeriesOccurrences } from "@/lib/db/queries/events";
import { EventHero } from "@/components/event/event-hero";
import { ActionButtons } from "@/components/event/action-buttons";
import { SeriesPicker } from "@/components/event/series-picker";
import { CommentsThread } from "@/components/event/comments-thread";
import { SponsorTile } from "@/components/event/sponsor-tile";
import { AddToCalendar } from "@/components/event/add-to-calendar";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;

  // Decode slug in case it's URL encoded
  const decodedSlug = decodeURIComponent(slug);

  let event;
  try {
    event = await getEventBySlug(decodedSlug);
  } catch (error) {
    console.error("Error fetching event:", error);
    notFound();
  }

  if (!event) {
    notFound();
  }

  // Fetch sibling occurrences if this is part of a series
  const seriesOccurrences = event.series_id
    ? await getSeriesOccurrences(event.series_id)
    : [];

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1 bg-background">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <EventHero event={event} />



          <div className="flex flex-wrap items-start gap-3 justify-between">
            <ActionButtons
              eventId={event.id}
              initialInterested={false} // We don't have this in getEventBySlug yet actually, need to check if user has liked
              interestedCount={event.counters?.interested_count}
            />
            <AddToCalendar event={event} />
          </div>

          {/* Series Navigation */}
          {seriesOccurrences.length > 1 && (
            <SeriesPicker
              currentSlug={event.slug}
              occurrences={seriesOccurrences}
            />
          )}

          <div className="mt-8">
            <CommentsThread eventId={event.id} />
          </div>

          <SponsorTile eventId={event.id} />

          {/* Source Attribution */}
          {event.source_url && (
            <div className="mt-12 border-t border-border-default pt-8">
              <p className="text-sm text-text-tertiary">
                Discovered via{" "}
                <a
                  href={event.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-text-secondary hover:text-brand-accent transition-colors"
                >
                  {event.source_name || "External Source"}
                </a>
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
