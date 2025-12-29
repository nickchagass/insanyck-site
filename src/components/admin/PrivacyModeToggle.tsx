// INSANYCK STEP H0 — Privacy Mode Toggle
// SSR-safe toggle with Shift+P keyboard shortcut
// Applies blur to .ins-money elements when active
// INSANYCK STEP H0-POLISH — Refined visual details

"use client";

import { useEffect, useState } from "react";

const PRIVACY_CLASS = "ins-privacy-mode";
const STORAGE_KEY = "insanyck-admin-privacy";

export default function PrivacyModeToggle() {
  const [isPrivate, setIsPrivate] = useState(false);

  // SSR-safe initialization
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Restore from localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") {
      setIsPrivate(true);
      document.documentElement.classList.add(PRIVACY_CLASS);
    }

    // Keyboard shortcut: Shift+P
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === "P") {
        e.preventDefault();
        togglePrivacy();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const togglePrivacy = () => {
    setIsPrivate((prev) => {
      const newValue = !prev;

      // Update DOM
      if (newValue) {
        document.documentElement.classList.add(PRIVACY_CLASS);
      } else {
        document.documentElement.classList.remove(PRIVACY_CLASS);
      }

      // Persist
      localStorage.setItem(STORAGE_KEY, String(newValue));

      return newValue;
    });
  };

  return (
    <button
      type="button"
      onClick={togglePrivacy}
      title={`Privacy Mode ${isPrivate ? "ON" : "OFF"} (Shift+P)`}
      className={`
        group relative
        flex items-center gap-2
        px-3 py-1.5
        rounded-[var(--ds-radius-md)]
        text-sm font-medium
        border
        transition-all duration-150
        ${
          isPrivate
            ? "bg-white/[0.06] text-white/90 border-white/[0.16]"
            : "bg-white/[0.02] text-white/50 border-white/[0.08]"
        }
        hover:border-white/[0.20]
        hover:bg-white/[0.04]
        active:scale-[0.98]
      `}
    >
      {/* Eye icon — INSANYCK STEP H0-POLISH: lighter stroke */}
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        {isPrivate ? (
          // Eye-off icon
          <>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
            />
          </>
        ) : (
          // Eye icon
          <>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </>
        )}
      </svg>

      <span className="hidden sm:inline">
        {isPrivate ? "Private" : "Public"}
      </span>

      {/* Keyboard hint tooltip — INSANYCK STEP H0-POLISH: refined styling */}
      <span
        className="
          absolute -top-8 left-1/2 -translate-x-1/2
          px-2.5 py-1
          bg-black/95 text-white/90 text-xs font-medium rounded-md
          border border-white/[0.08]
          whitespace-nowrap
          opacity-0 group-hover:opacity-100
          transition-opacity duration-200
          pointer-events-none
          backdrop-blur-sm
        "
      >
        Shift+P
      </span>
    </button>
  );
}
