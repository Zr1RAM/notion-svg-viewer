"use client";

import React from "react";
import { Folder, ChevronDown, Check } from "lucide-react";
import { SubfolderGroup } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { NavItemLink } from "./NavItemLink";

interface SubfolderDropdownProps {
  categoryName?: string;
  currentSubfolder: SubfolderGroup;
  subfolders: SubfolderGroup[];
}

export const SubfolderDropdown: React.FC<SubfolderDropdownProps> = ({
  categoryName = "Category",
  currentSubfolder,
  subfolders,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-hub-secondary hover:text-white hover:bg-white/[0.08] transition-colors focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[180px]"
          title="Switch subfolder"
        >
          <Folder className="w-3.5 h-3.5 text-hub-blue shrink-0" />
          <span className="truncate">{currentSubfolder.name}</span>
          <ChevronDown className="w-3 h-3 text-hub-muted shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-56 max-h-[70vh] overflow-y-auto custom-scrollbar bg-[#13161c]/95 border border-white/10 text-xs shadow-2xl backdrop-blur-md rounded-lg p-1.5"
      >
        <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-hub-muted px-2 py-1">
          Folders in {categoryName}
        </DropdownMenuLabel>
        {subfolders.map((sub) => {
          const isCurrent = sub.slug === currentSubfolder.slug;
          return (
            <DropdownMenuSub key={sub.slug}>
              <DropdownMenuSubTrigger
                className={cn(
                  "flex items-center justify-between px-2 py-1.5 text-xs rounded-md cursor-pointer",
                  isCurrent
                    ? "bg-white/[0.08] text-white font-medium"
                    : "text-hub-secondary hover:text-white"
                )}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Folder className="w-3.5 h-3.5 text-hub-blue shrink-0" />
                  <span className="truncate">{sub.name}</span>
                </div>
                {isCurrent && (
                  <Check className="w-3 h-3 text-hub-green shrink-0 ml-1.5" />
                )}
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-64 max-h-[70vh] overflow-y-auto custom-scrollbar bg-[#13161c]/95 border border-white/10 text-xs shadow-2xl backdrop-blur-md rounded-lg p-1.5">
                <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-hub-muted px-2 py-1">
                  {sub.name} Files
                </DropdownMenuLabel>
                {sub.items.map((subItem) => (
                  <NavItemLink key={subItem.id} item={subItem} />
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
