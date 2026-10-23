"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  BotMessageSquare,
  Settings,
  Trash2,
  MessageSquare,
  Sparkles,
  Copy,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useChat } from "./ChatContext";
import { ChatSettingsView } from "./ChatSettingsView";
import { ChatConversationView } from "./ChatConversationView";
import { PROVIDERS, copyConversation } from "@/lib/ai";

export type ChatCorner = "top" | "bottom";

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  corner: ChatCorner;
  className?: string;
}

const TOP_OFFSET = 76;
const BOTTOM_MARGIN = 24;
const BTN_SIZE = 52;

export const ChatPanel: React.FC<ChatPanelProps> = ({
  isOpen,
  onClose,
  corner,
  className,
}) => {
  const [isMobile, setIsMobile] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  const {
    settings,
    isSettingsOpen,
    setIsSettingsOpen,
    clearMessages,
    messages,
    docContext,
  } = useChat();

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleCopyAll = async () => {
    if (messages.length === 0) return;
    await copyConversation(messages, docContext?.title);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  if (!isOpen) return null;

  const currentProvider = PROVIDERS.find((p) => p.id === settings?.provider);
  const isConfigured = Boolean(settings?.apiKey);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 sm:hidden animate-in fade-in duration-200"
      />

      {/* Chat Container (Mobile Compact Bottom Sheet / Desktop Floating Side Card) */}
      <aside
        style={
          isMobile
            ? undefined
            : {
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
              }
        }
        className={cn(
          "fixed z-50 flex flex-col overflow-hidden select-none",
          isMobile
            ? "inset-x-0 bottom-0 h-[52vh] max-h-[58vh] rounded-t-2xl border-t border-white/15 bg-[#13161c]/98 backdrop-blur-2xl shadow-2xl animate-in slide-in-from-bottom duration-300"
            : "w-[380px] sm:w-[420px] max-w-[calc(100vw-32px)] bg-[#13161c]/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl animate-in fade-in-0 zoom-in-95 duration-200",
          className
        )}
      >
        {/* Mobile Pull Handle */}
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mt-2 mb-1 sm:hidden flex-shrink-0" />

        {/* Header */}
        <div className="flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-white/10 bg-white/[0.02] flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-hub-green/10 border border-hub-green/30 flex items-center justify-center text-hub-green shrink-0">
              <BotMessageSquare className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-semibold text-white tracking-wide truncate">
                  AI Architect
                </h3>
                {isConfigured && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-hub-green/15 text-hub-green border border-hub-green/30 shrink-0">
                    {currentProvider?.name.replace(/Google |Anthropic /, "") || "Active"}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-hub-muted flex items-center gap-1.5 truncate">
                <span
                  className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    isConfigured ? "bg-hub-green animate-pulse" : "bg-amber-400"
                  )}
                />
                <span className="truncate">
                  {isConfigured ? settings?.model || "Ready" : "API key required"}
                </span>
              </p>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Toggle Settings / Back to Chat button */}
            {isConfigured && (
              <button
                type="button"
                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                className={cn(
                  "p-1.5 rounded-md transition-colors cursor-pointer",
                  isSettingsOpen
                    ? "text-hub-green bg-white/[0.08]"
                    : "text-hub-muted hover:text-white hover:bg-white/[0.08]"
                )}
                title={isSettingsOpen ? "Back to Chat" : "AI Provider Settings"}
              >
                {isSettingsOpen ? (
                  <MessageSquare className="w-3.5 h-3.5" />
                ) : (
                  <Settings className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {/* Copy Entire Conversation button */}
            {!isSettingsOpen && messages.length > 0 && (
              <button
                type="button"
                onClick={handleCopyAll}
                className={cn(
                  "p-1.5 rounded-md transition-colors cursor-pointer",
                  copiedAll
                    ? "text-hub-green bg-hub-green/10"
                    : "text-hub-muted hover:text-white hover:bg-white/[0.08]"
                )}
                title={
                  copiedAll
                    ? "Copied & downloaded .md file!"
                    : "Copy entire conversation (downloads .md)"
                }
              >
                {copiedAll ? (
                  <Check className="w-3.5 h-3.5 text-hub-green" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}

            {/* Clear Chat History button (visible in chat view when messages exist) */}
            {!isSettingsOpen && messages.length > 0 && (
              <button
                type="button"
                onClick={clearMessages}
                className="p-1.5 rounded-md text-hub-muted hover:text-red-400 hover:bg-white/[0.08] transition-colors cursor-pointer"
                title="Clear chat history"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Close Chat Panel */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-hub-muted hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer"
              title="Close chat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Body: Settings Form vs. Active Conversation */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {isSettingsOpen || !isConfigured ? (
            <ChatSettingsView />
          ) : (
            <ChatConversationView />
          )}
        </div>
      </aside>
    </>
  );
};
