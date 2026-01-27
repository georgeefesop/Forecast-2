import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { SearchBar } from "@/components/search/search-bar";
import { FilterChips } from "@/components/filters/filter-chips";
import { SponsoredBanner } from "@/components/home/sponsored-banner";
import { GalleryGrid } from "@/components/home/gallery-grid";
import { FadeIn } from "@/components/ui/fade-in";
import { getEvents } from "@/lib/db/queries/events";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();

  // Fetch primary occurrences for the gallery wall
  const events = await getEvents({
    primaryOnly: true,
    limit: 40,
    viewerId: session?.user?.id,
  });

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="mx-auto max-w-[1248px] px-4 py-8 md:py-12 sm:px-6 lg:px-8 relative">
          {/* Hero Section - 2 Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16 items-start">

            {/* Left Column: Content + Filters */}
            <div className="lg:col-span-7 flex flex-col">
              <FadeIn delay={0.1}>
                <h1 className="font-serif font-medium text-[clamp(34px,3.4vw,56px)] leading-[1.1] text-text-primary tracking-tight">
                  Everything happening <br /> in <span className="italic text-brand-accent">Cyprus</span>
                </h1>
              </FadeIn>

              <FadeIn delay={0.2}>
                <p className="mt-4 text-[clamp(14px,1.1vw,18px)] leading-[1.6] text-text-secondary max-w-[52ch]">
                  Curated events, venues, and experiences across the island. Discover the best of culture, nightlife, and community.
                </p>
              </FadeIn>


            </div>

            {/* Right Column: Search (Floating) */}
            <div className="lg:col-span-5 lg:flex lg:justify-end lg:pt-2">
              <div className="w-full max-w-[480px]">
                <SearchBar />
              </div>
            </div>
          </div>

          {/* Sponsored Banner & Filters Container */}
          <div className="relative mb-8 w-full">
            {/* Desktop: Floating Sidebar Ad (Left Gutter) */}
            <div className="hidden 2xl:block absolute -left-[320px] top-0 w-[280px] h-full pointer-events-none">
              <div className="sticky top-24 pointer-events-auto">
                <FadeIn delay={0.4}>
                  <SponsoredBanner variant="vertical" />
                </FadeIn>
              </div>
            </div>

            {/* Mobile/Tablet: Banner above filters */}
            <div className="2xl:hidden mb-8">
              <FadeIn delay={0.4}>
                <SponsoredBanner variant="horizontal" />
              </FadeIn>
            </div>

            {/* Main Content Area (Filters + Gallery) */}
            <div className="relative z-10">
              {/* Filters Section */}
              <div className="mb-8">
                <FadeIn delay={0.3}>
                  <FilterChips masked={true} />
                </FadeIn>
                <FadeIn delay={0.4}>
                  <div className="mt-4">
                    <a
                      href="/explore"
                      className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors border-b border-transparent hover:border-text-primary"
                    >
                      Advanced Search →
                    </a>
                  </div>
                </FadeIn>
              </div>

              {/* Gallery Wall */}
              <div className="mb-16">
                <GalleryGrid events={events} />
              </div>
            </div>
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
