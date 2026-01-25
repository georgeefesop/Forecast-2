"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

interface VibeCheckFormProps {
  eventId: string;
}

export function VibeCheckForm({ eventId }: VibeCheckFormProps) {
  const { data: session } = useSession();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    crowd: "",
    music: "",
    queue: "",
    value: "",
    note: "",
  });

  if (!session) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/events/${eventId}/vibe-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
      }
    } catch (error) {
      console.error("Vibe check error:", error);
    }
  };

  if (submitted) {
    return (
      <div className="mb-8 rounded-lg border border-border-default bg-background-elevated p-6">
        <p className="text-text-secondary">Thanks for your vibe check!</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mb-8 rounded-lg border border-border-default bg-background-elevated p-6">
      <h2 className="mb-4 text-xl font-semibold text-text-primary">
        Vibe Check
      </h2>
      <p className="mb-6 text-sm text-text-secondary">
        Help others know what to expect
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Crowd
          </label>
          <div className="flex gap-2">
            {["chill", "mixed", "intense"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFormData({ ...formData, crowd: option })}
                className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  formData.crowd === option
                    ? "border-brand bg-brand text-text-inverse"
                    : "border-border-default bg-background-surface text-text-secondary hover:bg-background-elevated"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Music
          </label>
          <div className="flex gap-2">
            {["🔥", "ok", "meh"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFormData({ ...formData, music: option })}
                className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  formData.music === option
                    ? "border-brand bg-brand text-text-inverse"
                    : "border-border-default bg-background-surface text-text-secondary hover:bg-background-elevated"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Queue
          </label>
          <div className="flex gap-2">
            {["short", "medium", "long"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFormData({ ...formData, queue: option })}
                className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  formData.queue === option
                    ? "border-brand bg-brand text-text-inverse"
                    : "border-border-default bg-background-surface text-text-secondary hover:bg-background-elevated"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Value
          </label>
          <div className="flex gap-2">
            {["worth it", "overpriced"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFormData({ ...formData, value: option })}
                className={`flex-1 rounded-md border px-4 py-2 text-sm font-medium transition-colors ${
                  formData.value === option
                    ? "border-brand bg-brand text-text-inverse"
                    : "border-border-default bg-background-surface text-text-secondary hover:bg-background-elevated"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Note (optional)
          </label>
          <textarea
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-border-default bg-background-surface px-3 py-2 text-text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
            placeholder="Add any additional notes..."
          />
        </div>

        <Button type="submit" className="w-full">
          Submit Vibe Check
        </Button>
      </div>
    </form>
  );
}
