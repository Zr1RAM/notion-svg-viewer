export type AIProvider = "gemini" | "claude" | "openai" | "local" | "kimi";

export interface AISettings {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface ProviderInfo {
  id: AIProvider;
  name: string;
  badge: string;
  defaultModel: string;
  supportedModels: string[];
  placeholderKey: string;
  keyHelpUrl?: string;
  keyHelpText?: string;
  requiresBaseUrl?: boolean;
  defaultBaseUrl?: string;
  isLive: boolean;
}

export const PROVIDERS: ProviderInfo[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    badge: "Active",
    defaultModel: "gemini-2.5-flash",
    supportedModels: [
      "gemini-2.5-flash",
      "gemini-2.5-pro",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
      "gemini-1.5-pro",
    ],
    placeholderKey: "AIzaSy...",
    keyHelpUrl: "https://aistudio.google.com/app/apikey",
    keyHelpText: "Get free Gemini API key at Google AI Studio",
    isLive: true,
  },
  {
    id: "claude",
    name: "Anthropic Claude",
    badge: "Placeholder",
    defaultModel: "claude-3-5-sonnet-latest",
    supportedModels: ["claude-3-5-sonnet-latest", "claude-3-5-haiku-latest"],
    placeholderKey: "sk-ant-...",
    keyHelpUrl: "https://console.anthropic.com/",
    keyHelpText: "Get key from Anthropic Console",
    isLive: false,
  },
  {
    id: "openai",
    name: "ChatGPT (OpenAI)",
    badge: "Placeholder",
    defaultModel: "gpt-4o",
    supportedModels: ["gpt-4o", "gpt-4o-mini", "o3-mini"],
    placeholderKey: "sk-proj-...",
    keyHelpUrl: "https://platform.openai.com/api-keys",
    keyHelpText: "Get key from OpenAI Platform",
    isLive: false,
  },
  {
    id: "local",
    name: "Local LLM (Ollama / LMStudio)",
    badge: "Placeholder",
    defaultModel: "llama3.2",
    supportedModels: ["llama3.2", "mistral", "qwen2.5-coder", "deepseek-r1"],
    placeholderKey: "ollama (or leave blank)",
    requiresBaseUrl: true,
    defaultBaseUrl: "http://localhost:11434",
    keyHelpText: "Runs locally on your machine via Ollama or LMStudio",
    isLive: false,
  },
  {
    id: "kimi",
    name: "Moonshot Kimi",
    badge: "Placeholder",
    defaultModel: "moonshot-v1-8k",
    supportedModels: ["moonshot-v1-8k", "moonshot-v1-32k"],
    placeholderKey: "sk-...",
    keyHelpUrl: "https://platform.moonshot.cn/",
    keyHelpText: "Get key from Moonshot Open Platform",
    isLive: false,
  },
];

export const DEFAULT_AI_SETTINGS: AISettings = {
  provider: "gemini",
  apiKey: "",
  model: "gemini-2.5-flash",
};
