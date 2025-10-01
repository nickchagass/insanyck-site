"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  imageUrl: string;
  alt?: string;
  hint?: string;
};

function supportsHover() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(hover:hover)").matches ?? false;
}

export default function ProductStage({ imageUrl, alt = "", hint }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [mounted, setMounted] = useState(false);

  const reduceMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  useEffect(() => setMounted(true), []);

  // Tilt / parallax suave
  useEffect(() => {
    const el = rootRef.current;
    const img = imgRef.current;
    if (!el || !img || reduceMotion) return;

    let raf = 0;
    let rx = 0, ry = 0, tx = 0, ty = 0;

    const onMove = (x: number, y: number) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (x - cx) / (r.width / 2);
      const dy = (y - cy) / (r.height / 2);
      tx = Math.max(-10, Math.min(10, dx * 10));
      ty = Math.max(-10, Math.min(10, dy * 10));
      loop();
    };

    const loop = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        // limite 7°
        rx += (Math.max(-7, Math.min(7, ty)) - rx) * 0.12;
        ry += (Math.max(-7, Math.min(7, -tx)) - ry) * 0.12;
        img.style.transform = `translateZ(0) rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
    };

    const onMouse = (e: MouseEvent) => onMove(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches?.[0]; if (!t) return;
      onMove(t.clientX, t.clientY);
    };
    const reset = () => { tx = ty = 0; loop(); };

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
      ref={rootRef}
      className="pdp-stage"
      aria-label="Visual do produto"
    >
      <div aria-hidden className="pdp-stage__halo" />
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
        <div aria-hidden className="pdp-stage__pedestal" />
      </div>
      {mounted && supportsHover() && !reduceMotion && hint && (
        <div className="pdp-stage__hint">{hint}</div>
      )}
    </div>
  );
}