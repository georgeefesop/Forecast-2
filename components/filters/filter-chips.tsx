"use client";

import { useState } from "react";
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
];
const categories = [
  "Nightlife",
  "Culture",
  "Family",
  "Outdoors",
  "Food & Drink",
  "Music",
  "Sports",
  "Arts",
];

export function FilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const city = searchParams.get("city") || "Limassol";
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
    router.push(`/explore?${params.toString()}`);
  };

  const toggleFree = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (free) {
      params.delete("free");
    } else {
      params.set("free", "true");
    }
    router.push(`/explore?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      {/* Main Filter Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* City Select */}
        <select
          value={city}
          onChange={(e) => updateFilter("city", e.target.value)}
          className="rounded-md border border-border-default bg-background-surface px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        >
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
          className="rounded-md border border-border-default bg-background-surface px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        >
          <option value="">All Dates</option>
          {dateOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Category Select */}
        <select
          value={category}
          onChange={(e) => updateFilter("category", e.target.value || null)}
          className="rounded-md border border-border-default bg-background-surface px-3 py-2 text-sm text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
        >
          <option value="">All Types</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Free Toggle */}
        <button
          onClick={toggleFree}
          className={cn(
            "rounded-md border px-3 py-2 text-sm font-medium transition-colors",
            free
              ? "border-brand bg-brand text-text-inverse"
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
        {(date || category || free) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const params = new URLSearchParams();
              params.set("city", city);
              router.push(`/explore?${params.toString()}`);
            }}
            className="text-text-tertiary"
          >
            <X className="mr-1 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {(date || category || free) && (
        <div className="flex flex-wrap gap-2">
          {date && (
            <span className="inline-flex items-center gap-1 rounded-full bg-background-elevated px-3 py-1 text-sm text-text-secondary">
              {dateOptions.find((opt) => opt.value === date)?.label}
              <button
                onClick={() => updateFilter("date", null)}
                className="ml-1 text-text-tertiary hover:text-text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {category && (
            <span className="inline-flex items-center gap-1 rounded-full bg-background-elevated px-3 py-1 text-sm text-text-secondary">
              {category}
              <button
                onClick={() => updateFilter("category", null)}
                className="ml-1 text-text-tertiary hover:text-text-primary"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {free && (
            <span className="inline-flex items-center gap-1 rounded-full bg-background-elevated px-3 py-1 text-sm text-text-secondary">
              Free
              <button
                onClick={toggleFree}
                className="ml-1 text-text-tertiary hover:text-text-primary"
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
