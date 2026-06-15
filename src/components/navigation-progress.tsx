"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

function ProgressBar() {
  const [visible, setVisible] = useState(true);

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[9999] h-1 overflow-hidden bg-sky-200/90 shadow-[0_1px_6px_rgba(14,165,233,0.45)]">
      <div
        className="navigation-progress-bar h-full bg-sky-500"
        onAnimationEnd={() => setVisible(false)}
      />
    </div>
  );
}

export function NavigationProgress() {
  const pathname = usePathname();

  return <ProgressBar key={pathname} />;
}