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
      // limites suaves
      tx = Math.max(-10, Math.min(10, dx * 10));
      ty = Math.max(-10, Math.min(10, dy * 10));
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
      {/* halo de luz suave */}
      <div aria-hidden className="pdp-stage__halo" />
      {/* imagem "flutuando" */}
      <div className="pdp-stage__imgWrap">
        {/* use <img> para preservar proporção original do asset */}
        <img
          ref={imgRef}
          src={imageUrl}
          alt={alt}
          className="pdp-stage__img"
          decoding="async"
          loading="eager"
        />
      </div>
      {/* base/pedestal */}
      <div aria-hidden className="pdp-stage__pedestal" />
      {/* dica de interação */}
      {mounted && supportsHover() && !reduceMotion && hint && (
        <div className="pdp-stage__hint">{hint}</div>
      )}
    </div>
  );
}