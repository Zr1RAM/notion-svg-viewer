import fs from "fs";
import path from "path";
import {
  CategoryGroup,
  DiagramNode,
  DiagramNodesMap,
  HubItem,
  ItemType,
  SubfolderGroup,
} from "./types";
import {
  parseMarkdown,
  HeadingItem,
  LANG_METADATA,
} from "./markdown";

import { formatTitle, formatFolderName, slugify } from "./utils";

// Re-export utilities, markdown parsing utilities & types for consumer components
export { formatTitle, formatFolderName, slugify, parseMarkdown, LANG_METADATA };
export type { HeadingItem };

export interface ScopedDocLine {
  lineNum: number;
  text: string;
}

export interface ScopedDocRecord {
  title: string;
  fileName: string;
  slug: string;
  url: string;
  isReadme: boolean;
  lines: ScopedDocLine[];
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
  folderDocs?: ScopedDocRecord[];
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
const CACHE_DOCS_DIR = path.join(process.cwd(), ".cache", "docs");

export function getDocsDirectory(): string {
  return CACHE_DOCS_DIR;
}

/**
 * Discovers and indexes all items in content/ and synced .cache/docs/
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
          url: `/cloud-architecture/${folder}.html`,
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

  // 3. Markdown Docs (Synced from Supabase Storage into .cache/docs)
  const docsDir = getDocsDirectory();
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

interface TargetDocMatch {
  filePath: string;
  categoryName: string;
  subfolderName?: string;
}

/**
 * Searches recursively in docsDir for a markdown file matching the slug segments
 */
function findDocFile(docsDir: string, slugParts: string[]): TargetDocMatch | null {
  function findRecursive(dir: string, relPath: string[]): TargetDocMatch | null {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = findRecursive(full, relPath);
        if (found) return found;
      } else if (entry.isFile() && entry.name.endsWith(".md")) {
        const fileSlug = slugify(entry.name.replace(/\.md$/i, ""));
        if (relPath[relPath.length - 1] === fileSlug) {
          const relDir = path.relative(docsDir, dir).replace(/\\/g, "/");
          const dirSegments = relDir.split("/").map(slugify);
          const expectedDirSegments = relPath.slice(0, -1);
          if (expectedDirSegments.every((s, i) => dirSegments[i] === s)) {
            const rawDirSegments = relDir.split("/");
            let category = "Documentation";
            let subfolder: string | undefined = undefined;
            if (rawDirSegments.length > 0) category = formatFolderName(rawDirSegments[0]);
            if (rawDirSegments.length > 1) subfolder = rawDirSegments[1];
            return {
              filePath: full,
              categoryName: category,
              subfolderName: subfolder,
            };
          }
        }
      }
    }
    return null;
  }

  return findRecursive(docsDir, slugParts);
}

/**
 * Scans and indexes sibling markdown files in the same folder for scoped Spotlight search
 */
function indexSiblingDocsForSpotlight(
  targetFilePath: string,
  categoryName: string,
  subfolderName?: string
): ScopedDocRecord[] {
  const targetDir = path.dirname(targetFilePath);
  const folderDocs: ScopedDocRecord[] = [];

  try {
    const siblingEntries = fs.readdirSync(targetDir);
    for (const entry of siblingEntries) {
      if (entry.endsWith(".md")) {
        const fullEntryPath = path.join(targetDir, entry);
        const fileContent = fs.readFileSync(fullEntryPath, "utf-8");
        const fileSlug = slugify(entry.replace(/\.md$/i, ""));
        const isReadme = entry.toLowerCase().startsWith("readme");
        const subfolderSlug = subfolderName ? slugify(subfolderName) : undefined;
        const routeSlug = subfolderSlug
          ? `${slugify(categoryName)}/${subfolderSlug}/${fileSlug}`
          : `${slugify(categoryName)}/${fileSlug}`;

        const lines: ScopedDocLine[] = [];
        const rawLines = fileContent.split("\n");
        rawLines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed || trimmed === "---" || trimmed === "***") return;
          lines.push({
            lineNum: idx + 1,
            text: trimmed,
          });
        });

        folderDocs.push({
          title: formatTitle(entry),
          fileName: entry,
          slug: fileSlug,
          url: `/docs/${routeSlug}/`,
          isReadme,
          lines,
        });
      }
    }

    folderDocs.sort((a, b) => {
      if (a.isReadme) return -1;
      if (b.isReadme) return 1;
      return a.title.localeCompare(b.title);
    });
  } catch (err) {
    console.warn("Failed to index folder documents for spotlight search:", err);
  }

  return folderDocs;
}

/**
 * Loads and parses markdown document data
 */
export function getDocData(slugParts: string[]): DocContent | null {
  const docsDir = getDocsDirectory();
  if (!fs.existsSync(docsDir)) return null;

  const target = findDocFile(docsDir, slugParts);
  if (!target || !fs.existsSync(target.filePath)) return null;

  const rawMarkdown = fs.readFileSync(target.filePath, "utf-8");
  const wordCount = rawMarkdown.split(/\s+/).filter(Boolean).length;
  const readingTime = `${Math.ceil(wordCount / 200)} min read`;

  // Parse markdown through the modular pipeline
  const { html, headings } = parseMarkdown(rawMarkdown);

  // Index sibling docs for in-memory Spotlight line search
  const folderDocs = indexSiblingDocsForSpotlight(
    target.filePath,
    target.categoryName,
    target.subfolderName
  );

  return {
    title: formatTitle(path.basename(target.filePath)),
    category: target.categoryName,
    subfolder: target.subfolderName,
    html,
    headings,
    wordCount,
    readingTime,
    rawMarkdown,
    folderDocs,
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
