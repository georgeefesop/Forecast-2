"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function ClaimVenuePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [venues, setVenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `/api/venues/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setVenues(data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (venueId: string) => {
    setSubmitting(true);
    try {
      const response = await fetch("/api/organizer/claim-venue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueId }),
      });

      if (response.ok) {
        router.push("/organizer?tab=venues");
      } else {
        const data = await response.json();
        alert(data.error || "Failed to claim venue");
      }
    } catch (error) {
      console.error("Claim error:", error);
      alert("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-fluid-3xl font-bold text-text-primary">
            Claim a Venue
          </h1>

          <p className="mb-6 text-text-secondary">
            Search for a venue and request to claim it. Once approved, you'll
            be able to manage events for that venue.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="mb-8">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for a venue..."
                className="flex-1 rounded-md border border-border-default bg-background-surface px-4 py-2 text-text-primary focus:border-border-strong focus:outline-none"
              />
              <Button type="submit" disabled={loading}>
                <Search className="mr-2 h-4 w-4" />
                Search
              </Button>
            </div>
          </form>

          {/* Results */}
          {loading ? (
            <p className="text-text-secondary">Searching...</p>
          ) : venues.length === 0 && searchQuery ? (
            <p className="text-text-secondary">No venues found.</p>
          ) : (
            <div className="space-y-4">
              {venues.map((venue) => (
                <div
                  key={venue.id}
                  className="flex items-center justify-between rounded-lg border border-border-default bg-background-surface p-4"
                >
                  <div>
                    <h3 className="font-semibold text-text-primary">
                      {venue.name}
                    </h3>
                    <p className="text-sm text-text-secondary">
                      {venue.address}, {venue.city}
                    </p>
                    <p className="mt-1 text-xs text-text-tertiary">
                      Status: {venue.claim_status}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleClaim(venue.id)}
                    disabled={
                      submitting ||
                      selectedVenue === venue.id ||
                      venue.claim_status !== "unclaimed"
                    }
                  >
                    {venue.claim_status === "unclaimed"
                      ? "Request Claim"
                      : venue.claim_status}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
