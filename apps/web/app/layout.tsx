import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEB_URL ?? "http://localhost:3000"),
  title: "Empire of Sin: Quick Takeover",
  description: "A five-round multiplayer battle for control of the city.",
  openGraph: {
    title: "Empire of Sin: Quick Takeover",
    description: "Draft. Deal. Betray. Control the city in five ruthless rounds.",
    type: "website",
    images: [{ url: "/og.png", width: 1536, height: 1024, alt: "Empire of Sin: Quick Takeover" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Empire of Sin: Quick Takeover",
    description: "Draft. Deal. Betray. Control the city in five ruthless rounds.",
    images: ["/og.png"],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
