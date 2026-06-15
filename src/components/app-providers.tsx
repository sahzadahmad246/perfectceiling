"use client";

import { Toaster } from "sonner";

import { NavigationProgress } from "@/components/navigation-progress";

export function AppProviders() {
  return (
    <>
      <NavigationProgress />
      <Toaster closeButton position="top-center" richColors />
    </>
  );
}