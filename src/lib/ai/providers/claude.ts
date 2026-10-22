import { AISettings, ChatMessage } from "../types";

/**
 * Placeholder implementation for Anthropic Claude Messages API.
 * Direct browser calls to https://api.anthropic.com/v1/messages are blocked by Anthropic's CORS policy.
 * When enabling in production, route through a Next.js API route or proxy with dangerous-allow-browser header.
 */
export async function callClaude(
  settings: AISettings,
  _messages: ChatMessage[],
  _systemPrompt: string
): Promise<string> {
  const model = settings.model || "claude-3-5-sonnet-latest";

  // Simulate or document proxy requirement
  throw new Error(
    `Claude integration (${model}) is currently in placeholder mode. Direct browser requests to Anthropic are blocked by CORS. Please select 'Google Gemini' for the live browser client, or implement an API route proxy for Claude.`
  );
}
