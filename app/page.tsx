import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { SearchBar } from "@/components/search/search-bar";
import { FilterChips } from "@/components/filters/filter-chips";
import { SponsoredBanner } from "@/components/home/sponsored-banner";
import { CuratedSection } from "@/components/home/curated-section";
import { CategoryRow } from "@/components/home/category-row";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-6">
            <SearchBar />
          </div>

          {/* Filter Row */}
          <div className="mb-8">
            <FilterChips />
          </div>

          {/* Sponsored Banner */}
          <div className="mb-12">
            <SponsoredBanner />
          </div>

          {/* Curated Sections */}
          <div className="space-y-12">
            <CuratedSection title="Tonight" filter="tonight" />
            <CuratedSection title="This Weekend" filter="weekend" />
            <CuratedSection title="Popular right now" filter="popular" />
            <CuratedSection title="Free & Easy" filter="free" />

            {/* Category Rows */}
            <CategoryRow category="Nightlife" />
            <CategoryRow category="Culture" />
            <CategoryRow category="Family" />
            <CategoryRow category="Outdoors" />
            <CategoryRow category="Food & Drink" />
          </div>

          {/* Newsletter CTA */}
          <div className="mt-16 rounded-lg border border-border-default bg-background-elevated p-8 text-center">
            <h2 className="text-fluid-2xl font-bold text-text-primary">
              Stay in the loop
            </h2>
            <p className="mt-2 text-text-secondary">
              Get weekly event recommendations delivered to your inbox
            </p>
            <a
              href="/newsletter"
              className="mt-4 inline-block rounded-md bg-brand px-6 py-3 text-sm font-medium text-text-inverse transition-colors hover:bg-brand/90"
            >
              Subscribe to Newsletter
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
