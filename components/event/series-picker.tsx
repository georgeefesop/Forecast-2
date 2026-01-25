import Link from "next/link";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

interface SeriesPickerProps {
    currentSlug: string;
    occurrences: any[];
}

export function SeriesPicker({ currentSlug, occurrences }: SeriesPickerProps) {
    if (occurrences.length <= 1) return null;

    return (
        <div className="mt-8 rounded-xl border border-border-default bg-background-elevated p-6">
            <div className="flex items-center gap-2 mb-4 text-text-primary">
                <Calendar className="h-5 w-5" />
                <h3 className="font-bold">Other Dates for this Event</h3>
            </div>

            <div className="flex flex-wrap gap-3">
                {occurrences.map((occ) => {
                    const isActive = occ.slug === currentSlug;
                    const date = new Date(occ.start_at);

                    return (
                        <Link
                            key={occ.id}
                            href={`/event/${occ.slug}`}
                            className={cn(
                                "group relative flex flex-col items-center justify-center rounded-lg border px-4 py-3 transition-all",
                                isActive
                                    ? "border-brand-accent bg-brand-accent/10 shadow-sm"
                                    : "border-border-default bg-background hover:border-brand-accent/50 hover:shadow-md"
                            )}
                        >
                            <span className={cn(
                                "text-xs font-bold uppercase tracking-wider mb-1",
                                isActive ? "text-brand-accent" : "text-text-tertiary"
                            )}>
                                {format(date, "MMM")}
                            </span>
                            <span className={cn(
                                "text-2xl font-black leading-tight",
                                isActive ? "text-text-primary" : "text-text-secondary"
                            )}>
                                {format(date, "d")}
                            </span>
                            <span className={cn(
                                "text-[10px] font-medium opacity-70",
                                isActive ? "text-brand-accent" : "text-text-tertiary"
                            )}>
                                {format(date, "h:mm a")}
                            </span>

                            {isActive && (
                                <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-accent text-[10px] text-white">
                                    ✓
                                </div>
                            )}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
