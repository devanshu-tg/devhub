import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type KickerProps = {
  children: ReactNode;
  className?: string;
};

/** / SECTION NAME — uppercase mono label in TG orange. */
export function Kicker({ children, className }: KickerProps) {
  return (
    <div
      className={cn(
        "font-mono text-[11px] uppercase tracking-kicker text-[color:var(--accent)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

type DisplayTitleProps = {
  children: ReactNode;
  italic?: ReactNode;
  as?: "h1" | "h2" | "h3";
  size?: "xl" | "lg" | "md";
  className?: string;
};

const sizeClasses: Record<NonNullable<DisplayTitleProps["size"]>, string> = {
  xl: "text-[52px] leading-[1.02] tracking-[-0.04em]",
  lg: "text-[40px] leading-[1.05] tracking-[-0.032em]",
  md: "text-[28px] leading-[1.1] tracking-[-0.028em]",
};

/** Display-size headline with optional `italic` span inserted at the end. */
export function DisplayTitle({
  children,
  italic,
  as: Tag = "h1",
  size = "xl",
  className,
}: DisplayTitleProps) {
  return (
    <Tag
      className={cn(
        "font-sans font-medium text-[color:var(--ink)]",
        sizeClasses[size],
        className,
      )}
    >
      {children}
      {italic ? (
        <>
          {" "}
          <span className="font-serif italic">{italic}</span>
        </>
      ) : null}
    </Tag>
  );
}

type SectionHeaderProps = {
  kicker?: ReactNode;
  title: ReactNode;
  italic?: ReactNode;
  sub?: ReactNode;
  right?: ReactNode;
  size?: DisplayTitleProps["size"];
  className?: string;
};

/** Page/section header with kicker + headline (one italic accent) + subtitle + optional right slot. */
export function SectionHeader({
  kicker,
  title,
  italic,
  sub,
  right,
  size = "lg",
  className,
}: SectionHeaderProps) {
  return (
    <header className={cn("flex items-end justify-between gap-10", className)}>
      <div className="max-w-[720px]">
        {kicker ? <Kicker className="mb-2">{kicker}</Kicker> : null}
        <DisplayTitle italic={italic} size={size}>
          {title}
        </DisplayTitle>
        {sub ? (
          <p className="mt-3 text-[16px] leading-[1.55] text-[color:var(--fg-muted)] max-w-[620px]">
            {sub}
          </p>
        ) : null}
      </div>
      {right ? <div className="flex-shrink-0">{right}</div> : null}
    </header>
  );
}
