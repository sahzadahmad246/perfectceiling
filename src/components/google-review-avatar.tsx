"use client";

import { useState } from "react";

type GoogleReviewAvatarProps = {
  name: string;
  photoUrl: string | null;
};

/**
 * Google review avatars often block hotlinking without referrerPolicy.
 * Use a plain img (not next/image) so photos load reliably.
 */
export function GoogleReviewAvatar({ name, photoUrl }: GoogleReviewAvatarProps) {
  const [failed, setFailed] = useState(false);
  const initial = name.trim().slice(0, 1).toUpperCase() || "G";
  const showPhoto = Boolean(photoUrl) && !failed;

  return (
    <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-border-soft bg-gradient-to-br from-amber-100 to-surface-muted">
      {showPhoto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          alt=""
          className="size-full object-cover"
          onError={() => setFailed(true)}
          referrerPolicy="no-referrer"
          src={photoUrl!}
        />
      ) : (
        <span className="flex size-full items-center justify-center text-sm font-semibold text-amber-800/80">
          {initial}
        </span>
      )}
    </div>
  );
}
