"use client";

import React from "react";
import { X, BotMessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export type ChatCorner = "top" | "bottom";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  corner: ChatCorner;
  className?: string;
  children?: React.ReactNode;
}

const TOP_OFFSET = 76;
const BOTTOM_MARGIN = 24;
const BTN_SIZE = 52;

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  corner,
  className,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <aside
      style={{
        right: "24px",
        ...(corner === "top"
          ? {
              top: `${TOP_OFFSET + BTN_SIZE + 12}px`,
              bottom: `${BOTTOM_MARGIN}px`,
            }
          : {
              top: "68px",
              bottom: `${BOTTOM_MARGIN + BTN_SIZE + 12}px`,
            }),
      }}
      className={cn(
        "fixed z-50 w-[360px] sm:w-[400px] max-w-[calc(100vw-32px)]",
        "bg-[#13161c]/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl flex flex-col overflow-hidden",
        "animate-in fade-in-0 zoom-in-95 duration-200 select-none",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-hub-green/10 border border-hub-green/30 flex items-center justify-center text-hub-green">
            <BotMessageSquare className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white tracking-wide">Any doubts?</h3>
            <p className="text-[10px] text-hub-muted flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-hub-green" />
              Ready
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-hub-muted hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
          title="Close chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body: Empty for now as requested */}
      <div className="flex-1 p-4 flex flex-col items-center justify-center text-center text-hub-muted">
        {children}
      </div>
    </aside>
  );
};
