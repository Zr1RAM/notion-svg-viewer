"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronRight, ExternalLink, Home, Layers, BookOpen, Share2, Check } from "lucide-react";

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isEmbed = mounted && searchParams?.get("embed") === "true";

  if (isEmbed) {
    return null; // Clean zero-chrome mode for Notion embed!
  }

  const isHome = pathname === "/";

  // Build breadcrumbs from path
  const segments = pathname.split("/").filter(Boolean);

  const copyNotionEmbed = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("embed", "true");
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0f1117]/85 backdrop-blur-xl border-b border-[#272d3b] px-4 sm:px-8 py-3 flex items-center justify-between transition-all">
      {/* Left: Brand & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href="/"
          className="flex items-center gap-2 group text-white font-semibold text-sm hover:text-hub-green transition-colors flex-shrink-0"
        >
          <div className="w-7 h-7 rounded-lg bg-hub-green/10 border border-hub-green/30 flex items-center justify-center text-hub-green group-hover:scale-105 transition-transform">
            <Layers className="w-4 h-4" />
          </div>
          <span className="hidden sm:inline font-bold tracking-tight">Notion Diagrams Hub</span>
        </Link>

        {!isHome && (
          <div className="flex items-center gap-2 text-xs text-hub-secondary min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
            <ChevronRight className="w-3.5 h-3.5 text-hub-muted flex-shrink-0" />
            {segments.map((seg, idx) => {
              const isLast = idx === segments.length - 1;
              const formatted = seg
                .replace(/[-_]/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase());
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-hub-muted flex-shrink-0" />}
                  <span className={isLast ? "text-white font-medium truncate" : "hover:text-white truncate"}>
                    {formatted}
                  </span>
                </React.Fragment>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        {!isHome && (
          <button
            onClick={copyNotionEmbed}
            title="Copy Notion Embed link"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-hub-green/10 text-xs font-medium text-hub-secondary hover:text-hub-green border border-white/5 hover:border-hub-green/30 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-hub-green" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Notion Embed</span>
              </>
            )}
          </button>
        )}

        <Link
          href="/"
          title="Back to Hub Directory"
          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-hub-secondary hover:text-white transition-colors"
        >
          <Home className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
};
