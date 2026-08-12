"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/** Short one-line service titles for the hero typewriter. */
const phrases = [
  { text: "POP false ceilings", colorClass: "hero-typewriter-homes" },
  { text: "PVC kitchen ceilings", colorClass: "hero-typewriter-shops" },
  { text: "Gypsum & cove lighting", colorClass: "hero-typewriter-offices" },
  { text: "Wooden ceiling work", colorClass: "hero-typewriter-homes" },
  { text: "Repairs & clean quotes", colorClass: "hero-typewriter-shops" },
] as const;

type HeroHeadingProps = {
  /** White text for photo/video hero backgrounds. */
  onDark?: boolean;
  className?: string;
};

export function HeroHeading({ onDark = false, className }: HeroHeadingProps) {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPhrase = phrases[phraseIndex];

  useEffect(() => {
    const current = currentPhrase.text;
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayText === current) {
      timeout = setTimeout(() => setIsDeleting(true), 2400);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    } else {
      const step = isDeleting ? 40 : 70;
      timeout = setTimeout(() => {
        setDisplayText(
          current.slice(0, displayText.length + (isDeleting ? -1 : 1)),
        );
      }, step);
    }

    return () => clearTimeout(timeout);
  }, [currentPhrase.text, displayText, isDeleting, phraseIndex]);

  return (
    <h1
      className={cn(
        "font-primary text-[26px] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[30px] sm:leading-[1.1]",
        onDark ? "text-white" : "text-foreground",
        className,
      )}
    >
      <span className="block text-[0.72em] font-medium opacity-90">
        Perfect Ceiling
      </span>
      <span className="mt-1 block whitespace-nowrap">
        <span className={cn(onDark ? "text-white" : currentPhrase.colorClass)}>
          {displayText}
        </span>
        <span
          aria-hidden
          className={cn(
            "typewriter-cursor ml-px inline-block w-[2px]",
            onDark ? "text-white" : "text-foreground",
          )}
        >
          |
        </span>
      </span>
    </h1>
  );
}
