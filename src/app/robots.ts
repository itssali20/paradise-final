import type { MetadataRoute } from "next";
import { SITE } from "@/content/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/book", "/api", "/login", "/reset"] }],
    sitemap: `${SITE.url.replace(/\/$/, "")}/sitemap.xml`,
  };
}
