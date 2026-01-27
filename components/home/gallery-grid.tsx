import { EventCard } from "@/components/event-card";
import { cn } from "@/lib/utils";

interface GalleryGridProps {
    events: any[];
    className?: string;
}

/**
 * Bento Grid v3: Predictable Pattern
 * Strictly maintains the premium "Gallery Wall" aesthetic.
 */
export function GalleryGrid({ events, className }: GalleryGridProps) {
    if (!events || events.length === 0) return null;

    // chunk events into groups of 5 for the pattern
    const chunks = [];
    for (let i = 0; i < events.length; i += 5) {
        chunks.push(events.slice(i, i + 5));
    }

    return (
        <div className={cn("flex flex-col gap-12", className)}>
            {chunks.map((chunk, chunkIndex) => {
                const baseIndex = chunkIndex * 5;
                return (
                    <div key={chunkIndex} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[600px]">
                        {/* Left Column: Hero Card (1st item) */}
                        {chunk[0] && (
                            <div className="lg:col-span-7 h-[400px] lg:h-auto">
                                <EventCard
                                    {...mapEventToProps(chunk[0])}
                                    size="hero"
                                    className="h-full w-full"
                                    index={baseIndex}
                                />
                            </div>
                        )}

                        {/* Right Column: 2x2 Grid (Next 4 items) */}
                        <div className="lg:col-span-5 grid grid-cols-2 gap-4 h-full">
                            {chunk.slice(1, 5).map((event, eventIdx) => (
                                <div key={event.id} className="min-h-[180px]">
                                    <EventCard
                                        {...mapEventToProps(event)}
                                        size="small"
                                        className="h-full w-full"
                                        index={baseIndex + eventIdx + 1}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function mapEventToProps(event: any) {
    return {
        id: event.id,
        slug: event.slug,
        title: event.title,
        startAt: new Date(event.start_at),
        venue: event.venue,
        imageUrl: event.local_image_url || event.image_url || undefined,
        interestedCount: event.counters?.interested_count,
        goingCount: event.counters?.going_count,
        category: event.category || undefined,
        sourceName: event.source_name || undefined,
        priceMin: event.price_min,
        isSeries: event.series_id !== null,
        isInterested: event.user_interested,
    };
}
