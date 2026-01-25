"use client"

import * as React from "react"

export interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  size?: "default" | "sm";
  className?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ checked, onCheckedChange, disabled, size = "default", className = "", ...props }, ref) => {
    const sizeClass = size === "sm" ? "switch-sm" : "";
    const classes = `switch ${sizeClass} ${className}`.trim();
    
    return (
      <label className={classes}>
        <input
          type="checkbox"
          ref={ref}
          checked={checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          disabled={disabled}
          {...props}
        />
        <span className="switch-slider" />
      </label>
    );
  }
)
Switch.displayName = "Switch"

export { Switch }
