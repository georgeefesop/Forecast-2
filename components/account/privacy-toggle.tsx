"use client";

import { useState, useEffect } from "react";

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
  const [isChecked, setIsChecked] = useState(checked);

  useEffect(() => {
    setIsChecked(checked);
  }, [checked]);

  const handleToggle = () => {
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange(newValue);
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-border-default bg-background-surface p-4">
      <div className="flex-1">
        <p className="font-medium text-text-primary">{label}</p>
        <p className="text-sm text-text-secondary">{description}</p>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={isChecked}
          onChange={handleToggle}
          disabled={loading}
        />
        <div className="peer h-6 w-11 rounded-full bg-background-elevated after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-border-default after:bg-background-base after:transition-all after:content-[''] peer-checked:bg-brand peer-checked:after:translate-x-full peer-checked:after:border-brand peer-disabled:opacity-50"></div>
      </label>
    </div>
  );
}
