"use client";

import { useState, useEffect, useRef } from "react";
import { MainNav } from "@/components/nav/main-nav";
import { Footer } from "@/components/footer";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<"upcoming" | "live">("upcoming");

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map centered on Limassol, Cyprus
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "raster-tiles": {
            type: "raster",
            tiles: [
              "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          },
        },
        layers: [
          {
            id: "simple-tiles",
            type: "raster",
            source: "raster-tiles",
            minzoom: 0,
            maxzoom: 22,
          },
        ],
      },
      center: [33.0228, 34.7071], // Limassol coordinates
      zoom: 13,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
      // TODO: Load events and add markers
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        <div className="relative h-[calc(100vh-4rem)]">
          {/* Controls */}
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div className="flex rounded-lg border border-border-default bg-background-surface shadow-lg">
              <button
                onClick={() => setViewMode("upcoming")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === "upcoming"
                    ? "bg-brand text-text-inverse"
                    : "text-text-secondary hover:bg-background-elevated"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setViewMode("live")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${
                  viewMode === "live"
                    ? "bg-brand text-text-inverse"
                    : "text-text-secondary hover:bg-background-elevated"
                }`}
              >
                Live
              </button>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="bg-background-surface"
              onClick={() => {
                // TODO: Implement "Near me" geolocation
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((position) => {
                    map.current?.flyTo({
                      center: [position.coords.longitude, position.coords.latitude],
                      zoom: 14,
                    });
                  });
                }
              }}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Near me
            </Button>
          </div>

          {/* Map Container */}
          <div ref={mapContainer} className="h-full w-full" />

          {/* Legend */}
          {mapLoaded && (
            <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-border-default bg-background-surface p-3 shadow-lg">
              <div className="text-xs font-medium text-text-primary">Legend</div>
              <div className="mt-2 space-y-1 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-brand" />
                  <span>Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-semantic-warning" />
                  <span>Promoted</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
