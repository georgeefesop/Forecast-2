"use client";

import { useState, useEffect, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { GalleryGrid } from "./gallery-grid";
import { Loader2 } from "lucide-react";

interface LiveEventFeedProps {
    initialEvents: any[];
}

export function LiveEventFeed({ initialEvents }: LiveEventFeedProps) {
    const searchParams = useSearchParams();
    const [events, setEvents] = useState(initialEvents);
    const [isPending, startTransition] = useTransition();
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Current filter keys
        const city = searchParams.get("city");
        const category = searchParams.get("category");
        const date = searchParams.get("date");
        const free = searchParams.get("free") === "true";
        const language = searchParams.get("language");
        const venue = searchParams.get("venue");
        const sources = searchParams.get("sources");
        const hiddenLanguages = searchParams.get("hidden_languages");

        // If no filters, revert to initial events
        if (!city && !category && !date && !free && !language && !venue && !sources && !hiddenLanguages) {
            setEvents(initialEvents);
            return;
        }

        // Otherwise, fetch filtered events from the internal API
        const fetchFiltered = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams(searchParams.toString());
                // Ensure we only get primary occurrences
                params.set("primaryOnly", "true");

                // Explicitly ensure hidden_languages is passed (it should be in searchParams.toString(), but good to be safe/clear)
                if (hiddenLanguages) {
                    params.set("hidden_languages", hiddenLanguages);
                }

                // Reset offset logic if we were paging (not implemented yet but good practice)
                if (!params.get("limit")) params.set("limit", "40");

                const response = await fetch(`/api/events?${params.toString()}`);
                if (!response.ok) throw new Error("Failed to fetch");

                const data = await response.json();

                startTransition(() => {
                    setEvents(data.events || []);
                });
            } catch (error) {
                console.error("Filtering error:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFiltered();
    }, [searchParams, initialEvents]);

    return (
        <div className="relative min-h-[400px]">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 z-20 flex items-start justify-center bg-background/50 pt-20 backdrop-blur-sm transition-opacity">
                    <div className="flex items-center gap-2 rounded-full bg-bg-surface px-4 py-2 shadow-lg border border-border-default">
                        <Loader2 className="h-4 w-4 animate-spin text-brand-accent" />
                        <span className="text-sm font-medium">Updating...</span>
                    </div>
                </div>
            )}

            {/* Grid */}
            <div className={isLoading ? "opacity-50 grayscale-[20%] transition-all duration-300" : "transition-all duration-300"}>
                {events.length > 0 ? (
                    <GalleryGrid events={events} />
                ) : !isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="h-12 w-12 rounded-full bg-bg-elevated flex items-center justify-center mb-4">
                            <span className="text-2xl">🔎</span>
                        </div>
                        <h3 className="text-xl font-serif font-medium text-text-primary">No events found</h3>
                        <p className="text-text-secondary mt-2">Try adjusting your filters to find what's happening.</p>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
