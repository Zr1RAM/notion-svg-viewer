import hljs from "highlight.js";
import { slugify } from "../utils";

export interface HeadingItem {
  id: string;
  text: string;
  level: number;
}

export const LANG_METADATA: Record<string, { name: string; color: string; bg: string; border: string }> = {
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

/**
 * Renders an interactive container for Mermaid diagrams with code/diagram toggle
 */
export function renderMermaidBlock(text: string): string {
  const escapedText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<div class="mermaid-block-wrapper my-6 rounded-xl border border-white/10 bg-[#161b22]/90 backdrop-blur-sm overflow-hidden shadow-2xl transition-all" data-mermaid-code="${encodeURIComponent(text)}">
    <div class="mermaid-block-header flex items-center justify-between px-4 py-2.5 bg-[#0d1117]/90 border-b border-white/5 select-none">
      <div class="flex items-center gap-2">
        <svg class="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
          <line x1="3" x2="21" y1="9" y2="9"/>
          <line x1="9" x2="9" y1="21" y2="9"/>
        </svg>
        <span class="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">Mermaid Diagram</span>
      </div>
      <div class="flex items-center gap-2">
        <button class="mermaid-toggle-btn px-2.5 py-1 text-xs font-medium rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5" title="Toggle between visual diagram and source code">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          <span>View Code</span>
        </button>
        <button class="mermaid-copy-btn px-2.5 py-1 text-xs font-medium rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors flex items-center gap-1.5" data-code="${encodeURIComponent(text)}" title="Copy mermaid source">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          <span>Copy</span>
        </button>
      </div>
    </div>
    <div class="mermaid-preview-container p-6 flex justify-center items-center overflow-x-auto min-h-[140px] bg-[#090d13]/50">
      <div class="mermaid-loading-indicator flex items-center gap-2 text-xs text-gray-400 font-mono">
        <svg class="animate-spin h-4 w-4 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Rendering diagram...</span>
      </div>
      <div class="mermaid-target w-full flex justify-center overflow-x-auto"></div>
    </div>
    <div class="mermaid-code-view hidden border-t border-white/5 bg-[#090d13] p-4 text-xs font-mono text-gray-300 overflow-x-auto">
      <pre><code>${escapedText}</code></pre>
    </div>
  </div>`;
}

/**
 * Renders a syntax-highlighted collapsible code block with copy action
 */
export function renderCodeBlock(text: string, rawLang: string): string {
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
}

/**
 * Renders headings with unique IDs, collapsible chevrons, and outline registration
 */
export function renderHeading(
  text: string,
  depth: number,
  idCounts: Map<string, number>,
  headings: HeadingItem[]
): string {
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
}
