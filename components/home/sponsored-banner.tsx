import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { getEvents } from "@/lib/db/queries/events";

interface SponsoredBannerProps {
  variant?: "horizontal" | "vertical";
}

export async function SponsoredBanner({ variant = "horizontal" }: SponsoredBannerProps) {
  // Fetch a featured event (first upcoming event with an image)
  let event: any = null;

  try {
    const events = await getEvents({
      search: "Kalopedis",
      limit: 1,
    });
    event = events[0] || null;
  } catch (error) {
    console.error("Error fetching sponsored event:", error);
  }

  if (!event) {
    return null;
  }

  const isVertical = variant === "vertical";

  const normalizeTitle = (text: string) => {
    if (!text) return text;
    if (text.length > 3 && text === text.toUpperCase() && text !== text.toLowerCase()) {
      return text.charAt(0) + text.slice(1).toLowerCase();
    }
    return text;
  };

  const displayTitle = normalizeTitle(event.title);

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-border-default bg-background-elevated transition-all hover:shadow-lg",
      isVertical ? "flex flex-col h-auto" : "grid md:grid-cols-2"
    )}>
      <div className="absolute top-4 right-4 z-20 rounded-full bg-background-overlay/80 backdrop-blur-sm border border-white/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white shadow-lg">
        Sponsored
      </div>

      {/* Image */}
      <Link
        href={`/event/${event.slug}`}
        className={cn(
          "relative block overflow-hidden",
          isVertical ? "aspect-[4/5] w-full" : "aspect-video md:aspect-auto md:h-full min-h-[220px]"
        )}
      >
        {(event.local_image_url || event.image_url) && (
          <Image
            src={event.local_image_url || event.image_url}
            alt={event.title}
            fill
            className="object-cover transition-transform duration-700"
          />
        )}
        {/* Scrim for text overlay if needed, but here we have a content area */}
      </Link>

      {/* Content */}
      <div className={cn(
        "flex flex-col justify-center",
        isVertical ? "p-5" : "p-8 md:p-10"
      )}>
        <Link href={`/event/${event.slug}`} className="block group">
          <h2 className={cn(
            "font-serif font-medium text-text-primary transition-colors group-hover:text-brand-accent",
            isVertical ? "text-xl leading-tight" : "text-3xl md:text-4xl leading-tight"
          )}>
            {displayTitle}
          </h2>
          {event.description && (
            <p className={cn(
              "mt-3 text-text-secondary h-min",
              isVertical ? "text-xs line-clamp-2" : "text-base line-clamp-3"
            )}>
              {event.description}
            </p>
          )}
        </Link>

        <div className={cn(
          "mt-6 space-y-2.5 text-text-secondary",
          isVertical ? "text-xs" : "text-sm"
        )}>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 opacity-70" />
            <time dateTime={new Date(event.start_at).toISOString()}>
              {format(new Date(event.start_at), isVertical ? "EEE, MMM d 'at' h:mm a" : "EEEE, MMMM d 'at' h:mm a")}
            </time>
          </div>
          {event.venue && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 opacity-70" />
              <span className="line-clamp-1">
                {event.venue.name}
              </span>
            </div>
          )}
        </div>

        <div className={cn(
          "mt-6 flex items-center",
          isVertical ? "flex-col gap-3" : "gap-6"
        )}>
          {event.ticket_url && (
            <a
              href={event.ticket_url}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "inline-flex items-center justify-center gap-2 rounded-full bg-brand-accent px-6 py-3 font-bold text-text-inverse transition-all hover:scale-105 hover:bg-brand-accent/90 shadow-md",
                isVertical ? "w-full text-xs" : "text-sm"
              )}
            >
              Get Tickets
              <ArrowRight className="h-4 w-4" />
            </a>
          )}
          <Link
            href={`/event/${event.slug}`}
            className={cn(
              "font-bold text-text-primary hover:underline underline-offset-4",
              isVertical ? "text-[11px] uppercase tracking-wider" : "text-sm"
            )}
          >
            Details →
          </Link>
        </div>
      </div>
    </div>
  );
}
