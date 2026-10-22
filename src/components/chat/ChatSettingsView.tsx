"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  ShieldCheck,
  RefreshCw,
  X,
} from "lucide-react";
import {
  AIProvider,
  AISettings,
  PROVIDERS,
  DEFAULT_AI_SETTINGS,
  fetchGeminiModels,
  GeminiModelOption,
} from "@/lib/ai";
import { useChat } from "./ChatContext";

const GEMINI_MODELS_CACHE_KEY = "hub_gemini_models_cache";

export const ChatSettingsView: React.FC = () => {
  const { settings, saveSettings, resetSettings, setIsSettingsOpen } = useChat();

  const [provider, setProvider] = useState<AIProvider>(
    settings?.provider || DEFAULT_AI_SETTINGS.provider
  );
  const [apiKey, setApiKey] = useState(settings?.apiKey || "");
  const [model, setModel] = useState(
    settings?.model || DEFAULT_AI_SETTINGS.model
  );
  const [baseUrl, setBaseUrl] = useState(settings?.baseUrl || "http://localhost:11434");
  const [showKey, setShowKey] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Dynamic Google Gemini models state
  const [geminiModels, setGeminiModels] = useState<GeminiModelOption[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);
  const pingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const selectedProviderInfo =
    PROVIDERS.find((p) => p.id === provider) || PROVIDERS[0];

  // Load cached Gemini models on mount if available
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(GEMINI_MODELS_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as GeminiModelOption[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGeminiModels(parsed);
        }
      }
    } catch {}
  }, []);

  // Fetch available Gemini models in background directly from Google's API
  const pingGeminiModels = useCallback(async (keyToUse: string) => {
    const cleanKey = keyToUse.trim();
    if (!cleanKey || cleanKey.length < 15) return;

    setIsFetchingModels(true);
    setFormError(null);

    try {
      const models = await fetchGeminiModels(cleanKey);
      setGeminiModels(models);
      try {
        sessionStorage.setItem(GEMINI_MODELS_CACHE_KEY, JSON.stringify(models));
      } catch {}

      // If current selected model is not in the live list, auto-select the highest rated one
      if (models.length > 0 && !models.some((m) => m.id === model)) {
        setModel(models[0].id);
      }
    } catch {
      // Background ping fails gracefully without blocking the user
    } finally {
      setIsFetchingModels(false);
    }
  }, [model]);

  // Ping Google for available models the first time key is entered or when settings view opens with a key
  useEffect(() => {
    if (provider === "gemini" && apiKey.trim().length >= 15) {
      pingGeminiModels(apiKey);
    }
  }, [provider]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle API key input changes with automatic debounced background ping
  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    setFormError(null);

    if (pingTimeoutRef.current) clearTimeout(pingTimeoutRef.current);

    if (provider === "gemini" && val.trim().length >= 25) {
      pingTimeoutRef.current = setTimeout(() => {
        pingGeminiModels(val);
      }, 700);
    }
  };

  // Update default model whenever provider changes
  const handleProviderChange = (newProvider: AIProvider) => {
    setProvider(newProvider);
    setIsCustomModel(false);
    const pInfo = PROVIDERS.find((p) => p.id === newProvider) || PROVIDERS[0];
    setModel(pInfo.defaultModel);
    if (pInfo.requiresBaseUrl && !baseUrl) {
      setBaseUrl(pInfo.defaultBaseUrl || "http://localhost:11434");
    }
    setFormError(null);

    // If switching to Gemini and key is present, ping models
    if (newProvider === "gemini" && apiKey.trim().length >= 15) {
      pingGeminiModels(apiKey);
    }
  };

  const handleSelectModel = (val: string) => {
    if (val === "__custom__") {
      setIsCustomModel(true);
      return;
    }
    setModel(val);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = apiKey.trim();

    if (!cleanKey && provider !== "local") {
      setFormError("Please enter a valid API key for " + selectedProviderInfo.name);
      return;
    }

    const newSettings: AISettings = {
      provider,
      apiKey: cleanKey,
      model: model.trim() || selectedProviderInfo.defaultModel,
      ...(selectedProviderInfo.requiresBaseUrl ? { baseUrl: baseUrl.trim() } : {}),
    };

    saveSettings(newSettings);
  };

  return (
    <div className="flex-1 w-full flex flex-col justify-between overflow-y-auto p-4 sm:p-5 custom-scrollbar text-left select-text">
      <div>
        {/* Header Title */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-hub-purple/15 border border-hub-purple/35 flex items-center justify-center text-hub-purple">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white tracking-wide">
              AI Architect Configuration
            </h4>
            <p className="text-[11px] text-hub-muted">
              Select your AI engine & configure your client API key
            </p>
          </div>
        </div>

        {formError && (
          <div className="mb-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/25 flex items-start gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5">
          {/* 1. AI Provider Dropdown */}
          <div>
            <label className="block text-[11px] font-semibold text-hub-secondary uppercase tracking-wider mb-1.5">
              AI Provider
            </label>
            <div className="relative">
              <select
                value={provider}
                onChange={(e) => handleProviderChange(e.target.value as AIProvider)}
                className="w-full bg-[#101318] border border-white/15 focus:border-hub-green/60 rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors appearance-none cursor-pointer"
              >
                {PROVIDERS.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#161b22] text-white">
                    {p.name} {p.isLive ? "(Recommended / Live)" : `(${p.badge})`}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-2.5 pointer-events-none text-hub-muted">
                ▼
              </div>
            </div>

            {selectedProviderInfo.id !== "gemini" && (
              <p className="text-[10px] text-amber-400/90 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>
                  {selectedProviderInfo.name} is in placeholder mode. Switch to Gemini for live chatting.
                </span>
              </p>
            )}
          </div>

          {/* 2. API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-hub-secondary uppercase tracking-wider">
                API Key
              </label>
              {selectedProviderInfo.keyHelpUrl && (
                <a
                  href={selectedProviderInfo.keyHelpUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[10.5px] text-hub-green hover:underline flex items-center gap-1 font-medium"
                >
                  <span>{selectedProviderInfo.keyHelpText || "Get API Key"}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>

            <div className="relative">
              <input
                type={showKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => handleApiKeyChange(e.target.value)}
                onBlur={() => {
                  if (provider === "gemini" && apiKey.trim().length >= 15) {
                    pingGeminiModels(apiKey);
                  }
                }}
                placeholder={selectedProviderInfo.placeholderKey}
                autoComplete="off"
                spellCheck="false"
                className="w-full bg-[#101318] border border-white/15 focus:border-hub-green/60 rounded-xl pl-3 pr-9 py-2 text-xs text-white font-mono placeholder:text-hub-muted outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey((prev) => !prev)}
                className="absolute right-2.5 top-2 text-hub-muted hover:text-white p-0.5 rounded cursor-pointer"
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 3. Model Selector (Auto-populated with available models from Google) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] font-semibold text-hub-secondary uppercase tracking-wider flex items-center gap-1.5">
                <span>Model</span>
              </label>

              {isFetchingModels && (
                <span className="text-[10px] text-hub-muted flex items-center gap-1 font-normal">
                  <RefreshCw className="w-2.5 h-2.5 animate-spin text-hub-green" />
                  <span>Checking Google models...</span>
                </span>
              )}
            </div>

            {/* Model Input or Dropdown */}
            {isCustomModel ? (
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="e.g. gemini-2.5-flash or custom model ID"
                  className="w-full bg-[#101318] border border-white/15 focus:border-hub-green/60 rounded-xl pl-3 pr-8 py-2 text-xs text-white placeholder:text-hub-muted outline-none transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setIsCustomModel(false)}
                  className="absolute right-2 text-hub-muted hover:text-white p-1 rounded cursor-pointer"
                  title="Back to models list"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={model}
                  onChange={(e) => handleSelectModel(e.target.value)}
                  onFocus={() => {
                    if (provider === "gemini" && apiKey.trim().length >= 15 && geminiModels.length === 0) {
                      pingGeminiModels(apiKey);
                    }
                  }}
                  className="w-full bg-[#101318] border border-white/15 focus:border-hub-green/60 rounded-xl px-3 py-2 text-xs text-white outline-none transition-colors appearance-none cursor-pointer"
                >
                  {provider === "gemini" && geminiModels.length > 0 ? (
                    geminiModels.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[#161b22] text-white">
                        {m.displayName !== m.id ? `${m.displayName} (${m.id})` : m.id}
                      </option>
                    ))
                  ) : (
                    selectedProviderInfo.supportedModels.map((m) => (
                      <option key={m} value={m} className="bg-[#161b22] text-white">
                        {m}
                      </option>
                    ))
                  )}
                  <option value="__custom__" className="bg-[#161b22] text-hub-green">
                    + Custom / Manual model name...
                  </option>
                </select>
                <div className="absolute right-3 top-2.5 pointer-events-none text-hub-muted">
                  ▼
                </div>
              </div>
            )}
          </div>

          {/* Optional Base URL (for Local LLM) */}
          {selectedProviderInfo.requiresBaseUrl && (
            <div>
              <label className="block text-[11px] font-semibold text-hub-secondary uppercase tracking-wider mb-1.5">
                Local Endpoint URL
              </label>
              <input
                type="text"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full bg-[#101318] border border-white/15 focus:border-hub-green/60 rounded-xl px-3 py-2 text-xs text-white placeholder:text-hub-muted outline-none transition-colors"
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-hub-green hover:bg-hub-green/90 text-[#0f1117] font-semibold text-xs shadow-lg shadow-hub-green/20 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Save & Start Chatting</span>
            </button>

            {settings?.apiKey && (
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-hub-secondary hover:text-white border border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Security Privacy Notice */}
      <div className="mt-4 pt-3 border-t border-white/10 flex items-start gap-2 text-[10.5px] text-hub-muted leading-relaxed">
        <ShieldCheck className="w-3.5 h-3.5 text-hub-green shrink-0 mt-0.5" />
        <div>
          <span>Your key is saved exclusively in your browser&apos;s </span>
          <code className="text-hub-green font-mono text-[10px]">localStorage</code>
          <span>. Requests are sent directly from your browser to the AI provider.</span>
          {settings?.apiKey && (
            <button
              type="button"
              onClick={resetSettings}
              className="block mt-1 text-red-400/80 hover:text-red-400 hover:underline cursor-pointer"
            >
              Clear saved key & reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
