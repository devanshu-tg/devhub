"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PillFilterProps = {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
  count?: number | string;
  icon?: ReactNode;
  size?: "md" | "sm";
  className?: string;
  disabled?: boolean;
};

/** Filter pill — active = ink bg + paper text. Inactive = bg-elev + fg-muted. */
export function PillFilter({
  active,
  onClick,
  children,
  count,
  icon,
  size = "md",
  className,
  disabled,
}: PillFilterProps) {
  const sizeClasses = size === "sm" ? "px-3 py-1.5 text-[12px]" : "px-4 py-2 text-[13px]";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-medium transition-colors",
        sizeClasses,
        active
          ? "bg-[color:var(--ink)] text-[color:var(--paper)] border-[color:var(--ink)]"
          : "bg-[color:var(--bg-elev)] text-[color:var(--fg-muted)] border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--fg)]",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {icon}
      <span>{children}</span>
      {count != null ? (
        <span
          className={cn(
            "font-mono text-[11px] tracking-kicker",
            active ? "text-[color:var(--paper)]/70" : "text-[color:var(--fg-subtle)]",
          )}
        >
          {count}
        </span>
      ) : null}
    </button>
  );
}

type ChipProps = {
  children: ReactNode;
  tone?: "default" | "accent" | "cream";
  className?: string;
};

/** Small inline chip for tags. */
export function Chip({ children, tone = "default", className }: ChipProps) {
  const toneClasses = {
    default:
      "bg-[color:var(--cream)] border-[color:var(--border)] text-[color:var(--fg-muted)]",
    accent: "bg-[color:var(--tg-orange-50)] border-[color:var(--tg-orange-100)] text-[color:var(--accent)]",
    cream: "bg-[color:var(--cream)] border-[color:var(--border)] text-[color:var(--ink)]",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[10.5px] tracking-[0.08em]",
        toneClasses,
        className,
      )}
    >
      {children}
    </span>
  );
}

type IconBadgeProps = {
  children: ReactNode;
  tone?: "cream" | "ink" | "accent";
  size?: number;
  className?: string;
};

/** Circle badge for icons in quick-links etc. */
export function IconBadge({
  children,
  tone = "cream",
  size = 40,
  className,
}: IconBadgeProps) {
  const toneClasses = {
    cream: "bg-[color:var(--cream)] text-[color:var(--accent)]",
    ink: "bg-[color:var(--ink)] text-[color:var(--paper)]",
    accent: "bg-[color:var(--accent)] text-[color:var(--accent-fg)]",
  }[tone];
  return (
    <div
      className={cn("flex items-center justify-center rounded-full flex-shrink-0", toneClasses, className)}
      style={{ width: size, height: size }}
    >
      {children}
    </div>
  );
}
