// INSANYCK STEP 3
"use client";

import * as React from "react";

type Variant = "solid" | "ghost";

export function CTA({
  children,
  variant = "solid",
  className = "",
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  if (variant === "ghost") {
    return (
      <button
        {...rest}
        className={[
          "rounded-xl px-6 h-12 border border-white/20 text-white/90",
          "hover:bg-white/5 hover:border-white/30",
          "transition shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]",
          className,
        ].join(" ")}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      {...rest}
      className={[
        "rounded-xl px-6 h-12 bg-white text-black",
        "hover:brightness-[1.03] active:translate-y-[0.5px]",
        "shadow-[0_1px_0_#ffffff40,0_8px_20px_rgba(255,255,255,0.08)]",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
