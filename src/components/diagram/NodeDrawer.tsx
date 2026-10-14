"use client";

import React, { useEffect } from "react";
import { DiagramNode } from "@/lib/types";
import { X, Layers, Activity, BookOpen, Tag, Check, Copy } from "lucide-react";

interface NodeDrawerProps {
  nodeId: string | null;
  node: DiagramNode | null;
  onClose: () => void;
  onTagClick?: (tag: string) => void;
}

export const NodeDrawer: React.FC<NodeDrawerProps> = ({
  nodeId,
  node,
  onClose,
  onTagClick,
}) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!nodeId || !node) return null;

  const handleCopy = () => {
    const text = `${node.title}\n${node.category} • ${node.badge || ""}\n\nSummary:\n${node.summary}\n\nArchitecture Role:\n${node.architectureRole || ""}\n\nDetails:\n${node.details}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside
      className="fixed top-4 bottom-4 right-4 w-[420px] max-w-[calc(100vw-32px)] bg-[#111827]/95 backdrop-blur-2xl text-[#f3f4f6] border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
      role="dialog"
      aria-labelledby="node-title"
    >
      {/* Header */}
      <div className="p-5 pb-4 border-b border-white/10 relative">
        <div className="flex justify-between items-center mb-2">
          {node.badge && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Layers className="w-3 h-3" />
              {node.badge}
            </span>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <button
              onClick={handleCopy}
              title="Copy Service Details"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              title="Close (Esc)"
              className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <h2 id="node-title" className="text-xl font-bold text-white tracking-tight leading-snug">
          {node.title}
        </h2>
        <p className="text-xs text-hub-secondary mt-1 flex items-center gap-1">
          <span>{node.category}</span>
          <span>•</span>
          <code className="text-hub-green font-mono">{nodeId}</code>
        </p>
      </div>

      {/* Content */}
      <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4 text-sm leading-relaxed">
        {/* Summary Card */}
        <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-hub-blue mb-2">
            <Activity className="w-3.5 h-3.5" />
            Overview Summary
          </div>
          <p className="text-gray-300">{node.summary}</p>
        </div>

        {/* Architecture Role */}
        {node.architectureRole && (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-hub-green mb-2">
              <Layers className="w-3.5 h-3.5" />
              Architecture Role
            </div>
            <p className="text-gray-300 font-medium">{node.architectureRole}</p>
          </div>
        )}

        {/* Deep Details */}
        {node.details && (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-hub-purple mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              Deep Details & Specifications
            </div>
            <div className="text-gray-300 whitespace-pre-line leading-relaxed">
              {node.details}
            </div>
          </div>
        )}

        {/* Search Terms / Tags */}
        {node.searchTerms && node.searchTerms.length > 0 && (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-400 mb-2.5">
              <Tag className="w-3.5 h-3.5" />
              Related Topics & Keywords
            </div>
            <div className="flex flex-wrap gap-1.5">
              {node.searchTerms.map((term, i) => (
                <button
                  key={i}
                  onClick={() => onTagClick && onTagClick(term)}
                  className="px-2.5 py-1 rounded-md text-xs bg-white/5 hover:bg-hub-blue/20 text-gray-300 hover:text-hub-blue border border-white/5 hover:border-hub-blue/30 transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
