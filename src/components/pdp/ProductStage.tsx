"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  imageUrl: string;
  alt?: string;
  hint?: string; // ex.: "Arraste para girar — passe o mouse" (desktop)
  hintMobile?: string; // ex.: "Toque para interagir" (mobile, default: "Toque para interagir")
};

function supportsHover() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(hover:hover)")?.matches ?? false;
}

export default function ProductStage({ imageUrl, alt = "", hint, hintMobile }: Props) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [mounted, setMounted] = useState(false);

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  // INSANYCK STEP P1-STAGE — Hint dinâmico para desktop/mobile
  const displayHint = mounted
    ? supportsHover()
      ? hint
      : (hintMobile || "Toque para interagir")
    : undefined;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img) return;
    if (reduceMotion) return;

    let raf = 0;
    let rx = 0, ry = 0;   // rotação atual
    let tx = 0, ty = 0;   // alvo

    const clamp = (v: number, min: number, max: number) =>
      Math.max(min, Math.min(max, v));

    const onMove = (x: number, y: number) => {
      const r = frame.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (x - cx) / (r.width / 2);
      const dy = (y - cy) / (r.height / 2);
      // limite ~7 graus
      tx = clamp(dy * 7, -7, 7);
      ty = clamp(-dx * 7, -7, 7);
      tick();
    };

    const tick = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        rx += (tx - rx) * 0.12;
        ry += (ty - ry) * 0.12;
        img.style.transform = `translateZ(0) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    };

    const onMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const reset = () => { tx = 0; ty = 0; tick(); };

    frame.addEventListener("mousemove", onMouse);
    frame.addEventListener("mouseleave", reset);
    frame.addEventListener("touchmove", onTouch, { passive: true });
    frame.addEventListener("touchend", reset);

    return () => {
      cancelAnimationFrame(raf);
      frame.removeEventListener("mousemove", onMouse);
      frame.removeEventListener("mouseleave", reset);
      frame.removeEventListener("touchmove", onTouch);
      frame.removeEventListener("touchend", reset);
    };
  }, [reduceMotion]);

  return (
    <div ref={frameRef} className="ins-stage pdp-stage relative isolate overflow-hidden rounded-3xl border border-white/10 bg-black/30">
      {/* halo cinematográfico */}
      <div aria-hidden className="pdp-stage__halo" />
      {/* imagem (nunca distorce) */}
      <div className="pdp-stage__imgWrap">
        <img
          ref={imgRef}
          src={imageUrl}
          alt={alt}
          className="pdp-stage__img"
          decoding="async"
          loading="eager"
        />
      </div>
      {/* pedestal elíptico */}
      <div aria-hidden className="pdp-stage__pedestal" />
      {/* dica de interação — INSANYCK STEP P1-STAGE */}
      {!reduceMotion && displayHint && (
        <div className="pdp-stage__hint">{displayHint}</div>
      )}
    </div>
  );
}