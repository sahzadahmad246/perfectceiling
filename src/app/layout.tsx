import type { Metadata } from "next";

import { AppProviders } from "@/components/app-providers";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Perfect Ceiling | POP False Ceiling, PVC Ceiling & Ceiling Work",
    template: "%s | Perfect Ceiling",
  },
  description: siteConfig.description,
  keywords: [
    "POP false ceiling",
    "false ceiling contractor",
    "PVC ceiling",
    "wooden ceiling",
    "gypsum ceiling",
    "POP work",
    "ceiling repair",
  ],
  openGraph: {
    title: "Perfect Ceiling",
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: "Perfect Ceiling",
    locale: "en_IN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <AppProviders />
        {children}
      </body>
    </html>
  );
}
