import type { Metadata } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

import "allotment/dist/style.css";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.aigorithm.site"),
  title: {
    default: "Create your app and game",
    template: "%s | Aigorithm",
  },
  description: "Create your app and game",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Create your app and game",
    description: "Create your app and game",
    url: "https://www.aigorithm.site",
    siteName: "Aigorithm",
    images: [
      {
        url: "/og-image.png",
        width: 805,
        height: 805,
        alt: "Aigorithm - Create your app and game",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Create your app and game",
    description: "Create your app and game",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${inter.variable} ${plexMono.variable} antialiased`}
        >
          <Providers>
            {children}
            <Toaster />
          </Providers>
        </body>
      </html>
  );
}