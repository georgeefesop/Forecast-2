"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Heart, UserCheck, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionButtonsProps {
  eventId: string;
  initialInterested?: boolean;
  initialGoing?: boolean;
  interestedCount?: number;
  goingCount?: number;
}

export function ActionButtons({
  eventId,
  initialInterested = false,
  initialGoing = false,
  interestedCount = 0,
  goingCount = 0,
}: ActionButtonsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [interested, setInterested] = useState(initialInterested);
  const [going, setGoing] = useState(initialGoing);
  const [interestedCountState, setInterestedCount] = useState(interestedCount);
  const [goingCountState, setGoingCount] = useState(goingCount);
  const [loading, setLoading] = useState<"interested" | "going" | null>(null);

  const handleAction = async (type: "interested" | "going") => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

    if (loading) return; // Prevent multiple clicks

    setLoading(type);
    try {
      const response = await fetch(`/api/events/${eventId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        const data = await response.json();
        if (type === "interested") {
          setInterested(data.active);
          setInterestedCount(data.count);
        } else if (type === "going") {
          setGoing(data.active);
          setGoingCount(data.count);
        }
      }
    } catch (error) {
      console.error("Action error:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleShare = async () => {
    if (typeof window === "undefined") return;

    const currentUrl = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this event",
          url: currentUrl,
        });
      } catch (error) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(currentUrl);
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    }
  };

  return (
    <div>
      {/* Action Buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
        <Button
          variant={interested ? "default" : "outline"}
          onClick={() => handleAction("interested")}
          disabled={loading === "interested"}
        >
          <Heart />
          {loading === "interested" ? "Updating..." : "Interested"}
        </Button>

        <Button
          variant={going ? "default" : "outline"}
          onClick={() => handleAction("going")}
          disabled={loading === "going"}
        >
          <UserCheck />
          {loading === "going" ? "Updating..." : "Going"}
        </Button>

        <Button variant="outline" onClick={handleShare}>
          <Share2 />
          Share
        </Button>
      </div>

      {/* Counts */}
      <div>
        {interestedCountState > 0 && (
          <div>
            <span>{interestedCountState}</span> interested
          </div>
        )}
        {goingCountState > 0 && (
          <div>
            <span>{goingCountState}</span> going
          </div>
        )}
      </div>
    </div>
  );
}
