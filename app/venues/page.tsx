import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { getVenues } from "@/lib/db/queries/venues";
import Link from "next/link";
import { MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

interface VenuesPageProps {
  searchParams: {
    city?: string;
    type?: string;
    q?: string;
  };
}

export default async function VenuesPage({ searchParams }: VenuesPageProps) {
  let venues: any[] = [];
  try {
    venues = await getVenues({
    city: searchParams.city || "Limassol",
    type: searchParams.type || undefined,
    search: searchParams.q || undefined,
    limit: 100,
    });
  } catch (error) {
    console.error("Error fetching venues:", error);
    // Continue with empty array
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-6 text-fluid-3xl font-bold text-text-primary">
            Venues
          </h1>

          {/* Filters */}
          <div className="mb-8 flex flex-wrap gap-4">
            <select
              defaultValue={searchParams.city || "Limassol"}
              className="rounded-md border border-border-default bg-background-surface px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            >
              <option value="Limassol">Limassol</option>
              <option value="Nicosia">Nicosia</option>
              <option value="Larnaca">Larnaca</option>
              <option value="Paphos">Paphos</option>
            </select>
          </div>

          {/* Results */}
          {venues.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-text-secondary">No venues found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {venues.map((venue) => (
                <Link
                  key={venue.id}
                  href={`/venue/${venue.slug}`}
                  className="block overflow-hidden rounded-lg border border-border-default bg-background-surface transition-all hover:border-brand hover:shadow-lg"
                >
                  <div className="p-6">
                    <h3 className="mb-2 text-lg font-semibold text-text-primary">
                      {venue.name}
                    </h3>
                    {venue.address && (
                      <div className="mb-2 flex items-center gap-2 text-sm text-text-secondary">
                        <MapPin className="h-4 w-4" />
                        <span>{venue.address}</span>
                      </div>
                    )}
                    {venue.type && (
                      <span className="inline-block rounded-full bg-background-elevated px-3 py-1 text-xs text-text-secondary">
                        {venue.type}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
