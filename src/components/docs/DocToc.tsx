"use client";

import React, { useState, useEffect, useMemo } from "react";
import { HeadingItem } from "@/lib/content";
import { List, ChevronsUpDown, ChevronDown, ArrowUp, X } from "lucide-react";

export interface TocGroup {
  id: string;
  text: string;
  level: number;
  subItems: HeadingItem[];
}

interface DocTocProps {
  headings: HeadingItem[];
  activeHeading: string;
  allExpanded?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  onHeadingClick: (e: React.MouseEvent, id: string) => void;
  onToggleAll: () => void;
  onScrollToTop: () => void;
}

export const DocToc: React.FC<DocTocProps> = ({
  headings,
  activeHeading,
  allExpanded = true,
  isMobileOpen = false,
  onCloseMobile,
  onHeadingClick,
  onToggleAll,
  onScrollToTop,
}) => {
  const [collapsedTocSections, setCollapsedTocSections] = useState<Record<string, boolean>>({});

  // Group headings into sections (H2) and nested sub-items (H3/H4)
  const tocGroups = useMemo(() => {
    const groups: TocGroup[] = [];
    let currentGroup: TocGroup | null = null;

    for (const h of headings) {
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
  }, [headings]);

  // Sync section collapses when master allExpanded changes
  useEffect(() => {
    if (!allExpanded) {
      const map: Record<string, boolean> = {};
      tocGroups.forEach((g) => {
        map[g.id] = true;
      });
      setCollapsedTocSections(map);
    } else {
      setCollapsedTocSections({});
    }
  }, [allExpanded, tocGroups]);

  // Toggle individual section in outline
  const toggleTocSection = (groupId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedTocSections((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

  // Reusable Nav Content List
  const renderNavList = (isMobile = false) => (
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
                onClick={(e) => {
                  onHeadingClick(e, group.id);
                  if (isMobile && onCloseMobile) onCloseMobile();
                }}
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
                  className="p-1.5 text-hub-muted hover:text-hub-purple transition-colors cursor-pointer"
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
                      onClick={(e) => {
                        onHeadingClick(e, sub.id);
                        if (isMobile && onCloseMobile) onCloseMobile();
                      }}
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
  );

  return (
    <>
      {/* 1. Desktop Sticky Sidebar (Visible on lg+ screens) */}
      <aside className="toc-sidebar hidden lg:flex flex-col w-[280px] xl:w-[320px] flex-shrink-0 sticky top-20 max-h-[calc(100vh-6rem)] bg-hub-card border border-hub-border rounded-2xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-hub-border">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-hub-blue">
            <List className="w-4 h-4 text-hub-blue" />
            <span>Table of Contents</span>
          </div>
          <button
            onClick={onToggleAll}
            title="Toggle All Sections"
            className="p-1 rounded hover:bg-white/5 text-hub-muted hover:text-hub-purple transition-colors cursor-pointer"
          >
            <ChevronsUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {renderNavList(false)}

        <div className="pt-3 mt-3 border-t border-hub-border flex items-center justify-between">
          <button
            onClick={onScrollToTop}
            className="flex items-center gap-1.5 text-xs text-hub-muted hover:text-white transition-colors cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Back to Top</span>
          </button>
          <span className="text-[10px] text-hub-muted font-mono">
            {headings.length} headings
          </span>
        </div>
      </aside>

      {/* 2. Mobile Slide-out Drawer (Visible when isMobileOpen is true on mobile) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop Overlay */}
          <div
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          />

          {/* Drawer Sidebar */}
          <aside className="relative z-10 w-[310px] max-w-[85vw] h-full bg-[#13161c]/98 border-r border-white/15 backdrop-blur-2xl shadow-2xl p-5 flex flex-col animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-hub-blue">
                <List className="w-4 h-4 text-hub-blue" />
                <span>Table of Contents</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={onToggleAll}
                  title="Toggle All Sections"
                  className="p-1.5 rounded hover:bg-white/5 text-hub-muted hover:text-hub-purple transition-colors cursor-pointer"
                >
                  <ChevronsUpDown className="w-4 h-4" />
                </button>
                <button
                  onClick={onCloseMobile}
                  title="Close Outline"
                  className="p-1.5 rounded hover:bg-white/5 text-hub-muted hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {renderNavList(true)}

            <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => {
                  onScrollToTop();
                  if (onCloseMobile) onCloseMobile();
                }}
                className="flex items-center gap-1.5 text-xs text-hub-muted hover:text-white transition-colors cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Back to Top</span>
              </button>
              <span className="text-[10px] text-hub-muted font-mono">
                {headings.length} headings
              </span>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
