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
  sourceName?: string;
  priceMin?: number | null;
  seriesId?: string | null;
  isSeries?: boolean;
  size?: 'small' | 'wide' | 'tall' | 'big';
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
  sourceName,
  priceMin,
  seriesId,
  isSeries = false,
  size = 'wide',
}: EventCardProps) {

  // Determine image sizing based on card size
  // For 'big' and 'tall' (multi-row), we let the image fill the available space (flex-1)
  // For 'small' and 'wide' (single-row), we enforce aspect ratio to keep them uniform

  const useFlexImage = size === 'big' || size === 'tall';

  let imageClass = "relative w-full overflow-hidden bg-background-elevated";
  if (useFlexImage) {
    imageClass += " flex-1 min-h-0"; // Grow to fill height
  } else {
    imageClass += " shrink-0"; // Fixed height based on aspect ratio
    if (size === 'small') imageClass += " aspect-[4/3]";
    else imageClass += " aspect-[2/1]"; // wide
  }

  // Determine content sizing
  // If image fills space, content should be auto height (flex-none)
  // If image is fixed, content fills remaining space (flex-1)
  const contentClass = useFlexImage ? "flex-none" : "flex-1";

  return (
    <Link
      href={`/event/${slug}`}
      className={cn(
        "group block overflow-hidden rounded-lg border border-border-subtle bg-background-elevated transition-all hover:shadow-md h-full flex flex-col",
        isPromoted && "border-border-default",
        className
      )}
    >
      {/* Image */}
      <div className={cn(imageClass)}>
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
          <div className="absolute top-2 right-2 rounded-full bg-background-overlay/80 backdrop-blur-sm border border-border-default px-3 py-1 text-xs font-medium text-text-inverse">
            Promoted
          </div>
        )}
        {isSeries && (
          <div className="absolute top-2 left-2 rounded-full bg-brand-accent/90 backdrop-blur-sm px-3 py-1 text-xs font-bold text-text-inverse shadow-sm group-hover:bg-brand-accent transition-colors">
            Series
          </div>
        )}
      </div>

      {/* Content */}
      <div className={cn("flex flex-col p-4 relative", contentClass)}>
        <h3 className={cn(
          "line-clamp-2 font-semibold text-text-primary mb-2",
          size === 'big' ? "text-fluid-xl" : "text-base"
        )}>
          {title}
        </h3>

        <div className="space-y-1 text-sm text-text-secondary mb-1 flex-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 shrink-0" />
            <time dateTime={startAt.toISOString()} suppressHydrationWarning>
              {format(startAt, "EEE, MMM d 'at' h:mm a")}
            </time>
          </div>
          {venue && (
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="line-clamp-1">
                {venue.name}, {venue.city}
              </span>
            </div>
          )}
        </div>

        {/* Price/Free Badge for large cards (replaces footer) */}
        {useFlexImage && (
          <div className={cn("absolute bottom-4 right-4 font-medium text-xs", !priceMin ? "text-green-600" : "text-text-primary")}>
            {!priceMin ? "Free" : `€${Number(priceMin).toFixed(2)}`}
          </div>
        )}

        {/* Footer info: Category, Price, Stats - Only shown for small/wide cards */}
        {!useFlexImage && (
          <div className="flex items-center justify-between pt-3 border-t border-border-default mt-auto">
            <div className="flex items-center gap-2">
              {category && (
                <span className="inline-flex items-center rounded-sm bg-background-overlay px-2 py-1 text-xs font-medium text-text-secondary ring-1 ring-inset ring-border-default">
                  {category}
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-text-tertiary font-medium">
              {/* Stats */}
              {(interestedCount > 0 || goingCount > 0) && (
                <div className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" />
                  <span>{interestedCount + goingCount}</span>
                </div>
              )}

              {/* Price Display */}
              <div className={cn("font-medium", !priceMin ? "text-green-600" : "text-text-primary")}>
                {!priceMin ? (
                  "Free"
                ) : (
                  `€${Number(priceMin).toFixed(2)}`
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
