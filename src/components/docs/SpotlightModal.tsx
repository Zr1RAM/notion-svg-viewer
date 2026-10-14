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
        <mark key={i} className="spotlight-mark">
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
      className="spotlight-backdrop open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="spotlight-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Spotlight Search"
        onKeyDown={handleKeyDown}
      >
        {/* Input Header */}
        <div className="spotlight-input-wrapper">
          <Search className="w-5 h-5 text-hub-purple flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="spotlight-input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search README or prep documents in this folder..."
            autoComplete="off"
            spellCheck="false"
          />
          <span className="spotlight-scope-badge">📁 {folderName}</span>
          <button
            type="button"
            className="spotlight-close-btn"
            onClick={onClose}
            title="Close (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="spotlight-filter-bar">
          <span className="spotlight-filter-label">Scope:</span>
          <button
            type="button"
            className={`spotlight-pill ${scopeFilter === "readme" ? "active" : ""}`}
            onClick={() => setScopeFilter("readme")}
          >
            README Only
          </button>
          <button
            type="button"
            className={`spotlight-pill ${scopeFilter === "all" ? "active" : ""}`}
            onClick={() => setScopeFilter("all")}
          >
            All Docs in Folder
          </button>
          <span className="spotlight-stats">
            {query.trim().length >= 2
              ? `${searchResults.length} ${searchResults.length === 1 ? "match" : "matches"}`
              : "Type to search"}
          </span>
        </div>

        {/* Results Container */}
        <div ref={resultsContainerRef} className="spotlight-results">
          {query.trim().length < 2 ? (
            <div className="spotlight-empty">
              Type at least 2 characters to search across{" "}
              {scopeFilter === "readme" ? "the topic README" : "all files in this folder"}.
            </div>
          ) : searchResults.length === 0 ? (
            <div className="spotlight-empty">
              No lines found matching &ldquo;<strong>{query}</strong>&rdquo; in this folder.
            </div>
          ) : (
            searchResults.map((result, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={`${result.url}-${result.lineNum}-${idx}`}
                  data-index={idx}
                  className={`spotlight-item ${isSelected ? "selected" : ""}`}
                  onClick={() => onSelectResult(result.url, result.text)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="spotlight-item-header">
                    <span
                      className={`spotlight-file-badge ${result.isReadme ? "is-readme" : ""}`}
                    >
                      {result.title}
                    </span>
                    <span className="spotlight-line-num">L{result.lineNum}</span>
                  </div>
                  <div className="spotlight-snippet">
                    {renderHighlightedText(result.text, query)}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Shortcuts */}
        <div className="spotlight-footer">
          <div className="spotlight-hint">
            <span>↑</span> <span>↓</span> Navigate
          </div>
          <div className="spotlight-hint">
            <span>↵</span> Open result
          </div>
          <div className="spotlight-hint">
            <span>esc</span> Close
          </div>
        </div>
      </div>
    </div>
  );
};
