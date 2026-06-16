"use client";

import { useEffect, useState } from "react";

const phrases = [
  { text: "homes.", colorClass: "hero-typewriter-homes" },
  { text: "shops.", colorClass: "hero-typewriter-shops" },
  { text: "offices.", colorClass: "hero-typewriter-offices" },
] as const;

export function HeroHeading() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const currentPhrase = phrases[phraseIndex];

  useEffect(() => {
    const current = currentPhrase.text;
    let timeout: ReturnType<typeof setTimeout>;

    if (!isDeleting && displayText === current) {
      timeout = setTimeout(() => setIsDeleting(true), 2200);
    } else if (isDeleting && displayText === "") {
      setIsDeleting(false);
      setPhraseIndex((prev) => (prev + 1) % phrases.length);
    } else {
      const step = isDeleting ? 55 : 90;
      timeout = setTimeout(() => {
        setDisplayText(
          current.slice(0, displayText.length + (isDeleting ? -1 : 1)),
        );
      }, step);
    }

    return () => clearTimeout(timeout);
  }, [currentPhrase.text, displayText, isDeleting, phraseIndex]);

  return (
    <h1 className="font-primary mt-5 text-[27px] font-semibold leading-[1.12] tracking-[-0.02em] text-foreground sm:mt-6 sm:text-[36px] sm:leading-[1.08]">
      Quiet, clean ceiling work for{" "}
      <span
        className={`inline-block min-w-[6.5ch] text-left sm:min-w-[7ch] ${currentPhrase.colorClass}`}
      >
        <span>{displayText}</span>
        <span
          aria-hidden
          className="typewriter-cursor ml-px inline-block w-[2px]"
        >
          |
        </span>
      </span>
    </h1>
  );
}