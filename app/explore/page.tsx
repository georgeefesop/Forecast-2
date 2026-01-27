import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { FilterChips } from "@/components/filters/filter-chips";
import { EventList } from "@/components/explore/event-list";
import { SortSelect } from "@/components/explore/sort-select";
import { getEvents } from "@/lib/db/queries/events";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ExplorePageProps {
  searchParams: {
    q?: string;
    city?: string;
    date?: string;
    category?: string;
    free?: string;
    sort?: string;
    language?: string;
  };
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const session = await auth();
  // Ensure searchParams is properly handled (Next.js 15 compatibility)
  const params = await Promise.resolve(searchParams);

  let events: any[] = [];
  try {
    events = await getEvents({
      city: params.city && params.city.trim() ? params.city : undefined,
      category: params.category && params.category.trim() ? params.category : undefined,
      date: params.date && params.date.trim() ? params.date : undefined,
      free: params.free === "true",
      search: params.q && params.q.trim() ? params.q : undefined,
      language: params.language && params.language.trim() ? params.language : undefined,
      limit: 500, // Increased from 50 to show more events
      viewerId: session?.user?.id,
    });
  } catch (error) {
    console.error("Error fetching events:", error);
    // Continue with empty array
  }

  // Sort events
  let sortedEvents = [...events];
  if (params.sort === "interested") {
    sortedEvents.sort(
      (a, b) =>
        (b.counters?.interested_count || 0) -
        (a.counters?.interested_count || 0)
    );
  } else if (params.sort === "free") {
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

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <FilterChips masked={false} />
            <p className="text-sm font-medium text-text-secondary whitespace-nowrap">
              {events.length} upcoming events
            </p>
          </div>

          {/* Sort */}
          <div className="mb-6 flex items-center justify-end">
            <SortSelect />
          </div>

          {/* Results */}
          <EventList events={sortedEvents} />
        </div>
      </main>
      <Footer />
    </div>
  );
}
