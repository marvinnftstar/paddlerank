"use client";

import { useEffect, useState } from "react";
import { getSafeLogoUrl } from "@/lib/clubs";

type ClubLogoProps = {
  clubName: string;
  logoUrl: string | null;
  className?: string;
};

export function ClubLogo({
  clubName,
  logoUrl,
  className = "h-14 w-14",
}: ClubLogoProps) {
  const safeLogoUrl = getSafeLogoUrl(logoUrl);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [safeLogoUrl]);

  if (!safeLogoUrl || imageFailed) {
    return (
      <div
        role="img"
        aria-label={`${clubName} logo fallback`}
        className={`flex shrink-0 items-center justify-center rounded-xl bg-court-mist text-lg font-black text-court-navy ${className}`}
      >
        {clubName.slice(0, 1).toUpperCase()}
      </div>
    );
  }

  return (
    <img
      src={safeLogoUrl}
      alt={`${clubName} logo`}
      className={`shrink-0 rounded-xl border border-court-teal/15 object-cover ${className}`}
      onError={() => setImageFailed(true)}
    />
  );
}
