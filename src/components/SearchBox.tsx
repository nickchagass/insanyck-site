// INSANYCK STEP 11 — SearchBox with DB Integration
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import { track } from "@/lib/analytics";

type Suggestion = {
  slug: string;
  title: string;
  price: string;
  thumb?: string;
};


export default function SearchBox() {
  const { t } = useTranslation(["search"]);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [idx, setIdx] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [_loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // INSANYCK STEP 11 — Fetch suggestions from API
  useEffect(() => {
    if (!q.trim()) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=8`);
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        const mapped: Suggestion[] = (data.results || []).map((p: any) => ({
          slug: p.slug,
          title: p.title,
          price: p.price,
          thumb: p.images?.front || "/products/placeholder/front.webp",
        }));
        
        setSuggestions(mapped);
      } catch (error) {
        console.error('[SearchBox] Error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 150); // Debounce
    return () => clearTimeout(timeoutId);
  }, [q]);

  const data = suggestions;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && !open) {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 0);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setIdx((v) => Math.min(v + 1, Math.max(0, data.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setIdx((v) => Math.max(0, v - 1));
    } else if (e.key === "Enter" && data[idx]) {
      track("select_suggestion", { slug: data[idx].slug });
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-white/80 hover:text-white/95 transition-all duration-150 px-2 py-1 rounded-lg border border-white/10 hover:border-white/25 hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
        aria-expanded={open}
        aria-controls="search-dropdown"
      >
        {t("search:open", "Buscar")}
        <span className="ml-2 text-white/40 text-xs">/</span>
      </button>

      {open && (
        <div
          id="search-dropdown"
          role="dialog"
          aria-modal="true"
          aria-labelledby="insanyck-search-label"
          className="absolute right-0 mt-2 w-[380px] rounded-2xl border border-white/10 bg-black/70 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] p-3 z-[60]"
        >
          <label id="insanyck-search-label" className="sr-only">
            {t("search:label", "Buscar produtos")}
          </label>
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("search:placeholder", "Busque por produtos")}
            className="w-full bg-transparent border border-white/15 rounded-lg px-3 py-2 outline-none text-white placeholder:text-white/40 focus:border-white/40 focus:ring-2 focus:ring-white/20 transition-all duration-150"
            autoComplete="off"
            aria-describedby="search-results"
          />
          <ul id="search-results" role="listbox" className="mt-3 max-h-[300px] overflow-auto flex flex-col gap-2">
            {data.length === 0 && (
              <li className="text-white/60 text-sm px-2 py-3">
                {t("search:empty", "Nenhum resultado")}
              </li>
            )}
            {data.map((s, i) => (
              <li key={s.slug}>
                <Link
                  href={`/produto/${s.slug}`}
                  role="option"
                  aria-selected={i === idx}
                  className={`flex items-center gap-3 rounded-xl border border-white/10 p-2 hover:bg-white/8 hover:border-white/20 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-1 ${
                    i === idx ? "ring-2 ring-white/30 bg-white/5" : ""
                  }`}
                  onClick={() => {
                    track("search", { q });
                    setOpen(false);
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.thumb}
                    alt={s.title}
                    className="w-12 h-12 object-cover rounded-lg border border-white/10"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-white/90 text-sm truncate">{s.title}</div>
                    <div className="text-white/60 text-xs">{s.price}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
