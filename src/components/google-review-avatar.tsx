"use client";

import Image from "next/image";
import { shouldBypassImageOptimization } from "@/lib/image-loading";
import { useState } from "react";

type GoogleReviewAvatarProps = {
  name: string;
  photoUrl: string | null;
};

export function GoogleReviewAvatar({ name, photoUrl }: GoogleReviewAvatarProps) {
  const [failed, setFailed] = useState(false);
  const initial = name.trim().slice(0, 1).toUpperCase() || "G";
  const showPhoto = Boolean(photoUrl) && !failed;

  return (
    <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-border-soft bg-gradient-to-br from-amber-100 to-surface-muted">
      {showPhoto ? (
        <Image
          alt=""
          loading="lazy"
          decoding="async"
          width={44}
          height={44}
          className="size-full object-cover"
          onError={() => setFailed(true)}
          referrerPolicy="no-referrer"
          src={photoUrl!}
          sizes="44px"
          unoptimized={shouldBypassImageOptimization(photoUrl!)}
        />
      ) : (
        <span className="flex size-full items-center justify-center text-sm font-semibold text-amber-800/80">
          {initial}
        </span>
      )}
    </div>
  );
}
