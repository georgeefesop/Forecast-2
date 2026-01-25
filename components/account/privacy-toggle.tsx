"use client";

import { Switch } from "@/components/ui/switch";

interface PrivacyToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  loading?: boolean;
}

export function PrivacyToggle({
  label,
  description,
  checked,
  onChange,
  loading = false,
}: PrivacyToggleProps) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border-default bg-background-surface p-4">
      <div className="flex-1">
        <p className="font-medium text-text-primary">{label}</p>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        disabled={loading}
      />
    </div>
  );
}
