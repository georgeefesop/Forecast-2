import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { MapPin, Calendar, CheckCircle2, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Venue } from "@/lib/db/queries/venues";

interface VenueCardProps {
    venue: Venue;
}

export function VenueCard({ venue }: VenueCardProps) {
    // Use first image or fallback
    const imageUrl = venue.images?.[0] || null;

    return (
        <Link
            href={`/venue/${venue.slug}`}
            className="group block overflow-hidden rounded-xl border border-border-default bg-background-surface transition-all hover:border-border-strong hover:shadow-md no-underline hover:!no-underline"
        >
            {/* Image */}
            <div className="relative aspect-[3/2] w-full overflow-hidden bg-background-elevated">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={venue.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-text-tertiary">
                        <span className="text-3xl">🏛️</span>
                    </div>
                )}

                {/* Badges */}
                <div className="absolute left-2 top-2 flex gap-1.5">
                    {venue.claim_status === 'verified' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/90 px-1.5 py-0.5 text-[9px] font-bold text-white backdrop-blur-sm">
                            <CheckCircle2 className="h-2.5 w-2.5" />
                            VERIFIED
                        </span>
                    )}
                    {venue.claim_status === 'unclaimed' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-background-overlay/80 px-1.5 py-0.5 text-[9px] font-medium text-text-inverse backdrop-blur-sm">
                            Claim
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-3">
                <div className="mb-0.5 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 font-serif text-base font-medium text-text-primary group-hover:text-brand-accent group-hover:underline transition-colors">
                        {venue.name}
                    </h3>
                </div>

                <div className="mb-2 flex items-center gap-1 text-[11px] text-text-secondary group-hover:underline">
                    <MapPin className="h-3.5 w-3.5 opacity-70" />
                    <span className="line-clamp-1">
                        {venue.city}
                        {venue.area ? `, ${venue.area}` : ''}
                    </span>
                </div>

                <div className="mb-3 flex flex-wrap gap-1.5">
                    {venue.type && (
                        <span className="inline-flex items-center rounded-sm bg-background-elevated px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-text-secondary group-hover:underline">
                            {venue.type}
                        </span>
                    )}
                    {venue.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="inline-flex items-center rounded-sm border border-border-default px-1.5 py-0.5 text-[9px] text-text-secondary group-hover:underline">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Footer / Stats */}
                <div className="flex items-center justify-between border-t border-border-subtle pt-2">
                    <div className="flex items-center gap-2">
                        {venue.upcoming_events_count && venue.upcoming_events_count > 0 ? (
                            <div className="flex items-center gap-1 text-[11px] font-medium text-brand-accent group-hover:underline">
                                <Calendar className="h-3 w-3" />
                                <span>{venue.upcoming_events_count} upcoming</span>
                                {venue.next_event_at && (
                                    <span className="text-text-tertiary px-1 whitespace-nowrap hidden sm:inline">• {format(new Date(venue.next_event_at), 'MMM d')}</span>
                                )}
                            </div>
                        ) : (
                            <span className="text-[10px] text-text-tertiary">No upcoming events</span>
                        )}
                    </div>

                    {venue.total_saves !== undefined && venue.total_saves > 0 && (
                        <div className="flex items-center gap-1 text-[10px] font-medium text-text-secondary" title="Total saves">
                            <Heart className="h-3 w-3 text-red-500 fill-red-500/10" />
                            <span>{venue.total_saves}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
