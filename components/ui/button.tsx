import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "ghost" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "default", size = "default", className = "", ...props }, ref) => {
    // Build class names
    const baseClass = "btn";
    const variantClass = 
      variant === "default" ? "btn-default-variant" :
      variant === "outline" ? "btn-outline" :
      variant === "secondary" ? "btn-secondary" :
      "btn-ghost";
    const sizeClass = 
      size === "sm" ? "btn-sm" :
      size === "lg" ? "btn-lg" :
      size === "icon" ? "btn-icon" :
      "btn-default";
    
    const classes = `${baseClass} ${variantClass} ${sizeClass} ${className}`.trim();

    return (
      <button
        ref={ref}
        className={classes}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
