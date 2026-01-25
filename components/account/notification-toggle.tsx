"use client";

import { useState, useEffect } from "react";

interface NotificationToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  loading?: boolean;
}

export function NotificationToggle({
  label,
  description,
  checked,
  onChange,
  loading = false,
}: NotificationToggleProps) {
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
        <div className={`peer h-7 w-12 rounded-full transition-colors ${
          isChecked ? 'bg-semantic-success' : 'bg-gray-300 dark:bg-gray-600'
        } after:absolute after:left-[3px] after:top-[3px] after:h-6 after:w-6 after:rounded-full after:border-2 after:transition-all after:content-[''] ${
          isChecked 
            ? 'after:translate-x-5 after:border-semantic-success after:bg-background-base' 
            : 'after:translate-x-0 after:border-gray-400 dark:after:border-gray-500 after:bg-background-base'
        } peer-disabled:opacity-50 shadow-sm`}></div>
      </label>
    </div>
  );
}
