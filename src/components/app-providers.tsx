"use client";

import { DeferredToaster } from "@/components/deferred-toaster";

import { NavigationProgressProvider } from "@/components/navigation-progress";
import { PwaRegister } from "@/components/pwa-register";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <NavigationProgressProvider>
      <PwaRegister />
      <DeferredToaster />
      {children}
    </NavigationProgressProvider>
  );
}