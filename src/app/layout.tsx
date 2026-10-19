import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bodoni-moda/opsz.css";
import "@fontsource-variable/bodoni-moda/opsz-italic.css";
import "@fontsource-variable/manrope";
import "@/styles/globals.css";
import "@/styles/shell.css";
import "@/styles/sections.css";
import "@/styles/app.css";
import "@/styles/casting.css";
import "@/styles/admin.css";
import { SITE } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "Paradise Club · Elite Vacations", template: "%s · Paradise Club" },
  description: SITE.description,
  applicationName: "Paradise Club",
  keywords: ["singles vacation", "luxury singles resort", "elite vacations", "Paradise Club", "bikini contest", "Miss Paradise", "singles events"],
  openGraph: {
    type: "website",
    siteName: "Paradise Club",
    title: `Paradise Club · ${SITE.slogan}`,
    description: `${SITE.headline} Luxury singles vacations, international competitions and exclusive resorts.`,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Paradise Club" }],
  },
  twitter: { card: "summary_large_image", images: ["/og.jpg"] },
  icons: { icon: [{ url: "/brand/icon-32.png", sizes: "32x32" }, { url: "/brand/icon-192.png", sizes: "192x192" }], apple: "/brand/icon-180.png" },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#03060b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
