import { AISettings, ChatMessage } from "../types";

/**
 * Placeholder implementation for Local LLMs (Ollama / LMStudio / LocalAI).
 * Expects an OpenAI-compatible endpoint like http://localhost:11434/v1/chat/completions.
 */
export async function callLocalLlm(
  settings: AISettings,
  _messages: ChatMessage[],
  _systemPrompt: string
): Promise<string> {
  const endpoint = settings.baseUrl || "http://localhost:11434";
  const model = settings.model || "llama3.2";

  throw new Error(
    `Local LLM integration (${model} @ ${endpoint}) is in placeholder mode. Make sure Ollama or LMStudio is running with CORS enabled, or select 'Google Gemini' for the live engine.`
  );
}
