"use client";

import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Search,
  X,
  Share2,
  Check,
  Maximize2,
} from "lucide-react";

interface DiagramControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  searchTerm: string;
  onSearchChange: (val: string) => void;
  matchedCount?: number;
  totalCount: number;
  embedMode?: boolean;
}

export const DiagramControls: React.FC<DiagramControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onReset,
  searchTerm,
  onSearchChange,
  matchedCount,
  totalCount,
  embedMode,
}) => {
  const [copied, setCopied] = useState(false);

  const copyEmbedUrl = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("embed", "true");
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="absolute top-4 left-4 z-40 flex items-center gap-2 max-w-[calc(100vw-32px)]">
      {/* Search Bar */}
      <div className="relative flex items-center bg-[#181b22]/90 backdrop-blur-md border border-[#272d3b] hover:border-[#3d465c] rounded-xl px-3 py-1.5 shadow-lg transition-all focus-within:border-hub-green/50">
        <Search className="w-4 h-4 text-hub-muted mr-2 flex-shrink-0" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={`Search ${totalCount} services...`}
          className="bg-transparent text-sm text-hub-primary placeholder-hub-muted focus:outline-none w-36 sm:w-56"
        />
        {searchTerm && (
          <button
            onClick={() => onSearchChange("")}
            className="p-1 hover:text-white text-hub-muted"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        {searchTerm && typeof matchedCount === "number" && (
          <span className="ml-2 px-1.5 py-0.5 rounded text-[11px] font-mono bg-hub-green/10 text-hub-green border border-hub-green/30">
            {matchedCount}
          </span>
        )}
      </div>

      {/* Zoom and Navigation Buttons */}
      <div className="flex items-center bg-[#181b22]/90 backdrop-blur-md border border-[#272d3b] rounded-xl p-1 shadow-lg gap-0.5">
        <button
          onClick={onZoomIn}
          title="Zoom In (+)"
          className="p-2 rounded-lg text-hub-secondary hover:text-white hover:bg-white/5 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={onZoomOut}
          title="Zoom Out (-)"
          className="p-2 rounded-lg text-hub-secondary hover:text-white hover:bg-white/5 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={onReset}
          title="Reset Zoom & Pan"
          className="p-2 rounded-lg text-hub-secondary hover:text-white hover:bg-white/5 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Notion Embed Copy Button */}
      {!embedMode && (
        <button
          onClick={copyEmbedUrl}
          title="Copy Notion Embed URL (?embed=true)"
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-[#181b22]/90 backdrop-blur-md border border-[#272d3b] hover:border-hub-green/40 hover:bg-hub-green/10 text-xs font-medium text-hub-secondary hover:text-hub-green rounded-xl shadow-lg transition-all"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-hub-green" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Notion Embed Link</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
