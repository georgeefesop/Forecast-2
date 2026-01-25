import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { SearchBar } from "@/components/search/search-bar";
import { FilterChips } from "@/components/filters/filter-chips";
import { SponsoredBanner } from "@/components/home/sponsored-banner";
import { GalleryGrid } from "@/components/home/gallery-grid";
import { getEvents } from "@/lib/db/queries/events";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch primary occurrences for the gallery wall
  const events = await getEvents({
    primaryOnly: true,
    limit: 40,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header & Search */}
          <div className="mb-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-fluid-4xl font-black tracking-tight text-text-primary leading-[1.1]">
                Everything happening <br />
                in <span className="text-brand-accent italic">Cyprus</span>
              </h1>
              <p className="mt-4 text-fluid-lg text-text-secondary">
                Curated events, venues, and experiences across the island.
              </p>
            </div>
            <div className="w-full md:w-96">
              <SearchBar />
            </div>
          </div>

          {/* Filter Row */}
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <FilterChips />
            <a
              href="/explore"
              className="text-sm font-semibold text-brand-accent hover:underline"
            >
              Advanced Search →
            </a>
          </div>

          {/* Gallery Wall */}
          <div className="mb-16">
            <h2 className="mb-6 text-fluid-2xl font-bold text-text-primary">
              The Wall
            </h2>
            <GalleryGrid events={events} />
          </div>

          {/* Sponsored Banner */}
          <div className="mb-16">
            <SponsoredBanner />
          </div>

          {/* Newsletter CTA */}
          <div className="mt-16 rounded-2xl border border-border-default bg-background-elevated p-12 text-center shadow-xl">
            <h2 className="text-fluid-3xl font-bold text-text-primary">
              Stay in the loop
            </h2>
            <p className="mt-4 text-fluid-lg text-text-secondary max-w-lg mx-auto">
              Get weekly event recommendations delivered to your inbox.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <a
                href="/newsletter"
                className="rounded-full bg-brand-accent px-8 py-4 text-base font-bold text-text-inverse transition-all hover:scale-105 hover:bg-brand-accent/90"
              >
                Join the Pulse
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
