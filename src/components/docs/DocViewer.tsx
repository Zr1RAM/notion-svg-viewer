"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DocContent } from "@/lib/content";
import { DocToc } from "./DocToc";
import { DocHeader } from "./DocHeader";
import { DocArticle } from "./DocArticle";
import { SpotlightModal } from "./SpotlightModal";
import { MermaidErrorModal, MermaidErrorInfo } from "./MermaidErrorModal";

interface DocViewerProps {
  doc: DocContent;
  embedMode?: boolean;
}

export const DocViewer: React.FC<DocViewerProps> = ({ doc, embedMode = false }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEmbed = embedMode || searchParams?.get("embed") === "true";

  const [activeHeading, setActiveHeading] = useState<string>("");
  const [readingProgress, setReadingProgress] = useState(0);
  const [allExpanded, setAllExpanded] = useState(true);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [mermaidErrorInfo, setMermaidErrorInfo] = useState<MermaidErrorInfo | null>(null);

  const articleRef = useRef<HTMLElement>(null);

  // Global Ctrl+P / Cmd+P hotkey & custom event listener to open scoped Spotlight Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "p" || e.key.toLowerCase() === "k")) {
        e.preventDefault(); // suppress browser print dialog
        setIsSpotlightOpen((prev) => !prev);
      }
    };

    const handleOpenSpotlight = () => setIsSpotlightOpen(true);

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-spotlight", handleOpenSpotlight);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-spotlight", handleOpenSpotlight);
    };
  }, []);

  // Helper to scroll to a specific text snippet and trigger pulse highlight after scroll arrival
  const scrollToSnippet = useCallback((snippet: string): boolean => {
    if (!snippet) return false;
    const container = articleRef.current;
    if (!container) return false;

    // Clean any markdown syntax markers from snippet for clean textContent matching
    const cleanSnippet = snippet
      .replace(/^#{1,6}\s+/, "")
      .replace(/^>\s*/, "")
      .replace(/^[-*+]\s+\[[ x]\]\s*/i, "")
      .replace(/^[-*+]\s+/, "")
      .replace(/^\d+\.\s+/, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) -> text
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1") // ![alt](url) -> alt
      .replace(/<[^>]+>/g, "") // strip inline html tags
      .replace(/[`*_~]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();

    if (!cleanSnippet) return false;

    // Search strictly within content elements (exclude section/question container divs)
    const contentCandidates = Array.from(
      container.querySelectorAll(
        "h1, h2, h3, h4, h5, h6, p, li, pre, code, tr, td, th, blockquote, dt, dd"
      )
    ) as HTMLElement[];

    // Helper: given a list of matching elements, pick the deepest / leaf-most element
    const pickLeafMatch = (elements: HTMLElement[]): HTMLElement | null => {
      if (elements.length === 0) return null;
      const leafElements = elements.filter(
        (el) => !elements.some((other) => other !== el && el.contains(other))
      );
      return leafElements[0] || elements[0];
    };

    // 1. Exact cleaned line match (normalized whitespace)
    const exactMatches = contentCandidates.filter((el) => {
      const tc = (el.textContent || "").toLowerCase().replace(/\s+/g, " ");
      return tc.includes(cleanSnippet);
    });
    let targetEl = pickLeafMatch(exactMatches);

    // 2. Prefix match (first 30 characters)
    if (!targetEl && cleanSnippet.length > 25) {
      const prefix = cleanSnippet.slice(0, 30);
      const prefixMatches = contentCandidates.filter((el) => {
        const tc = (el.textContent || "").toLowerCase().replace(/\s+/g, " ");
        return tc.includes(prefix);
      });
      targetEl = pickLeafMatch(prefixMatches);
    }

    // 3. Significant keywords match (words longer than 3 chars)
    if (!targetEl) {
      const words = cleanSnippet
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length > 3)
        .slice(0, 5);

      if (words.length > 0) {
        const wordMatches = contentCandidates.filter((el) => {
          const tc = (el.textContent || "").toLowerCase();
          return words.every((w) => tc.includes(w));
        });
        targetEl = pickLeafMatch(wordMatches);
      }
    }

    // Fallback: search all non-container elements
    if (!targetEl) {
      const allElements = Array.from(container.querySelectorAll("*")) as HTMLElement[];
      const fallbackMatches = allElements.filter((el) => {
        if (
          el.classList.contains("collapsible-section") ||
          el.classList.contains("section-body") ||
          el.classList.contains("collapsible-question") ||
          el.classList.contains("question-body")
        ) {
          return false;
        }
        const tc = (el.textContent || "").toLowerCase().replace(/\s+/g, " ");
        return tc.includes(cleanSnippet);
      });
      targetEl = pickLeafMatch(fallbackMatches);
    }

    if (!targetEl) return false;

    // Identify the best block element to scroll to and highlight
    const blockEl =
      (targetEl.closest(
        "p, li, h1, h2, h3, h4, h5, h6, pre, tr, td, blockquote"
      ) as HTMLElement | null) || targetEl;

    // Detect if this snippet is within a Question & Answer card
    const questionEl = targetEl.closest(".collapsible-question") as HTMLElement | null;

    // Uncollapse all ancestor collapsible sections, questions, and code blocks
    let cur: HTMLElement | null = blockEl;
    while (cur && cur !== container) {
      if (cur.classList.contains("collapsible-section") && !cur.classList.contains("open")) {
        cur.classList.add("open");
        const h2 = cur.querySelector("h2.collapsible-heading");
        if (h2) h2.setAttribute("aria-expanded", "true");
      }
      if (cur.classList.contains("collapsible-question") && !cur.classList.contains("open")) {
        cur.classList.add("open");
        const h3 = cur.querySelector("h3.collapsible-heading");
        if (h3) h3.setAttribute("aria-expanded", "true");
      }
      if (cur.classList.contains("code-block-wrapper") && !cur.classList.contains("open")) {
        cur.classList.add("open");
        const toggleSpan = cur.querySelector(".btn-toggle-code span");
        if (toggleSpan) toggleSpan.textContent = "Collapse";
      }
      cur = cur.parentElement;
    }

    // Force DOM layout reflow so element coordinates are accurate following expansion
    void container.offsetHeight;

    // Function to trigger the glowing highlight across the entire question & answer card
    const triggerHighlight = () => {
      container.querySelectorAll(".search-target-highlight, .search-line-highlight").forEach((el) => {
        el.classList.remove("search-target-highlight", "search-line-highlight");
      });

      if (questionEl) {
        void questionEl.offsetWidth; // trigger reflow
        questionEl.classList.add("search-target-highlight");

        if (blockEl && blockEl !== questionEl) {
          blockEl.classList.add("search-line-highlight");
        }
      } else {
        void blockEl.offsetWidth;
        blockEl.classList.add("search-target-highlight");
      }
    };

    const scrollTarget =
      questionEl && questionEl.offsetHeight < window.innerHeight * 0.85
        ? questionEl
        : blockEl;

    triggerHighlight();
    scrollTarget.scrollIntoView({ behavior: "smooth", block: "center" });

    return true;
  }, []);

  // Check for cross-page jump snippet in sessionStorage on load (with retry for DOM paint)
  useEffect(() => {
    const jumpSnippet = sessionStorage.getItem("spotlight_jump_snippet");
    if (jumpSnippet) {
      sessionStorage.removeItem("spotlight_jump_snippet");
      let attempts = 0;
      const tryScroll = () => {
        const found = scrollToSnippet(jumpSnippet);
        attempts++;
        if (!found && attempts < 5) {
          setTimeout(tryScroll, 120);
        }
      };
      setTimeout(tryScroll, 80);
    }
  }, [doc.html, scrollToSnippet]);

  // Handle result selection from Spotlight search modal
  const handleSelectSearchResult = (url: string, snippetText: string) => {
    setIsSpotlightOpen(false);

    if (typeof window !== "undefined") {
      const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").toLowerCase();
      const rawPath = window.location.pathname.replace(/\/$/, "").toLowerCase();
      const currentPath = basePath && rawPath.startsWith(basePath)
        ? rawPath.slice(basePath.length)
        : rawPath;
      const targetPath = url.replace(/\/$/, "").toLowerCase();

      if (currentPath === targetPath) {
        // Same page: immediately scroll and highlight
        scrollToSnippet(snippetText);
      } else {
        // Different page: navigate to target page and carry snippet
        sessionStorage.setItem("spotlight_jump_snippet", snippetText);
        router.push(url);
      }
    }
  };

  // Scroll spy & reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setReadingProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)));
      }

      const headingElements = doc.headings
        .map((h) => document.getElementById(h.id))
        .filter(Boolean) as HTMLElement[];

      for (let i = headingElements.length - 1; i >= 0; i--) {
        const el = headingElements[i];
        const rect = el.getBoundingClientRect();
        if (rect.top <= 140) {
          setActiveHeading(el.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [doc.headings]);

  // Master Collapse / Expand All toggle across all article sections, questions, and code blocks
  const toggleAll = useCallback(() => {
    const next = !allExpanded;
    setAllExpanded(next);

    const container = articleRef.current;
    if (!container) return;

    // Toggle sections in content
    container.querySelectorAll(".collapsible-section").forEach((sec) => {
      sec.classList.toggle("open", next);
      const h2 = sec.querySelector("h2.collapsible-heading");
      if (h2) h2.setAttribute("aria-expanded", String(next));
    });

    // Toggle questions in content
    container.querySelectorAll(".collapsible-question").forEach((q) => {
      q.classList.toggle("open", next);
      const h3 = q.querySelector("h3.collapsible-heading");
      if (h3) h3.setAttribute("aria-expanded", String(next));
    });

    // Toggle code blocks in content
    container.querySelectorAll(".code-block-wrapper").forEach((blk) => {
      blk.classList.toggle("open", next);
      const toggleSpan = blk.querySelector(".btn-toggle-code span");
      if (toggleSpan) toggleSpan.textContent = next ? "Collapse" : "Expand";
    });
  }, [allExpanded]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Scroll to heading ensuring its parent section and question are uncollapsed
  const handleTocClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const targetEl = document.getElementById(id);
    if (!targetEl) return;
    const container = articleRef.current;

    // Uncollapse parent section in article if closed
    const parentSection = targetEl.closest(".collapsible-section");
    if (parentSection && !parentSection.classList.contains("open")) {
      parentSection.classList.add("open");
      const h2 = parentSection.querySelector("h2.collapsible-heading");
      if (h2) h2.setAttribute("aria-expanded", "true");
    }

    // Uncollapse question in article if closed
    const parentQuestion = targetEl.closest(".collapsible-question");
    if (parentQuestion && !parentQuestion.classList.contains("open")) {
      parentQuestion.classList.add("open");
      const h3 = parentQuestion.querySelector("h3.collapsible-heading");
      if (h3) h3.setAttribute("aria-expanded", "true");
    }

    if (container) void container.offsetHeight;

    const questionEl = targetEl.closest(".collapsible-question") as HTMLElement | null;
    const highlightTarget = questionEl || targetEl;

    const triggerHighlight = () => {
      if (container) {
        container.querySelectorAll(".search-target-highlight, .search-line-highlight").forEach((el) => {
          el.classList.remove("search-target-highlight", "search-line-highlight");
        });
      }
      void highlightTarget.offsetWidth;
      highlightTarget.classList.add("search-target-highlight");
    };

    const scrollTarget =
      questionEl && questionEl.offsetHeight < window.innerHeight * 0.85
        ? questionEl
        : targetEl;

    triggerHighlight();
    scrollTarget.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="w-full min-h-screen bg-hub-bg text-hub-primary relative">
      {/* Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-0.5 bg-hub-green z-50 transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      />

      {/* Scoped Spotlight Search Modal */}
      {doc.folderDocs && doc.folderDocs.length > 0 && (
        <SpotlightModal
          isOpen={isSpotlightOpen}
          onClose={() => setIsSpotlightOpen(false)}
          folderName={doc.subfolder || doc.category}
          folderDocs={doc.folderDocs}
          onSelectResult={handleSelectSearchResult}
        />
      )}

      {/* Mermaid Syntax Error Diagnostic Modal */}
      <MermaidErrorModal
        isOpen={Boolean(mermaidErrorInfo)}
        onClose={() => setMermaidErrorInfo(null)}
        errorInfo={mermaidErrorInfo}
      />

      {/* Main Document Layout Grid (TOC Sidebar on left, Header & Article on right) */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-8 py-8 ${isEmbed ? "!max-w-none !p-4" : ""}`}>
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Left Column: Sticky Table of Contents Sidebar */}
          {!isEmbed && (
            <DocToc
              headings={doc.headings}
              activeHeading={activeHeading}
              allExpanded={allExpanded}
              onHeadingClick={handleTocClick}
              onToggleAll={toggleAll}
              onScrollToTop={scrollToTop}
            />
          )}

          {/* Right Column: Title Card + Document Article */}
          <main className={`flex-1 min-w-0 ${isEmbed ? "w-full" : ""}`}>
            <DocHeader
              doc={doc}
              isEmbed={isEmbed}
              allExpanded={allExpanded}
              onToggleAll={toggleAll}
            />

            <DocArticle
              ref={articleRef}
              html={doc.html}
              title={doc.title}
              onInspectMermaidError={setMermaidErrorInfo}
            />
          </main>
        </div>
      </div>
    </div>
  );
};
