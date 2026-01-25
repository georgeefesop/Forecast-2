import { notFound } from "next/navigation";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { getVenueBySlug } from "@/lib/db/queries/venues";
import { getEvents } from "@/lib/db/queries/events";
import { MapPin, Globe, Instagram, Mail, Phone } from "lucide-react";
import { EventCard } from "@/components/event-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

interface VenuePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function VenuePage({ params }: VenuePageProps) {
  const { slug } = await params;
  let venue;
  let upcomingEvents: any[] = [];
  
  try {
    venue = await getVenueBySlug(slug);
    if (!venue) {
      notFound();
    }
    upcomingEvents = await getEvents({
    // Filter by venue - we'll need to add this to the query
    limit: 20,
    });
  } catch (error) {
    console.error("Error fetching venue:", error);
    notFound();
  }

  // Filter events by venue_id
  const venueEvents = upcomingEvents.filter(
    (e) => e.venue_id === venue.id
  );

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Venue Hero */}
          <div className="mb-8">
            <h1 className="mb-4 text-fluid-4xl font-bold text-text-primary">
              {venue.name}
            </h1>

            <div className="space-y-3 text-base text-text-secondary">
              {venue.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{venue.address}, {venue.city}</span>
                </div>
              )}

              {venue.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  <a
                    href={`tel:${venue.phone}`}
                    className="text-text-primary hover:underline"
                  >
                    {venue.phone}
                  </a>
                </div>
              )}

              {venue.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  <a
                    href={`mailto:${venue.email}`}
                    className="text-text-primary hover:underline"
                  >
                    {venue.email}
                  </a>
                </div>
              )}

              {venue.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <a
                    href={venue.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-primary hover:underline"
                  >
                    Website
                  </a>
                </div>
              )}

              {venue.instagram && (
                <div className="flex items-center gap-2">
                  <Instagram className="h-5 w-5" />
                  <a
                    href={`https://instagram.com/${venue.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-text-primary hover:underline"
                  >
                    @{venue.instagram.replace("@", "")}
                  </a>
                </div>
              )}
            </div>

            {venue.claim_status === "unclaimed" && (
              <div className="mt-6">
                <Link href="/organizer?action=claim">
                  <Button>Claim this venue</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div>
            <h2 className="mb-6 text-fluid-2xl font-bold text-text-primary">
              Upcoming Events
            </h2>
            {venueEvents.length === 0 ? (
              <p className="text-text-secondary">No upcoming events.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {venueEvents.map((event) => (
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
        </div>
      </main>
      <Footer />
    </div>
  );
}
