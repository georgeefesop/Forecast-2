"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Search, MapPin, Grid, Layers, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";
import { cn } from "@/lib/utils";

const CITIES = ["Limassol", "Nicosia", "Larnaca", "Paphos", "Ayia Napa"];
const TYPES = ["Club", "Bar", "Theatre", "Gallery", "Restaurant", "Festival Site", "Community", "Other"];
const SORT_OPTIONS = [
    { value: "active", label: "Most Active" },
    { value: "trending", label: "Trending" },
    { value: "az", label: "A-Z" },
];

export function VenueFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleSearch = useDebouncedCallback((term: string) => {
        const params = new URLSearchParams(searchParams);
        if (term) {
            params.set("q", term);
        } else {
            params.delete("q");
        }
        router.replace(`/venues?${params.toString()}`);
    }, 300);

    const updateFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams);
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.replace(`/venues?${params.toString()}`);
    };

    return (
        <div className="space-y-4">
            {/* Top Bar: Search + Main Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                {/* Search */}
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                    <Input
                        placeholder="Search venues..."
                        className="pl-9 bg-background-surface border-border-default"
                        defaultValue={searchParams.get("q")?.toString()}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                    />
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-2 overflow-x-auto scrollbar-hide">
                    {/* City Dropdown/Select (Simplified as chips for now or native select) */}
                    <select
                        className="h-10 rounded-full border border-border-default bg-background-surface px-4 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                        value={searchParams.get("city") || ""}
                        onChange={(e) => updateFilter("city", e.target.value || null)}
                    >
                        <option value="">All Cities</option>
                        {CITIES.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>

                    {/* Type Dropdown */}
                    <select
                        className="h-10 rounded-full border border-border-default bg-background-surface px-4 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                        value={searchParams.get("type") || ""}
                        onChange={(e) => updateFilter("type", e.target.value || null)}
                    >
                        <option value="">All Types</option>
                        {TYPES.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>

                    {/* Sort */}
                    <select
                        className="h-10 rounded-full border border-border-default bg-background-surface px-4 text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
                        value={searchParams.get("sort") || "active"}
                        onChange={(e) => updateFilter("sort", e.target.value)}
                    >
                        {SORT_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Active Filters Display */}
            {(searchParams.get("type") || searchParams.get("q")) && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <span>Active filters:</span>
                    {searchParams.get("q") && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-background-elevated px-2 py-0.5">
                            "{searchParams.get("q")}"
                            <button onClick={() => {
                                const input = document.querySelector('input[placeholder="Search venues..."]') as HTMLInputElement;
                                if (input) input.value = '';
                                handleSearch('');
                            }}><X className="h-3 w-3" /></button>
                        </span>
                    )}
                    {searchParams.get("type") && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-background-elevated px-2 py-0.5">
                            {searchParams.get("type")}
                            <button onClick={() => updateFilter("type", null)}><X className="h-3 w-3" /></button>
                        </span>
                    )}
                    <button onClick={() => router.replace('/venues')} className="text-xs text-text-tertiary hover:text-text-primary underline">
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}
