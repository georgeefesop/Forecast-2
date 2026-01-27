"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { Suspense } from "react";

function SubmitPageContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    city: searchParams.get("city") || "Limassol",
    venue: searchParams.get("venueName") || "", // If we have name
    venueId: searchParams.get("venue") || "", // If we have ID
    address: "",
    category: "",
    tags: "",
    priceMin: "",
    priceMax: "",
    currency: "EUR",
    ticketUrl: "",
    adultOnly: false,
    image: null as File | null,
  });

  // Pre-fill from URL if params change (useful if navigating while page open)
  useEffect(() => {
    const venueId = searchParams.get("venue");
    const city = searchParams.get("city");
    if (venueId || city) {
      setFormData(prev => ({
        ...prev,
        venueId: venueId || prev.venueId,
        city: city || prev.city
      }));
    }
  }, [searchParams]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Upload image if provided
      let imageUrl = null;
      if (formData.image) {
        const imageFormData = new FormData();
        imageFormData.append("file", formData.image);
        const imageResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageFormData,
        });
        if (imageResponse.ok) {
          const imageData = await imageResponse.json();
          imageUrl = imageData.url;
        }
      }

      // Submit event
      const response = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit event");
      }

      router.push("/account?tab=activity");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-fluid-3xl font-bold text-text-primary">
            Submit an Event
          </h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={4}
                    className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.startAt}
                      onChange={(e) =>
                        setFormData({ ...formData, startAt: e.target.value })
                      }
                      required
                      className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      End Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.endAt}
                      onChange={(e) =>
                        setFormData({ ...formData, endAt: e.target.value })
                      }
                      className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    City *
                  </label>
                  <select
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    required
                    className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                  >
                    <option value="Limassol">Limassol</option>
                    <option value="Nicosia">Nicosia</option>
                    <option value="Larnaca">Larnaca</option>
                    <option value="Paphos">Paphos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Venue or Address *
                  </label>
                  {formData.venueId ? (
                    <div className="flex items-center gap-2 rounded-md border border-border-default bg-background-elevated px-4 py-3">
                      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-brand-accent/10 text-brand-accent">
                        🏛️
                      </div>
                      <div>
                        <p className="font-semibold text-text-primary">
                          {searchParams.get("venueName") || "Selected Venue"}
                        </p>
                        <p className="text-xs text-text-secondary">Pre-selected venue</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, venueId: "" })}
                        className="ml-auto text-text-tertiary hover:text-text-primary"
                      >
                        Change
                      </button>
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      placeholder="Enter venue name or full address"
                      required
                      className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                    />
                  )}
                </div>

                <Button type="button" onClick={() => setStep(2)} className="w-full">
                  Continue
                </Button>
              </div>
            )}

            {/* Step 2: Category & Details */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                    className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                  >
                    <option value="">Select category</option>
                    <option value="Nightlife">Nightlife</option>
                    <option value="Culture">Culture</option>
                    <option value="Family">Family</option>
                    <option value="Outdoors">Outdoors</option>
                    <option value="Food & Drink">Food & Drink</option>
                    <option value="Music">Music</option>
                    <option value="Sports">Sports</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) =>
                      setFormData({ ...formData, tags: e.target.value })
                    }
                    placeholder="jazz, live music, outdoor"
                    className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Min Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.priceMin}
                      onChange={(e) =>
                        setFormData({ ...formData, priceMin: e.target.value })
                      }
                      className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Max Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.priceMax}
                      onChange={(e) =>
                        setFormData({ ...formData, priceMax: e.target.value })
                      }
                      className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) =>
                        setFormData({ ...formData, currency: e.target.value })
                      }
                      className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Ticket URL
                  </label>
                  <input
                    type="url"
                    value={formData.ticketUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, ticketUrl: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-border-default bg-background-surface p-4">
                  <input
                    type="checkbox"
                    id="adultOnly"
                    checked={formData.adultOnly}
                    onChange={(e) =>
                      setFormData({ ...formData, adultOnly: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-border-default text-text-primary"
                  />
                  <label htmlFor="adultOnly" className="flex-1 cursor-pointer">
                    <p className="font-medium text-text-primary">Adult-only event (18+)</p>
                    <p className="text-sm text-text-secondary">
                      This event is restricted to adults only (e.g., drinking events, nightlife)
                    </p>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Event Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        image: e.target.files?.[0] || null,
                      })
                    }
                    className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                  />
                </div>

                {error && (
                  <div className="rounded-md bg-semantic-error/10 p-3 text-sm text-semantic-error">
                    {error}
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "Submitting..." : "Submit Event"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-text-secondary">Loading...</div>}>
      <SubmitPageContent />
    </Suspense>
  );
}
