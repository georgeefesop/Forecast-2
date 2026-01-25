import { EventCard } from "@/components/event-card";
import { getEvents, getPopularEvents } from "@/lib/db/queries/events";

interface CuratedSectionProps {
  title: string;
  filter: "tonight" | "weekend" | "popular" | "free" | "upcoming";
}

export async function CuratedSection({ title, filter }: CuratedSectionProps) {
  let events: any[] = [];

  try {
    if (filter === "popular") {
      events = await getPopularEvents(3);
    } else if (filter === "tonight") {
      // Events happening today
      events = await getEvents({
        date: "today",
        limit: 3,
      });
    } else if (filter === "weekend") {
      events = await getEvents({
        date: "weekend",
        limit: 3,
      });
    } else if (filter === "free") {
      events = await getEvents({
        free: true,
        limit: 3,
      });
    } else if (filter === "upcoming") {
      // Show more upcoming events on home page
      events = await getEvents({
        limit: 24, // Increased from 12
      });
    }
  } catch (error) {
    console.error(`Error fetching ${filter} events:`, error);
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="mb-6 text-fluid-2xl font-bold text-text-primary">
        {title}
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard
            key={event.id}
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
          />
        ))}
      </div>
    </section>
  );
}
