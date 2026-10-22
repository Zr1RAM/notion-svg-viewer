import { AISettings, ChatMessage } from "../types";

/**
 * Placeholder implementation for Moonshot Kimi API.
 * Uses https://api.moonshot.cn/v1/chat/completions structure.
 */
export async function callKimi(
  settings: AISettings,
  _messages: ChatMessage[],
  _systemPrompt: string
): Promise<string> {
  const model = settings.model || "moonshot-v1-8k";

  throw new Error(
    `Moonshot Kimi (${model}) integration is in placeholder mode. Select 'Google Gemini' for the live active engine.`
  );
}
