import { getActivePlacements } from "@/lib/ads/placement-queries";
import { EventCard } from "@/components/event-card";

export async function ExploreInsert() {
  const placements = await getActivePlacements("explore_insert");

  if (placements.length === 0) {
    return null;
  }

  const placement = placements[0];
  const creative = placement.campaign?.creative_json;

  if (!creative || !creative.eventId) {
    return null;
  }

  // TODO: Fetch event by ID
  // For now, return a placeholder
  return (
    <div className="rounded-lg border-2 border-border-default bg-background-elevated p-4">
      <div className="mb-2 text-xs font-medium text-text-secondary">Promoted</div>
      <p className="text-sm text-text-secondary">
        Promoted event will appear here
      </p>
    </div>
  );
}
