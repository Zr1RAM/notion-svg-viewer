"use client";

import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { DocContent, HeadingItem } from "@/lib/content";
import {
  Clock,
  FileText,
  List,
  Share2,
  Check,
  ChevronRight,
  ChevronDown,
  ArrowUp,
  ChevronsUpDown,
  Copy,
} from "lucide-react";

interface DocViewerProps {
  doc: DocContent;
  embedMode?: boolean;
}

interface TocGroup {
  id: string;
  text: string;
  level: number;
  subItems: HeadingItem[];
}

export const DocViewer: React.FC<DocViewerProps> = ({ doc, embedMode = false }) => {
  const searchParams = useSearchParams();
  const isEmbed = embedMode || searchParams?.get("embed") === "true";
  const [activeHeading, setActiveHeading] = useState<string>("");
  const [readingProgress, setReadingProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [allExpanded, setAllExpanded] = useState(true);
  const [collapsedTocSections, setCollapsedTocSections] = useState<Record<string, boolean>>({});

  const articleRef = useRef<HTMLElement>(null);

  // Group headings into sections (H2) and nested sub-items (H3/H4) for TOC
  const tocGroups = useMemo(() => {
    const groups: TocGroup[] = [];
    let currentGroup: TocGroup | null = null;

    for (const h of doc.headings) {
      if (h.level <= 2) {
        currentGroup = {
          id: h.id,
          text: h.text,
          level: h.level,
          subItems: [],
        };
        groups.push(currentGroup);
      } else {
        if (currentGroup) {
          currentGroup.subItems.push(h);
        } else {
          currentGroup = {
            id: h.id,
            text: h.text,
            level: h.level,
            subItems: [],
          };
          groups.push(currentGroup);
        }
      }
    }
    return groups;
  }, [doc.headings]);

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

  // Interactive article event delegation for collapsible sections, questions, and code blocks
  const handleArticleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // Ignore clicks on anchor link targets or form inputs
    if (target.closest("a.heading-anchor") || target.tagName.toLowerCase() === "input") return;

    // 1. Copy code button
    const copyBtn = target.closest(".copy-code-btn") as HTMLElement | null;
    if (copyBtn) {
      e.stopPropagation();
      const code = decodeURIComponent(copyBtn.getAttribute("data-code") || "");
      navigator.clipboard.writeText(code);
      const span = copyBtn.querySelector("span");
      if (span) span.textContent = "Copied!";
      copyBtn.classList.add("text-hub-green");
      setTimeout(() => {
        if (span) span.textContent = "Copy";
        copyBtn.classList.remove("text-hub-green");
      }, 2000);
      return;
    }

    // 2. Code toggle button or code header
    const codeToggle = target.closest(".btn-toggle-code") as HTMLElement | null;
    const codeHeader = target.closest(".code-block-header") as HTMLElement | null;
    if (codeToggle || codeHeader) {
      const wrapper = (codeToggle || codeHeader)!.closest(".code-block-wrapper") as HTMLElement | null;
      if (wrapper) {
        const isOpen = wrapper.classList.toggle("open");
        const toggleSpan = wrapper.querySelector(".btn-toggle-code span");
        if (toggleSpan) toggleSpan.textContent = isOpen ? "Collapse" : "Expand";
      }
      return;
    }

    // 3. Question (H3) toggle
    const h3 = target.closest("h3.collapsible-heading") as HTMLElement | null;
    if (h3) {
      const q = h3.closest(".collapsible-question") as HTMLElement | null;
      if (q) {
        const isOpen = q.classList.toggle("open");
        h3.setAttribute("aria-expanded", String(isOpen));
      }
      return;
    }

    // 4. Section (H2) toggle
    const h2 = target.closest("h2.collapsible-heading") as HTMLElement | null;
    if (h2) {
      const sec = h2.closest(".collapsible-section") as HTMLElement | null;
      if (sec) {
        const isOpen = sec.classList.toggle("open");
        h2.setAttribute("aria-expanded", String(isOpen));
      }
      return;
    }
  }, []);

  // Initialize and persist checkbox states in localStorage
  useEffect(() => {
    const container = articleRef.current;
    if (!container) return;

    const checkboxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    if (checkboxes.length === 0) return;

    const storageKey = `doc-checks-${encodeURIComponent(doc.title)}`;
    let savedChecks: Record<number, boolean> = {};
    try {
      savedChecks = JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch {}

    checkboxes.forEach((cb, idx) => {
      cb.removeAttribute("disabled");
      cb.classList.add("cursor-pointer", "accent-hub-green", "w-4", "h-4", "mr-2");
      if (savedChecks[idx] !== undefined) {
        cb.checked = savedChecks[idx];
      }
      cb.onchange = () => {
        savedChecks[idx] = cb.checked;
        try {
          localStorage.setItem(storageKey, JSON.stringify(savedChecks));
        } catch {}
      };
    });
  }, [doc.title, doc.html]);

  // Master Collapse / Expand All toggle
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

    // Sync TOC section expansion
    const newCollapsedMap: Record<string, boolean> = {};
    if (!next) {
      // If collapsing all, collapse all TOC groups
      tocGroups.forEach((g) => {
        newCollapsedMap[g.id] = true;
      });
    }
    setCollapsedTocSections(newCollapsedMap);
  }, [allExpanded, tocGroups]);

  // Toggle individual TOC section
  const toggleTocSection = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedTocSections((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  const copyNotionEmbed = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("embed", "true");
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const copyRawMarkdown = () => {
    if (!doc.rawMarkdown) return;
    navigator.clipboard.writeText(doc.rawMarkdown);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Scroll to heading ensuring its parent section and question are uncollapsed
  const handleTocClick = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const targetEl = document.getElementById(id);
    if (!targetEl) return;

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

    const headerOffset = 90;
    const elementPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
    window.scrollTo({
      top: Math.max(0, elementPosition - headerOffset),
      behavior: "smooth",
    });

    targetEl.classList.remove("search-target-highlight");
    void targetEl.offsetWidth; // trigger reflow
    targetEl.classList.add("search-target-highlight");
  };

  return (
    <div className="w-full min-h-screen bg-hub-bg text-hub-primary relative">
      {/* Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-0.5 bg-hub-green z-50 transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      />

      <div className={`max-w-7xl mx-auto px-4 sm:px-8 py-8 ${isEmbed ? "!max-w-none !p-4" : ""}`}>
        {/* Flex layout: Table of Contents on LEFT, Main Article on RIGHT */}
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Sticky Table of Contents Sidebar - Left Side (300px fixed width, custom purple scrollbar) */}
          {!isEmbed && (
            <aside className="toc-sidebar hidden lg:flex flex-col w-[300px] flex-shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] bg-hub-card border border-hub-border rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-hub-border">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-hub-blue">
                  <List className="w-4 h-4 text-hub-blue" />
                  <span>Table of Contents</span>
                </div>
                <button
                  onClick={toggleAll}
                  title="Toggle All Sections"
                  className="p-1 rounded hover:bg-white/5 text-hub-muted hover:text-hub-purple transition-colors"
                >
                  <ChevronsUpDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <nav className="toc-scroll-area overflow-y-auto flex-1 pr-1.5 flex flex-col gap-1.5 text-xs">
                {tocGroups.map((group, gIdx) => {
                  const isSectionActive = activeHeading === group.id;
                  const isCollapsed = Boolean(collapsedTocSections[group.id]);
                  const hasSubItems = group.subItems.length > 0;

                  return (
                    <div key={`toc-group-${group.id}-${gIdx}`} className="toc-group flex flex-col">
                      {/* Section Heading Row */}
                      <div className="flex items-center justify-between group rounded hover:bg-white/5 transition-colors">
                        <a
                          href={`#${group.id}`}
                          onClick={(e) => handleTocClick(e, group.id)}
                          className={`flex-1 py-1.5 px-2 rounded font-semibold transition-colors truncate ${
                            isSectionActive ? "!text-hub-green font-bold" : "text-gray-200 hover:text-white"
                          }`}
                          title={group.text}
                        >
                          {group.text}
                        </a>

                        {hasSubItems && (
                          <button
                            type="button"
                            onClick={(e) => toggleTocSection(group.id, e)}
                            className="p-1.5 text-hub-muted hover:text-hub-purple transition-colors"
                            title={isCollapsed ? "Expand section in outline" : "Collapse section in outline"}
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                isCollapsed ? "-rotate-90 text-hub-muted" : "rotate-0 text-hub-purple"
                              }`}
                            />
                          </button>
                        )}
                      </div>

                      {/* Nested Questions / Sub-items */}
                      {hasSubItems && !isCollapsed && (
                        <div className="pl-2 ml-2 border-l border-white/10 flex flex-col gap-0.5 my-1">
                          {group.subItems.map((sub, sIdx) => {
                            const isSubActive = activeHeading === sub.id;
                            return (
                              <a
                                key={`toc-sub-${group.id}-${sub.id}-${sIdx}`}
                                href={`#${sub.id}`}
                                onClick={(e) => handleTocClick(e, sub.id)}
                                className={`block py-1 px-2 rounded text-[11.5px] transition-colors truncate ${
                                  isSubActive
                                    ? "!text-hub-green font-bold bg-white/5"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                                title={sub.text}
                              >
                                {sub.text}
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              <div className="pt-3 mt-3 border-t border-hub-border flex items-center justify-between">
                <button
                  onClick={scrollToTop}
                  className="flex items-center gap-1.5 text-xs text-hub-muted hover:text-white transition-colors"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>Back to Top</span>
                </button>
                <span className="text-[10px] text-hub-muted font-mono">
                  {doc.headings.length} headings
                </span>
              </div>
            </aside>
          )}

          {/* Main Content Area - Right Side */}
          <main className={`flex-1 min-w-0 ${isEmbed ? "w-full" : ""}`}>
            {/* Header info card */}
            <div className="bg-hub-card border border-hub-border rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-hub-secondary">
                  <span className="text-hub-blue">{doc.category}</span>
                  {doc.subfolder && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-hub-muted" />
                      <span>{doc.subfolder}</span>
                    </>
                  )}
                </div>

                {/* Header Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={toggleAll}
                    title="Collapse / Expand All Sections, Questions & Code"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-hub-secondary hover:text-white border border-white/5 transition-all"
                  >
                    <ChevronsUpDown className="w-3.5 h-3.5 text-hub-purple" />
                    <span>{allExpanded ? "Collapse All" : "Expand All"}</span>
                  </button>

                  <button
                    onClick={copyRawMarkdown}
                    title="Copy Raw Markdown Text"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-hub-secondary hover:text-white border border-white/5 transition-all"
                  >
                    {copiedRaw ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-hub-green" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-hub-blue" />
                        <span>Copy Raw</span>
                      </>
                    )}
                  </button>

                  {!isEmbed && (
                    <button
                      onClick={copyNotionEmbed}
                      title="Copy Notion Embed URL (?embed=true)"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-hub-green/10 text-xs font-medium text-hub-secondary hover:text-hub-green border border-white/5 hover:border-hub-green/30 transition-all"
                    >
                      {copiedLink ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-hub-green" />
                          <span>Embed Copied!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Notion Embed</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-4">
                {doc.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-hub-muted font-mono">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-hub-blue" />
                  <span>{doc.readingTime}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-hub-green" />
                  <span>{doc.wordCount.toLocaleString()} words</span>
                </div>
              </div>
            </div>

            {/* Rendered HTML with delegated interaction handling */}
            <article
              ref={articleRef}
              onClick={handleArticleClick}
              className="markdown-body bg-hub-card border border-hub-border rounded-2xl p-6 sm:p-10 shadow-xl"
              dangerouslySetInnerHTML={{ __html: doc.html }}
            />
          </main>
        </div>
      </div>
    </div>
  );
};
