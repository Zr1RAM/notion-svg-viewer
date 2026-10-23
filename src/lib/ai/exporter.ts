import { ChatMessage } from "./types";

/**
 * Formats full chat conversation history into readable Markdown.
 */
export function formatConversationAsMarkdown(
  messages: ChatMessage[],
  docTitle?: string
): string {
  const dateStr = new Date().toLocaleString();
  const headerLines = [
    `# AI Architect Chat Session`,
    docTitle ? `**Context / Document:** ${docTitle}` : "",
    `**Exported Date:** ${dateStr}`,
    `**Message Count:** ${messages.length}`,
    `\n---\n`,
  ];

  const header = headerLines.filter(Boolean).join("\n");

  const body = messages
    .map((msg) => {
      const sender = msg.role === "user" ? "### 👤 User" : "### 🤖 AI Architect";
      const time = new Date(msg.timestamp).toLocaleTimeString();
      return `${sender} *(${time})*\n\n${msg.content}\n\n---`;
    })
    .join("\n\n");

  return `${header}\n\n${body}\n`;
}

/**
 * Checks if the conversation exceeds the threshold for standard clipboard pasting.
 * Threshold defaults to 10,000 characters (~2,000 words).
 */
export function checkConversationSize(
  messages: ChatMessage[],
  thresholdChars = 10000
): { isTooLarge: boolean; totalChars: number; totalWords: number } {
  const totalChars = messages.reduce((acc, m) => acc + m.content.length, 0);
  const totalWords = messages.reduce((acc, m) => {
    const words = m.content.trim().split(/\s+/).filter(Boolean).length;
    return acc + words;
  }, 0);

  return {
    isTooLarge: totalChars > thresholdChars,
    totalChars,
    totalWords,
  };
}

/**
 * Generates and triggers a browser file download of the conversation as a .md file.
 */
export function exportConversationAsMarkdownFile(
  messages: ChatMessage[],
  docTitle?: string
): void {
  if (typeof window === "undefined" || messages.length === 0) return;

  const mdContent = formatConversationAsMarkdown(messages, docTitle);
  const blob = new Blob([mdContent], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const cleanTitle = (docTitle || "chat-session")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const dateTag = new Date().toISOString().slice(0, 10);
  const filename = `${cleanTitle || "ai-chat"}-${dateTag}.md`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies the full conversation to clipboard and ALWAYS provides/downloads
 * the conversation as a .md file.
 */
export async function copyConversation(
  messages: ChatMessage[],
  docTitle?: string
): Promise<boolean> {
  if (messages.length === 0) return false;

  // Always generate and download the .md file
  exportConversationAsMarkdownFile(messages, docTitle);

  // Copy Markdown formatted text to clipboard
  try {
    const mdContent = formatConversationAsMarkdown(messages, docTitle);
    await navigator.clipboard.writeText(mdContent);
    return true;
  } catch (err) {
    console.warn("Clipboard copy failed, but .md file was downloaded:", err);
    return false;
  }
}
