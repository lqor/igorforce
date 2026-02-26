"use client";

import clsx from "clsx";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "brand" | "neutral" | "destructive" | "outline" | "success";

const variantStyles: Record<Variant, string> = {
  brand: "bg-sf-blue text-white hover:bg-sf-blue-dark",
  neutral: "bg-white text-sf-text border border-sf-border hover:bg-sf-cloud",
  destructive: "bg-sf-error text-white hover:bg-red-700",
  outline: "bg-transparent text-sf-blue border border-sf-blue hover:bg-blue-50",
  success: "bg-sf-success text-white hover:bg-green-700",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "neutral", size = "md", ...props }, ref) => {
    const sizeStyles = {
      sm: "px-3 py-1 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-2.5 text-base",
    };
    return (
      <button
        ref={ref}
        className={clsx(
          "inline-flex items-center justify-center gap-1.5 rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-sf-blue focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
