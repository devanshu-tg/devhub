"use client";

type Tone = "orange" | "warm" | "slate" | "dark";

type Props = {
  label?: string;
  width?: string | number;
  height?: string | number;
  tone?: Tone;
  className?: string;
};

const PALETTE: Record<Tone, [string, string]> = {
  orange: ["#FFE8D4", "#FFD5A8"],
  warm: ["#F5EEDF", "#E8DEC9"],
  slate: ["#1E232A", "#171A1F"],
  dark: ["#2A261F", "#23201B"],
};

export function ImagePlaceholder({
  label = "IMAGE",
  width = "100%",
  height = 200,
  tone = "orange",
  className,
}: Props) {
  const [base, accent] = PALETTE[tone];
  return (
    <div
      className={className}
      style={{
        width,
        height,
        position: "relative",
        overflow: "hidden",
        background: base,
        borderRadius: 6,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(135deg, ${base} 0 14px, ${accent} 14px 28px)`,
        }}
      />
      {label ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            letterSpacing: "0.2em",
            color: tone === "slate" || tone === "dark" ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.4)",
            fontWeight: 500,
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
}
