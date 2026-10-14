"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { DocContent } from "@/lib/content";
import {
  BookOpen,
  Clock,
  FileText,
  List,
  Share2,
  Check,
  ChevronRight,
  ArrowUp,
} from "lucide-react";

interface DocViewerProps {
  doc: DocContent;
  embedMode?: boolean;
}

export const DocViewer: React.FC<DocViewerProps> = ({ doc, embedMode = false }) => {
  const searchParams = useSearchParams();
  const isEmbed = embedMode || searchParams?.get("embed") === "true";
  const [activeHeading, setActiveHeading] = useState<string>("");
  const [readingProgress, setReadingProgress] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Scroll spy & reading progress
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setReadingProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)));
      }

      // Check which heading is currently in viewport
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

  // Code copy buttons and checkbox persistence
  useEffect(() => {
    // 1. Code copy buttons
    const copyButtons = document.querySelectorAll<HTMLButtonElement>(".copy-code-btn");
    copyButtons.forEach((btn) => {
      const code = decodeURIComponent(btn.getAttribute("data-code") || "");
      btn.onclick = () => {
        navigator.clipboard.writeText(code);
        const originalText = btn.textContent;
        btn.textContent = "Copied!";
        btn.classList.add("text-hub-green");
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove("text-hub-green");
        }, 2000);
      };
    });

    // 2. Interactive checkboxes with localStorage memory
    const checkboxes = document.querySelectorAll<HTMLInputElement>(
      '.markdown-body input[type="checkbox"]'
    );
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
        localStorage.setItem(storageKey, JSON.stringify(savedChecks));
      };
    });
  }, [doc.html, doc.title]);

  const copyNotionEmbed = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("embed", "true");
    navigator.clipboard.writeText(url.toString());
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full min-h-screen bg-hub-bg text-hub-primary relative">
      {/* Top Reading Progress Bar */}
      <div
        className="fixed top-0 left-0 h-0.5 bg-hub-green z-50 transition-all duration-150"
        style={{ width: `${readingProgress}%` }}
      />

      <div className={`max-w-7xl mx-auto px-4 sm:px-8 py-8 ${isEmbed ? "!max-w-none !p-4" : ""}`}>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content Area */}
          <main className={isEmbed ? "col-span-1" : "lg:col-span-3 min-w-0"}>
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

                {!isEmbed && (
                  <button
                    onClick={copyNotionEmbed}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-hub-green/10 text-xs font-medium text-hub-secondary hover:text-hub-green border border-white/5 hover:border-hub-green/30 transition-all"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-hub-green" />
                        <span>Embed Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Copy Notion Embed</span>
                      </>
                    )}
                  </button>
                )}
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

            {/* Rendered HTML */}
            <article
              className="markdown-body bg-hub-card border border-hub-border rounded-2xl p-6 sm:p-10 shadow-xl"
              dangerouslySetInnerHTML={{ __html: doc.html }}
            />
          </main>

          {/* Sticky Table of Contents Sidebar */}
          {!isEmbed && (
            <aside className="hidden lg:block lg:col-span-1">
              <div className="sticky top-20 max-h-[calc(100vh-6rem)] flex flex-col bg-hub-card border border-hub-border rounded-2xl p-5 shadow-xl">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-hub-blue pb-3 mb-3 border-b border-hub-border">
                  <List className="w-4 h-4" />
                  <span>On This Page</span>
                </div>

                <nav className="overflow-y-auto flex-1 pr-1 flex flex-col gap-1 text-xs">
                  {doc.headings.map((h, i) => {
                    const isActive = activeHeading === h.id;
                    const paddingLeft =
                      h.level === 1 ? "pl-0" : h.level === 2 ? "pl-2" : h.level === 3 ? "pl-4" : "pl-6";

                    return (
                      <a
                        key={i}
                        href={`#${h.id}`}
                        className={`block py-1 rounded transition-colors ${paddingLeft} ${
                          isActive
                            ? "text-hub-green font-semibold"
                            : "text-hub-secondary hover:text-white"
                        }`}
                      >
                        {h.text}
                      </a>
                    );
                  })}
                </nav>

                <div className="pt-4 mt-3 border-t border-hub-border">
                  <button
                    onClick={scrollToTop}
                    className="flex items-center gap-2 text-xs text-hub-muted hover:text-white transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>Back to Top</span>
                  </button>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
};
