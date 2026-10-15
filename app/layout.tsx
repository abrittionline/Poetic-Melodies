import type { Metadata, Viewport } from "next";
import "@fontsource/noto-sans-bengali/400.css";
import "@fontsource/noto-serif-bengali/400.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "Poetic Melodies | কবিতার গান",
  description:
    "It's Poetry in Song. A bilingual home for poetry, voice and music. A Creation by Sohel Azad.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Poetic Melodies",
    statusBarStyle: "default",
  },
  icons: { icon: "/icons/icon.svg", apple: "/icons/icon-192.png" },
};
export const viewport: Viewport = {
  themeColor: "#f7f5ef",
  width: "device-width",
  initialScale: 1,
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
