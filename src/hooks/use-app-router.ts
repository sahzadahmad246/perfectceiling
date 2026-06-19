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
        begin(href);
        router.push(href, options);
      },
      replace: (href: string, options?: Parameters<typeof router.replace>[1]) => {
        begin(href);
        router.replace(href, options);
      },
      refresh: () => router.refresh(),
      prefetch: router.prefetch,
    }),
    [begin, router],
  );
}