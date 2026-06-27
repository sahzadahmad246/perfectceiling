import type { Metadata, Viewport } from "next";
import { Montserrat, Plus_Jakarta_Sans } from "next/font/google";

import { AppProviders } from "@/components/app-providers";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const primaryFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-plus-jakarta",
  fallback: [],
});

const secondaryFont = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-montserrat",
  fallback: [],
});

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
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Perfect Ceiling",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Perfect Ceiling",
    description: siteConfig.description,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  manifest: "/manifest.webmanifest",
  applicationName: siteConfig.name,
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: "default",
  },
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#18181b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${primaryFont.variable} ${secondaryFont.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background font-secondary text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
