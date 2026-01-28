import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { getVenues } from "@/lib/db/queries/venues";
import { VenueCard } from "@/components/venue/venue-card";
import { VenueFilters } from "@/components/venue/venue-filters";
import { FadeIn } from "@/components/ui/fade-in";

export const dynamic = "force-dynamic";

interface VenuesPageProps {
  searchParams: {
    city?: string;
    type?: string;
    q?: string;
    sort?: "active" | "trending" | "az";
  };
}

export default async function VenuesPage({ searchParams }: VenuesPageProps) {
  // Await searchParams for Next.js 15+ readiness
  const params = await Promise.resolve(searchParams);

  let venues: any[] = [];
  try {
    venues = await getVenues({
      // Default to Limassol if no city param provided, as per spec B2.
      city: params.city === undefined ? "Limassol" : (params.city === "" ? undefined : params.city),
      type: params.type || undefined,
      search: params.q || undefined,
      sort: params.sort || "az",
      limit: 100,
    });
  } catch (error) {
    console.error("Error fetching venues:", error);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <FadeIn>
        <h1 className="mb-2 text-fluid-3xl font-bold text-text-primary">
          The Pulse of the City
        </h1>
        <p className="mb-8 text-lg text-text-secondary max-w-2xl">
          Discover the spaces shaping the culture. From underground clubs to open-air stages.
        </p>
      </FadeIn>

      <div className="mb-8">
        <VenueFilters />
      </div>

      {/* Results */}
      {venues.length === 0 ? (
        <div className="py-16 text-center border rounded-xl border-dashed border-border-default">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-background-elevated">
            <span className="text-2xl">🔍</span>
          </div>
          <h3 className="text-lg font-medium text-text-primary">No venues found</h3>
          <p className="text-text-secondary mt-1 max-w-sm mx-auto">
            We couldn't find any venues matching your filters in {params.city || "Limassol"}.
          </p>
          <div className="mt-6">
            <a href="/venues" className="text-brand-accent hover:underline font-medium">Clear filters</a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {venues.map((venue, index) => (
            <FadeIn key={venue.id} delay={index * 0.05}>
              <VenueCard venue={venue} />
            </FadeIn>
          ))}
        </div>
      )}
    </div>
  );
}
