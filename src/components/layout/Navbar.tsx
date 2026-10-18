"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChevronRight,
  Layers,
  Share2,
  Check,
  Search,
} from "lucide-react";
import { CategoryGroup, HubItem } from "@/lib/types";
import { formatTitle } from "@/lib/utils";
import { VaultsDropdown, SubfolderDropdown, FileDropdown } from "./nav";

interface NavbarProps {
  categories?: CategoryGroup[];
}

export const Navbar: React.FC<NavbarProps> = ({ categories = [] }) => {
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

  // Build breadcrumbs segments from path (e.g. /docs/interview-prep/react-and-node/mock-for-17-10-2026-1)
  const segments = pathname.split("/").filter(Boolean);

  // Identify current category, subfolder, and active file
  const currentCategory = useMemo(() => {
    if (segments.length < 2) return null;
    const catSlug = segments[1];
    return categories.find((c) => c.slug === catSlug) || null;
  }, [segments, categories]);

  const currentSubfolder = useMemo(() => {
    if (!currentCategory || segments.length < 4) return null;
    const subSlug = segments[2];
    return currentCategory.subfolders.find((s) => s.slug === subSlug) || null;
  }, [segments, currentCategory]);

  const currentSubfoldersList = useMemo(() => {
    return currentCategory ? currentCategory.subfolders : [];
  }, [currentCategory]);

  const currentFilesList = useMemo<HubItem[]>(() => {
    if (currentSubfolder) return currentSubfolder.items;
    if (currentCategory) return currentCategory.directItems;
    return [];
  }, [currentSubfolder, currentCategory]);

  const activeFile = useMemo(() => {
    return currentFilesList.find((f) => f.url === pathname) || null;
  }, [currentFilesList, pathname]);

  const currentFileTitle = useMemo(() => {
    if (activeFile) return activeFile.title;
    if (segments.length === 0) return "";
    return formatTitle(segments[segments.length - 1]);
  }, [activeFile, segments]);

  const copyNotionEmbed = () => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.set("embed", "true");
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0f1117]/85 backdrop-blur-xl border-b border-[#272d3b] px-4 sm:px-8 py-2.5 flex items-center justify-between transition-all select-none">
      {/* Left: Brand with Top-Level Category Dropdown + Breadcrumbs */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Brand / Home Dropdown (Cloud Architecture, Fast Track, Interview Prep) */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <Link
            href="/"
            className="flex items-center gap-2 group text-white font-semibold text-sm hover:text-hub-green transition-colors"
            title="Go to Hub Home"
          >
            <div className="w-7 h-7 rounded-lg bg-hub-green/10 border border-hub-green/30 flex items-center justify-center text-hub-green group-hover:scale-105 transition-transform">
              <Layers className="w-4 h-4" />
            </div>
            <span className="hidden sm:inline font-bold tracking-tight">Notion Diagrams Hub</span>
          </Link>

          {/* Top-Level Vaults Dropdown attached to Home Brand */}
          <VaultsDropdown categories={categories} />
        </div>

        {/* Breadcrumb Path Trail */}
        {!isHome && (
          <div className="flex items-center gap-1.5 text-xs text-hub-secondary min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
            <ChevronRight className="w-3.5 h-3.5 text-hub-muted flex-shrink-0" />

            {/* 1. Root Section (Docs / Diagrams / Guides) */}
            <Link
              href="/"
              className="hover:text-white transition-colors truncate max-w-[80px] hidden sm:inline"
              title="Back to Hub"
            >
              {segments[0].charAt(0).toUpperCase() + segments[0].slice(1)}
            </Link>

            {/* 2. Category Segment (e.g. Interview Prep) */}
            {currentCategory && (
              <>
                <ChevronRight className="w-3 h-3 text-hub-muted flex-shrink-0 hidden sm:inline" />
                <Link
                  href={`/#${currentCategory.slug}`}
                  className="hover:text-white transition-colors truncate max-w-[140px] hidden md:inline"
                  title={`View ${currentCategory.name} on Hub`}
                >
                  {currentCategory.name}
                </Link>
              </>
            )}

            {/* 3. Subfolder Segment with Dropdown (e.g. React & Node) */}
            {currentSubfolder && (
              <>
                <ChevronRight className="w-3 h-3 text-hub-muted flex-shrink-0" />
                <SubfolderDropdown
                  categoryName={currentCategory?.name}
                  currentSubfolder={currentSubfolder}
                  subfolders={currentSubfoldersList}
                />
              </>
            )}

            {/* 4. Active File Segment with Files Dropdown */}
            <ChevronRight className="w-3 h-3 text-hub-muted flex-shrink-0" />
            <FileDropdown
              title={currentFileTitle}
              files={currentFilesList}
              folderName={currentSubfolder ? currentSubfolder.name : currentCategory?.name || "Folder"}
            />

            {/* Spotlight Search Trigger button next to file name */}
            {pathname.startsWith("/docs/") && (
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent("open-spotlight"))}
                title="Search folder documents (Ctrl + P)"
                className="ml-1 hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-hub-purple/15 hover:bg-hub-purple/25 text-xs font-semibold text-hub-purple hover:text-white border border-hub-purple/35 transition-all flex-shrink-0"
              >
                <Search className="w-3 h-3" />
                <span>Search</span>
                <kbd className="text-[9px] px-1 py-0.2 rounded bg-black/40 border border-white/10 font-mono text-gray-300">
                  Ctrl P
                </kbd>
              </button>
            )}
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
      </div>
    </header>
  );
};

