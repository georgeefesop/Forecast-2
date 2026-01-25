"use client";

import { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

const PRODUCT_TYPES = [
  { value: "promote_event", label: "Promote Event" },
  { value: "feature_venue", label: "Feature Venue" },
  { value: "sponsor_newsletter", label: "Sponsor Newsletter" },
];

const PLACEMENT_TYPES = [
  { value: "home_banner", label: "Home Banner" },
  { value: "featured_events", label: "Featured Events" },
  { value: "explore_insert", label: "Explore Insert" },
  { value: "map_highlight", label: "Map Highlight" },
  { value: "event_sponsor_tile", label: "Event Sponsor Tile" },
  { value: "newsletter_sponsor", label: "Newsletter Sponsor" },
];

function BoostNewPageContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productType: searchParams.get("product") || "",
    eventId: searchParams.get("event") || "",
    venueId: "",
    placements: [] as string[],
    startsAt: "",
    endsAt: "",
    city: "Limassol",
    category: "",
    headline: "",
    description: "",
    ctaText: "Learn More",
    ctaLink: "",
    image: null as File | null,
  });

  if (!session) {
    router.push("/auth/signin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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

      // Create campaign
      const response = await fetch("/api/boost/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          imageUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create campaign");
      }

      router.push("/organizer?tab=promote");
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="mb-8 text-fluid-3xl font-bold text-text-primary">
            Create Promotion Campaign
          </h1>

          <form onSubmit={handleSubmit}>
            {/* Step 1: Product Type */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    What would you like to promote? *
                  </label>
                  <div className="space-y-2">
                    {PRODUCT_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, productType: type.value })
                        }
                        className={`w-full rounded-lg border p-4 text-left transition-colors ${
                          formData.productType === type.value
                            ? "border-brand-accent bg-brand-accent/10"
                            : "border-border-default bg-background-surface hover:bg-background-elevated"
                        }`}
                      >
                        <div className="font-medium text-text-primary">
                          {type.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!formData.productType}
                  className="w-full"
                >
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Select Item */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    {formData.productType === "promote_event"
                      ? "Select Event"
                      : formData.productType === "feature_venue"
                      ? "Select Venue"
                      : "Enter Sponsor Details"}
                  </label>
                  {formData.productType === "sponsor_newsletter" ? (
                    <div className="space-y-4">
                      <input
                        type="text"
                        placeholder="Headline"
                        value={formData.headline}
                        onChange={(e) =>
                          setFormData({ ...formData, headline: e.target.value })
                        }
                        className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                      />
                      <textarea
                        placeholder="Description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        rows={4}
                        className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder={
                        formData.productType === "promote_event"
                          ? "Event ID"
                          : "Venue ID"
                      }
                      value={
                        formData.productType === "promote_event"
                          ? formData.eventId
                          : formData.venueId
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [formData.productType === "promote_event"
                            ? "eventId"
                            : "venueId"]: e.target.value,
                        })
                      }
                      className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                    />
                  )}
                </div>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Placements & Schedule */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Select Placements *
                  </label>
                  <div className="space-y-2">
                    {PLACEMENT_TYPES.map((placement) => (
                      <label
                        key={placement.value}
                        className="flex items-center gap-2 rounded-lg border border-border-default bg-background-surface p-3 hover:bg-background-elevated"
                      >
                        <input
                          type="checkbox"
                          checked={formData.placements.includes(
                            placement.value
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                placements: [
                                  ...formData.placements,
                                  placement.value,
                                ],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                placements: formData.placements.filter(
                                  (p) => p !== placement.value
                                ),
                              });
                            }
                          }}
                          className="rounded border-border-default"
                        />
                        <span className="text-text-primary">
                          {placement.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formData.startsAt}
                      onChange={(e) =>
                        setFormData({ ...formData, startsAt: e.target.value })
                      }
                      className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formData.endsAt}
                      onChange={(e) =>
                        setFormData({ ...formData, endsAt: e.target.value })
                      }
                      className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(4)}
                    disabled={formData.placements.length === 0}
                    className="flex-1"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Targeting & Creative */}
            {step === 4 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Targeting
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      className="rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                    >
                      <option value="Limassol">Limassol</option>
                      <option value="Nicosia">Nicosia</option>
                      <option value="Larnaca">Larnaca</option>
                      <option value="Paphos">Paphos</option>
                    </select>
                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                    >
                      <option value="">All Categories</option>
                      <option value="Nightlife">Nightlife</option>
                      <option value="Culture">Culture</option>
                      <option value="Family">Family</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Creative
                  </label>
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Headline"
                      value={formData.headline}
                      onChange={(e) =>
                        setFormData({ ...formData, headline: e.target.value })
                      }
                      className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                    />
                    <textarea
                      placeholder="Description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                    />
                    <input
                      type="url"
                      placeholder="CTA Link"
                      value={formData.ctaLink}
                      onChange={(e) =>
                        setFormData({ ...formData, ctaLink: e.target.value })
                      }
                      className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
                    />
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
                </div>

                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(3)}
                    className="flex-1"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? "Creating..." : "Create Campaign"}
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

export default function BoostNewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BoostNewPageContent />
    </Suspense>
  );
}
