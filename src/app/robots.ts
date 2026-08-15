import type { MetadataRoute } from "next";

const SITE_URL = "https://nashemann-web.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/account", "/vendor/dashboard", "/influencer/dashboard", "/chat"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
