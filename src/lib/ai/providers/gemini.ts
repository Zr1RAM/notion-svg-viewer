import { AISettings, ChatMessage } from "../types";

export async function callGemini(
  settings: AISettings,
  messages: ChatMessage[],
  systemPrompt: string
): Promise<string> {
  const apiKey = settings.apiKey?.trim();
  if (!apiKey) {
    throw new Error("Missing Gemini API key. Please configure your key in settings.");
  }

  const model = settings.model || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`;

  // Convert ChatMessage history to Gemini contents structure
  const contents = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

  if (contents.length === 0) {
    throw new Error("No messages to send.");
  }

  const payload: Record<string, unknown> = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2500,
    },
  };

  if (systemPrompt) {
    payload.system_instruction = {
      parts: [{ text: systemPrompt }],
    };
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Network error communicating with Google Gemini: ${message}`);
  }

  const data = await res.json();

  if (!res.ok) {
    const errorMsg = data?.error?.message || `HTTP ${res.status} ${res.statusText}`;
    if (res.status === 400 && errorMsg.toLowerCase().includes("key")) {
      throw new Error("Invalid Gemini API Key. Please update your key in the settings tab.");
    }
    if (res.status === 429) {
      throw new Error("Gemini rate limit exceeded. Please wait a moment before trying again.");
    }
    throw new Error(`Gemini API Error: ${errorMsg}`);
  }

  const candidate = data.candidates?.[0];
  if (!candidate) {
    if (data.promptFeedback?.blockReason) {
      throw new Error(`Response blocked by safety filters: ${data.promptFeedback.blockReason}`);
    }
    throw new Error("Gemini returned an empty response.");
  }

  const replyText = candidate.content?.parts?.map((p: { text?: string }) => p.text || "").join("") || "";
  if (!replyText.trim()) {
    throw new Error("Gemini generated an empty response text.");
  }

  return replyText;
}

export interface GeminiModelOption {
  id: string;
  displayName: string;
  description?: string;
}

/**
 * Fetch available models dynamically from Google's Generative Language API using the provided API key.
 * Only returns models that support generateContent.
 */
export async function fetchGeminiModels(apiKey: string): Promise<GeminiModelOption[]> {
  const cleanKey = apiKey.trim();
  if (!cleanKey) {
    throw new Error("API key is required to fetch available models.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
    cleanKey
  )}`;

  let res: Response;
  try {
    res = await fetch(url);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Network error connecting to Google Models API: ${msg}`);
  }

  const data = await res.json();
  if (!res.ok) {
    const errorMsg = data?.error?.message || `HTTP ${res.status}`;
    if (res.status === 400 && errorMsg.toLowerCase().includes("key")) {
      throw new Error("Invalid API Key. Please verify your Gemini API key.");
    }
    throw new Error(`Google API Error: ${errorMsg}`);
  }

  const rawModels: Array<{
    name?: string;
    displayName?: string;
    description?: string;
    supportedGenerationMethods?: string[];
  }> = data?.models || [];

  const chatModels: GeminiModelOption[] = rawModels
    .filter((m) => m.supportedGenerationMethods?.includes("generateContent"))
    .map((m) => {
      const id = (m.name || "").replace(/^models\//, "");
      return {
        id,
        displayName: m.displayName || id,
        description: m.description,
      };
    })
    .filter((m) => m.id.length > 0);

  if (chatModels.length === 0) {
    throw new Error("No chat-compatible models returned by Google for this key.");
  }

  // Sort with latest & recommended models at the top
  chatModels.sort((a, b) => {
    const getScore = (id: string) => {
      if (id.startsWith("gemini-2.5-flash")) return 110;
      if (id.startsWith("gemini-2.5-pro")) return 105;
      if (id.startsWith("gemini-2.0-flash")) return 100;
      if (id.startsWith("gemini-2.0-pro")) return 95;
      if (id.startsWith("gemini-1.5-flash")) return 80;
      if (id.startsWith("gemini-1.5-pro")) return 75;
      if (id.includes("flash")) return 60;
      if (id.includes("pro")) return 50;
      return 10;
    };
    return getScore(b.id) - getScore(a.id);
  });

  return chatModels;
}

