import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { getActivePlacements } from "@/lib/ads/placement-queries";

export async function HomeBanner() {
  const placements = await getActivePlacements("home_banner", {
    city: "Limassol",
  });

  if (placements.length === 0) {
    return null;
  }

  const placement = placements[0];
  const creative = placement.campaign?.creative_json;

  if (!creative) {
    return null;
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-border-default bg-background-elevated">
      <div className="absolute top-4 right-4 z-10 rounded-full bg-background-overlay/80 backdrop-blur-sm border border-border-default px-3 py-1.5 text-sm font-medium text-text-inverse">
        Sponsored
      </div>
      <Link href={creative.ctaLink || "#"} className="block">
        <div className="grid md:grid-cols-2">
          {creative.imageUrl && (
            <div className="relative aspect-video md:aspect-auto md:h-full min-h-[200px]">
              <Image
                src={creative.imageUrl}
                alt={creative.headline || "Sponsored Event"}
                fill
                className="object-cover"
              />
            </div>
          )}
          <div className="flex flex-col justify-center p-8">
            <h2 className="text-fluid-3xl font-bold text-text-primary">
              {creative.headline}
            </h2>
            {creative.description && (
              <p className="mt-2 text-text-secondary">{creative.description}</p>
            )}
            <div className="mt-6 flex items-center gap-4">
              <Link
                href={creative.ctaLink || "#"}
                className="inline-flex items-center gap-2 rounded-md bg-brand-accent px-6 py-3 text-sm font-medium text-text-inverse transition-colors hover:bg-brand-accent-hover"
              >
                {creative.ctaText || "Learn More"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
