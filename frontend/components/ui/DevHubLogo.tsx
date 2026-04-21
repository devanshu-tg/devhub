"use client";

type LogoProps = {
  size?: number;
  mono?: boolean;
  className?: string;
};

export function DevHubLogo({ size = 32, mono = false, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect width="40" height="40" rx="9" fill={mono ? "currentColor" : "var(--tg-orange)"} />
      <path
        d="M9 14L15 22L9 30"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M17 14L23 22L17 30"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.55"
      />
      <circle cx="29" cy="14" r="2.2" fill="#fff" />
      <circle cx="29" cy="30" r="2.2" fill="#fff" />
      <path d="M29 16.2V27.8" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

type WordmarkProps = {
  size?: number;
  className?: string;
};

export function DevHubWordmark({ size = 18, className }: WordmarkProps) {
  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 2,
        fontFamily: "var(--font-sans)",
        fontWeight: 700,
        fontSize: size,
        letterSpacing: "-0.02em",
        color: "var(--ink)",
      }}
    >
      <span>Dev</span>
      <span style={{ color: "var(--tg-orange)" }}>Hub</span>
    </span>
  );
}
