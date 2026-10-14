import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { getDiagramData } from "@/lib/content";
import { DiagramCanvas } from "@/components/diagram/DiagramCanvas";
import { Metadata } from "next";
import { Suspense } from "react";

interface DiagramPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  const diagramsDir = path.join(process.cwd(), "content", "diagrams");
  if (!fs.existsSync(diagramsDir)) return [];

  const folders = fs.readdirSync(diagramsDir).filter((f) => {
    const full = path.join(diagramsDir, f);
    return fs.statSync(full).isDirectory();
  });

  const params: { slug: string[] }[] = [];
  folders.forEach((f) => {
    // Generates /diagrams/cloud-architecture/<folder>/
    params.push({ slug: ["cloud-architecture", f] });
    // Also generates direct /diagrams/<folder>/
    params.push({ slug: [f] });
  });

  return params;
}

export async function generateMetadata({ params }: DiagramPageProps): Promise<Metadata> {
  const { slug } = await params;
  const diagramId = slug[slug.length - 1];
  const diagram = getDiagramData(diagramId);

  if (!diagram) {
    return { title: "Diagram Not Found" };
  }

  return {
    title: `${diagram.title} | Notion Diagrams Hub`,
    description: `Interactive pan-and-zoom ${diagram.title} with service inspector and metadata details.`,
  };
}

export default async function DiagramPage({ params }: DiagramPageProps) {
  const { slug } = await params;
  const diagramId = slug[slug.length - 1];
  const diagram = getDiagramData(diagramId);

  if (!diagram) {
    notFound();
  }

  // Load nodeCircles from metadata.json if present
  let nodeCircles: Record<string, { x: number; y: number; r: number }> = {};
  const metaPath = path.join(process.cwd(), "content", "diagrams", diagramId, "metadata.json");
  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, "utf-8"));
      if (meta.nodeCircles) nodeCircles = meta.nodeCircles;
    } catch {}
  }

  return (
    <Suspense fallback={<div className="flex-1 bg-[#121212]" />}>
      <DiagramCanvas
        svgContent={diagram.svgContent}
        nodes={diagram.nodes}
        nodeCircles={nodeCircles}
        title={diagram.title}
      />
    </Suspense>
  );
}
