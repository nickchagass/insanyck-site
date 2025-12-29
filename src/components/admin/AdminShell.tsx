// INSANYCK STEP H0 — Admin Shell Layout
// "The Black Box" — Museum Edition admin wrapper
// Sticky header + The Pulse HUD + content area

"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { ADMIN_CONSOLE_META } from "@/lib/admin/constants";
import PrivacyModeToggle from "./PrivacyModeToggle";
import AdminPulseHUD from "./AdminPulseHUD";
import DsBadge from "@/components/ds/DsBadge";
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
      {/* Sticky Header */}
      <header
        className="
          sticky top-0 z-50
          border-b border-[color:var(--ds-border-subtle)]
          backdrop-blur-xl
          bg-black/50
        "
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Title + Badge */}
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {title || ADMIN_CONSOLE_META.name}
              </h1>
              <DsBadge variant="new">
                {ADMIN_CONSOLE_META.codename}
              </DsBadge>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Privacy Mode Toggle */}
              <PrivacyModeToggle />

              {/* Back to Store */}
              <Link
                href="/"
                className="
                  hidden sm:flex items-center gap-2
                  px-3 py-1.5
                  text-sm font-medium
                  text-[color:var(--ds-accent-soft)]
                  border border-[color:var(--ds-border-subtle)]
                  rounded-[var(--ds-radius-md)]
                  hover:border-[color:var(--ds-border-strong)]
                  hover:text-[color:var(--ds-accent)]
                  transition-all duration-150
                  active:scale-[0.97]
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
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Loja
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* The Pulse HUD */}
        {!hidePulse && (
          <div className="mb-8">
            <AdminPulseHUD />
          </div>
        )}

        {/* Content Area */}
        <GlassCard className="min-h-[400px]">
          {children}
        </GlassCard>
      </main>

      {/* Footer */}
      <footer className="border-t border-[color:var(--ds-border-subtle)] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[color:var(--ds-accent-soft)]">
            <div>
              {ADMIN_CONSOLE_META.name} · {ADMIN_CONSOLE_META.version}
            </div>
            <div className="flex items-center gap-4">
              <span>CEO-Only Access</span>
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
