"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bookmark, Heart, UserCheck, Share2, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionButtonsProps {
  eventId: string;
  initialInterested?: boolean;
  initialGoing?: boolean;
  initialSaved?: boolean;
  interestedCount?: number;
  goingCount?: number;
}

export function ActionButtons({
  eventId,
  initialInterested = false,
  initialGoing = false,
  initialSaved = false,
  interestedCount = 0,
  goingCount = 0,
}: ActionButtonsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [interested, setInterested] = useState(initialInterested);
  const [going, setGoing] = useState(initialGoing);
  const [saved, setSaved] = useState(initialSaved);
  const [interestedCountState, setInterestedCount] = useState(interestedCount);
  const [goingCountState, setGoingCount] = useState(goingCount);

  const handleAction = async (type: "interested" | "going" | "save") => {
    if (!session) {
      router.push("/auth/signin");
      return;
    }

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
        } else if (type === "save") {
          setSaved(data.active);
        }
      }
    } catch (error) {
      console.error("Action error:", error);
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
    <div className="mb-8 space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant={saved ? "default" : "outline"}
          onClick={() => handleAction("save")}
          className="flex items-center gap-2"
        >
          <Bookmark className="h-4 w-4" />
          {saved ? "Saved" : "Save"}
        </Button>

        <Button
          variant={interested ? "default" : "outline"}
          onClick={() => handleAction("interested")}
          className="flex items-center gap-2"
        >
          <Heart className="h-4 w-4" />
          Interested
        </Button>

        <Button
          variant={going ? "default" : "outline"}
          onClick={() => handleAction("going")}
          className="flex items-center gap-2"
        >
          <UserCheck className="h-4 w-4" />
          Going
        </Button>

        <Button variant="outline" onClick={handleShare} className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </div>

      {/* Counts */}
      <div className="flex items-center gap-6 text-sm text-text-secondary">
        {interestedCountState > 0 && (
          <div>
            <span className="font-medium">{interestedCountState}</span> interested
          </div>
        )}
        {goingCountState > 0 && (
          <div>
            <span className="font-medium">{goingCountState}</span> going
          </div>
        )}
      </div>
    </div>
  );
}
