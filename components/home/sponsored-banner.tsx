import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { getEvents } from "@/lib/db/queries/events";

export async function SponsoredBanner() {
  // Fetch a featured event (first upcoming event with an image)
  let event: any = null;

  try {
    const events = await getEvents({
      limit: 10,
    });

    // Find first event with an image
    event = events.find((e) => e.local_image_url || e.image_url) || events[0] || null;
  } catch (error) {
    console.error("Error fetching sponsored event:", error);
  }

  if (!event) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border-default bg-background-elevated transition-all hover:shadow-lg">
      <div className="absolute top-4 right-4 z-10 rounded-full bg-background-overlay/80 backdrop-blur-sm border border-border-default px-3 py-1.5 text-sm font-medium text-text-inverse">
        Sponsored
      </div>
      <div className="grid md:grid-cols-2">
        {/* Image */}
        <Link
          href={`/event/${event.slug}`}
          className="relative aspect-video md:aspect-auto md:h-full min-h-[200px] block"
        >
          {(event.local_image_url || event.image_url) && (
            <Image
              src={event.local_image_url || event.image_url}
              alt={event.title}
              fill
              className="object-cover"
            />
          )}
        </Link>

        {/* Content */}
        <div className="flex flex-col justify-center p-8">
          <Link href={`/event/${event.slug}`} className="block">
            <h2 className="text-fluid-3xl font-bold text-text-primary">
              {event.title}
            </h2>
            {event.description && (
              <p className="mt-2 text-text-secondary line-clamp-2">{event.description}</p>
            )}
          </Link>

          <div className="mt-6 space-y-2 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={new Date(event.start_at).toISOString()}>
                {format(new Date(event.start_at), "EEEE, MMMM d 'at' h:mm a")}
              </time>
            </div>
            {event.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  {event.venue.name}, {event.venue.city}
                </span>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-4">
            {event.ticket_url && (
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-brand-accent px-6 py-3 text-sm font-medium text-text-inverse transition-colors hover:bg-brand-accent-hover"
              >
                Get Tickets
                <ArrowRight className="h-4 w-4" />
              </a>
            )}
            <Link
              href={`/event/${event.slug}`}
              className="text-sm font-medium text-text-primary hover:underline"
            >
              Learn more →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
