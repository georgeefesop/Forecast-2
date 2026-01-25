"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startAt: "",
    endAt: "",
    city: "Limassol",
    venue: "",
    address: "",
    category: "",
    tags: "",
    priceMin: "",
    priceMax: "",
    currency: "EUR",
    ticketUrl: "",
    image: null as File | null,
  });

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
                    className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
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
                    className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
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
                      className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
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
                      className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
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
                    className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
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
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Enter venue name or full address"
                    required
                    className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
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
                    className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
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
                    className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
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
                      className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
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
                      className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
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
                      className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
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
                    className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
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
                    className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
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
