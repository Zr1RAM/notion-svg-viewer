import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { getDocData, getDocsDirectory, slugify } from "@/lib/content";
import { DocViewer } from "@/components/docs/DocViewer";
import { Metadata } from "next";
import { Suspense } from "react";

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  const docsDir = getDocsDirectory();
  if (!fs.existsSync(docsDir)) return [];

  const params: { slug: string[] }[] = [];

  function scan(currentDir: string, currentSlugs: string[]) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        scan(path.join(currentDir, entry.name), [...currentSlugs, slugify(entry.name)]);
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const fileSlug = slugify(entry.name.replace(/\.md$/i, ""));
        params.push({ slug: [...currentSlugs, fileSlug] });
      }
    }
  }

  scan(docsDir, []);
  return params;
}

export async function generateMetadata({ params }: DocPageProps): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocData(slug);

  if (!doc) {
    return { title: "Document Not Found" };
  }

  return {
    title: `${doc.title} | Notion Diagrams Hub`,
    description: `${doc.category} documentation • ${doc.wordCount} words • ${doc.readingTime}`,
  };
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const doc = getDocData(slug);

  if (!doc) {
    notFound();
  }

  return (
    <Suspense fallback={<div className="flex-1 bg-hub-bg" />}>
      <DocViewer doc={doc} />
    </Suspense>
  );
}
