import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { getGuideData, slugify } from "@/lib/content";
import { Metadata } from "next";

interface GuidePageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  const guidesDir = path.join(process.cwd(), "content", "guides");
  if (!fs.existsSync(guidesDir)) return [];

  const files = fs.readdirSync(guidesDir).filter((f) => f.endsWith(".html"));
  const params: { slug: string[] }[] = [];

  files.forEach((f) => {
    const s = slugify(f.replace(/\.html$/i, ""));
    params.push({ slug: ["fast-track-plans", s] });
    params.push({ slug: [s] });
  });

  return params;
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Java Spring Boot Master Guide | Notion Diagrams Hub",
    description: "The Complete Java Spring Boot Multiservice Master Guide (3-Day Fast-Track).",
  };
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guideId = slug[slug.length - 1];
  const html = getGuideData(guideId);

  if (!html) {
    notFound();
  }

  // Render guide content inside a clean responsive container
  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100">
      <iframe
        srcDoc={html}
        title="Guide"
        className="w-full min-h-[calc(100vh-56px)] border-0"
        sandbox="allow-scripts allow-same-origin allow-popups"
      />
    </div>
  );
}
