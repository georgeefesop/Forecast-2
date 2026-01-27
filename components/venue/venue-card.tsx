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
            className="group block overflow-hidden rounded-xl border border-border-default bg-background-surface transition-all hover:border-border-strong hover:shadow-md"
        >
            {/* Image */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-background-elevated">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={venue.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-text-tertiary">
                        <span className="text-4xl">🏛️</span>
                    </div>
                )}

                {/* Badges */}
                <div className="absolute left-3 top-3 flex gap-2">
                    {venue.claim_status === 'verified' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/90 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                            <CheckCircle2 className="h-3 w-3" />
                            VERIFIED
                        </span>
                    )}
                    {venue.claim_status === 'unclaimed' && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-background-overlay/80 px-2 py-0.5 text-[10px] font-medium text-text-inverse backdrop-blur-sm">
                            Claim this
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="mb-1 flex items-start justify-between gap-2">
                    <h3 className="line-clamp-1 font-serif text-lg font-medium text-text-primary group-hover:text-brand-accent transition-colors">
                        {venue.name}
                    </h3>
                </div>

                <div className="mb-3 flex items-center gap-1.5 text-xs text-text-secondary">
                    <MapPin className="h-3.5 w-3.5 opacity-70" />
                    <span className="line-clamp-1">
                        {venue.city}
                        {venue.area ? `, ${venue.area}` : ''}
                    </span>
                </div>

                <div className="mb-4 flex flex-wrap gap-2">
                    {venue.type && (
                        <span className="inline-flex items-center rounded-sm bg-background-elevated px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-text-secondary">
                            {venue.type}
                        </span>
                    )}
                    {venue.tags?.slice(0, 2).map(tag => (
                        <span key={tag} className="inline-flex items-center rounded-sm border border-border-default px-2 py-1 text-[10px] text-text-secondary">
                            {tag}
                        </span>
                    ))}
                </div>

                {/* Footer / Stats */}
                <div className="flex items-center justify-between border-t border-border-subtle pt-3">
                    <div className="flex items-center gap-3">
                        {venue.upcoming_events_count && venue.upcoming_events_count > 0 ? (
                            <div className="flex items-center gap-1.5 text-xs font-medium text-brand-accent">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>{venue.upcoming_events_count} upcoming</span>
                                {venue.next_event_at && (
                                    <span className="text-text-tertiary px-1 whitespace-nowrap">• {format(new Date(venue.next_event_at), 'MMM d')}</span>
                                )}
                            </div>
                        ) : (
                            <span className="text-xs text-text-tertiary">No upcoming events</span>
                        )}
                    </div>

                    {venue.total_saves !== undefined && venue.total_saves > 0 && (
                        <div className="flex items-center gap-1 text-xs font-medium text-text-secondary" title="Total saves for all events at this venue">
                            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500/10" />
                            <span>{venue.total_saves}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
