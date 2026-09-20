"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ShinyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
  fillColor?: string;
  labelColor?: string;
  accentColor?: string;
  accentSoftColor?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export const ShinyButton: React.FC<ShinyButtonProps> = ({
  children,
  className,
  fillColor = "#111827",
  labelColor = "#f5eef7",
  accentColor = "#ff6b4a",
  accentSoftColor = "#ffb199",
  onClick,
  disabled,
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={
        {
          backgroundColor: fillColor,
          color: labelColor,
          "--accent": accentColor,
          "--accent-soft": accentSoftColor,
        } as React.CSSProperties
      }
      className={cn(
        "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg px-4 py-2.5 text-sm font-semibold tracking-wide shadow-sm transition-all duration-300",
        "border border-slate-700/60 hover:border-slate-600 hover:shadow-md active:scale-[0.98]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500",
        "disabled:pointer-events-none disabled:opacity-60",
        className
      )}
      {...props}
    >
      {/* Dynamic light reflection sweep */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-full top-0 block -skew-x-12 bg-gradient-to-r from-transparent via-[var(--accent-soft)]/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:animate-shine group-hover:opacity-100"
      />

      {/* Subtle bottom edge glow */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-3/4 -translate-x-1/2 rounded-full bg-[var(--accent)] opacity-80 blur-[1px] transition-all duration-300 group-hover:w-full group-hover:opacity-100"
      />

      {/* Button content */}
      <span className="relative z-10 flex items-center gap-2 font-medium">
        {children}
      </span>
    </button>
  );
};

export default ShinyButton;
