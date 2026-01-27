"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SourceDropdown } from "./source-dropdown";
import { FilterDropdown } from "./filter-dropdown";

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
  const pathname = usePathname();
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
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ name: string, count: number }[]>([
    { name: "Music", count: 0 },
    { name: "Theatre", count: 0 },
    { name: "Arts", count: 0 },
    { name: "Nightlife", count: 0 }
  ]);

  // Fetch active categories on mount
  const [facetCounts, setFacetCounts] = useState<{
    cities: { value: string; count: number }[];
    languages: { value: string; count: number }[];
    sources: { value: string; count: number }[];
    venues: { value: string; label?: string; count: number }[];
    dates: { value: string; count: number }[];
  }>({ cities: [], languages: [], sources: [], venues: [], dates: [] });

  // Fetch active categories and facets on mount
  useEffect(() => {
    // Categories
    fetch('/api/events/categories')
      .then(res => res.json())
      .then(data => {
        if (data.categories && Array.isArray(data.categories) && data.categories.length > 0) {
          // Normalize names
          const formatted = data.categories.map((c: { name: string, count: number }) => ({
            name: c.name.charAt(0).toUpperCase() + c.name.slice(1).toLowerCase(),
            count: c.count
          }));

          // Deduplicate by name, summing counts if duplicates exist
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

    // Facets
    fetch('/api/events/facets')
      .then(res => res.json())
      .then(data => {
        // Validate data structure before setting state
        if (data && Array.isArray(data.cities)) {
          setFacetCounts(data);
        }
      })
      .catch(err => console.error("Failed to fetch facets:", err));
  }, []);

  // Helper to get count for a label
  const getCityLabel = (city: string) => {
    const found = facetCounts.cities?.find(c => c.value === city);
    return found ? `${city} (${found.count})` : city;
  };

  const getDateLabel = (opt: { value: string, label: string }) => {
    const found = facetCounts.dates?.find(d => d.value === opt.value);
    return found ? `${opt.label} (${found.count})` : opt.label;
  };

  const getLanguageLabel = (opt: { value: string, label: string }) => {
    const found = facetCounts.languages?.find(l => l.value === opt.value);
    return found ? `${opt.label} (${found.count})` : opt.label;
  };

  const city = searchParams.get("city") || "";
  const date = searchParams.get("date") || "";
  const category = searchParams.get("category") || "";
  const free = searchParams.get("free") === "true";
  const language = searchParams.get("language") || "";
  const sources = searchParams.get("sources") || "";
  const venue = searchParams.get("venue") || "";

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Use replace to avoid cluttering history with filter changes
    // If on homepage, update current URL. Otherwise, go to explore.
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

  const buttonBaseClass = "group flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-200 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-text-primary cursor-pointer";
  const buttonActiveClass = "bg-white text-text-primary border-text-primary shadow-sm hover:bg-[#EBE5DE]";
  const buttonInactiveClass = "bg-text-primary text-text-inverse border-border-subtle hover:bg-[#EBE5DE] hover:text-text-primary";

  return (
    <div className="w-full overflow-hidden">
      <div
        ref={scrollRef}
        className={cn(
          "flex items-center gap-2 overflow-x-auto pb-4 pt-1 scrollbar-hide px-1 scroll-smooth",
          masked && "mask-fade-right"
        )}>
        {/* City Select */}
        <FilterDropdown
          label="City"
          options={cities.map(c => ({ value: c, label: getCityLabel(c) }))}
          selectedValues={city ? [city] : []}
          onSelect={(val) => updateFilter("city", val === city ? null : val)}
          onClear={() => updateFilter("city", null)}
          open={activeDropdown === "city"}
          onOpenChange={(isOpen) => setActiveDropdown(prev => isOpen ? "city" : (prev === "city" ? null : prev))}
        />

        {/* Date Select */}
        <FilterDropdown
          label="Date"
          options={dateOptions.map(o => ({ ...o, label: getDateLabel(o) }))}
          selectedValues={date ? [date] : []}
          onSelect={(val) => updateFilter("date", val === date ? null : val)}
          onClear={() => updateFilter("date", null)}
          open={activeDropdown === "date"}
          onOpenChange={(isOpen) => setActiveDropdown(prev => isOpen ? "date" : (prev === "date" ? null : prev))}
        />

        {/* Language Select */}
        <FilterDropdown
          label="Language"
          options={languageOptions.map(l => ({ ...l, label: getLanguageLabel(l) }))}
          selectedValues={language ? [language] : []}
          onSelect={(val) => updateFilter("language", val === language ? null : val)}
          onClear={() => updateFilter("language", null)}
          open={activeDropdown === "language"}
          onOpenChange={(isOpen) => setActiveDropdown(prev => isOpen ? "language" : (prev === "language" ? null : prev))}
        />

        {/* Source Filter */}
        <SourceDropdown
          open={activeDropdown === "source"}
          onOpenChange={(isOpen) => setActiveDropdown(prev => isOpen ? "source" : (prev === "source" ? null : prev))}
          counts={facetCounts.sources}
        />

        {/* Venue Filter */}
        <FilterDropdown
          label="Venue"
          options={facetCounts.venues.map(v => ({ value: v.value, label: `${v.label || v.value} (${v.count})` }))}
          selectedValues={venue ? [venue] : []}
          onSelect={(val) => updateFilter("venue", val === venue ? null : val)}
          onClear={() => updateFilter("venue", null)}
          open={activeDropdown === "venue"}
          onOpenChange={(isOpen) => setActiveDropdown(prev => isOpen ? "venue" : (prev === "venue" ? null : prev))}
        />

        {/* Category Tags */}
        <div className="flex items-center gap-2 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => updateFilter("category", category === cat.name ? null : cat.name)}
              className={cn(
                buttonBaseClass,
                category === cat.name ? buttonActiveClass : buttonInactiveClass
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
            buttonBaseClass,
            free ? buttonActiveClass : buttonInactiveClass
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
        {(date || category || free || city || language || sources || venue) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams();
              const targetPath = pathname === "/" ? "/" : "/explore";
              router.replace(`${targetPath}?${params.toString()}`, { scroll: false });
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
      {(date || category || free || city || language || sources || venue) && (
        <div className="flex flex-wrap gap-2 mt-4">
          {city && (
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-sm text-brand-accent">
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
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-sm text-brand-accent">
              {dateOptions.find((opt) => opt.value === date)?.label}
              <button
                onClick={() => updateFilter("date", null)}
                className="ml-1 text-brand-accent/70 hover:text-brand-accent cursor-pointer"
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
                className="ml-1 text-brand-accent/70 hover:text-brand-accent cursor-pointer"
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
                className="ml-1 text-brand-accent/70 hover:text-brand-accent cursor-pointer"
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
                className="ml-1 text-brand-accent/70 hover:text-brand-accent cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {sources && sources.split(",").map((s) => (
            <span key={s} className="inline-flex items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-sm text-brand-accent">
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
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-accent/30 bg-brand-accent/10 px-3 py-1 text-sm text-brand-accent">
              {venue}
              <button
                onClick={() => updateFilter("venue", null)}
                className="ml-1 text-brand-accent/70 hover:text-brand-accent cursor-pointer"
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
