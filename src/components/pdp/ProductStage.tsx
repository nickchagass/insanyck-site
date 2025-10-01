"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  imageUrl: string;
  alt?: string;
  hint?: string; // ex.: "Arraste para girar — passe o mouse"
};

function supportsHover() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(hover:hover)").matches ?? false;
}

export default function ProductStage({ imageUrl, alt = "", hint }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [mounted, setMounted] = useState(false);
  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  useEffect(() => setMounted(true), []);

  // Tilting/parallax control
  useEffect(() => {
    const el = ref.current;
    const img = imgRef.current;
    if (!el || !img) return;
    if (reduceMotion) return;

    let raf = 0;
    let rx = 0,
      ry = 0,
      tx = 0,
      ty = 0;

    const onMove = (x: number, y: number) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (x - cx) / (r.width / 2);
      const dy = (y - cy) / (r.height / 2);
      // limite a 7 graus
      const MAX = 7;
      tx = Math.max(-MAX, Math.min(MAX, dx * MAX));
      ty = Math.max(-MAX, Math.min(MAX, dy * MAX));
      loop();
    };

    const loop = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        rx += (ty - rx) * 0.12; // inverte e suaviza
        ry += (-tx - ry) * 0.12;
        img.style.transform = `translateZ(0) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    };

    const onMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (!e.touches[0]) return;
      onMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const reset = () => {
      tx = ty = 0;
      loop();
    };

    el.addEventListener("mousemove", onMouse);
    el.addEventListener("mouseleave", reset);
    el.addEventListener("touchmove", onTouch, { passive: true });
    el.addEventListener("touchend", reset);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mousemove", onMouse);
      el.removeEventListener("mouseleave", reset);
      el.removeEventListener("touchmove", onTouch);
      el.removeEventListener("touchend", reset);
    };
  }, [reduceMotion]);

  return (
    <div
      ref={ref}
      className="pdp-stage relative isolate overflow-hidden rounded-3xl border border-white/10 bg-black/30"
      aria-label="Visual do produto"
    >
      <div aria-hidden className="pdp-stage__halo" />

      {/* Frame 4/5 com área útil previsível */}
      <div className="pdp-stage__frame">
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
      </div>

      <div aria-hidden className="pdp-stage__pedestal" />

      {mounted && supportsHover() && !reduceMotion && hint && (
        <div className="pdp-stage__hint">{hint}</div>
      )}
    </div>
  );
}