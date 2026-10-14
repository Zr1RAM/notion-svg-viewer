import fs from "fs";
import path from "path";
import { marked } from "marked";
import hljs from "highlight.js";
import {
  CategoryGroup,
  DiagramNode,
  DiagramNodesMap,
  HubItem,
  ItemType,
  SubfolderGroup,
} from "./types";

const ACRONYMS = new Set([
  "AWS",
  "GCP",
  "AZURE",
  "API",
  "DB",
  "K8S",
  "CI",
  "CD",
  "DNS",
  "CDN",
  "IAM",
  "VPC",
  "DSA",
  "SQL",
  "MERN",
  "PERN",
  "REST",
]);

export function formatTitle(name: string): string {
  let base = name.replace(/\.(html|md|svg|json)$/i, "");
  if (base.toLowerCase() === "readme") return "Overview & Index";
  return base
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/Interiview/gi, "Interview")
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (word === "&") return "&";
      const upper = word.toUpperCase();
      if (ACRONYMS.has(upper)) return upper;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export function formatFolderName(slug: string): string {
  if (!slug || slug === "root" || slug === "general") return "General Diagrams";
  return slug
    .replace(/[-_]/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => {
      if (word === "&") return "&";
      const upper = word.toUpperCase();
      if (ACRONYMS.has(upper)) return upper;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Custom marked renderer for syntax highlighting & IDs
marked.setOptions({
  gfm: true,
  breaks: false,
});

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export interface DocContent {
  title: string;
  category: string;
  subfolder?: string;
  html: string;
  headings: HeadingItem[];
  wordCount: number;
  readingTime: string;
  rawMarkdown: string;
}

export interface DiagramContent {
  id: string;
  title: string;
  category: string;
  svgContent: string;
  nodes: DiagramNodesMap;
  nodeCount: number;
}

const CONTENT_DIR = path.join(process.cwd(), "content");

/**
 * Discovers and indexes all items in content/
 */
export function getAllHubItems(): CategoryGroup[] {
  const items: HubItem[] = [];

  // 1. Cloud Architecture Diagrams
  const diagramsDir = path.join(CONTENT_DIR, "diagrams");
  if (fs.existsSync(diagramsDir)) {
    const diagramFolders = fs.readdirSync(diagramsDir);
    for (const folder of diagramFolders) {
      const folderPath = path.join(diagramsDir, folder);
      if (fs.statSync(folderPath).isDirectory()) {
        const nodesPath = path.join(folderPath, "nodes.json");
        let nodeCount = 0;
        if (fs.existsSync(nodesPath)) {
          try {
            const data = JSON.parse(fs.readFileSync(nodesPath, "utf-8"));
            nodeCount = Object.keys(data).length;
          } catch {}
        }
        items.push({
          id: folder,
          title: `${formatTitle(folder)} Architecture`,
          slug: `cloud-architecture/${folder}`,
          category: "Cloud Architecture",
          type: "diagram",
          description: `Interactive cloud architecture map with ${nodeCount} inspectable services, pan & zoom.`,
          url: `/diagrams/cloud-architecture/${folder}/`,
          meta: { nodesCount: nodeCount },
        });
      }
    }
  }

  // 2. Guides (e.g. SpringBoot.html)
  const guidesDir = path.join(CONTENT_DIR, "guides");
  if (fs.existsSync(guidesDir)) {
    const guideFiles = fs.readdirSync(guidesDir);
    for (const file of guideFiles) {
      const filePath = path.join(guidesDir, file);
      if (fs.statSync(filePath).isFile()) {
        const nameSlug = slugify(file.replace(/\.html$/i, ""));
        items.push({
          id: nameSlug,
          title: "Java Spring Boot Multiservice Master Guide",
          slug: `fast-track-plans/${nameSlug}`,
          category: "Fast Track Plans",
          type: "guide",
          description: "Complete 3-day multiservice fast-track interactive study plan.",
          url: `/guides/fast-track-plans/${nameSlug}/`,
        });
      }
    }
  }

  // 3. Markdown Docs (Interview Prep)
  const docsDir = path.join(CONTENT_DIR, "docs");
  if (fs.existsSync(docsDir)) {
    function scanDocs(currentDir: string, currentCategory: string, currentSubfolder?: string) {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          const subName = entry.name;
          scanDocs(fullPath, currentCategory, subName);
        } else if (entry.isFile() && entry.name.endsWith(".md")) {
          const fileSlug = slugify(entry.name.replace(/\.md$/i, ""));
          const subfolderSlug = currentSubfolder ? slugify(currentSubfolder) : undefined;
          const routeSlug = subfolderSlug
            ? `${slugify(currentCategory)}/${subfolderSlug}/${fileSlug}`
            : `${slugify(currentCategory)}/${fileSlug}`;

          const content = fs.readFileSync(fullPath, "utf-8");
          const wordCount = content.split(/\s+/).filter(Boolean).length;
          const readingTime = `${Math.ceil(wordCount / 200)} min read`;

          items.push({
            id: fileSlug,
            title: formatTitle(entry.name),
            slug: routeSlug,
            category: formatFolderName(currentCategory),
            subfolder: currentSubfolder,
            type: "doc",
            description: `${wordCount} words • ${readingTime}`,
            url: `/docs/${routeSlug}/`,
            meta: {
              wordCount,
              readingTime,
            },
          });
        }
      }
    }

    const docCategories = fs.readdirSync(docsDir, { withFileTypes: true });
    for (const cat of docCategories) {
      if (cat.isDirectory()) {
        scanDocs(path.join(docsDir, cat.name), formatFolderName(cat.name));
      }
    }
  }

  // Group by category
  const categoryMap = new Map<string, { directItems: HubItem[]; subfolders: Map<string, HubItem[]> }>();

  for (const item of items) {
    if (!categoryMap.has(item.category)) {
      categoryMap.set(item.category, { directItems: [], subfolders: new Map() });
    }
    const cat = categoryMap.get(item.category)!;
    if (item.subfolder) {
      if (!cat.subfolders.has(item.subfolder)) {
        cat.subfolders.set(item.subfolder, []);
      }
      cat.subfolders.get(item.subfolder)!.push(item);
    } else {
      cat.directItems.push(item);
    }
  }

  const sortItems = (a: HubItem, b: HubItem) => {
    if (a.title.toLowerCase().startsWith("overview")) return -1;
    if (b.title.toLowerCase().startsWith("overview")) return 1;
    return a.title.localeCompare(b.title);
  };

  const result: CategoryGroup[] = [];
  categoryMap.forEach((val, categoryName) => {
    val.directItems.sort(sortItems);

    const subfoldersList: SubfolderGroup[] = [];
    val.subfolders.forEach((subItems, subName) => {
      subItems.sort(sortItems);
      subfoldersList.push({
        name: subName,
        slug: slugify(subName),
        items: subItems,
      });
    });
    subfoldersList.sort((a, b) => a.name.localeCompare(b.name));

    const totalCount = val.directItems.length + subfoldersList.reduce((acc, s) => acc + s.items.length, 0);

    result.push({
      name: categoryName,
      slug: slugify(categoryName),
      totalCount,
      directItems: val.directItems,
      subfolders: subfoldersList,
    });
  });

  result.sort((a, b) => a.name.localeCompare(b.name));
  return result;
}

/**
 * Loads Diagram Data
 */
export function getDiagramData(diagramId: string): DiagramContent | null {
  const dir = path.join(CONTENT_DIR, "diagrams", diagramId);
  if (!fs.existsSync(dir)) return null;

  const svgPath = path.join(dir, "diagram.svg");
  const nodesPath = path.join(dir, "nodes.json");

  if (!fs.existsSync(svgPath) || !fs.existsSync(nodesPath)) return null;

  let svgContent = fs.readFileSync(svgPath, "utf-8");
  const nodes: DiagramNodesMap = JSON.parse(fs.readFileSync(nodesPath, "utf-8"));

  return {
    id: diagramId,
    title: `${formatTitle(diagramId)} Architecture`,
    category: "Cloud Architecture",
    svgContent,
    nodes,
    nodeCount: Object.keys(nodes).length,
  };
}

/**
 * Loads Doc Data
 */
export function getDocData(slugParts: string[]): DocContent | null {
  const docsDir = path.join(CONTENT_DIR, "docs");
  // Search recursively for matching slug
  let targetFile: string | null = null;
  let categoryName = "Documentation";
  let subfolderName: string | undefined = undefined;

  function findFile(dir: string, relPath: string[]): string | null {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = findFile(full, relPath);
        if (found) return found;
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const fileSlug = slugify(entry.name.replace(/\.md$/i, ""));
        if (relPath[relPath.length - 1] === fileSlug) {
          // Check if parent folders match
          const relDir = path.relative(docsDir, dir).replace(/\\/g, "/");
          const dirSegments = relDir.split("/").map(slugify);
          const expectedDirSegments = relPath.slice(0, -1);
          if (expectedDirSegments.every((s, i) => dirSegments[i] === s)) {
            const rawDirSegments = relDir.split("/");
            if (rawDirSegments.length > 0) categoryName = formatFolderName(rawDirSegments[0]);
            if (rawDirSegments.length > 1) subfolderName = rawDirSegments[1];
            return full;
          }
        }
      }
    }
    return null;
  }

  targetFile = findFile(docsDir, slugParts);
  if (!targetFile || !fs.existsSync(targetFile)) return null;

  const rawMarkdown = fs.readFileSync(targetFile, "utf-8");
  const wordCount = rawMarkdown.split(/\s+/).filter(Boolean).length;
  const readingTime = `${Math.ceil(wordCount / 200)} min read`;

  const headings: HeadingItem[] = [];
  const lines = rawMarkdown.split("\n");
  for (const line of lines) {
    const match = line.match(/^(#{1,4})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = slugify(text);
      headings.push({ id, text, level });
    }
  }

  // Configure marked with syntax highlighting
  const renderer = new marked.Renderer();
  renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
    const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
    const highlighted = hljs.highlight(text, { language }).value;
    return `<div class="code-block-wrapper relative group my-4">
      <div class="code-block-header flex items-center justify-between px-4 py-1.5 text-xs font-mono bg-[#1a1e27] text-gray-400 border border-b-0 border-[#272d3b] rounded-t-lg">
        <span>${language}</span>
        <button class="copy-code-btn text-gray-400 hover:text-white transition-colors" data-code="${encodeURIComponent(text)}">Copy</button>
      </div>
      <pre class="!mt-0 !rounded-t-none"><code class="hljs language-${language}">${highlighted}</code></pre>
    </div>`;
  };

  renderer.heading = function ({ text, depth }: { text: string; depth: number }) {
    const id = slugify(text.replace(/<[^>]+>/g, ""));
    return `<h${depth} id="${id}" class="group flex items-center gap-2">
      <span>${text}</span>
      <a href="#${id}" class="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-hub-blue text-sm">#</a>
    </h${depth}>`;
  };

  const html = marked.parse(rawMarkdown, { renderer }) as string;

  const fileName = path.basename(targetFile);
  const title = formatTitle(fileName);

  return {
    title,
    category: categoryName,
    subfolder: subfolderName,
    html,
    headings,
    wordCount,
    readingTime,
    rawMarkdown,
  };
}

/**
 * Loads Guide HTML
 */
export function getGuideData(guideId: string): string | null {
  const guidesDir = path.join(CONTENT_DIR, "guides");
  if (!fs.existsSync(guidesDir)) return null;

  const files = fs.readdirSync(guidesDir);
  for (const file of files) {
    if (slugify(file.replace(/\.html$/i, "")) === guideId) {
      return fs.readFileSync(path.join(guidesDir, file), "utf-8");
    }
  }
  return null;
}
