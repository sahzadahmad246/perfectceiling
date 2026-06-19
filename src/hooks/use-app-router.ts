"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";

import { useNavigationProgress } from "@/components/navigation-progress";

export function useAppRouter() {
  const router = useRouter();
  const { begin } = useNavigationProgress();

  return useMemo(
    () => ({
      back: () => {
        begin();
        router.back();
      },
      forward: () => {
        begin();
        router.forward();
      },
      push: (href: string, options?: Parameters<typeof router.push>[1]) => {
        router.push(href, options);
        begin(href);
      },
      replace: (href: string, options?: Parameters<typeof router.replace>[1]) => {
        router.replace(href, options);
        begin(href);
      },
      refresh: () => router.refresh(),
      prefetch: router.prefetch,
    }),
    [begin, router],
  );
}