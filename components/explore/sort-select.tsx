"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "soonest";

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    const sortValue = e.target.value;
    
    if (sortValue === "soonest") {
      params.delete("sort");
    } else {
      params.set("sort", sortValue);
    }
    
    router.replace(`/explore?${params.toString()}`);
  };

  return (
    <select
      value={currentSort}
      onChange={handleSortChange}
      className="rounded-md border border-border-default bg-background-surface px-3 py-2 text-sm text-text-primary focus:border-border-strong focus:outline-none"
    >
      <option value="soonest">Soonest</option>
      <option value="interested">Most Interested</option>
      <option value="free">Free First</option>
    </select>
  );
}
