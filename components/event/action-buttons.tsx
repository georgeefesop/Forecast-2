"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleInterest } from "@/lib/actions/interactions";
import { cn } from "@/lib/utils";

interface ActionButtonsProps {
  eventId: string;
  initialInterested?: boolean;
  interestedCount?: number;
}

export function ActionButtons({
  eventId,
  initialInterested = false,
  interestedCount = 0,
}: ActionButtonsProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const [interested, setInterested] = useState(initialInterested);
  const [count, setCount] = useState(interestedCount);
  const [isPending, startTransition] = useTransition();

  const handleToggleInterest = async () => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // Optimistic update
    const newValue = !interested;
    setInterested(newValue);
    setCount(prev => newValue ? prev + 1 : Math.max(0, prev - 1));

    startTransition(async () => {
      const result = await toggleInterest(eventId, pathname);
      if (result.error) {
        // Revert
        setInterested(!newValue);
        setCount(prev => !newValue ? prev + 1 : Math.max(0, prev - 1));
      }
    });
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
        // Could show a toast here
      } catch (error) {
        console.error("Failed to copy to clipboard:", error);
      }
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant={interested ? "default" : "outline"}
          onClick={handleToggleInterest}
          disabled={isPending}
          className={cn(interested && "bg-red-500 hover:bg-red-600 text-white border-red-500")}
        >
          <Heart className={cn("mr-2 h-4 w-4", interested ? "fill-current" : "")} />
          {interested ? "Interested" : "Interested"}
        </Button>

        <Button variant="outline" onClick={handleShare}>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>

      {/* Counts */}
      {count > 0 && (
        <div className="text-sm text-text-secondary font-medium">
          {count} people interested
        </div>
      )}
    </div>
  );
}
