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

const LANG_METADATA: Record<string, { name: string; color: string; bg: string; border: string }> = {
  javascript: { name: "JavaScript", color: "#f7df1e", bg: "rgba(247, 223, 30, 0.12)", border: "rgba(247, 223, 30, 0.35)" },
  js: { name: "JavaScript", color: "#f7df1e", bg: "rgba(247, 223, 30, 0.12)", border: "rgba(247, 223, 30, 0.35)" },
  typescript: { name: "TypeScript", color: "#3178c6", bg: "rgba(49, 120, 198, 0.15)", border: "rgba(49, 120, 198, 0.35)" },
  ts: { name: "TypeScript", color: "#3178c6", bg: "rgba(49, 120, 198, 0.15)", border: "rgba(49, 120, 198, 0.35)" },
  jsx: { name: "React JSX", color: "#61dafb", bg: "rgba(97, 218, 251, 0.12)", border: "rgba(97, 218, 251, 0.35)" },
  tsx: { name: "React TSX", color: "#61dafb", bg: "rgba(97, 218, 251, 0.12)", border: "rgba(97, 218, 251, 0.35)" },
  html: { name: "HTML", color: "#f16529", bg: "rgba(241, 101, 41, 0.12)", border: "rgba(241, 101, 41, 0.35)" },
  css: { name: "CSS", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)", border: "rgba(56, 189, 248, 0.35)" },
  json: { name: "JSON", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.35)" },
  python: { name: "Python", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)", border: "rgba(56, 189, 248, 0.35)" },
  py: { name: "Python", color: "#38bdf8", bg: "rgba(56, 189, 248, 0.12)", border: "rgba(56, 189, 248, 0.35)" },
  bash: { name: "Bash", color: "#00ff88", bg: "rgba(0, 255, 136, 0.12)", border: "rgba(0, 255, 136, 0.35)" },
  sh: { name: "Shell", color: "#00ff88", bg: "rgba(0, 255, 136, 0.12)", border: "rgba(0, 255, 136, 0.35)" },
  shell: { name: "Shell", color: "#00ff88", bg: "rgba(0, 255, 136, 0.12)", border: "rgba(0, 255, 136, 0.35)" },
  sql: { name: "SQL", color: "#c084fc", bg: "rgba(192, 132, 252, 0.12)", border: "rgba(192, 132, 252, 0.35)" },
  java: { name: "Java", color: "#f89820", bg: "rgba(248, 152, 32, 0.12)", border: "rgba(248, 152, 32, 0.35)" },
  yaml: { name: "YAML", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.12)", border: "rgba(244, 63, 94, 0.35)" },
  yml: { name: "YAML", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.12)", border: "rgba(244, 63, 94, 0.35)" },
};

function preprocessCallouts(md: string): string {
  const alertRegex = /^>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\s*([^\n]*))?/gim;
  return md
    .replace(alertRegex, (match, type, title) => {
      const lowerType = type.toLowerCase();
      const displayTitle = title ? title.trim() : type;
      return `\n<div class="alert-callout ${lowerType}"><div class="alert-title">${displayTitle}</div>\n`;
    })
    .replace(/<\/div>\n\n(?=[^>])/g, "</div>\n");
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
 * Wraps H2 headings in collapsible sections and H3 headings in collapsible questions
 */
function wrapSectionsAndQuestions(html: string): string {
  const parts = html.split(/(<h[23][^>]*>[\s\S]*?<\/h[23]>)/gi);
  let out = "";
  let inSection = false;
  let inQuestion = false;

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (/^<h2/i.test(part)) {
      if (inQuestion) {
        out += "</div></div>"; // close question-body and question
        inQuestion = false;
      }
      if (inSection) {
        out += "</div></section>"; // close section-body and section
        inSection = false;
      }
      out += `<section class="collapsible-section open">${part}<div class="section-body">`;
      inSection = true;
    } else if (/^<h3/i.test(part)) {
      if (inQuestion) {
        out += "</div></div>"; // close previous question-body and question
        inQuestion = false;
      }
      out += `<div class="collapsible-question open">${part}<div class="question-body">`;
      inQuestion = true;
    } else {
      out += part;
    }
  }

  if (inQuestion) {
    out += "</div></div>";
  }
  if (inSection) {
    out += "</div></section>";
  }

  return out;
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
  const idCounts = new Map<string, number>();

  // Configure marked with syntax highlighting
  const renderer = new marked.Renderer();
  renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
    const rawLang = (lang || "").toLowerCase().trim();
    const language = rawLang && hljs.getLanguage(rawLang) ? rawLang : "plaintext";
    const highlighted = hljs.highlight(text, { language }).value;
    const lineCount = text.trim().split("\n").length;

    const langMeta = LANG_METADATA[rawLang] || {
      name: rawLang ? rawLang.toUpperCase() : "Code",
      color: "var(--accent-blue)",
      bg: "rgba(56, 189, 248, 0.1)",
      border: "rgba(56, 189, 248, 0.25)",
    };

    return `<div class="code-block-wrapper open" style="border-left: 3px solid ${langMeta.color};">
      <div class="code-block-header" title="Click to collapse / expand code block">
        <div class="code-header-left">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="code-chevron" style="color:${langMeta.color};">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
          <span class="code-lang-label" style="color:${langMeta.color}; background:${langMeta.bg}; border: 1px solid ${langMeta.border};">${langMeta.name}</span>
          <span class="code-line-count">${lineCount} ${lineCount === 1 ? "line" : "lines"}</span>
        </div>
        <div class="code-header-actions">
          <button class="code-action-btn copy-code-btn" data-code="${encodeURIComponent(text)}" title="Copy code to clipboard">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span>Copy</span>
          </button>
          <button class="code-action-btn btn-toggle-code" title="Toggle code visibility">
            <span>Collapse</span>
          </button>
        </div>
      </div>
      <div class="code-block-body">
        <pre><code class="hljs language-${language}">${highlighted}</code></pre>
      </div>
    </div>`;
  };

  renderer.heading = function ({ text, depth }: { text: string; depth: number }) {
    const cleanText = text.replace(/<[^>]+>/g, "").trim();
    const baseSlug = slugify(cleanText) || `heading-${depth}`;
    const count = idCounts.get(baseSlug) || 0;
    idCounts.set(baseSlug, count + 1);
    const id = count === 0 ? baseSlug : `${baseSlug}-${count}`;

    // Collect into headings outline (levels 1-3 for doc overview, sections, questions)
    if (depth <= 3) {
      headings.push({ id, text: cleanText, level: depth });
    }

    const chevronSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="heading-chevron"><polyline points="9 18 15 12 9 6"></polyline></svg>`;

    if (depth === 2) {
      return `<h2 id="${id}" class="collapsible-heading group" aria-expanded="true" title="Click to toggle section">
        ${chevronSvg}
        <span class="heading-text">${text}</span>
        <a href="#${id}" class="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-hub-blue text-sm ml-2 self-center heading-anchor">#</a>
      </h2>`;
    }
    if (depth === 3) {
      return `<h3 id="${id}" class="collapsible-heading group" aria-expanded="true" title="Click to toggle answer">
        ${chevronSvg}
        <span class="heading-text">${text}</span>
        <a href="#${id}" class="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-hub-blue text-sm ml-2 self-center heading-anchor">#</a>
      </h3>`;
    }
    return `<h${depth} id="${id}" class="group flex items-center gap-2">
      <span>${text}</span>
      <a href="#${id}" class="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-hub-blue text-sm ml-2">#</a>
    </h${depth}>`;
  };

  const preprocessedMarkdown = preprocessCallouts(rawMarkdown);
  const rawHtml = marked.parse(preprocessedMarkdown, { renderer }) as string;
  const html = wrapSectionsAndQuestions(rawHtml);

  const fileName = path.basename(targetFile);
  const title = formatTitle(fileName);

  // Scan and index sibling markdown files in the same folder for scoped Spotlight search
  const targetDir = path.dirname(targetFile);
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

  return {
    title,
    category: categoryName,
    subfolder: subfolderName,
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
