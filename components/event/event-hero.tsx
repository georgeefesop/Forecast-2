import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import type { Event } from "@/lib/db/queries/events";

interface EventHeroProps {
  event: Event;
}

export function EventHero({ event }: EventHeroProps) {
  return (
    <div className="mb-8">
      {/* Image */}
      {event.image_url && (
        <div className="relative mb-6 aspect-video w-full overflow-hidden rounded-lg bg-background-elevated">
          <Image
            src={event.image_url}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}

      {/* Title */}
      <h1 className="mb-4 text-fluid-4xl font-bold text-text-primary">
        {event.title}
      </h1>

      {/* Meta Info */}
      <div className="space-y-3 text-base text-text-secondary">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <time dateTime={event.start_at.toISOString()}>
            {format(new Date(event.start_at), "EEEE, MMMM d, yyyy 'at' h:mm a")}
            {event.end_at &&
              ` - ${format(new Date(event.end_at), "h:mm a")}`}
          </time>
        </div>

        {event.venue ? (
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <Link
              href={`/venue/${event.venue.slug}`}
              className="text-text-primary hover:underline"
            >
              {event.venue.name}
            </Link>
            {event.venue.city && <span>, {event.venue.city}</span>}
          </div>
        ) : event.address_text && (
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            <span>{event.address_text}</span>
          </div>
        )}

        {event.ticket_url && (
          <div className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            <a
              href={event.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-primary hover:underline"
            >
              Get Tickets
            </a>
          </div>
        )}

        {event.price_min !== null && (
          <div>
            {event.price_min === 0 ? (
              <span className="font-medium text-semantic-success">Free</span>
            ) : (
              <span>
                {event.price_min}
                {event.price_max && event.price_max !== event.price_min
                  ? ` - ${event.price_max}`
                  : ""}{" "}
                {event.currency}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <div className="mt-6 prose max-w-none">
          <p className="text-text-secondary whitespace-pre-line">
            {event.description}
          </p>
        </div>
      )}
    </div>
  );
}
