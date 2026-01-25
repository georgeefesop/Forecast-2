import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { FilterChips } from "@/components/filters/filter-chips";
import { EventCard } from "@/components/event-card";
import { getEvents } from "@/lib/db/queries/events";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

interface ExplorePageProps {
  searchParams: {
    q?: string;
    city?: string;
    date?: string;
    category?: string;
    free?: string;
    sort?: string;
  };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  let events: any[] = [];
  try {
    events = await getEvents({
    city: searchParams.city || "Limassol",
    category: searchParams.category || undefined,
    date: searchParams.date || undefined,
    free: searchParams.free === "true",
    search: searchParams.q || undefined,
    limit: 50,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    // Continue with empty array
  }

  // Sort events
  let sortedEvents = [...events];
  if (searchParams.sort === "interested") {
    sortedEvents.sort(
      (a, b) =>
        (b.counters?.interested_count || 0) -
        (a.counters?.interested_count || 0)
    );
  } else if (searchParams.sort === "free") {
    sortedEvents.sort((a, b) => {
      const aFree = !a.price_min || a.price_min === 0;
      const bFree = !b.price_min || b.price_min === 0;
      return bFree ? 1 : -1;
    });
  }
  // Default: soonest (already sorted by start_at)

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-6 text-fluid-3xl font-bold text-text-primary">
            Explore Events
          </h1>

          {/* Filters */}
          <div className="mb-8">
            <FilterChips />
          </div>

          {/* Sort */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-text-secondary">
              {events.length} event{events.length !== 1 ? "s" : ""} found
            </p>
            <select
              defaultValue={searchParams.sort || "soonest"}
              className="rounded-md border border-border-default bg-background-surface px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="soonest">Soonest</option>
              <option value="interested">Most Interested</option>
              <option value="free">Free First</option>
            </select>
          </div>

          {/* Results */}
          {events.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-text-secondary">No events found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sortedEvents.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  slug={event.slug}
                  title={event.title}
                  startAt={new Date(event.start_at)}
                  venue={event.venue}
                  imageUrl={event.image_url || undefined}
                  interestedCount={event.counters?.interested_count}
                  goingCount={event.counters?.going_count}
                  category={event.category || undefined}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
