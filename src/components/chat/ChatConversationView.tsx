"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  Send,
  Bot,
  User,
  Copy,
  Check,
  Sparkles,
  AlertCircle,
  RotateCw,
} from "lucide-react";
import { marked } from "marked";
import { useChat } from "./ChatContext";

const STARTER_PROMPTS = [
  "Explain the core architectural tradeoffs in this topic.",
  "Give me a Senior/Staff level interview question on this with an evaluation rubric.",
  "What are the common production bottlenecks and failure modes?",
  "Provide a clean, production-ready code example demonstrating best practices.",
];

export const ChatConversationView: React.FC = () => {
  const {
    messages,
    sendMessage,
    isLoading,
    error,
    docContext,
    setIsSettingsOpen,
  } = useChat();

  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading, error]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between overflow-hidden bg-transparent select-text">
      {/* Messages Thread Container */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 custom-scrollbar">
        {/* Empty State / Welcome Screen with Quick-Start Chips */}
        {messages.length === 0 && (
          <div className="py-4 text-center">
            <div className="w-10 h-10 rounded-2xl bg-hub-green/10 border border-hub-green/30 flex items-center justify-center text-hub-green mx-auto mb-2.5 shadow-lg shadow-hub-green/10">
              <Bot className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-white tracking-wide mb-1">
              Senior Software Architect AI
            </h4>
            <p className="text-[11px] text-hub-muted max-w-[280px] mx-auto leading-relaxed mb-4">
              Ask deep questions about system design, code patterns, scalability tradeoffs, or interview prep.
            </p>

            {docContext?.title && (
              <div className="mb-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[10.5px] text-hub-blue">
                <Sparkles className="w-3 h-3" />
                <span className="truncate max-w-[240px]">Context: {docContext.title}</span>
              </div>
            )}

            {/* Quick Starter Chips */}
            <div className="flex flex-col gap-1.5 text-left">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  className="p-2 rounded-xl bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-hub-green/30 text-[11px] text-hub-secondary hover:text-white transition-all text-left cursor-pointer flex items-center justify-between group"
                >
                  <span className="truncate pr-2">{prompt}</span>
                  <span className="text-hub-muted group-hover:text-hub-green text-xs shrink-0">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Render Chat Messages */}
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  isUser
                    ? "bg-hub-blue/20 text-hub-blue border border-hub-blue/30"
                    : "bg-hub-green/10 text-hub-green border border-hub-green/30 shadow-[0_0_10px_rgba(0,255,136,0.15)]"
                }`}
              >
                {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  isUser
                    ? "bg-[#1f242e] text-white border border-white/10 rounded-tr-none shadow-md"
                    : "bg-[#111318] text-hub-primary border border-white/10 rounded-tl-none shadow-lg"
                }`}
              >
                {/* Copy Button for Assistant responses */}
                {!isUser && (
                  <button
                    type="button"
                    onClick={() => copyToClipboard(msg.content, msg.id)}
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 rounded bg-white/10 hover:bg-white/20 text-hub-muted hover:text-white transition-opacity cursor-pointer"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3 h-3 text-hub-green" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                )}

                {/* Markdown content rendering */}
                {isUser ? (
                  <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                ) : (
                  <div
                    className="prose-chat text-xs space-y-1.5 break-words font-sans"
                    dangerouslySetInnerHTML={{
                      __html: marked.parse(msg.content, { async: false }) as string,
                    }}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Spinner Indicator */}
        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 rounded-lg bg-hub-green/10 text-hub-green border border-hub-green/30 flex items-center justify-center shrink-0 mt-0.5">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-[#111318] border border-white/10 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-lg">
              <div className="w-1.5 h-1.5 rounded-full bg-hub-green animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-hub-green animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 rounded-full bg-hub-green animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="text-[10px] text-hub-muted ml-2 font-mono">Thinking...</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 flex items-start justify-between gap-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-red-200">Error</p>
                <p className="text-[11px] text-red-300/90 leading-tight">{error}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="text-[11px] underline text-red-200 hover:text-white shrink-0 cursor-pointer"
            >
              Settings
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-2.5 sm:p-3 border-t border-white/10 bg-[#0d0f14]/80 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask doubts, architecture tradeoffs, or interview tips..."
            disabled={isLoading}
            className="flex-1 bg-[#161b22] border border-white/15 focus:border-hub-green/50 rounded-xl px-3 py-2 text-xs text-white placeholder:text-hub-muted outline-none resize-none max-h-24 min-h-[36px] transition-colors leading-relaxed"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-9 h-9 rounded-xl bg-hub-green text-[#0f1117] flex items-center justify-center shrink-0 hover:bg-hub-green/90 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer shadow-md shadow-hub-green/20"
            title="Send message (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
