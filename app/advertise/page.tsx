import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { TrendingUp, Eye, MapPin, Mail } from "lucide-react";

const placements = [
  {
    type: "home_banner",
    name: "Home Banner",
    description: "Large featured banner on the homepage",
    icon: Eye,
  },
  {
    type: "featured_events",
    name: "Featured Events",
    description: "Prominent placement in curated sections",
    icon: TrendingUp,
  },
  {
    type: "explore_insert",
    name: "Explore Insert",
    description: "Promoted cards in search results",
    icon: Eye,
  },
  {
    type: "map_highlight",
    name: "Map Highlight",
    description: "Highlighted pins on the map view",
    icon: MapPin,
  },
  {
    type: "event_sponsor_tile",
    name: "Event Sponsor Tile",
    description: "Sponsor section on event pages",
    icon: TrendingUp,
  },
  {
    type: "newsletter_sponsor",
    name: "Newsletter Sponsor",
    description: "Featured in newsletter emails",
    icon: Mail,
  },
];

export default function AdvertisePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="mb-4 text-fluid-4xl font-bold text-text-primary">
              Advertise on Forecast
            </h1>
            <p className="text-fluid-lg text-text-secondary max-w-2xl mx-auto">
              Reach thousands of event-goers in Limassol. Promote your events,
              venues, or brand with our premium advertising placements.
            </p>
          </div>

          {/* Placement Options */}
          <div className="mb-16">
            <h2 className="mb-8 text-fluid-2xl font-bold text-text-primary text-center">
              Advertising Options
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {placements.map((placement) => {
                const Icon = placement.icon;
                return (
                  <div
                    key={placement.type}
                    className="rounded-lg border border-border-default bg-background-surface p-6"
                  >
                    <Icon className="mb-4 h-8 w-8 text-brand" />
                    <h3 className="mb-2 text-lg font-semibold text-text-primary">
                      {placement.name}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {placement.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-xl border border-border-default bg-background-elevated p-12 text-center">
            <h2 className="mb-4 text-fluid-2xl font-bold text-text-primary">
              Ready to get started?
            </h2>
            <p className="mb-8 text-text-secondary">
              Create your first promotion campaign in minutes.
            </p>
            <Link href="/boost/new">
              <Button size="lg">Create Campaign</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
