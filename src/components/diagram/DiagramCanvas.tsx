"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { DiagramNodesMap } from "@/lib/types";
import { DiagramControls } from "./DiagramControls";
import { NodeDrawer } from "./NodeDrawer";

interface DiagramCanvasProps {
  svgContent: string;
  nodes: DiagramNodesMap;
  nodeCircles?: Record<string, { x: number; y: number; r: number }>;
  title: string;
  embedMode?: boolean;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  svgContent,
  nodes,
  nodeCircles = {},
  title,
  embedMode = false,
}) => {
  const searchParams = useSearchParams();
  const isEmbed = embedMode || searchParams?.get("embed") === "true";
  const containerRef = useRef<HTMLDivElement>(null);
  const svgWrapperRef = useRef<HTMLDivElement>(null);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Transform state: translate and scale
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const isPanningRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const mouseDownPosRef = useRef({ x: 0, y: 0 });

  // Update SVG DOM transform
  const updateTransform = useCallback(() => {
    const svgEl = svgWrapperRef.current?.querySelector("svg");
    if (svgEl) {
      const { x, y, scale } = transformRef.current;
      svgEl.style.transformOrigin = "0 0";
      svgEl.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
    }
  }, []);

  // Center and fit SVG on mount and reset
  const fitToScreen = useCallback(() => {
    const container = containerRef.current;
    const svgEl = svgWrapperRef.current?.querySelector("svg");
    if (!container || !svgEl) return;

    const cWidth = container.clientWidth;
    const cHeight = container.clientHeight;

    const viewBox = svgEl.viewBox?.baseVal;
    const svgWidth = viewBox?.width || parseFloat(svgEl.getAttribute("width") || "2126") || 2126;
    const svgHeight = viewBox?.height || parseFloat(svgEl.getAttribute("height") || "2127") || 2127;

    const scaleX = (cWidth * 0.92) / svgWidth;
    const scaleY = (cHeight * 0.92) / svgHeight;
    const initialScale = Math.min(scaleX, scaleY, 1.2);

    const x = (cWidth - svgWidth * initialScale) / 2;
    const y = (cHeight - svgHeight * initialScale) / 2;

    transformRef.current = { x, y, scale: initialScale };
    updateTransform();
  }, [updateTransform]);

  // Initial fit
  useEffect(() => {
    fitToScreen();
    const handleResize = () => updateTransform();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [fitToScreen, updateTransform]);

  // Hit-testing helper
  const getNodeFromCoords = useCallback(
    (clientX: number, clientY: number, target: Element | null): string | null => {
      const svgEl = svgWrapperRef.current?.querySelector("svg");
      if (!svgEl) return null;

      // 1. Precise circle geometry hit test
      let coordNode: string | null = null;
      let smallestR = Infinity;
      try {
        const pt = svgEl.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;
        const svgPt = pt.matrixTransform(svgEl.getScreenCTM()?.inverse());
        for (const [nId, circle] of Object.entries(nodeCircles)) {
          const d = Math.hypot(svgPt.x - circle.x, svgPt.y - circle.y);
          if (d <= circle.r + 12) {
            if (circle.r < smallestR) {
              smallestR = circle.r;
              coordNode = nId;
            }
          }
        }
      } catch {}

      // 2. DOM target check
      const nodeGroup = target ? target.closest("[data-node]") : null;
      const domNode = nodeGroup ? nodeGroup.getAttribute("data-node") : null;

      if (coordNode && domNode && coordNode !== domNode) {
        const rCoord = nodeCircles[coordNode]?.r || Infinity;
        const rDom = nodeCircles[domNode]?.r || Infinity;
        return rCoord < rDom ? coordNode : domNode;
      }

      return coordNode || domNode;
    },
    [nodeCircles]
  );

  // Pan & Zoom Event Listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onMouseDown = (e: MouseEvent) => {
      if ((e.target as HTMLElement)?.closest("#info-drawer") || (e.target as HTMLElement)?.closest("aside")) return;
      isPanningRef.current = true;
      startRef.current = {
        x: e.clientX - transformRef.current.x,
        y: e.clientY - transformRef.current.y,
      };
      mouseDownPosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isPanningRef.current) return;
      transformRef.current.x = e.clientX - startRef.current.x;
      transformRef.current.y = e.clientY - startRef.current.y;
      updateTransform();
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isPanningRef.current) return;
      isPanningRef.current = false;

      const dist = Math.hypot(e.clientX - mouseDownPosRef.current.x, e.clientY - mouseDownPosRef.current.y);
      if (dist <= 6) {
        // Click action
        const matched = getNodeFromCoords(e.clientX, e.clientY, e.target as Element);
        if (matched && nodes[matched]) {
          setSelectedNodeId((prev) => (prev === matched ? null : matched));
        } else {
          // Clicked outside
          setSelectedNodeId(null);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const { x, y, scale } = transformRef.current;
      const xs = (e.clientX - x) / scale;
      const ys = (e.clientY - y) / scale;
      const factor = e.deltaY < 0 ? 1.15 : 0.85;
      const nextScale = Math.min(Math.max(0.1, scale * factor), 15);

      transformRef.current.x = e.clientX - xs * nextScale;
      transformRef.current.y = e.clientY - ys * nextScale;
      transformRef.current.scale = nextScale;
      updateTransform();
    };

    // Touch event handling (smooth mobile pinch and drag)
    let touchStartDist = 0;
    let initialTouchScale = 1;
    let touchStartPos = { x: 0, y: 0 };
    let touchStartTime = 0;
    let isTouching = false;
    let isTouchDragging = false;

    const onTouchStart = (e: TouchEvent) => {
      if ((e.target as HTMLElement)?.closest("#info-drawer") || (e.target as HTMLElement)?.closest("aside")) return;
      if (e.touches.length === 1) {
        isTouching = true;
        isTouchDragging = false;
        const t = e.touches[0];
        touchStartPos = { x: t.clientX, y: t.clientY };
        touchStartTime = Date.now();
        startRef.current = {
          x: t.clientX - transformRef.current.x,
          y: t.clientY - transformRef.current.y,
        };
      } else if (e.touches.length === 2) {
        isTouching = true;
        isTouchDragging = true;
        touchStartDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialTouchScale = transformRef.current.scale;
        const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
        const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        startRef.current = {
          x: midX - transformRef.current.x,
          y: midY - transformRef.current.y,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTouching) return;
      if (e.touches.length === 1) {
        const t = e.touches[0];
        const dist = Math.hypot(t.clientX - touchStartPos.x, t.clientY - touchStartPos.y);
        if (!isTouchDragging && dist > 10) {
          isTouchDragging = true;
          startRef.current = {
            x: t.clientX - transformRef.current.x,
            y: t.clientY - transformRef.current.y,
          };
        }
        if (isTouchDragging) {
          transformRef.current.x = t.clientX - startRef.current.x;
          transformRef.current.y = t.clientY - startRef.current.y;
          updateTransform();
        }
      } else if (e.touches.length === 2) {
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (touchStartDist > 0) {
          const factor = currentDist / touchStartDist;
          const nextScale = Math.min(Math.max(0.1, initialTouchScale * factor), 15);
          const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
          const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
          const xs = (midX - transformRef.current.x) / transformRef.current.scale;
          const ys = (midY - transformRef.current.y) / transformRef.current.scale;

          transformRef.current.x = midX - xs * nextScale;
          transformRef.current.y = midY - ys * nextScale;
          transformRef.current.scale = nextScale;
          updateTransform();
        }
      }
      if (e.cancelable) e.preventDefault();
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!isTouching) return;
      if (e.touches.length === 0) {
        isTouching = false;
        const change = e.changedTouches[0];
        if (change) {
          const dist = Math.hypot(change.clientX - touchStartPos.x, change.clientY - touchStartPos.y);
          const timeElapsed = Date.now() - touchStartTime;
          if (!isTouchDragging && dist < 24 && timeElapsed < 600) {
            const target = document.elementFromPoint(touchStartPos.x, touchStartPos.y);
            const matched = getNodeFromCoords(touchStartPos.x, touchStartPos.y, target);
            if (matched && nodes[matched]) {
              setSelectedNodeId((prev) => (prev === matched ? null : matched));
            } else {
              setSelectedNodeId(null);
            }
          }
        }
        isTouchDragging = false;
      }
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });
    container.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: false });

    return () => {
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [getNodeFromCoords, nodes, updateTransform]);

  // Search filtering & node highlighting in SVG
  const matchedNodes = useMemo(() => {
    if (!searchTerm.trim()) return null;
    const query = searchTerm.toLowerCase();
    const set = new Set<string>();
    for (const [id, node] of Object.entries(nodes)) {
      if (
        id.toLowerCase().includes(query) ||
        node.title.toLowerCase().includes(query) ||
        node.category.toLowerCase().includes(query) ||
        node.badge?.toLowerCase().includes(query) ||
        node.summary.toLowerCase().includes(query) ||
        node.searchTerms?.some((t) => t.toLowerCase().includes(query))
      ) {
        set.add(id);
      }
    }
    return set;
  }, [nodes, searchTerm]);

  // Apply highlight classes to SVG elements
  useEffect(() => {
    const svgEl = svgWrapperRef.current?.querySelector("svg");
    if (!svgEl) return;

    const nodeGroups = svgEl.querySelectorAll<SVGGElement>("g[data-node]");
    nodeGroups.forEach((g) => {
      const nId = g.getAttribute("data-node") || "";

      // Selected node
      if (selectedNodeId && nId === selectedNodeId) {
        g.classList.add("is-selected");
      } else {
        g.classList.remove("is-selected");
      }

      // Search match / dim
      if (matchedNodes) {
        if (matchedNodes.has(nId)) {
          g.classList.remove("is-dimmed");
          g.classList.add("is-selected");
        } else {
          g.classList.add("is-dimmed");
          if (nId !== selectedNodeId) {
            g.classList.remove("is-selected");
          }
        }
      } else if (!selectedNodeId) {
        g.classList.remove("is-dimmed");
        g.classList.remove("is-selected");
      }
    });
  }, [matchedNodes, selectedNodeId]);

  // Controls actions
  const handleZoomIn = () => {
    const container = containerRef.current;
    if (!container) return;
    const cx = container.clientWidth / 2;
    const cy = container.clientHeight / 2;
    const { x, y, scale } = transformRef.current;
    const xs = (cx - x) / scale;
    const ys = (cy - y) / scale;
    const nextScale = Math.min(scale * 1.3, 15);
    transformRef.current.x = cx - xs * nextScale;
    transformRef.current.y = cy - ys * nextScale;
    transformRef.current.scale = nextScale;
    updateTransform();
  };

  const handleZoomOut = () => {
    const container = containerRef.current;
    if (!container) return;
    const cx = container.clientWidth / 2;
    const cy = container.clientHeight / 2;
    const { x, y, scale } = transformRef.current;
    const xs = (cx - x) / scale;
    const ys = (cy - y) / scale;
    const nextScale = Math.max(scale * 0.75, 0.1);
    transformRef.current.x = cx - xs * nextScale;
    transformRef.current.y = cy - ys * nextScale;
    transformRef.current.scale = nextScale;
    updateTransform();
  };

  const selectedNode = selectedNodeId ? nodes[selectedNodeId] || null : null;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none bg-[#121212] touch-none ${
        isEmbed ? "fixed inset-0 z-50" : "flex-1"
      }`}
    >
      {/* SVG Canvas wrapper */}
      <div
        ref={svgWrapperRef}
        className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />

      {/* Floating Diagram Controls */}
      <DiagramControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={fitToScreen}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        matchedCount={matchedNodes ? matchedNodes.size : undefined}
        totalCount={Object.keys(nodes).length}
        embedMode={isEmbed}
      />

      {/* Floating Canvas Hint */}
      <div className="fixed bottom-5 left-6 bg-[#0f172a]/85 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 text-xs text-gray-400 flex items-center gap-2 pointer-events-none shadow-xl z-30">
        <span className="w-2 h-2 rounded-full bg-hub-blue shadow-[0_0_8px_#38bdf8]" />
        <span>Click any service to inspect • Drag to pan • Scroll to zoom</span>
      </div>

      {/* Slide-over Detail Drawer */}
      <div id="info-drawer">
        <NodeDrawer
          nodeId={selectedNodeId}
          node={selectedNode}
          onClose={() => setSelectedNodeId(null)}
          onTagClick={(tag) => setSearchTerm(tag)}
        />
      </div>
    </div>
  );
};
