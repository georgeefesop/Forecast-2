"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ClearFiltersButton() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // Check if any standard filters are active (sources, city, date, category, free, language)
    const hasActiveFilters =
        searchParams.has("sources") ||
        searchParams.has("city") ||
        searchParams.has("date") ||
        searchParams.has("category") ||
        searchParams.has("free") ||
        searchParams.has("language");

    if (!hasActiveFilters) return null;

    const clearAll = () => {
        // Navigate to correct base path with NO params
        const targetPath = pathname === "/" ? "/" : "/explore";
        router.push(targetPath);
    };

    return (
        <button
            onClick={clearAll}
            className={cn(
                "text-sm font-medium text-text-tertiary hover:text-brand-desctructive transition-colors border-b border-transparent hover:border-brand-desctructive ml-4"
            )}
        >
            Clear all filters
        </button>
    );
}
