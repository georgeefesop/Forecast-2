import { notFound } from "next/navigation";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { getEventBySlug, getSeriesOccurrences } from "@/lib/db/queries/events";
import { EventHero } from "@/components/event/event-hero";
import { ActionButtons } from "@/components/event/action-buttons";
import { SeriesPicker } from "@/components/event/series-picker";
import { CommentsThread } from "@/components/event/comments-thread";
import { VenueEventsRail } from "@/components/event/venue-events-rail";
import { SponsorTile } from "@/components/event/sponsor-tile";
import { AddToCalendar } from "@/components/event/add-to-calendar";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const session = await auth();

  // Decode slug in case it's URL encoded
  const decodedSlug = decodeURIComponent(slug);

  let event;
  try {
    event = await getEventBySlug(decodedSlug, session?.user?.id);
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
              initialIsSaved={event.user_saved}
              savedCount={event.saved_count}
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

          {/* More at this Venue */}
          {event.venue && (
            <VenueEventsRail
              venueId="" // Not needed since we query by slug, but prop exists in interface
              // Actually I defined venueId in interface but didn't use it in logic (used slug).
              // Let's pass empty string or ID if available. event.venue usually has updated structure?
              // The query returns venue: { name, slug, city } but NOT ID in the nested object usually.
              // Let's check getEventBySlug return type.
              // It returns ...row, venue: { name, slug, city }. So NO ID in event.venue object.
              // I should update VenueEventsRail interface to not require venueId or just pass a dummy.
              // Or better, update VenueEventsRail to not ask for it.
              // For now, I will pass it if I can finding it, or just ignore it if I update the component.
              // Wait, I just created the component requiring venueId.
              // I should fix the component to not require it if I don't have it easily.
              // But event objects usually have venue_id at the top level? Yes: event.venue_id.
              venueId={event.venue_id || ""}
              venueName={event.venue.name}
              venueSlug={event.venue.slug}
              currentEventId={event.id}
            />
          )}

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
