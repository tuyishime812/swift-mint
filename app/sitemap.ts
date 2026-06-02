import type { MetadataRoute } from "next";
import { countries } from "@/lib/swiftmint";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://swiftmint.exchange";

  const staticPages = [
    "",
    "/service",
    "/countries",
    "/pricing",
    "/transfer",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
    "/dashboard",
    "/pay",
  ];

  const countryPages = countries.map((c) => `/countries/${c.slug}`);

  return [...staticPages, ...countryPages].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: path === "" ? 1 : 0.8,
  }));
}
