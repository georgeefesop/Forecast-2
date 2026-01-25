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

    return (
        <div className={cn(
            "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 md:auto-rows-[18rem] gap-4 max-w-7xl mx-auto grid-flow-dense",
            className
        )}>
            {events.map((event, index) => {
                // Determine layout spans based on a repeating 10-slot pattern
                const patternIndex = index % 10;
                let span = "col-span-1 row-span-1";
                let size: 'small' | 'wide' | 'tall' | 'big' = 'small';

                // Slot 0: Huge Hero (2x2)
                if (patternIndex === 0) {
                    span = "md:col-span-2 md:row-span-2";
                    size = 'big';
                }
                // Slot 4: Wide Landscape (2x1)
                else if (patternIndex === 4) {
                    span = "md:col-span-2 md:row-span-1";
                    size = 'wide';
                }
                // Slot 5: Tall Portrait (1x2)
                else if (patternIndex === 5) {
                    span = "md:col-span-1 md:row-span-2";
                    size = 'tall';
                }
                // Slot 9: Secondary Hero (2x2)
                else if (patternIndex === 9) {
                    span = "md:col-span-2 md:row-span-2";
                    size = 'big';
                }

                return (
                    <div
                        key={event.id}
                        className={cn("flex min-h-0 min-w-0", span)}
                    >
                        <EventCard
                            id={event.id}
                            slug={event.slug}
                            title={event.title}
                            startAt={new Date(event.start_at)}
                            venue={event.venue}
                            imageUrl={event.local_image_url || event.image_url || undefined}
                            interestedCount={event.counters?.interested_count}
                            goingCount={event.counters?.going_count}
                            category={event.category || undefined}
                            sourceName={event.source_name || undefined}
                            priceMin={event.price_min}
                            isSeries={event.series_id !== null}
                            size={size}
                            className="h-full w-full"
                        />
                    </div>
                );
            })}
        </div>
    );
}
