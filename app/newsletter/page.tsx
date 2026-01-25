"use client";

import { useState } from "react";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

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

export default function NewsletterPage() {
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    city: "Limassol",
    interests: [] as string[],
    frequency: "weekly",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        alert(data.error || "Failed to subscribe");
      }
    } catch (error) {
      console.error("Subscribe error:", error);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (category: string) => {
    setFormData({
      ...formData,
      interests: formData.interests.includes(category)
        ? formData.interests.filter((c) => c !== category)
        : [...formData.interests, category],
    });
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col">
        <MainNav />
        <main className="flex flex-1 items-center justify-center px-4 py-12">
          <div className="w-full max-w-md text-center">
            <CheckCircle className="mx-auto mb-4 h-16 w-16 text-semantic-success" />
            <h1 className="mb-4 text-fluid-3xl font-bold text-text-primary">
              You're subscribed!
            </h1>
            <p className="text-text-secondary">
              Check your email for a confirmation message.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="mb-4 text-fluid-4xl font-bold text-text-primary">
              Newsletter
            </h1>
            <p className="text-fluid-lg text-text-secondary">
              Get weekly event recommendations delivered to your inbox
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Phone (optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
              />
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
                Interests (select all that apply)
              </label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleInterest(category)}
                    className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                      formData.interests.includes(category)
                        ? "border-brand-accent bg-brand-accent text-text-inverse"
                        : "border-border-default bg-background-surface text-text-secondary hover:bg-background-elevated"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) =>
                  setFormData({ ...formData, frequency: e.target.value })
                }
                required
                className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-border-strong focus:outline-none"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Subscribing..." : "Subscribe"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
