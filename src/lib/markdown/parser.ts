import { marked } from "marked";
import { preprocessCallouts } from "./callouts";
import { wrapSectionsAndQuestions } from "./collapsibles";
import {
  HeadingItem,
  renderCodeBlock,
  renderHeading,
  renderMermaidBlock,
} from "./renderers";

export interface MarkdownParseResult {
  html: string;
  headings: HeadingItem[];
}

/**
 * Main markdown processing pipeline:
 * 1. Preprocesses GitHub alerts/callouts
 * 2. Parses with Marked using custom code, mermaid, & heading renderers
 * 3. Wraps H2 sections and H3 questions into collapsible HTML containers
 */
export function parseMarkdown(rawMarkdown: string): MarkdownParseResult {
  const headings: HeadingItem[] = [];
  const idCounts = new Map<string, number>();

  const renderer = new marked.Renderer();

  renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
    const rawLang = (lang || "").toLowerCase().trim();
    if (rawLang === "mermaid") {
      return renderMermaidBlock(text);
    }
    return renderCodeBlock(text, rawLang);
  };

  renderer.heading = function ({ text, depth }: { text: string; depth: number }) {
    return renderHeading(text, depth, idCounts, headings);
  };

  const preprocessed = preprocessCallouts(rawMarkdown);
  const rawHtml = marked.parse(preprocessed, {
    renderer,
    gfm: true,
    breaks: false,
  }) as string;
  const html = wrapSectionsAndQuestions(rawHtml);

  return { html, headings };
}
