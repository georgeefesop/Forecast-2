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
                // Alternate patterns: Even = Hero Left, Odd = Hero Right
                const isHeroRight = chunkIndex % 2 !== 0;

                return (
                    <div key={chunkIndex} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[600px]">
                        {/* 
                          PATTERN A: Hero Left (Default)
                          Order: Hero, Grid 
                        */}
                        {!isHeroRight && (
                            <>
                                <div className="lg:col-span-7 h-[400px] lg:h-auto">
                                    {chunk[0] && (
                                        <EventCard
                                            {...mapEventToProps(chunk[0])}
                                            size="hero"
                                            className="h-full w-full"
                                            index={baseIndex}
                                        />
                                    )}
                                </div>
                                <div className="lg:col-span-5 grid grid-cols-2 grid-rows-2 gap-4 h-full">
                                    {[0, 1, 2, 3].map((pos) => {
                                        const event = chunk[pos + 1];
                                        return (
                                            <div key={event ? event.id : `empty-${pos}`} className="min-h-[180px] h-full">
                                                {event && (
                                                    <EventCard
                                                        {...mapEventToProps(event)}
                                                        size="small"
                                                        className="h-full w-full"
                                                        index={baseIndex + pos + 1}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}

                        {/* 
                          PATTERN B: Hero Right (Inverted)
                          Order: Grid, Hero
                        */}
                        {isHeroRight && (
                            <>
                                <div className="lg:col-span-5 grid grid-cols-2 grid-rows-2 gap-4 h-full order-2 lg:order-1">
                                    {[0, 1, 2, 3].map((pos) => {
                                        const event = chunk[pos + 1];
                                        return (
                                            <div key={event ? event.id : `empty-${pos}`} className="min-h-[180px] h-full">
                                                {event && (
                                                    <EventCard
                                                        {...mapEventToProps(event)}
                                                        size="small"
                                                        className="h-full w-full"
                                                        index={baseIndex + pos + 1}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="lg:col-span-7 h-[400px] lg:h-auto order-1 lg:order-2">
                                    {chunk[0] && (
                                        <EventCard
                                            {...mapEventToProps(chunk[0])}
                                            size="hero"
                                            className="h-full w-full"
                                            index={baseIndex}
                                        />
                                    )}
                                </div>
                            </>
                        )}
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
        savedCount: event.saved_count,
        category: event.category || undefined,
        sourceName: event.source_name || undefined,
        priceMin: event.price_min,
        isSeries: event.series_id !== null,
        isSaved: event.user_saved,
        description: event.description || undefined,
        imageSizeKb: event.image_size_kb && !isNaN(Number(event.image_size_kb))
            ? Number(event.image_size_kb)
            : null,
    };
}
