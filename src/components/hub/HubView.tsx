"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  CategoryGroup,
  HubItem,
  SubfolderGroup,
} from "@/lib/types";
import {
  Search,
  X,
  Folder,
  FolderOpen,
  ChevronDown,
  ArrowRight,
  FileText,
  FileCode,
  BookOpen,
  Layers,
  Sparkles,
} from "lucide-react";

interface HubViewProps {
  categories: CategoryGroup[];
}

export const HubView: React.FC<HubViewProps> = ({ categories }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [openCards, setOpenCards] = useState<Record<string, boolean>>(() => {
    // Default all root cards open
    const initial: Record<string, boolean> = {};
    categories.forEach((cat) => {
      initial[cat.slug] = true;
    });
    return initial;
  });

  const [openSubfolders, setOpenSubfolders] = useState<Record<string, boolean>>(() => {
    // Default open
    const initial: Record<string, boolean> = {};
    categories.forEach((cat) => {
      cat.subfolders.forEach((sf) => {
        initial[`${cat.slug}/${sf.slug}`] = true;
      });
    });
    return initial;
  });

  const toggleCard = (slug: string) => {
    setOpenCards((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  const toggleSubfolder = (key: string) => {
    setOpenSubfolders((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filter categories and items based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const query = searchTerm.toLowerCase();

    return categories
      .map((cat) => {
        const directMatches = cat.directItems.filter(
          (item) =>
            item.title.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query) ||
            item.slug.toLowerCase().includes(query)
        );

        const subfolderMatches = cat.subfolders
          .map((sf) => {
            const matches = sf.items.filter(
              (item) =>
                item.title.toLowerCase().includes(query) ||
                item.description?.toLowerCase().includes(query) ||
                item.slug.toLowerCase().includes(query) ||
                sf.name.toLowerCase().includes(query)
            );
            return { ...sf, items: matches };
          })
          .filter((sf) => sf.items.length > 0);

        const totalMatches = directMatches.length + subfolderMatches.reduce((acc, s) => acc + s.items.length, 0);

        if (totalMatches === 0 && !cat.name.toLowerCase().includes(query)) {
          return null;
        }

        return {
          ...cat,
          directItems: directMatches,
          subfolders: subfolderMatches,
          totalCount: totalMatches,
        };
      })
      .filter(Boolean) as CategoryGroup[];
  }, [categories, searchTerm]);

  // Total summary statistics
  const totalStats = useMemo(() => {
    let diagrams = 0;
    let docs = 0;
    let guides = 0;

    categories.forEach((cat) => {
      const allItems = [...cat.directItems, ...cat.subfolders.flatMap((s) => s.items)];
      allItems.forEach((i) => {
        if (i.type === "diagram") diagrams++;
        else if (i.type === "doc") docs++;
        else if (i.type === "guide") guides++;
      });
    });

    return { diagrams, docs, guides, total: diagrams + docs + guides };
  }, [categories]);

  const renderItemButton = (item: HubItem) => {
    const isDoc = item.type === "doc";
    const isGuide = item.type === "guide";
    const isStaticHtml = item.url.endsWith(".html");
    const Component = isStaticHtml ? "a" : Link;

    return (
      <Component
        key={item.url}
        href={item.url}
        className="group flex items-center justify-between p-3 rounded-xl bg-hub-subcard hover:bg-hub-subcard-hover border border-hub-border hover:border-hub-border-hover transition-all duration-200"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono text-xs font-bold transition-transform group-hover:scale-105 flex-shrink-0 ${
              isDoc
                ? "bg-hub-blue/10 text-hub-blue border border-hub-blue/20"
                : isGuide
                ? "bg-hub-purple/10 text-hub-purple border border-hub-purple/20"
                : "bg-hub-green/10 text-hub-green border border-hub-green/20"
            }`}
          >
            {isDoc ? <FileText className="w-4 h-4" /> : isGuide ? <BookOpen className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-hub-primary group-hover:text-white transition-colors truncate">
                {item.title}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${
                  isDoc
                    ? "bg-hub-blue/15 text-hub-blue"
                    : isGuide
                    ? "bg-hub-purple/15 text-hub-purple"
                    : "bg-hub-green/15 text-hub-green"
                }`}
              >
                {item.type.toUpperCase()}
              </span>
            </div>
            {item.description && (
              <p className="text-xs text-hub-muted truncate mt-0.5">{item.description}</p>
            )}
          </div>
        </div>

        <div className="text-hub-muted group-hover:text-white group-hover:translate-x-1 transition-all pl-2">
          <ArrowRight className="w-4 h-4" />
        </div>
      </Component>
    );
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-12 flex flex-col items-center">
      {/* Ambient Glow */}
      <div className="ambient-glow" />

      {/* Header */}
      <header className="text-center mb-8 relative z-10">
        <div className="inline-flex items-center gap-2 bg-hub-green/10 text-hub-green text-xs font-semibold tracking-wider uppercase px-3 py-1 rounded-full border border-hub-green/25 mb-4 shadow-glow">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Architecture & Engineering Hub</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Notion Diagrams Hub
        </h1>
        <p className="text-sm sm:text-base text-hub-secondary max-w-xl mx-auto leading-relaxed">
          Interactive, pan-and-zoom architecture diagrams and technical assessment vaults, optimized for seamless embedding into Notion pages.
        </p>

        {/* Status Badge */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#181b22] border border-[#272d3b] text-xs font-mono text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <span>Static Export (GitHub Pages Ready)</span>
          </div>
        </div>
      </header>

      {/* Search Controls */}
      <div className="w-full max-w-2xl mb-10 relative z-10">
        <div className="relative flex items-center bg-hub-card border border-hub-border hover:border-hub-border-hover focus-within:border-hub-green/50 rounded-2xl p-2 shadow-xl transition-all">
          <Search className="w-5 h-5 text-hub-muted ml-3 mr-3 flex-shrink-0" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search diagrams, assessments, or cloud services..."
            className="w-full bg-transparent text-sm sm:text-base text-white placeholder-hub-muted focus:outline-none"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="p-1.5 mr-1 text-hub-muted hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex items-center justify-between px-2 mt-3 text-xs text-hub-muted">
          <span>
            {totalStats.diagrams} Diagrams • {totalStats.docs} Assessments • {totalStats.guides} Guide
          </span>
          {searchTerm && (
            <span>
              {filteredCategories.reduce((acc, c) => acc + c.totalCount, 0)} results found
            </span>
          )}
        </div>
      </div>

      {/* Grid of Categories */}
      {filteredCategories.length === 0 ? (
        <div className="text-center py-16 text-hub-muted relative z-10">
          <p className="text-base">No items match &quot;{searchTerm}&quot;</p>
          <button
            onClick={() => setSearchTerm("")}
            className="mt-3 px-4 py-1.5 rounded-lg bg-hub-card border border-hub-border text-xs text-hub-primary hover:text-white"
          >
            Clear Search
          </button>
        </div>
      ) : (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10 items-start">
          {filteredCategories.map((category) => {
            const isOpen = openCards[category.slug] !== false || searchTerm.trim().length > 0;

            return (
              <div
                key={category.slug}
                className="bg-hub-card border border-hub-border rounded-card p-5 shadow-xl hover:border-hub-border-hover transition-all"
              >
                {/* Category Header */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleCard(category.slug)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") toggleCard(category.slug);
                  }}
                  className={`flex items-center justify-between cursor-pointer select-none group transition-all duration-200 ${
                    isOpen ? "pb-4 border-b border-hub-border/60" : "pb-0 border-b border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 group-hover:scale-105 ${
                        isOpen
                          ? "bg-hub-green/10 border-hub-green/30 text-hub-green"
                          : "bg-white/5 border-white/10 text-hub-blue"
                      }`}
                    >
                      {isOpen ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-white group-hover:text-hub-blue transition-colors">
                        {category.name}
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-hub-secondary mt-0.5">
                        <span className="font-mono text-hub-green">
                          {category.totalCount} {category.totalCount === 1 ? "item" : "items"}
                        </span>
                        <span>•</span>
                        <code className="text-hub-muted">/{category.slug}</code>
                      </div>
                    </div>
                  </div>

                  <div
                    className={`p-1.5 rounded-lg text-hub-muted group-hover:text-white transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-hub-green" : ""
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </div>

                {/* Category Content (Smooth Animated Accordion) */}
                <div className={`hub-folder-submenu ${isOpen ? "open" : ""}`}>
                  <div className="hub-submenu-content pt-4">
                    {/* Direct Items */}
                    {category.directItems.map(renderItemButton)}

                    {/* Subfolders */}
                    {category.subfolders.map((sf) => {
                      const sfKey = `${category.slug}/${sf.slug}`;
                      const isSfOpen = openSubfolders[sfKey] !== false || searchTerm.trim().length > 0;

                      return (
                        <div
                          key={sf.slug}
                          className="bg-hub-subcard/50 border border-hub-border/70 rounded-xl p-3"
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => toggleSubfolder(sfKey)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") toggleSubfolder(sfKey);
                            }}
                            className="flex items-center justify-between cursor-pointer select-none py-1 group/sf"
                          >
                            <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 group-hover/sf:text-white">
                              <Folder className="w-3.5 h-3.5 text-hub-secondary" />
                              <span>{sf.name}</span>
                              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-white/5 text-gray-400">
                                {sf.items.length}
                              </span>
                            </div>
                            <div
                              className={`p-1 text-hub-muted group-hover/sf:text-white transition-transform duration-250 ${
                                isSfOpen ? "rotate-180 text-hub-purple" : ""
                              }`}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </div>
                          </div>

                          <div className={`hub-subfolder-drawer ${isSfOpen ? "open" : ""}`}>
                            <div className="hub-subfolder-content pt-3 pl-2 border-l border-white/5">
                              {sf.items.map(renderItemButton)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
