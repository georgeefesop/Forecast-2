"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MoreFiltersDrawerProps {
  open: boolean;
  onClose: () => void;
  children?: React.ReactNode;
}

export function MoreFiltersDrawer({
  open,
  onClose,
  children,
}: MoreFiltersDrawerProps) {
  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-background-overlay"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 rounded-t-xl border-t border-border-default bg-background-surface shadow-xl",
          "transform transition-transform duration-slow ease-out",
          open ? "translate-y-0" : "translate-y-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border-default p-4">
          <h2 className="text-lg font-semibold text-text-primary">
            More Filters
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-4">{children}</div>
      </div>
    </>
  );
}
