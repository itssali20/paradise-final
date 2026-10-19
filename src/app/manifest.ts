import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

/** Installable web app (Add to Home Screen) — the first step of the Phase 3 mobile app. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Paradise Club · Elite Vacations",
    short_name: "Paradise Club",
    description: `${SITE.program}. ${SITE.slogan}.`,
    start_url: "/account",
    display: "standalone",
    background_color: "#03060b",
    theme_color: "#03060b",
    icons: [
      { src: "/brand/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
