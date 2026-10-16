"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, X, Copy, Check, Terminal, Code2, Lightbulb, ExternalLink } from "lucide-react";

export interface MermaidErrorInfo {
  errorMessage: string;
  rawCode: string;
}

interface MermaidErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errorInfo: MermaidErrorInfo | null;
}

export const MermaidErrorModal: React.FC<MermaidErrorModalProps> = ({
  isOpen,
  onClose,
  errorInfo,
}) => {
  const [copiedError, setCopiedError] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !errorInfo) return null;

  // Extract line number if mentioned in error message (e.g. "Parse error on line 4:")
  const lineMatch = errorInfo.errorMessage.match(/(?:line\s*|on line\s*)(\d+)/i);
  const errorLineNum = lineMatch ? parseInt(lineMatch[1], 10) : null;

  const codeLines = errorInfo.rawCode.trim().split("\n");

  const copyErrorText = () => {
    navigator.clipboard.writeText(errorInfo.errorMessage);
    setCopiedError(true);
    setTimeout(() => setCopiedError(false), 2000);
  };

  const copySourceCode = () => {
    navigator.clipboard.writeText(errorInfo.rawCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-[#161b22] border border-rose-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0d1117]/90 select-none">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white tracking-tight">
                  Mermaid Syntax Error
                </h3>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Parse Failed
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                The diagram definition contains syntax that could not be parsed by the Mermaid compiler.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Close (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm custom-scrollbar">
          {/* Parser Error Output */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-rose-300 uppercase tracking-wider">
                <Terminal className="w-3.5 h-3.5" />
                <span>Compiler Diagnostic</span>
              </div>
              <button
                onClick={copyErrorText}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
              >
                {copiedError ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Error</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-[#090d13] border border-rose-500/30 rounded-xl p-4 font-mono text-xs text-rose-300 overflow-x-auto whitespace-pre-wrap select-all leading-relaxed shadow-inner">
              {errorInfo.errorMessage}
            </div>
          </div>

          {/* Source Code View with Highlighted Line */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-300 uppercase tracking-wider">
                <Code2 className="w-3.5 h-3.5 text-hub-blue" />
                <span>Mermaid Source {errorLineNum ? `(Line ${errorLineNum} flagged)` : ""}</span>
              </div>
              <button
                onClick={copySourceCode}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-colors"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Source</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-[#090d13] border border-white/10 rounded-xl overflow-hidden font-mono text-xs">
              <div className="overflow-x-auto max-h-56 divide-y divide-white/5">
                {codeLines.map((line, idx) => {
                  const lineNum = idx + 1;
                  const isErrorLine = errorLineNum === lineNum;
                  return (
                    <div
                      key={idx}
                      className={`flex items-start px-3 py-1 transition-colors ${
                        isErrorLine
                          ? "bg-rose-500/20 text-rose-200 border-l-4 border-rose-500"
                          : "text-gray-300 hover:bg-white/[0.02]"
                      }`}
                    >
                      <span className="w-8 shrink-0 select-none text-right pr-4 text-gray-500 font-mono text-[11px]">
                        {lineNum}
                      </span>
                      <pre className="flex-1 font-mono text-xs whitespace-pre overflow-x-auto">
                        {line || " "}
                      </pre>
                      {isErrorLine && (
                        <span className="shrink-0 ml-3 text-[10px] font-bold uppercase tracking-wider text-rose-300 bg-rose-500/30 px-2 py-0.5 rounded border border-rose-500/40">
                          Error
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Syntax Guidance */}
          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Common Fixes for Mermaid Flowcharts</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-gray-300 pl-1 leading-relaxed">
              <li>
                <strong className="text-white">Special Characters:</strong> Always wrap node labels containing characters like <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">&lt;=</code>, <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">&gt;</code>, <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">(</code>, <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">)</code>, or <code className="text-amber-300 bg-black/40 px-1 py-0.5 rounded">?</code> in double quotes. Example: <code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded">D["nextStart &lt;= currentEnd?"]</code> instead of <code className="text-rose-300 bg-black/40 px-1 py-0.5 rounded">D&#123;nextStart &lt;= currentEnd?&#125;</code>.
              </li>
              <li>
                <strong className="text-white">Edge Labels:</strong> In flowchart arrow text with spaces or characters, use quotes or standard pipes: <code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded">D -- "Yes Overlap" --&gt; E</code>.
              </li>
              <li>
                <strong className="text-white">Node IDs:</strong> Avoid spaces and punctuation in node identifiers (e.g., use <code className="text-emerald-300 bg-black/40 px-1 py-0.5 rounded">CheckMap</code> instead of <code className="text-rose-300 bg-black/40 px-1 py-0.5 rounded">Check Map</code>).
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-white/10 bg-[#0d1117]/90 text-xs">
          <div className="text-gray-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono text-[11px]">Esc</kbd> to dismiss
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
