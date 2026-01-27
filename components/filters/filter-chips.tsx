"use client";

import { useState, useEffect, useRef } from "react";
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

const languageOptions = [
  { value: "en", label: "English" },
  { value: "el", label: "Greek" },
  { value: "ru", label: "Russian" },
];

interface FilterChipsProps {
  masked?: boolean;
}

export function FilterChips({ masked = true }: FilterChipsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Horizontal Wheel Scroll logic
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // If we're already scrolling horizontally, let it be. 
      // Otherwise, convert vertical scroll (deltaY) to horizontal.
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;

      e.preventDefault();
      el.scrollBy({
        left: e.deltaY,
        behavior: 'auto' // We let 'scroll-smooth' class handle the feel or keep it responsive.
      });
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, []);

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
          formatted.forEach((item: { name: string, count: number }) => {
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
  const language = searchParams.get("language") || "";

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

  const commonSelectListClass = "h-10 cursor-pointer appearance-none rounded-full border px-4 pr-8 text-sm font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-text-primary";

  const getSelectClass = (isActive: boolean) => cn(
    commonSelectListClass,
    isActive
      ? "bg-text-primary text-text-inverse border-text-primary shadow-md hover:bg-text-primary/90"
      : "bg-bg-surface text-text-primary border-border-subtle hover:bg-bg-elevated hover:border-border-default"
  );

  return (
    <div className="w-full overflow-hidden">
      <div
        ref={scrollRef}
        className={cn(
          "flex items-center gap-2 overflow-x-auto pb-4 pt-1 scrollbar-hide px-1 scroll-smooth",
          masked && "mask-fade-right"
        )}>
        {/* City Select */}
        <div className="relative shrink-0">
          <select
            value={city}
            onChange={(e) => updateFilter("city", e.target.value || null)}
            className={getSelectClass(!!city)}
          >
            <option value="" className="bg-bg-surface text-text-primary">All Cities</option>
            {cities.map((c) => (
              <option key={c} value={c} className="bg-bg-surface text-text-primary">
                {c}
              </option>
            ))}
          </select>
          <div className={cn(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
            city ? "text-text-inverse/70" : "text-text-tertiary"
          )}>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Date Select */}
        <div className="relative shrink-0">
          <select
            value={date}
            onChange={(e) => updateFilter("date", e.target.value || null)}
            className={getSelectClass(!!date)}
          >
            <option value="" className="bg-bg-surface text-text-primary">All Dates</option>
            {dateOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-bg-surface text-text-primary">
                {opt.label}
              </option>
            ))}
          </select>
          <div className={cn(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
            date ? "text-text-inverse/70" : "text-text-tertiary"
          )}>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Language Select */}
        <div className="relative shrink-0">
          <select
            value={language}
            onChange={(e) => updateFilter("language", e.target.value || null)}
            className={getSelectClass(!!language)}
          >
            <option value="" className="bg-bg-surface text-text-primary">All Languages</option>
            {languageOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-bg-surface text-text-primary">
                {opt.label}
              </option>
            ))}
          </select>
          <div className={cn(
            "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-colors",
            language ? "text-text-inverse/70" : "text-text-tertiary"
          )}>
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Category Tags */}
        <div className="flex items-center gap-2 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => updateFilter("category", category === cat.name ? null : cat.name)}
              className={cn(
                "group flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-200 shrink-0 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-text-primary",
                category === cat.name
                  ? "bg-text-primary text-text-inverse border-text-primary shadow-md hover:bg-text-primary/90"
                  : "bg-bg-surface text-text-primary border-border-subtle hover:bg-bg-elevated hover:border-border-default"
              )}
            >
              <span>{cat.name}</span>
              <span className={cn(
                "inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold leading-none transition-colors",
                category === cat.name
                  ? "bg-surface-1 text-text-primary" // Inverted inside active chip
                  : "bg-bg-elevated text-text-tertiary group-hover:bg-border-subtle"
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
            "group flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-200 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-text-primary",
            free
              ? "bg-text-primary text-text-inverse border-text-primary shadow-md hover:bg-text-primary/90"
              : "bg-bg-surface text-text-primary border-border-subtle hover:bg-bg-elevated hover:border-border-default"
          )}
        >
          Free
        </button>

        {/* More Filters Button (Mobile) */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowMoreFilters(!showMoreFilters)}
          className="md:hidden shrink-0 rounded-full h-10"
        >
          More filters
        </Button>

        {/* Clear Filters */}
        {(date || category || free || city || language) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams();
              router.replace(`/explore?${params.toString()}`);
            }}
            className="text-text-tertiary shrink-0 h-10 rounded-full"
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}

        {/* Scroll End Spacer for Blur Mask */}
        <div className="w-[80px] shrink-0" aria-hidden="true" />
      </div>

      {/* Active Filters Display */}
      {(date || category || free || city || language) && (
        <div className="flex flex-wrap gap-2 mt-4">
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
          {language && (
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-sm text-brand-accent">
              {languageOptions.find((opt) => opt.value === language)?.label || language}
              <button
                onClick={() => updateFilter("language", null)}
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
