// src/signature/enhancements.ts
import { ReactElement } from "react";
export const applyUltraLuxury = (component: ReactElement) => {
  if (process.env.NEXT_PUBLIC_LUXURY_MODE === "ULTRA") {
    // Aqui pode envolver com glass, glow, etc
    return (
      <div style={{
        filter: "drop-shadow(0px 0px 36px #FFD700aa) blur(0.5px)",
        border: "2px solid #D4AF37",
        borderRadius: 28
      }}>
        {component}
      </div>
    );
  }
  return component;
};
