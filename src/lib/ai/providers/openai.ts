import { AISettings, ChatMessage } from "../types";

/**
 * Placeholder implementation for OpenAI ChatGPT API.
 * Uses https://api.openai.com/v1/chat/completions structure.
 */
export async function callOpenAI(
  settings: AISettings,
  _messages: ChatMessage[],
  _systemPrompt: string
): Promise<string> {
  const model = settings.model || "gpt-4o";

  throw new Error(
    `OpenAI (${model}) integration is in placeholder mode. Select 'Google Gemini' to use the active free AI engine.`
  );
}
