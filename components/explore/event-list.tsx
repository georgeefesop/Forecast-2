
"use client";

import { useState } from "react";
import { EventCard } from "@/components/event-card";
import { Event } from "@/lib/db/queries/events"; // Assuming type is exported
import { LayoutGrid, List } from "lucide-react"; // Icons
import { format } from "date-fns";

interface EventListProps {
    events: any[]; // Using any to avoid strict type coupling for now, but should matches Event
}

export function EventList({ events }: EventListProps) {
    const [view, setView] = useState<"grid" | "table">("grid");

    if (events.length === 0) {
        return (
            <div className="py-12 text-center">
                <p className="text-text-secondary">No events found.</p>
            </div>
        );
    }

    return (
        <div>
            {/* View Toggle */}
            <div className="mb-6 flex justify-end">
                <div className="flex items-center rounded-md border border-border-default bg-background-elevated p-1">
                    <button
                        onClick={() => setView("grid")}
                        className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${view === "grid"
                            ? "bg-brand-accent text-text-inverse shadow-sm"
                            : "text-text-secondary hover:bg-background-surface hover:text-text-primary"
                            }`}
                        aria-label="Grid view"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => setView("table")}
                        className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${view === "table"
                            ? "bg-brand-accent text-text-inverse shadow-sm"
                            : "text-text-secondary hover:bg-background-surface hover:text-text-primary"
                            }`}
                        aria-label="Table view"
                    >
                        <List className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* Grid View */}
            {view === "grid" && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map((event, index) => (
                        <EventCard
                            key={event.id}
                            id={event.id}
                            slug={event.slug}
                            title={event.title}
                            index={index}
                            startAt={new Date(event.start_at)}
                            venue={event.venue}
                            imageUrl={event.local_image_url || event.image_url || undefined}
                            imageSizeKb={event.image_size_kb && !isNaN(Number(event.image_size_kb)) ? Number(event.image_size_kb) : null}
                            savedCount={event.saved_count}
                            category={event.category || undefined}
                            sourceName={event.source_name || undefined}
                            priceMin={event.price_min}
                            isSaved={event.user_saved}
                        />
                    ))}
                </div>
            )}

            {/* Table View */}
            {view === "table" && (
                <div className="overflow-hidden rounded-lg border border-border-default bg-background-elevated shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-text-secondary">
                            <thead className="border-b border-border-default bg-background-surface text-text-primary">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Date & Time</th>
                                    <th className="px-6 py-4 font-semibold">Event</th>
                                    <th className="px-6 py-4 font-semibold">Venue</th>
                                    <th className="px-6 py-4 font-semibold">Category</th>
                                    <th className="px-6 py-4 font-semibold">Price</th>
                                    <th className="px-6 py-4 text-right font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border-default">
                                {events.map((event) => {
                                    const date = new Date(event.start_at);
                                    const isFree = !event.price_min || event.price_min === 0;

                                    return (
                                        <tr key={event.id} className="hover:bg-background-surface/50 transition-colors">
                                            <td className="whitespace-nowrap px-6 py-4">
                                                <div className="font-medium text-text-primary">
                                                    {format(date, "MMM d, yyyy")}
                                                </div>
                                                <div className="text-xs text-text-tertiary">
                                                    {format(date, "h:mm a")}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {(() => {
                                                    const displayTitle = event.title === event.title.toUpperCase() && event.title.length > 3
                                                        ? event.title.charAt(0) + event.title.slice(1).toLowerCase()
                                                        : event.title;
                                                    return (
                                                        <a
                                                            href={`/event/${event.slug}`}
                                                            className="font-serif font-medium text-text-primary hover:text-brand-accent transition-colors"
                                                        >
                                                            {displayTitle}
                                                        </a>
                                                    );
                                                })()}
                                            </td>
                                            <td className="px-6 py-4">
                                                {event.venue ? (
                                                    <span className="text-text-primary">{event.venue.name}</span>
                                                ) : (
                                                    <span className="italic text-text-tertiary">Unknown Venue</span>
                                                )}
                                                {event.city && (
                                                    <div className="text-xs text-text-tertiary">{event.city}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {event.category ? (
                                                    <span className="inline-flex items-center rounded-full bg-background-surface px-2.5 py-0.5 text-xs font-medium text-text-secondary border border-border-default">
                                                        {event.category}
                                                    </span>
                                                ) : (
                                                    "-"
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                {isFree ? (
                                                    <span className="font-medium text-semantic-success">Free</span>
                                                ) : (
                                                    <span>
                                                        €{event.price_min}
                                                        {event.price_max && event.price_max > event.price_min && ` - €${event.price_max}`}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <a
                                                    href={`/event/${event.slug}`}
                                                    className="inline-flex items-center text-sm font-medium text-brand-accent hover:text-brand-accent-hover"
                                                >
                                                    View
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
