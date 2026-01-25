import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface EventCardProps {
  id: string;
  slug: string;
  title: string;
  startAt: Date;
  venue?: {
    name: string;
    city: string;
  };
  imageUrl?: string;
  interestedCount?: number;
  goingCount?: number;
  category?: string;
  isPromoted?: boolean;
  className?: string;
}

export function EventCard({
  id,
  slug,
  title,
  startAt,
  venue,
  imageUrl,
  interestedCount = 0,
  goingCount = 0,
  category,
  isPromoted = false,
  className,
}: EventCardProps) {
  return (
    <Link
      href={`/event/${slug}`}
      className={cn(
        "group block overflow-hidden rounded-lg border border-border-default bg-background-surface transition-all hover:border-brand hover:shadow-lg",
        isPromoted && "ring-2 ring-brand",
        className
      )}
    >
      {/* Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-background-elevated">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text-tertiary">
            <Calendar className="h-12 w-12" />
          </div>
        )}
        {isPromoted && (
          <div className="absolute top-2 right-2 rounded bg-brand px-2 py-1 text-xs font-medium text-text-inverse">
            Promoted
          </div>
        )}
        {category && (
          <div className="absolute bottom-2 left-2 rounded bg-background-overlay/80 px-2 py-1 text-xs font-medium text-text-inverse backdrop-blur-sm">
            {category}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-text-primary group-hover:text-brand">
          {title}
        </h3>

        <div className="mt-2 space-y-1 text-sm text-text-secondary">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <time dateTime={startAt.toISOString()}>
              {format(startAt, "EEE, MMM d 'at' h:mm a")}
            </time>
          </div>
          {venue && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span>
                {venue.name}, {venue.city}
              </span>
            </div>
          )}
        </div>

        {/* Social Proof */}
        {(interestedCount > 0 || goingCount > 0) && (
          <div className="mt-3 flex items-center gap-4 text-sm text-text-secondary">
            {interestedCount > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{interestedCount} interested</span>
              </div>
            )}
            {goingCount > 0 && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{goingCount} going</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
