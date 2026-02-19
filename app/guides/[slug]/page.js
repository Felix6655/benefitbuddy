// /app/guides/[slug]/page.js
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES, getGuideBySlug } from "@/lib/guides";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://benefitbuddy.vercel.app";

export async function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }) {
  const guide = getGuideBySlug(params.slug);
  if (!guide) return {};

  const url = `${BASE_URL}/guides/${guide.slug}`;

  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: {
      title: guide.title,
      description: guide.description,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: guide.title,
      description: guide.description,
    },
  };
}

export default function GuidePage({ params }) {
  const guide = getGuideBySlug(params.slug);
  if (!guide) return notFound();

  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: "28px 16px" }}>
      <p style={{ marginBottom: 10 }}>
        <Link href="/">← Back to BenefitBuddy</Link>
      </p>

      <h1 style={{ fontSize: 34, lineHeight: 1.15, marginBottom: 10 }}>
        {guide.title}
      </h1>

      <p style={{ fontSize: 18, opacity: 0.9, marginBottom: 18 }}>
        {guide.description}
      </p>

      <div style={{ padding: 16, border: "1px solid rgba(0,0,0,0.1)", borderRadius: 12 }}>
        <h2 style={{ fontSize: 22, marginBottom: 10 }}>Next step</h2>
        <p style={{ marginBottom: 12 }}>
          Use the BenefitBuddy quiz to see which programs you might qualify for.
        </p>
        <Link href="/start">Start the quiz →</Link>
      </div>

      <hr style={{ margin: "22px 0" }} />

      <h3 style={{ marginBottom: 8 }}>Related guides</h3>
      <ul>
        {GUIDES.filter((g) => g.slug !== guide.slug)
          .slice(0, 6)
          .map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`}>{g.title}</Link>
            </li>
          ))}
      </ul>
    </main>
  );
}
