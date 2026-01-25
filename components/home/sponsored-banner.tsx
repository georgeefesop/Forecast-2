"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { format } from "date-fns";

// This will be replaced with real data from database
const mockSponsoredEvent = {
  id: "1",
  slug: "sample-event",
  title: "Featured Event - Live Music Night",
  description: "Join us for an unforgettable evening of live music",
  startAt: new Date(Date.now() + 86400000), // Tomorrow
  venue: {
    name: "The Venue",
    city: "Limassol",
    address: "123 Main Street",
  },
  imageUrl: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800",
  ticketUrl: "#",
};

export function SponsoredBanner() {
  const event = mockSponsoredEvent;
  const router = useRouter();

  const handleBannerClick = () => {
    router.push(`/event/${event.slug}`);
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-border-default bg-background-elevated">
      <div className="absolute top-4 right-4 z-10 rounded bg-brand px-3 py-1 text-sm font-medium text-text-inverse">
        Sponsored
      </div>
      <div 
        className="grid md:grid-cols-2 cursor-pointer"
        onClick={handleBannerClick}
      >
        {/* Image */}
        <div className="relative aspect-video md:aspect-auto md:h-full min-h-[200px]">
          {event.imageUrl && (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover"
            />
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center p-8">
          <h2 className="text-fluid-3xl font-bold text-text-primary">
            {event.title}
          </h2>
          <p className="mt-2 text-text-secondary">{event.description}</p>

          <div className="mt-6 space-y-2 text-sm text-text-secondary">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <time dateTime={event.startAt.toISOString()}>
                {format(event.startAt, "EEEE, MMMM d 'at' h:mm a")}
              </time>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>
                {event.venue.name}, {event.venue.city}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <Link
              href={event.ticketUrl}
              className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-sm font-medium text-text-inverse transition-colors hover:bg-brand/90"
              onClick={(e) => e.stopPropagation()}
            >
              Get Tickets
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={`/event/${event.slug}`}
              className="text-sm font-medium text-brand hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              Learn more
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
