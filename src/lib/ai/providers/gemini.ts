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
