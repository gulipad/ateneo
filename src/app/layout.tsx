import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ateneo",
  description: "Digital experience prototypes for Ateneo de Sevilla",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
