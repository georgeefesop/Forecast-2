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

    // Initialize map
    try {
      console.log("Initializing map...");
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
              attribution: '&copy; OpenStreetMap',
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
        zoom: 12,
      });

      map.current.on("load", async () => {
        setMapLoaded(true);
        map.current?.resize();

        // Fetch events
        try {
          const res = await fetch("/api/events/map");
          const data = await res.json();

          if (data.points) {
            // Helper for category styles
            const getCategoryStyle = (cat: string) => {
              const c = (cat || "").toLowerCase();
              if (c.includes("music") || c.includes("concert")) return { color: "#ef4444", icon: "🎵" }; // Red
              if (c.includes("theatre") || c.includes("arts")) return { color: "#8b5cf6", icon: "🎭" }; // Violet
              if (c.includes("sports") || c.includes("active")) return { color: "#10b981", icon: "⚽" }; // Green
              if (c.includes("family") || c.includes("kids")) return { color: "#f59e0b", icon: "👶" }; // Amber
              if (c.includes("food") || c.includes("drink")) return { color: "#ec4899", icon: "🍷" }; // Pink
              return { color: "#7C3AED", icon: "📅" }; // Default Brand
            };

            data.points.forEach((point: any) => {
              const style = getCategoryStyle(point.category);

              // Create marker element
              const el = document.createElement("div");
              el.className = "marker";
              el.dataset.category = point.category;
              el.style.width = "36px";
              el.style.height = "36px";
              el.style.borderRadius = "50%";
              el.style.backgroundColor = style.color;
              el.style.border = "2px solid white";
              el.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
              el.style.cursor = "pointer";
              el.style.display = "flex";
              el.style.alignItems = "center";
              el.style.justifyContent = "center";
              el.style.fontSize = "18px";
              el.style.color = "white";
              el.innerHTML = style.icon;

              // Create popup content with image
              let popupHtml = `<div style="font-family: sans-serif; padding: 0; max-width: 220px; border-radius: 8px; overflow: hidden;">`;

              // Image Header
              if (point.image) {
                popupHtml += `
                          <div style="height: 120px; width: 100%; background-image: url('${point.image}'); background-size: cover; background-position: center;"></div>
                        `;
              }

              // Content
              popupHtml += `
                        <div style="padding: 12px;">
                            <div style="font-weight: bold; margin-bottom: 4px; font-size: 14px; line-height: 1.2;">${point.title}</div>
                            <div style="font-size: 12px; color: #666; margin-bottom: 8px;">📍 ${point.venue}</div>
                            
                            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px; color: #444;">
                                <span>📅 ${new Date(point.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                ${point.price ? `<span style="font-weight: 600; color: #16a34a;">€${Number(point.price).toFixed(2)}</span>` : '<span style="font-weight: 600; color: #16a34a;">Free</span>'}
                            </div>
                            
                            <a href="/event/${point.slug}" style="display: block; text-align: center; margin-top: 12px; padding: 6px 12px; background-color: #7C3AED; color: white; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: 500;">View Details</a>
                        </div>
                    </div>`;

              const popup = new maplibregl.Popup({ offset: 20, maxWidth: '240px', closeButton: false }).setHTML(popupHtml);

              // Add to map
              new maplibregl.Marker({ element: el })
                .setLngLat([point.lng, point.lat])
                .setPopup(popup)
                .addTo(map.current!);
            });
          }
        } catch (e) {
          console.error("Failed to load map data:", e);
        }
      });

      map.current.on("error", (e) => {
        console.error("Map error:", e);
      });

    } catch (err) {
      console.error("Map initialization failed:", err);
    }

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
                className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === "upcoming"
                  ? "bg-brand-accent text-text-inverse"
                  : "text-text-secondary hover:bg-background-elevated"
                  }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setViewMode("live")}
                className={`px-4 py-2 text-sm font-medium transition-colors ${viewMode === "live"
                  ? "bg-brand-accent text-text-inverse"
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
                  <div className="h-3 w-3 rounded-full bg-brand-accent" />
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
