"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";

// Shared constants (should be extracted to a config/constants file in refactor, keeping here for now)
const dateOptions = [
    { value: "today", label: "Today" },
    { value: "weekend", label: "This Weekend" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "past", label: "Past Events" },
];

const languageOptions = [
    { value: "en", label: "English" },
    { value: "el", label: "Greek" },
    { value: "ru", label: "Russian" },
];

export function ActiveFiltersList() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const [facetCounts, setFacetCounts] = useState<{
        venues: { value: string; label?: string; count: number }[];
    }>({ venues: [] });

    // Fetch facets solely for Venue labels
    useEffect(() => {
        fetch('/api/events/facets')
            .then(res => res.json())
            .then(data => {
                if (data && Array.isArray(data.venues)) {
                    setFacetCounts(prev => ({ ...prev, venues: data.venues }));
                }
            })
            .catch(err => console.error("Failed to fetch facets for active labels:", err));
    }, []);

    const city = searchParams.get("city");
    const date = searchParams.get("date");
    const category = searchParams.get("category");
    const free = searchParams.get("free") === "true";
    const language = searchParams.get("language");
    const sources = searchParams.get("sources");
    const venue = searchParams.get("venue");

    const updateFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        const targetPath = pathname === "/" ? "/" : "/explore";
        router.replace(`${targetPath}?${params.toString()}`, { scroll: false });
    };

    const toggleFree = () => {
        const params = new URLSearchParams(searchParams.toString());
        if (free) {
            params.delete("free");
        } else {
            params.set("free", "true");
        }
        const targetPath = pathname === "/" ? "/" : "/explore";
        router.replace(`${targetPath}?${params.toString()}`, { scroll: false });
    };

    if (!city && !date && !category && !free && !language && !sources && !venue) {
        return null;
    }

    return (
        <div className="flex flex-wrap items-center gap-2">
            {city && (
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-sm text-brand-accent animate-in fade-in zoom-in duration-200">
                    {city}
                    <button
                        onClick={() => updateFilter("city", null)}
                        className="ml-1 text-brand-accent/70 hover:text-brand-accent cursor-pointer"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            )}
            {date && (
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-sm text-brand-accent animate-in fade-in zoom-in duration-200">
                    {dateOptions.find((opt) => opt.value === date)?.label || date}
                    <button
                        onClick={() => updateFilter("date", null)}
                        className="ml-1 text-brand-accent/70 hover:text-brand-accent cursor-pointer"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            )}
            {category && (
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-sm text-brand-accent animate-in fade-in zoom-in duration-200">
                    {category}
                    <button
                        onClick={() => updateFilter("category", null)}
                        className="ml-1 text-brand-accent/70 hover:text-brand-accent cursor-pointer"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            )}
            {free && (
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-sm text-brand-accent animate-in fade-in zoom-in duration-200">
                    Free
                    <button
                        onClick={toggleFree}
                        className="ml-1 text-brand-accent/70 hover:text-brand-accent cursor-pointer"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            )}
            {sources && sources.split(",").map((s) => (
                <span key={s} className="inline-flex items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-sm text-brand-accent animate-in fade-in zoom-in duration-200">
                    {s.split("_").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                    <button
                        onClick={() => {
                            const currentParams = new URLSearchParams(searchParams.toString());
                            const list = sources.split(",").filter((item) => item !== s);
                            if (list.length > 0) currentParams.set("sources", list.join(","));
                            else currentParams.delete("sources");
                            const targetPath = pathname === "/" ? "/" : "/explore";
                            router.replace(`${targetPath}?${currentParams.toString()}`, { scroll: false });
                        }}
                        className="ml-1 text-brand-accent/70 hover:text-brand-accent cursor-pointer"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            ))}
            {venue && (
                <span className="inline-flex items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-sm text-brand-accent animate-in fade-in zoom-in duration-200">
                    {facetCounts.venues?.find(v => v.value === venue)?.label || venue}
                    <button
                        onClick={() => updateFilter("venue", null)}
                        className="ml-1 text-brand-accent/70 hover:text-brand-accent cursor-pointer"
                    >
                        <X className="h-3 w-3" />
                    </button>
                </span>
            )}
        </div>
    );
}
