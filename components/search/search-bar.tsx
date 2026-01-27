"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, FormEvent } from "react";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/explore?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
          <Search className="h-5 w-5 text-text-tertiary" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search events, venues…"
          className="w-full h-12 rounded-2xl border border-border-subtle bg-bg-surface shadow-sm py-3 pl-11 pr-4 text-[15px] font-medium text-text-primary placeholder:text-text-tertiary focus:border-border-default focus:ring-4 focus:ring-border-subtle/30 focus:outline-none transition-all"
        />
      </div>
    </form>
  );
}
