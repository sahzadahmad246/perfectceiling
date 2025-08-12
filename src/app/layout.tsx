"use client";

import React from "react";
import Navbar from "@/components/navbar";
import { usePathname } from "next/navigation";
import { Toaster } from "sonner";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Hide Navbar if pathname starts with '/dashboard'
  const showNavbar = !pathname.startsWith("/dashboard");

  return (
    <html lang="en">
      <body className="min-h-screen grid grid-rows-[auto_1fr_auto] bg-gray-50/30">
        {showNavbar && <Navbar />}
        <main className="max-w-6xl mx-auto w-full p-4 py-8">{children}</main>
        <Toaster />
        
      </body>
    </html>
  );
}
