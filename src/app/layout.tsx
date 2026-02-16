import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ateneo",
  description:
    "Ateneo es el foro independiente para fundadores españoles excepcionales.",
  openGraph: {
    title: "Ateneo",
    description:
      "Ateneo es el foro independiente para fundadores españoles excepcionales.",
    images: ["/ateneo_logo.png"],
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
