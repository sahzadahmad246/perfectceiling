"use client";

import { Toaster } from "sonner";

import { NavigationProgressProvider } from "@/components/navigation-progress";
import { PwaRegister } from "@/components/pwa-register";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <NavigationProgressProvider>
      <PwaRegister />
      <Toaster closeButton position="top-center" richColors />
      {children}
    </NavigationProgressProvider>
  );
}