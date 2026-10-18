"use client";

import React from "react";
import { FileText, ChevronDown } from "lucide-react";
import { HubItem } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { NavItemLink } from "./NavItemLink";

interface FileDropdownProps {
  title: string;
  files: HubItem[];
  folderName?: string;
}

export const FileDropdown: React.FC<FileDropdownProps> = ({
  title,
  files,
  folderName = "Folder",
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-white font-medium hover:bg-white/[0.08] border border-white/10 hover:border-white/20 transition-all cursor-pointer focus:outline-none max-w-[140px] sm:max-w-[220px] md:max-w-[320px]"
          title="Switch document in this folder"
        >
          <FileText className="w-3.5 h-3.5 text-hub-green shrink-0" />
          <span className="truncate">{title}</span>
          <ChevronDown className="w-3.5 h-3.5 text-hub-muted shrink-0" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-64 max-h-[75vh] overflow-y-auto custom-scrollbar bg-[#13161c]/95 border border-white/10 text-xs shadow-2xl backdrop-blur-md rounded-lg p-1.5"
      >
        <DropdownMenuLabel className="text-[10px] uppercase font-semibold text-hub-muted px-2 py-1">
          Files in {folderName}
        </DropdownMenuLabel>

        {files.map((file) => (
          <NavItemLink key={file.id} item={file} />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
