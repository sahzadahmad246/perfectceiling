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
        <footer className="border-t bg-white/80 backdrop-blur">
          <div className="max-w-6xl mx-auto p-6 text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} Perfect Ceiling. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}
