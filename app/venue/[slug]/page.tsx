import { notFound } from "next/navigation";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { getVenueBySlug } from "@/lib/db/queries/venues";
import { getEvents } from "@/lib/db/queries/events";
import { MapPin, Globe, Instagram, Mail, Phone, CheckCircle2, Calendar, Edit, Plus } from "lucide-react";
import { EventCard } from "@/components/event-card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

interface VenuePageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function VenuePage({ params }: VenuePageProps) {
  const session = await auth();
  const { slug } = await params;
  let venue;
  let venueEvents: any[] = [];

  try {
    venue = await getVenueBySlug(slug);
    if (!venue) {
      notFound();
    }
    venueEvents = await getEvents({
      venue: venue.slug, // Use slug for filtering
      limit: 20,
    });
  } catch (error) {
    console.error("Error fetching venue:", error);
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Venue Hero */}
          <div className="mb-8 border-b border-border-subtle pb-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-fluid-4xl font-bold text-text-primary">
                    {venue.name}
                  </h1>
                  {venue.claim_status === 'verified' && (
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white" title="Verified Venue">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {venue.short_description && (
                  <p className="text-lg text-text-secondary max-w-2xl mb-4">
                    {venue.short_description}
                  </p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {venue.type && (
                    <span className="inline-flex items-center rounded-full bg-background-elevated px-3 py-1 text-sm font-medium text-text-primary">
                      {venue.type}
                    </span>
                  )}
                  {venue.tags?.map(tag => (
                    <span key={tag} className="inline-flex items-center rounded-full border border-border-default px-3 py-1 text-sm text-text-secondary">
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="space-y-2 text-base text-text-secondary">
                  {venue.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{venue.address}, {venue.city}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2">
                    {venue.website_url && (
                      <a href={venue.website_url} target="_blank" rel="noopener" className="flex items-center gap-2 hover:text-brand-accent transition-colors">
                        <Globe className="h-4 w-4" />
                        <span>Website</span>
                      </a>
                    )}
                    {venue.instagram_url && (
                      <a href={venue.instagram_url} target="_blank" rel="noopener" className="flex items-center gap-2 hover:text-brand-accent transition-colors">
                        <Instagram className="h-4 w-4 wait-0" />
                        <span>Instagram</span>
                      </a>
                    )}
                    {venue.phone && (
                      <a href={`tel:${venue.phone}`} className="flex items-center gap-2 hover:text-brand-accent transition-colors">
                        <Phone className="h-4 w-4" />
                        <span>{venue.phone}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 min-w-[200px]">
                {session?.user?.id && venue.claimed_by_user_id === session.user.id && (
                  <>
                    <Link href={`/venue/${venue.slug}/edit`}>
                      <Button className="w-full" variant="outline">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Venue
                      </Button>
                    </Link>
                    <Link href={`/submit?venue=${venue.id}&city=${venue.city}`}>
                      <Button className="w-full" variant="secondary">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Event
                      </Button>
                    </Link>
                  </>
                )}

                {venue.claim_status === 'unclaimed' && (
                  <Link href={`/organizer/claim?venue=${venue.id}`}>
                    <Button className="w-full" variant="outline">Claim this venue</Button>
                  </Link>
                )}
                <Button className="w-full">
                  <Calendar className="mr-2 h-4 w-4" />
                  Next Event
                  {venue.next_event_at && <span className="ml-1 opacity-70">({format(new Date(venue.next_event_at), 'MMM d')})</span>}
                </Button>
              </div>
            </div>

            {/* Stats Row */}
            <div className="mt-8 flex items-center gap-8 border-t border-border-subtle pt-6">
              <div>
                <p className="text-sm text-text-tertiary uppercase tracking-wider font-semibold">Upcoming Events</p>
                <p className="text-2xl font-bold text-text-primary">{venue.upcoming_events_count || 0}</p>
              </div>
              <div>
                <p className="text-sm text-text-tertiary uppercase tracking-wider font-semibold">Total Saves</p>
                <p className="text-2xl font-bold text-text-primary">{venue.total_saves || 0}</p>
              </div>
              <div>
                <p className="text-sm text-text-tertiary uppercase tracking-wider font-semibold">City</p>
                <p className="text-2xl font-bold text-text-primary">{venue.city}</p>
              </div>
            </div>
          </div>

          {/* About Section */}
          {venue.about && (
            <div className="mb-12">
              <h2 className="mb-4 text-xl font-bold text-text-primary">About</h2>
              <div className="prose prose-neutral max-w-3xl text-text-secondary">
                {venue.about}
              </div>
            </div>
          )}

          {/* Upcoming Events */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-fluid-2xl font-bold text-text-primary">
                Upcoming at {venue.name}
              </h2>
              {/* Optional filters for venue events could go here */}
            </div>

            {venueEvents.length === 0 ? (
              <div className="py-12 text-center border rounded-xl border-dashed border-border-default bg-background-surface">
                <p className="text-text-secondary mb-4">No upcoming events listed at this venue.</p>
                {venue.claim_status === 'verified' ? (
                  <Button variant="outline">Manage Events</Button>
                ) : (
                  <Button variant="secondary">Submit an Event</Button>
                )}
              </div>
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
                    savedCount={event.saved_count}
                    category={event.category || undefined}
                    isSaved={event.user_saved}
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
