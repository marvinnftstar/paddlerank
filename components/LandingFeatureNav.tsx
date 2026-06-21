"use client";

import { useEffect, useState } from "react";

type ComingSoonFeature = "Rankings" | "Courts";

const iconClassName = "h-4 w-4 shrink-0";

function TrophyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={iconClassName}>
      <path d="M8 4h8v3.5A4 4 0 0 1 12 12a4 4 0 0 1-4-4.5V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 6H5v1a4 4 0 0 0 4 4M16 6h3v1a4 4 0 0 1-4 4M12 12v4m-3 3h6m-5-3h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClubsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={iconClassName}>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M15 6.5a2.5 2.5 0 0 1 0 5M16 14a4.5 4.5 0 0 1 4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={iconClassName}>
      <path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.25" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function LandingFeatureNav() {
  const [comingSoonFeature, setComingSoonFeature] = useState<ComingSoonFeature | null>(null);

  useEffect(() => {
    if (!comingSoonFeature) return;

    const timer = window.setTimeout(() => setComingSoonFeature(null), 3200);
    return () => window.clearTimeout(timer);
  }, [comingSoonFeature]);

  const itemClassName =
    "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full px-2.5 py-2 text-xs font-extrabold text-white/90 transition hover:bg-white/15 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-court-green sm:px-3";

  return (
    <>
      <nav aria-label="Explore PaddleRank features" className="grid grid-cols-3 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-sm">
        <button type="button" onClick={() => setComingSoonFeature("Rankings")} className={itemClassName}>
          <TrophyIcon />
          <span>Rankings</span>
        </button>
        <a href="#club-interest" className={itemClassName}>
          <ClubsIcon />
          <span>Clubs</span>
        </a>
        <button type="button" onClick={() => setComingSoonFeature("Courts")} className={itemClassName}>
          <LocationIcon />
          <span>Courts</span>
        </button>
      </nav>

      {comingSoonFeature ? (
        <div role="status" aria-live="polite" className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-white/25 bg-court-navy/95 px-5 py-4 text-left text-white shadow-glow backdrop-blur sm:bottom-7">
          <p className="font-black">{comingSoonFeature} are coming soon.</p>
          <p className="mt-1 text-sm text-white/75">We&apos;re building more ways to play and connect.</p>
        </div>
      ) : null}
    </>
  );
}
