"use client";

import { useMemo } from "react";

type Props = {
  name?: string;
  size?: number;
  src?: string | null;
  className?: string;
};

export function Avatar({ name = "U", size = 32, src, className }: Props) {
  const hue = useMemo(() => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return h;
  }, [name]);

  const initials = name
    .split(" ")
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={className}
        style={{ width: size, height: size, borderRadius: size / 2, objectFit: "cover", flexShrink: 0 }}
      />
    );
  }

  return (
    <div
      className={className}
      aria-label={name}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        background: `oklch(0.72 0.12 ${hue})`,
        color: "#fff",
        fontSize: size * 0.38,
        fontWeight: 600,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-sans)",
        flexShrink: 0,
      }}
    >
      {initials || "U"}
    </div>
  );
}
