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
        <div className={`
          peer relative h-7 w-12 rounded-full transition-all duration-200 ease-in-out
          ${isChecked 
            ? 'bg-semantic-success shadow-lg shadow-semantic-success/30' 
            : 'bg-gray-300 dark:bg-gray-600'
          }
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}
          peer-focus:ring-2 peer-focus:ring-semantic-success/20 peer-focus:ring-offset-2
          peer-hover:scale-105
        `}>
          <div className={`
            absolute top-[2px] left-[2px] h-6 w-6 rounded-full transition-all duration-200 ease-in-out
            ${isChecked 
              ? 'translate-x-5 bg-white shadow-md' 
              : 'translate-x-0 bg-white shadow-sm'
            }
            flex items-center justify-center
          `}>
            {isChecked && (
              <svg className="h-4 w-4 text-semantic-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {!isChecked && (
              <svg className="h-4 w-4 text-gray-400 dark:text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      </label>
    </div>
  );
}
