"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Folder, Home } from "lucide-react";
import { CategoryGroup } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { NavItemLink } from "./NavItemLink";

interface VaultsDropdownProps {
  categories: CategoryGroup[];
}

export const VaultsDropdown: React.FC<VaultsDropdownProps> = ({ categories }) => {
  const router = useRouter();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="p-1 rounded-md text-hub-muted hover:text-white hover:bg-white/[0.08] transition-colors focus:outline-none cursor-pointer"
          title="Browse all Vaults & Architecture Diagrams"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className="w-56 bg-[#13161c]/95 border border-white/10 text-xs shadow-2xl backdrop-blur-md rounded-lg p-1.5"
      >
        <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-hub-muted px-2 py-1">
          Vaults & Categories
        </DropdownMenuLabel>

        {categories.map((cat) => (
          <DropdownMenuSub key={cat.slug}>
            <DropdownMenuSubTrigger className="flex items-center gap-2 px-2 py-1.5 text-xs text-hub-secondary hover:text-white rounded-md cursor-pointer">
              <Folder className="w-3.5 h-3.5 text-hub-purple shrink-0" />
              <span className="truncate">{cat.name}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-60 max-h-[70vh] overflow-y-auto custom-scrollbar bg-[#13161c]/95 border border-white/10 text-xs shadow-2xl backdrop-blur-md rounded-lg p-1.5">
              {/* Direct items in this category */}
              {cat.directItems.map((item) => (
                <NavItemLink key={item.id} item={item} />
              ))}

              {/* Subfolders in this category */}
              {cat.subfolders.map((sub) => (
                <DropdownMenuSub key={sub.slug}>
                  <DropdownMenuSubTrigger className="flex items-center gap-2 px-2 py-1.5 text-xs text-hub-secondary hover:text-white rounded-md cursor-pointer">
                    <Folder className="w-3.5 h-3.5 text-hub-blue shrink-0" />
                    <span className="truncate">{sub.name}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-64 max-h-[70vh] overflow-y-auto custom-scrollbar bg-[#13161c]/95 border border-white/10 text-xs shadow-2xl backdrop-blur-md rounded-lg p-1.5">
                    {sub.items.map((subItem) => (
                      <NavItemLink key={subItem.id} item={subItem} />
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}

        <DropdownMenuSeparator className="-mx-1 my-1.5 bg-white/10" />

        <DropdownMenuItem
          onClick={() => router.push("/")}
          className="flex items-center gap-2 px-2 py-1.5 text-xs text-hub-muted hover:text-white rounded-md cursor-pointer"
        >
          <Home className="w-3.5 h-3.5 shrink-0" />
          <span>Hub Overview</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
