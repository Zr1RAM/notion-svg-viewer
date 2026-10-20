"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Search, X } from "lucide-react";
import { ScopedDocRecord } from "@/lib/content";

interface SearchMatch {
  title: string;
  fileName: string;
  url: string;
  isReadme: boolean;
  lineNum: number;
  text: string;
}

interface SpotlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderName: string;
  folderDocs: ScopedDocRecord[];
  onSelectResult: (url: string, snippetText: string) => void;
}

export const SpotlightModal: React.FC<SpotlightModalProps> = ({
  isOpen,
  onClose,
  folderName,
  folderDocs,
  onSelectResult,
}) => {
  const [query, setQuery] = useState("");
  const [scopeFilter, setScopeFilter] = useState<"readme" | "all">("readme");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsContainerRef = useRef<HTMLDivElement>(null);

  // Focus input on open and reset query
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Execute in-memory search across scoped folderDocs
  const searchResults = useMemo(() => {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery || trimmedQuery.length < 2) return [];

    const matches: SearchMatch[] = [];
    const targetDocs = folderDocs.filter((doc) => {
      if (scopeFilter === "readme") return doc.isReadme;
      return true;
    });

    for (const doc of targetDocs) {
      for (const line of doc.lines) {
        if (line.text.toLowerCase().includes(trimmedQuery)) {
          matches.push({
            title: doc.title,
            fileName: doc.fileName,
            url: doc.url,
            isReadme: doc.isReadme,
            lineNum: line.lineNum,
            text: line.text,
          });
          if (matches.length >= 60) break;
        }
      }
      if (matches.length >= 60) break;
    }

    return matches;
  }, [query, scopeFilter, folderDocs]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchResults]);

  // Ensure selected item stays scrolled into view
  useEffect(() => {
    if (!resultsContainerRef.current) return;
    const selectedEl = resultsContainerRef.current.querySelector<HTMLElement>(
      `[data-index="${selectedIndex}"]`
    );
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selectedIndex]);

  // Keyboard navigation within modal
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % searchResults.length);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (searchResults.length > 0) {
        setSelectedIndex((prev) => (prev - 1 + searchResults.length) % searchResults.length);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        const item = searchResults[selectedIndex];
        onSelectResult(item.url, item.text);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // Helper to render matched keyword highlighted
  const renderHighlightedText = (text: string, queryStr: string) => {
    if (!queryStr.trim()) return text;
    const regex = new RegExp(`(${queryStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return parts.map((part, i) =>
      part.toLowerCase() === queryStr.trim().toLowerCase() ? (
        <mark key={i} className="bg-amber-500/30 text-amber-200 px-1 py-0.5 rounded font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-start justify-center pt-3 sm:pt-[10vh] px-2 sm:px-4 transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-[#161b22] border border-white/15 rounded-xl sm:rounded-2xl w-full max-w-[620px] max-h-[85vh] sm:max-h-[540px] shadow-2xl shadow-black ring-1 ring-hub-purple/30 overflow-hidden flex flex-col transition-transform duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight Search"
        onKeyDown={handleKeyDown}
      >
        {/* Input Header */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3.5 flex items-center gap-2.5 sm:gap-3 border-b border-white/10 bg-white/[0.03]">
          <Search className="w-4 h-4 sm:w-5 sm:h-5 text-hub-purple flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="bg-transparent border-none outline-none text-sm sm:text-[15px] text-white w-full placeholder:text-hub-muted font-sans"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents in this folder..."
            autoComplete="off"
            spellCheck="false"
          />
          <span className="hidden sm:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded-md bg-hub-purple/15 border border-hub-purple/30 text-hub-purple whitespace-nowrap flex-shrink-0">
            📁 {folderName}
          </span>
          <button
            type="button"
            className="text-hub-muted hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors flex-shrink-0"
            onClick={onClose}
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#101318] border-b border-white/5 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="hidden sm:inline text-hub-muted text-[11px] uppercase tracking-wider mr-0.5">Scope:</span>
            <button
              type="button"
              className={`px-2 py-0.5 rounded-full text-[10.5px] sm:text-[11.5px] transition-colors border font-sans ${
                scopeFilter === "readme"
                  ? "bg-hub-blue/15 border-hub-blue text-white font-semibold"
                  : "bg-white/[0.04] border-white/10 text-hub-secondary hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => setScopeFilter("readme")}
            >
              README Only
            </button>
            <button
              type="button"
              className={`px-2 py-0.5 rounded-full text-[10.5px] sm:text-[11.5px] transition-colors border font-sans ${
                scopeFilter === "all"
                  ? "bg-hub-blue/15 border-hub-blue text-white font-semibold"
                  : "bg-white/[0.04] border-white/10 text-hub-secondary hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => setScopeFilter("all")}
            >
              All Docs
            </button>
          </div>
          <span className="text-[10.5px] sm:text-[11.5px] text-hub-muted truncate">
            {query.trim().length >= 2
              ? `${searchResults.length} ${searchResults.length === 1 ? "match" : "matches"}`
              : "Type to search"}
          </span>
        </div>

        {/* Results Container */}
        <div ref={resultsContainerRef} className="flex-1 min-h-0 max-h-[48vh] sm:max-h-[360px] overflow-y-auto p-1.5 sm:p-2 scrollbar-thin scrollbar-thumb-hub-purple/30 scrollbar-track-black/20">
          {query.trim().length < 2 ? (
            <div className="py-7 px-4 text-center text-hub-muted text-xs sm:text-[13.5px]">
              Type at least 2 characters to search across{" "}
              {scopeFilter === "readme" ? "the topic README" : "all files in this folder"}.
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-7 px-4 text-center text-hub-muted text-xs sm:text-[13.5px]">
              No lines found matching &ldquo;<strong>{query}</strong>&rdquo; in this folder.
            </div>
          ) : (
            searchResults.map((result, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${result.url}-${result.lineNum}-${idx}`}
                  data-index={idx}
                  className={`p-2 sm:p-2.5 rounded-lg mb-1 cursor-pointer transition-all border flex flex-col gap-1 ${
                    isSelected
                      ? "bg-hub-purple/15 border-hub-purple/40 translate-x-0.5"
                      : "border-transparent bg-white/[0.02] hover:bg-hub-purple/10 hover:border-hub-purple/30 hover:translate-x-0.5"
                  }`}
                  onClick={() => onSelectResult(result.url, result.text)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] sm:text-[11px] font-semibold px-1.5 py-0.5 rounded border font-mono ${
                        result.isReadme
                          ? "text-hub-purple bg-hub-purple/15 border-hub-purple/30"
                          : "text-hub-green bg-hub-green/10 border-hub-green/25"
                      }`}
                    >
                      {result.title}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-hub-muted font-mono">L{result.lineNum}</span>
                  </div>
                  <div className="text-xs sm:text-[13px] text-hub-secondary leading-snug truncate">
                    {renderHighlightedText(result.text, query)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Shortcuts (Desktop only) */}
        <div className="hidden sm:flex px-4 py-2 border-t border-white/5 items-center gap-4 text-[11.5px] text-hub-muted bg-[#101318]">
          <div className="flex items-center gap-1">
            <span className="bg-white/10 border border-white/15 px-1.5 py-0.5 rounded font-mono text-[10.5px] mr-1 text-hub-secondary">↑</span>
            <span className="bg-white/10 border border-white/15 px-1.5 py-0.5 rounded font-mono text-[10.5px] mr-1 text-hub-secondary">↓</span> Navigate
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-white/10 border border-white/15 px-1.5 py-0.5 rounded font-mono text-[10.5px] mr-1 text-hub-secondary">↵</span> Open result
          </div>
          <div className="flex items-center gap-1">
            <span className="bg-white/10 border border-white/15 px-1.5 py-0.5 rounded font-mono text-[10.5px] mr-1 text-hub-secondary">esc</span> Close
          </div>
        </div>
      </div>
    </div>
  );
};
