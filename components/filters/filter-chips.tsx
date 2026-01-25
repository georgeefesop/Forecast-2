"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const cities = ["Limassol", "Nicosia", "Larnaca", "Paphos", "Ayia Napa"];
const dateOptions = [
  { value: "today", label: "Today" },
  { value: "weekend", label: "This Weekend" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
  { value: "past", label: "Past Events" },
];

export function FilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [categories, setCategories] = useState<{ name: string, count: number }[]>([
    { name: "Music", count: 0 },
    { name: "Theatre", count: 0 },
    { name: "Arts", count: 0 },
    { name: "Nightlife", count: 0 }
  ]);

  // Fetch active categories on mount
  useEffect(() => {
    fetch('/api/events/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          // Normalize names
          const formatted = data.categories.map((c: { name: string, count: number }) => ({
            name: c.name.charAt(0).toUpperCase() + c.name.slice(1).toLowerCase(),
            count: c.count
          }));

          // Deduplicate by name, summing counts if duplicates exist (rare due to API group by)
          const uniqueMap = new Map<string, number>();
          formatted.forEach((item: { name: string, count: number }) => { // added type annotation
            const current = uniqueMap.get(item.name) || 0;
            uniqueMap.set(item.name, current + item.count);
          });

          const unique = Array.from(uniqueMap.entries()).map(([name, count]) => ({ name, count }));
          setCategories(unique);
        }
      })
      .catch(err => console.error("Failed to fetch categories:", err));
  }, []);

  const city = searchParams.get("city") || "";
  const date = searchParams.get("date") || "";
  const category = searchParams.get("category") || "";
  const free = searchParams.get("free") === "true";

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Use replace to avoid cluttering history with filter changes
    router.replace(`/explore?${params.toString()}`);
  };

  const toggleFree = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (free) {
      params.delete("free");
    } else {
      params.set("free", "true");
    }
    router.replace(`/explore?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* City Select */}
        <select
          value={city}
          onChange={(e) => updateFilter("city", e.target.value || null)}
          className="rounded-md border border-border-default bg-background-surface px-3 py-2 text-sm text-text-primary focus:border-border-strong focus:outline-none"
        >
          <option value="">All Cities</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Date Select */}
        <select
          value={date}
          onChange={(e) => updateFilter("date", e.target.value || null)}
          className="rounded-md border border-border-default bg-background-surface px-3 py-2 text-sm text-text-primary focus:border-border-strong focus:outline-none"
        >
          <option value="">All Dates</option>
          {dateOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Category Tags */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => updateFilter("category", category === cat.name ? null : cat.name)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all shadow-sm",
                category === cat.name
                  ? "border-brand-accent bg-brand-accent text-white hover:bg-brand-accent-hover ring-2 ring-brand-accent/20"
                  : "border-border-default bg-background-surface text-text-secondary hover:bg-background-elevated hover:border-border-strong"
              )}
            >
              <span>{cat.name}</span>
              <span className={cn(
                "ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold leading-none",
                category === cat.name
                  ? "bg-white text-brand-accent"
                  : "bg-background-neutral text-text-tertiary"
              )}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Free Toggle */}
        <button
          onClick={toggleFree}
          className={cn(
            "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
            free
              ? "border-brand-accent bg-brand-accent/10 text-brand-accent"
              : "border-border-default bg-background-surface text-text-secondary hover:bg-background-elevated"
          )}
        >
          Free
        </button>

        {/* More Filters Button (Mobile) */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className="md:hidden"
        >
          More filters
        </Button>

        {/* Clear Filters */}
        {(date || category || free || city) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams();
              // Use replace to avoid adding to history, and ensure fresh fetch
              router.replace(`/explore?${params.toString()}`);
            }}
            className="text-text-tertiary"
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {(date || category || free || city) && (
        <div className="flex flex-wrap gap-2">
          {city && (
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-sm text-brand-accent">
              {city}
              <button
                onClick={() => updateFilter("city", null)}
                className="ml-1 text-brand-accent/70 hover:text-brand-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {date && (
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-sm text-brand-accent">
              {dateOptions.find((opt) => opt.value === date)?.label}
              <button
                onClick={() => updateFilter("date", null)}
                className="ml-1 text-brand-accent/70 hover:text-brand-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {category && (
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-sm text-brand-accent">
              {category}
              <button
                onClick={() => updateFilter("category", null)}
                className="ml-1 text-brand-accent/70 hover:text-brand-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {free && (
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-sm text-brand-accent">
              Free
              <button
                onClick={toggleFree}
                className="ml-1 text-brand-accent/70 hover:text-brand-accent"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
