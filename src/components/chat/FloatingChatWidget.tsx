"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatPanel, ChatCorner } from "./ChatPanel";
import { useChat } from "./ChatContext";

type Corner = ChatCorner;

const TOP_OFFSET = 76; // Below navbar
const BOTTOM_MARGIN = 24;
const BTN_SIZE = 52; // 52px circle

export const FloatingChatWidget: React.FC = () => {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const { isOpen, setIsOpen } = useChat();
  const [corner, setCorner] = useState<Corner>("bottom");
  const [dragY, setDragY] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [windowHeight, setWindowHeight] = useState(800);

  const pointerDownRef = useRef(false);
  const startClientYRef = useRef(0);
  const startTopRef = useRef(0);
  const totalMovementRef = useRef(0);

  // Initialize and load saved corner
  useEffect(() => {
    setMounted(true);
    setWindowHeight(window.innerHeight);

    const saved = localStorage.getItem("hub_chat_corner");
    if (saved === "top" || saved === "bottom") {
      setCorner(saved);
    }

    const handleResize = () => setWindowHeight(window.innerHeight);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isEmbed = mounted && searchParams?.get("embed") === "true";

  // Calculate snapped Y position
  const getSnappedY = useCallback(
    (c: Corner) => {
      if (c === "top") return TOP_OFFSET;
      return Math.max(TOP_OFFSET, windowHeight - BTN_SIZE - BOTTOM_MARGIN);
    },
    [windowHeight]
  );

  const activeY = isDragging && dragY !== null ? dragY : getSnappedY(corner);

  // Pointer event handlers for vertical drag & corner snapping
  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    pointerDownRef.current = true;
    startClientYRef.current = e.clientY;
    startTopRef.current = getSnappedY(corner);
    totalMovementRef.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!pointerDownRef.current) return;

    const deltaY = e.clientY - startClientYRef.current;
    totalMovementRef.current = Math.abs(deltaY);

    if (totalMovementRef.current > 5) {
      if (!isDragging) setIsDragging(true);
      const minY = TOP_OFFSET;
      const maxY = Math.max(TOP_OFFSET, windowHeight - BTN_SIZE - BOTTOM_MARGIN);
      const newY = Math.max(minY, Math.min(maxY, startTopRef.current + deltaY));
      setDragY(newY);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!pointerDownRef.current) return;
    pointerDownRef.current = false;

    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // Ignored if already released
    }

    if (totalMovementRef.current > 5 && dragY !== null) {
      // It was a drag: snap to top or bottom based on vertical midpoint
      const midpoint = windowHeight / 2;
      const targetCorner: Corner = dragY < midpoint ? "top" : "bottom";
      setCorner(targetCorner);
      localStorage.setItem("hub_chat_corner", targetCorner);
    } else {
      // It was a clean click: toggle chat box
      setIsOpen((prev) => !prev);
    }

    setIsDragging(false);
    setDragY(null);
  };

  const handlePointerCancel = () => {
    pointerDownRef.current = false;
    setIsDragging(false);
    setDragY(null);
  };

  if (!mounted || isEmbed) {
    return null;
  }

  return (
    <>
      {/* Floating Circular Trigger Button */}
      <button
        type="button"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{
          top: `${activeY}px`,
          right: "24px",
          touchAction: "none",
        }}
        title={isOpen ? "Close Chat" : "Open Chat (Drag to reposition)"}
        className={cn(
          "fixed z-50 w-[52px] h-[52px] rounded-full flex items-center justify-center select-none shadow-2xl transition-transform",
          "bg-[#13161c]/95 border backdrop-blur-xl text-white",
          isDragging
            ? "cursor-grabbing scale-105 border-hub-green/80 shadow-[0_0_25px_rgba(0,255,136,0.35)]"
            : "cursor-grab hover:scale-105 hover:border-hub-green/50 hover:shadow-[0_0_20px_rgba(0,255,136,0.25)] border-white/15",
          isOpen && !isDragging && "border-hub-green/60 shadow-[0_0_20px_rgba(0,255,136,0.2)]",
          !isDragging && "transition-[top,transform,border-color,box-shadow] duration-300 ease-out"
        )}
      >
        {isOpen ? (
          <X className="w-5 h-5 text-hub-green transition-transform duration-200" />
        ) : (
          <div className="relative flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-hub-green" />
          </div>
        )}
      </button>

      {/* Floating Rounded Rect Chat Container */}
      <ChatPanel
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        corner={corner}
      />
    </>
  );
};
