import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
const OG_IMAGE_PATH = "/opengraph-image.png";
const TWITTER_IMAGE_PATH = "/twitter-image.png";

export const metadata: Metadata = {
  title: "Ateneo",
  description:
    "Ateneo es el foro independiente para fundadores españoles excepcionales.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Ateneo",
    description:
      "Ateneo es el foro independiente para fundadores españoles excepcionales.",
    url: SITE_URL,
    siteName: "Ateneo",
    locale: "es_ES",
    type: "website",
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: "Ateneo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ateneo",
    description:
      "Ateneo es el foro independiente para fundadores españoles excepcionales.",
    images: [TWITTER_IMAGE_PATH],
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
