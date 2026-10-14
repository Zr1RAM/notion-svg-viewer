import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";
import { getDiagramData } from "@/lib/content";
import { Metadata } from "next";

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
    description: `Interactive pan-and-zoom ${diagram.title}.`,
  };
}

export default async function DiagramPage({ params }: DiagramPageProps) {
  const { slug } = await params;
  const diagramId = slug[slug.length - 1];
  const diagram = getDiagramData(diagramId);

  if (!diagram) {
    notFound();
  }

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const targetUrl = `${basePath}/cloud-architecture/${diagramId}.html`;

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#121212] text-gray-400 p-8 min-h-[60vh]">
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.replace('${targetUrl}' + window.location.search);`,
        }}
      />
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-hub-green border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-gray-300">
          Loading {diagram.title}...
        </p>
        <p className="text-xs text-gray-500">
          If you are not redirected automatically,{" "}
          <a
            href={targetUrl}
            className="text-hub-green underline hover:text-white"
          >
            click here
          </a>
          .
        </p>
      </div>
    </div>
  );
}
