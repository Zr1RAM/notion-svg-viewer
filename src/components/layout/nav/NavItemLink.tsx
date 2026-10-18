"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Layers, BookOpen, FileText, Check } from "lucide-react";
import { HubItem } from "@/lib/types";
import { cn } from "@/lib/utils";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface NavItemLinkProps {
  item: HubItem;
}

export const NavItemLink: React.FC<NavItemLinkProps> = ({ item }) => {
  const router = useRouter();
  const pathname = usePathname();
  const isActive = item.url === pathname;

  return (
    <DropdownMenuItem
      onClick={() => router.push(item.url)}
      className={cn(
        "flex items-center justify-between px-2 py-1.5 rounded-md cursor-pointer transition-colors text-xs",
        isActive
          ? "bg-white/[0.08] text-white font-medium"
          : "text-hub-secondary hover:text-white hover:bg-white/[0.06]"
      )}
    >
      <div className="flex items-center gap-2 min-w-0">
        {item.type === "diagram" ? (
          <Layers className="w-3.5 h-3.5 text-hub-green shrink-0" />
        ) : item.type === "guide" ? (
          <BookOpen className="w-3.5 h-3.5 text-hub-amber shrink-0" />
        ) : (
          <FileText className="w-3.5 h-3.5 text-hub-blue shrink-0" />
        )}
        <span className="truncate">{item.title}</span>
      </div>
      {isActive && (
        <Check className="w-3.5 h-3.5 text-hub-green shrink-0 ml-2" />
      )}
    </DropdownMenuItem>
  );
};
