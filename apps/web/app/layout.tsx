import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000"),
  title: "Underworld: Quick Takeover",
  description: "A five-round multiplayer battle for control of the city.",
  openGraph: {
    title: "Underworld: Quick Takeover",
    description: "Draft. Deal. Betray. Control the city in five ruthless rounds.",
    type: "website",
    images: [{ url: "/og.jpg", width: 1536, height: 1024, alt: "Underworld: Quick Takeover" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Underworld: Quick Takeover",
    description: "Draft. Deal. Betray. Control the city in five ruthless rounds.",
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#111318" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
