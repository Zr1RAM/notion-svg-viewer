import { AISettings, ChatMessage, DEFAULT_AI_SETTINGS } from "./types";
import { callGemini } from "./providers/gemini";
import { callClaude } from "./providers/claude";
import { callOpenAI } from "./providers/openai";
import { callLocalLlm } from "./providers/localLlm";
import { callKimi } from "./providers/kimi";

export * from "./types";
export * from "./prompts";
export * from "./exporter";
export { fetchGeminiModels } from "./providers/gemini";
export type { GeminiModelOption } from "./providers/gemini";

export const AI_SETTINGS_STORAGE_KEY = "hub_ai_settings";

/**
 * Load saved AI settings from localStorage. Returns null if not configured or empty apiKey.
 */
export function loadAISettings(): AISettings | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AI_SETTINGS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<AISettings>;
    if (!parsed.provider || !parsed.apiKey) return null;

    return {
      provider: parsed.provider,
      apiKey: parsed.apiKey.trim(),
      model: parsed.model || DEFAULT_AI_SETTINGS.model,
      baseUrl: parsed.baseUrl,
    };
  } catch {
    return null;
  }
}

/**
 * Save AI settings to localStorage.
 */
export function saveAISettings(settings: AISettings): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(AI_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error("Failed to persist AI settings to localStorage:", err);
  }
}

/**
 * Clear saved AI settings.
 */
export function clearAISettings(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AI_SETTINGS_STORAGE_KEY);
  } catch {}
}

/**
 * Central dispatcher routing to the configured provider strategy.
 */
export async function sendChatMessage(
  settings: AISettings,
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  switch (settings.provider) {
    case "gemini":
      return callGemini(settings, messages, systemPrompt);
    case "claude":
      return callClaude(settings, messages, systemPrompt);
    case "openai":
      return callOpenAI(settings, messages, systemPrompt);
    case "local":
      return callLocalLlm(settings, messages, systemPrompt);
    case "kimi":
      return callKimi(settings, messages, systemPrompt);
    default:
      throw new Error(`Unsupported AI provider: ${String((settings as AISettings).provider)}`);
  }
}
