"use client";

import React, { useState } from "react";
import { DocContent } from "@/lib/content";
import {
  Clock,
  FileText,
  Share2,
  Check,
  ChevronRight,
  ChevronsUpDown,
  Copy,
} from "lucide-react";

interface DocHeaderProps {
  doc: DocContent;
  isEmbed?: boolean;
  allExpanded: boolean;
  onToggleAll: () => void;
}

export const DocHeader: React.FC<DocHeaderProps> = ({
  doc,
  isEmbed = false,
  allExpanded,
  onToggleAll,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedRaw, setCopiedRaw] = useState(false);

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

  return (
    <div className="bg-hub-card border border-hub-border rounded-2xl p-6 sm:p-8 mb-8 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        {/* Breadcrumb Path */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-hub-secondary">
          <span className="text-hub-blue">{doc.category}</span>
          {doc.subfolder && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-hub-muted" />
              <span>{doc.subfolder}</span>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-hub-muted" />
          <span className="text-white font-medium">{doc.title}</span>
        </div>

        {/* Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onToggleAll}
            title="Collapse / Expand All Sections, Questions & Code"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-hub-secondary hover:text-white border border-white/5 transition-all cursor-pointer"
          >
            <ChevronsUpDown className="w-3.5 h-3.5 text-hub-purple" />
            <span>{allExpanded ? "Collapse All" : "Expand All"}</span>
          </button>

          <button
            onClick={copyRawMarkdown}
            title="Copy Raw Markdown Text"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-hub-secondary hover:text-white border border-white/5 transition-all cursor-pointer"
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-hub-green/10 text-xs font-medium text-hub-secondary hover:text-hub-green border border-white/5 hover:border-hub-green/30 transition-all cursor-pointer"
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
  );
};
