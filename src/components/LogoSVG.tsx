// INSANYCK STEP 3
"use client";

import * as React from "react";

type LogoVariant = "primary" | "mono" | "outline";
type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

export type LogoProps = {
  variant?: LogoVariant;
  size?: LogoSize;
  glow?: boolean;
  ariaLabel?: string;
  className?: string;
};

const SIZE_MAP: Record<LogoSize, number> = {
  xs: 72,
  sm: 96,
  md: 120,
  lg: 160,
  xl: 200,
};

export function LogoSVG({
  variant = "primary",
  size = "sm",
  glow = false,
  ariaLabel = "INSANYCK",
  className = "",
}: LogoProps) {
  const src =
    variant === "mono"
      ? "/public/brand/logo-mono.svg".replace("/public", "")
      : variant === "outline"
      ? "/public/brand/logo-outline.svg".replace("/public", "")
      : "/public/brand/logo.svg".replace("/public", "");
  const height = SIZE_MAP[size];

  return (
    <span
      className={[
        "inline-flex items-center",
        glow ? "drop-shadow-[0_0_12px_rgba(255,255,255,0.25)]" : "",
        className,
      ].join(" ")}
      aria-label={ariaLabel}
    >
      {/* usando <img> para manter o <text> do SVG temporário até trocarmos por <path> */}
      <img src={src} alt={ariaLabel} height={height} style={{ height }} />
    </span>
  );
}

export default LogoSVG;
