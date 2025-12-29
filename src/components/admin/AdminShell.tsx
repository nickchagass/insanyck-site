// INSANYCK STEP H0 — Admin Shell Layout
// "The Black Box" — Museum Edition admin wrapper
// Sticky header + The Pulse HUD + content area
// INSANYCK STEP H0-POLISH — Refined visual details (quiet luxury)

"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ADMIN_CONSOLE_META } from "@/lib/admin/constants";
import PrivacyModeToggle from "./PrivacyModeToggle";
import AdminPulseHUD from "./AdminPulseHUD";
import GlassCard from "@/components/ui/GlassCard";

interface AdminShellProps {
  children: ReactNode;
  /** Page title (optional, defaults to console name) */
  title?: string;
  /** Hide The Pulse HUD (default: false) */
  hidePulse?: boolean;
}

export default function AdminShell({
  children,
  title,
  hidePulse = false,
}: AdminShellProps) {
  return (
    <div className="min-h-screen museum-atmosphere">
      {/* Sticky Header — INSANYCK STEP H0-POLISH: lighter blur, finer hairline */}
      <header
        className="
          sticky top-0 z-50
          border-b border-white/[0.06]
          backdrop-blur-md
          bg-black/40
        "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Title + Badge */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-semibold text-white/95 tracking-tight">
                {title || ADMIN_CONSOLE_META.name}
              </h1>
              {/* INSANYCK STEP H0-POLISH: custom badge (more jewel-like) */}
              <span
                className="
                  inline-flex items-center
                  px-2.5 py-0.5
                  rounded-[var(--ds-radius-sm)]
                  text-[0.6875rem] font-medium uppercase tracking-wider
                  bg-gradient-to-br from-white/[0.08] to-white/[0.04]
                  text-white/70
                  border border-white/[0.12]
                  backdrop-blur-sm
                "
              >
                {ADMIN_CONSOLE_META.codename}
              </span>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Privacy Mode Toggle */}
              <PrivacyModeToggle />

              {/* Back to Store — INSANYCK STEP H0-POLISH: refined hover */}
              <Link
                href="/"
                className="
                  hidden sm:flex items-center gap-2
                  px-3 py-1.5
                  text-sm font-medium
                  text-white/50
                  border border-white/[0.08]
                  rounded-[var(--ds-radius-md)]
                  hover:border-white/[0.16]
                  hover:text-white/80
                  hover:bg-white/[0.03]
                  transition-all duration-150
                  active:scale-[0.98]
                "
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Loja
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content — INSANYCK STEP H0-POLISH: increased spacing */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* The Pulse HUD */}
        {!hidePulse && (
          <div className="mb-10">
            <AdminPulseHUD />
          </div>
        )}

        {/* Content Area */}
        <GlassCard className="min-h-[400px]">
          {children}
        </GlassCard>
      </main>

      {/* Footer — INSANYCK STEP H0-POLISH: finer hairline, refined status pill */}
      <footer className="border-t border-white/[0.06] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/40">
            <div className="text-xs tracking-wider">
              {ADMIN_CONSOLE_META.name} · {ADMIN_CONSOLE_META.version}
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs tracking-wide text-white/50">CEO-Only Access</span>
              <div
                className="
                  h-1.5 w-1.5 rounded-full
                  bg-emerald-400/80
                  shadow-[0_0_8px_rgba(52,211,153,0.4)]
                "
              />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
