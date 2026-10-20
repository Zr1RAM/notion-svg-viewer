"use client";

import React, { useEffect, useCallback } from "react";
import { MermaidErrorInfo } from "./MermaidErrorModal";
import { cn } from "@/lib/utils";
import "@/styles/markdown.css";
import "@/styles/highlight.css";

export interface DocArticleProps {
  html: string;
  title: string;
  className?: string;
  onInspectMermaidError?: (errorInfo: MermaidErrorInfo) => void;
}

export const DocArticle = React.forwardRef<HTMLElement, DocArticleProps>(
  ({ html, title, className, onInspectMermaidError }, ref) => {
    // Delegated event handling for collapsible sections, questions, code blocks, and Mermaid
    const handleArticleClick = useCallback(
      (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;

        // Ignore clicks on anchor link targets or form inputs
        if (target.closest("a.heading-anchor") || target.tagName.toLowerCase() === "input") return;

        // 1. Copy code button
        const copyBtn = target.closest(".copy-code-btn") as HTMLElement | null;
        if (copyBtn) {
          e.stopPropagation();
          const code = decodeURIComponent(copyBtn.getAttribute("data-code") || "");
          navigator.clipboard.writeText(code);
          const span = copyBtn.querySelector("span");
          if (span) span.textContent = "Copied!";
          copyBtn.classList.add("text-hub-green");
          setTimeout(() => {
            if (span) span.textContent = "Copy";
            copyBtn.classList.remove("text-hub-green");
          }, 2000);
          return;
        }

        // 2. Code toggle button or code header
        const codeToggle = target.closest(".btn-toggle-code") as HTMLElement | null;
        const codeHeader = target.closest(".code-block-header") as HTMLElement | null;
        if (codeToggle || codeHeader) {
          const wrapper = (codeToggle || codeHeader)!.closest(".code-block-wrapper") as HTMLElement | null;
          if (wrapper) {
            const isOpen = wrapper.classList.toggle("open");
            const toggleSpan = wrapper.querySelector(".btn-toggle-code span");
            if (toggleSpan) toggleSpan.textContent = isOpen ? "Collapse" : "Expand";
          }
          return;
        }

        // 3. Question (H3) toggle
        const h3 = target.closest("h3.collapsible-heading") as HTMLElement | null;
        if (h3) {
          const q = h3.closest(".collapsible-question") as HTMLElement | null;
          if (q) {
            const isOpen = q.classList.toggle("open");
            h3.setAttribute("aria-expanded", String(isOpen));
          }
          return;
        }

        // 4. Section (H2) toggle
        const h2 = target.closest("h2.collapsible-heading") as HTMLElement | null;
        if (h2) {
          const sec = h2.closest(".collapsible-section") as HTMLElement | null;
          if (sec) {
            const isOpen = sec.classList.toggle("open");
            h2.setAttribute("aria-expanded", String(isOpen));
          }
          return;
        }

        // 5. Mermaid Toggle Button (View Code <-> View Diagram)
        const mermaidToggle = target.closest(".mermaid-toggle-btn") as HTMLElement | null;
        if (mermaidToggle) {
          e.stopPropagation();
          const wrapper = mermaidToggle.closest(".mermaid-block-wrapper") as HTMLElement | null;
          if (wrapper) {
            const preview = wrapper.querySelector(".mermaid-preview-container") as HTMLElement | null;
            const codeView = wrapper.querySelector(".mermaid-code-view") as HTMLElement | null;
            const span = mermaidToggle.querySelector("span");
            if (preview && codeView) {
              const isShowingCode = !codeView.classList.contains("hidden");
              if (isShowingCode) {
                codeView.classList.add("hidden");
                preview.classList.remove("hidden");
                if (span) span.textContent = "View Code";
              } else {
                codeView.classList.remove("hidden");
                preview.classList.add("hidden");
                if (span) span.textContent = "View Diagram";
              }
            }
          }
          return;
        }

        // 6. Mermaid Copy Code Button
        const mermaidCopy = target.closest(".mermaid-copy-btn") as HTMLElement | null;
        if (mermaidCopy) {
          e.stopPropagation();
          const code = decodeURIComponent(mermaidCopy.getAttribute("data-code") || "");
          navigator.clipboard.writeText(code);
          const span = mermaidCopy.querySelector("span");
          if (span) span.textContent = "Copied!";
          mermaidCopy.classList.add("text-emerald-400");
          setTimeout(() => {
            if (span) span.textContent = "Copy";
            mermaidCopy.classList.remove("text-emerald-400");
          }, 2000);
          return;
        }

        // 7. Mermaid Error Inspect Button (Open Error Modal)
        const errorBtn = target.closest(".btn-mermaid-inspect-error") as HTMLElement | null;
        if (errorBtn && onInspectMermaidError) {
          e.stopPropagation();
          const wrapper = errorBtn.closest(".mermaid-block-wrapper") as HTMLElement | null;
          const errorMsg = decodeURIComponent(errorBtn.getAttribute("data-error") || "Mermaid syntax error");
          const rawCode = decodeURIComponent(wrapper?.getAttribute("data-mermaid-code") || "");
          onInspectMermaidError({
            errorMessage: errorMsg,
            rawCode,
          });
          return;
        }

        // 8. Mermaid Error "View Code" shortcut
        const showCodeBtn = target.closest(".btn-mermaid-show-code") as HTMLElement | null;
        if (showCodeBtn) {
          e.stopPropagation();
          const wrapper = showCodeBtn.closest(".mermaid-block-wrapper") as HTMLElement | null;
          if (wrapper) {
            const preview = wrapper.querySelector(".mermaid-preview-container") as HTMLElement | null;
            const codeView = wrapper.querySelector(".mermaid-code-view") as HTMLElement | null;
            const toggleSpan = wrapper.querySelector(".mermaid-toggle-btn span");
            if (preview && codeView) {
              codeView.classList.remove("hidden");
              preview.classList.add("hidden");
              if (toggleSpan) toggleSpan.textContent = "View Diagram";
            }
          }
          return;
        }
      },
      [onInspectMermaidError]
    );

    // Dynamic Conditional Mermaid Rendering (Loads mermaid only when needed)
    useEffect(() => {
      // Resolve container element from forwarded ref
      const container =
        ref && typeof ref !== "function" && ref.current
          ? ref.current
          : document.querySelector<HTMLElement>(".markdown-body");

      if (!container) return;

      const mermaidBlocks = container.querySelectorAll<HTMLElement>(".mermaid-block-wrapper");
      if (mermaidBlocks.length === 0) return; // Zero overhead if no mermaid blocks!

      let isMounted = true;

      async function renderMermaid() {
        try {
          const mermaid = (await import("mermaid")).default;
          mermaid.initialize({
            startOnLoad: false,
            suppressErrorRendering: true,
            theme: "dark",
            darkMode: true,
            themeVariables: {
              darkMode: true,
              background: "#090d13",
              primaryColor: "#0f172a",
              primaryTextColor: "#f1f5f9",
              primaryBorderColor: "#00ff88",
              lineColor: "#38bdf8",
              secondaryColor: "#1e1b4b",
              tertiaryColor: "#0f172a",
              noteBkgColor: "#161b22",
              noteTextColor: "#cbd5e1",
              noteBorderColor: "#38bdf8",
              actorBkg: "#0f172a",
              actorBorder: "#00ff88",
              actorTextColor: "#f1f5f9",
              signalColor: "#38bdf8",
              signalTextColor: "#f1f5f9",
            },
            fontFamily: "inherit",
            securityLevel: "loose",
          });

          const renderTasks = Array.from(mermaidBlocks).map(async (block, i) => {
            if (!isMounted) return;
            const targetEl = block.querySelector<HTMLElement>(".mermaid-target");
            const loadingEl = block.querySelector<HTMLElement>(".mermaid-loading-indicator");
            const rawCode = decodeURIComponent(block.getAttribute("data-mermaid-code") || "");

            if (!targetEl || targetEl.getAttribute("data-rendered") === "true") return;

            const chartId = `mermaid_chart_${Date.now()}_${i}`;

            // Clean up any lingering temporary DOM nodes from prior attempts
            document.getElementById(chartId)?.remove();
            document.getElementById(`d${chartId}`)?.remove();

            try {
              // Validate syntax with parse()
              await mermaid.parse(rawCode, { suppressErrors: false });

              // If parse succeeded, render the diagram SVG
              const { svg } = await mermaid.render(chartId, rawCode);
              if (!isMounted) return;

              targetEl.innerHTML = svg;
              targetEl.setAttribute("data-rendered", "true");
              if (loadingEl) loadingEl.style.display = "none";
            } catch (renderError: any) {
              console.warn(`Mermaid diagram #${i} syntax issue:`, renderError?.message || renderError);
              if (!isMounted) return;

              document.getElementById(chartId)?.remove();
              document.getElementById(`d${chartId}`)?.remove();

              const errorMessage =
                renderError?.message ||
                (typeof renderError === "string" ? renderError : "Diagram syntax or compilation error");

              targetEl.setAttribute("data-rendered", "error");
              if (loadingEl) loadingEl.style.display = "none";

              targetEl.innerHTML = `
                <div class="mermaid-error-banner w-full max-w-xl mx-auto my-3 p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 backdrop-blur-sm text-center flex flex-col items-center gap-3 animate-in fade-in">
                  <div class="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/25 flex items-center justify-center text-rose-400">
                    <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
                      <line x1="12" y1="9" x2="12" y2="13"/>
                      <line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <div class="space-y-1">
                    <h4 class="text-sm font-semibold text-rose-300">Mermaid Diagram Error</h4>
                    <p class="text-xs text-gray-300 max-w-md">Failed to render diagram due to a syntax error in the definition.</p>
                  </div>
                  <div class="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      class="btn-mermaid-inspect-error inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/35 hover:border-rose-500/60 transition-all cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                      data-error="${encodeURIComponent(errorMessage)}"
                    >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                      </svg>
                      <span>View Error Details</span>
                    </button>
                    <button
                      type="button"
                      class="btn-mermaid-show-code inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                    >
                      <span>View Code</span>
                    </button>
                  </div>
                </div>
              `;
            }
          });

          await Promise.allSettled(renderTasks);
        } catch (loadError) {
          console.error("Failed to dynamically load Mermaid:", loadError);
        }
      }

      renderMermaid();

      return () => {
        isMounted = false;
      };
    }, [html, ref]);

    // Initialize and persist checkbox states in localStorage
    useEffect(() => {
      const container =
        ref && typeof ref !== "function" && ref.current
          ? ref.current
          : document.querySelector<HTMLElement>(".markdown-body");

      if (!container) return;

      const checkboxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
      if (checkboxes.length === 0) return;

      const storageKey = `doc-checks-${encodeURIComponent(title)}`;
      let savedChecks: Record<number, boolean> = {};
      try {
        savedChecks = JSON.parse(localStorage.getItem(storageKey) || "{}");
      } catch {}

      checkboxes.forEach((cb, idx) => {
        cb.removeAttribute("disabled");
        cb.classList.add("cursor-pointer", "accent-hub-green", "w-4", "h-4", "mr-2");
        if (savedChecks[idx] !== undefined) {
          cb.checked = savedChecks[idx];
        }
        cb.onchange = () => {
          savedChecks[idx] = cb.checked;
          try {
            localStorage.setItem(storageKey, JSON.stringify(savedChecks));
          } catch {}
        };
      });
    }, [title, html, ref]);

    return (
      <article
        ref={ref}
        onClick={handleArticleClick}
        className={cn(
          "markdown-body bg-hub-card border border-hub-border rounded-2xl p-4 sm:p-10 shadow-xl w-full max-w-full min-w-0",
          className
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
);

DocArticle.displayName = "DocArticle";
