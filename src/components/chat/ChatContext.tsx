"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  AISettings,
  ChatMessage,
  DocumentContext,
  loadAISettings,
  saveAISettings,
  clearAISettings,
  sendChatMessage,
  buildSystemPromptWithContext,
  DEFAULT_AI_SETTINGS,
} from "@/lib/ai";

interface ChatContextType {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleChat: () => void;
  // Settings
  settings: AISettings | null;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  saveSettings: (settings: AISettings) => void;
  resetSettings: () => void;
  // Conversation
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  // Active Document context
  docContext?: DocumentContext;
  setDocContext: (context?: DocumentContext) => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

const CHAT_HISTORY_STORAGE_KEY = "hub_chat_messages_v1";

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AISettings | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docContext, setDocContext] = useState<DocumentContext | undefined>(undefined);
  const [mounted, setMounted] = useState(false);

  // Initialize settings and message history on client mount
  useEffect(() => {
    setMounted(true);
    const savedSettings = loadAISettings();
    setSettings(savedSettings);

    try {
      const savedMessages = sessionStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } catch {}
  }, []);

  const toggleChat = useCallback(() => setIsOpen((prev) => !prev), []);

  const handleSaveSettings = useCallback((newSettings: AISettings) => {
    saveAISettings(newSettings);
    setSettings(newSettings);
    setIsSettingsOpen(false);
    setError(null);
  }, []);

  const handleResetSettings = useCallback(() => {
    clearAISettings();
    setSettings(null);
    setIsSettingsOpen(true);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    try {
      sessionStorage.removeItem(CHAT_HISTORY_STORAGE_KEY);
    } catch {}
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) return;

      if (!settings || !settings.apiKey) {
        setIsSettingsOpen(true);
        setError("Please configure your AI Provider and API key before chatting.");
        return;
      }

      setError(null);

      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };

      const newHistory = [...messages, userMessage];
      setMessages(newHistory);
      try {
        sessionStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
      } catch {}

      setIsLoading(true);

      try {
        const systemPrompt = buildSystemPromptWithContext(docContext);
        const replyText = await sendChatMessage(settings, newHistory, systemPrompt);

        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          role: "assistant",
          content: replyText,
          timestamp: Date.now(),
        };

        const updatedHistory = [...newHistory, assistantMessage];
        setMessages(updatedHistory);
        try {
          sessionStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
        } catch {}
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [settings, messages, isLoading, docContext]
  );

  return (
    <ChatContext.Provider
      value={{
        isOpen,
        setIsOpen,
        toggleChat,
        settings,
        isSettingsOpen: !settings ? true : isSettingsOpen,
        setIsSettingsOpen,
        saveSettings: handleSaveSettings,
        resetSettings: handleResetSettings,
        messages,
        isLoading,
        error,
        sendMessage,
        clearMessages,
        docContext,
        setDocContext,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};
