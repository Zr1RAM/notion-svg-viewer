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

  const model = settings.model || "gemini-2.5-flash";
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
 * Determines whether a model returned by Google's API is an active, currently supported chat model.
 * Strictly filters out deprecated, discontinued, retired, internal experimental, and non-chat models.
 */
function isActiveGeminiChatModel(raw: {
  name?: string;
  displayName?: string;
  description?: string;
  supportedGenerationMethods?: string[];
}): boolean {
  // 1. Must support content generation
  if (!raw.supportedGenerationMethods?.includes("generateContent")) {
    return false;
  }

  const id = (raw.name || "").replace(/^models\//, "").toLowerCase().trim();
  const desc = (raw.description || "").toLowerCase();
  const displayName = (raw.displayName || "").toLowerCase();

  // 2. Reject explicitly deprecated, discontinued, or retired models
  if (
    desc.includes("deprecated") ||
    desc.includes("discontinued") ||
    desc.includes("retired") ||
    displayName.includes("deprecated") ||
    displayName.includes("discontinued") ||
    displayName.includes("retired")
  ) {
    return false;
  }

  // 3. Must be a Gemini family model (excludes chat-bison, text-bison, aqa, etc.)
  if (!id.startsWith("gemini-")) {
    return false;
  }

  // 4. Exclude non-chat / specialized / embedding / image models
  if (
    id.includes("embedding") ||
    id.includes("imagen") ||
    id.includes("aqa") ||
    id.includes("gecko")
  ) {
    return false;
  }

  // 5. Exclude retired Gemini 1.0 models & legacy vision models (shut down by Google)
  if (
    id === "gemini-pro" ||
    id === "gemini-pro-vision" ||
    id.startsWith("gemini-1.0") ||
    id.startsWith("gemini-ultra")
  ) {
    return false;
  }

  // 6. Must be a modern supported generation (Gemini 1.5, 2.0, 2.5, or future 3.x+)
  const isSupportedVersion = /^gemini-(?:[2-9]\d*|1\.[5-9])/i.test(id);
  if (!isSupportedVersion) {
    return false;
  }

  // 7. Filter out outdated temporary experimental date-stamped snapshots (e.g. exp-0827, exp-0924)
  if (/-exp-\d{4}/i.test(id)) {
    return false;
  }

  // 8. Filter out legacy numbered snapshots (-001) where standard versions exist
  if (id.includes("-001") && (id.includes("1.5") || id.includes("2.0"))) {
    return false;
  }

  return true;
}

/**
 * Fetch available models dynamically from Google's Generative Language API using the provided API key.
 * Only returns active, currently supported chat models.
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
    .filter(isActiveGeminiChatModel)
    .map((m) => {
      const id = (m.name || "").replace(/^models\//, "");
      return {
        id,
        displayName: m.displayName || id,
        description: m.description,
      };
    })
    .filter((m) => m.id.length > 0);

  // Fallback to active standard lineup if no models match
  if (chatModels.length === 0) {
    return [
      { id: "gemini-2.5-flash", displayName: "Gemini 2.5 Flash" },
      { id: "gemini-2.5-pro", displayName: "Gemini 2.5 Pro" },
      { id: "gemini-2.0-flash", displayName: "Gemini 2.0 Flash" },
      { id: "gemini-1.5-flash", displayName: "Gemini 1.5 Flash" },
      { id: "gemini-1.5-pro", displayName: "Gemini 1.5 Pro" },
    ];
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

