import { GUIDES } from "@/lib/guides";

export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://benefitbuddy.vercel.app";
  const lastModified = new Date();

  const core = [
    { url: `${baseUrl}/`, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/start`, lastModified, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/results`, lastModified, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified, changeFrequency: "monthly", priority: 0.3 },
    { url: `${baseUrl}/contact`, lastModified, changeFrequency: "monthly", priority: 0.3 },
  ];

  const guides = GUIDES.map((g) => ({
    url: `${baseUrl}/guides/${g.slug}`,
    lastModified,
    changeFrequency: "monthly",
    priority: g.priority ?? 0.6,
  }));

  return [...core, ...guides];
}
