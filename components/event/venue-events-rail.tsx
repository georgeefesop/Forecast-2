
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { getEvents } from "@/lib/db/queries/events";
import { EventCard } from "@/components/event-card";

interface VenueEventsRailProps {
    venueId: string;
    venueName: string;
    venueSlug: string;
    currentEventId: string;
}

export async function VenueEventsRail({
    venueName,
    venueSlug,
    currentEventId
}: VenueEventsRailProps) {
    // Fetch up to 5 events to ensure we have 4 after filtering current one
    const events = await getEvents({
        venue: venueSlug,
        limit: 5,
        date: "future" // Ensure we show future events
    } as any);

    // Filter out current event
    const otherEvents = events
        .filter(e => e.id !== currentEventId)
        .slice(0, 4);

    if (otherEvents.length === 0) {
        return null;
    }

    return (
        <div className="mt-12 border-t border-border-default pt-8">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-text-tertiary" />
                    <h2 className="text-xl font-bold text-text-primary">
                        More at <Link href={`/venue/${venueSlug}`} className="hover:underline hover:text-brand-accent">{venueName}</Link>
                    </h2>
                </div>
                <Link
                    href={`/venue/${venueSlug}`}
                    className="group flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary"
                >
                    View All
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {otherEvents.map((event, index) => (
                    <EventCard
                        key={event.id}
                        id={event.id}
                        slug={event.slug}
                        title={event.title}
                        startAt={event.start_at}
                        venue={event.venue ? {
                            name: event.venue.name,
                            city: event.venue.city
                        } : undefined}
                        imageUrl={event.image_url || undefined}
                        savedCount={event.saved_count}
                        // Check EventCardProps:
                        // id, slug, title, startAt, venue, imageUrl, savedCount, category, isPromoted, className, priceMin, seriesId, isSeries, size, index, description
                        category={event.category || undefined}
                        priceMin={event.price_min}
                        size="small"
                        index={index}
                        imageSizeKb={event.image_size_kb}
                    />
                ))}
            </div>
        </div>
    );
}
