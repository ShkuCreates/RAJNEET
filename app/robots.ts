import { MetadataRoute } from "next";

const getBaseUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "https://rajneet.co.in").replace(/\/+$/, "");

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/dashboard"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
