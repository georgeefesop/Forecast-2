import Link from "next/link";
import { EventCard } from "@/components/event-card";
import { ArrowRight } from "lucide-react";
import { getEvents } from "@/lib/db/queries/events";

interface CategoryRowProps {
  category: string;
}

export async function CategoryRow({ category }: CategoryRowProps) {
  let events: any[] = [];

  try {
    events = await getEvents({
      category,
      limit: 4,
    });
  } catch (error) {
    console.error(`Error fetching ${category} events:`, error);
  }

  if (events.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-fluid-2xl font-bold text-text-primary">
          {category}
        </h2>
        <Link
          href={`/explore?category=${encodeURIComponent(category)}`}
          className="flex items-center gap-1 text-sm font-medium text-text-secondary hover:text-text-primary"
        >
          View all
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {events.slice(0, 4).map((event) => (
          <EventCard
            key={event.id}
            id={event.id}
            slug={event.slug}
            title={event.title}
            startAt={new Date(event.start_at)}
            venue={event.venue}
            imageUrl={event.local_image_url || event.image_url || undefined}
            imageSizeKb={event.image_size_kb && !isNaN(Number(event.image_size_kb)) ? Number(event.image_size_kb) : null}
            savedCount={event.saved_count}
            category={event.category || undefined}
            sourceName={event.source_name || undefined}
            priceMin={event.price_min}
          />
        ))}
      </div>
    </section>
  );
}
