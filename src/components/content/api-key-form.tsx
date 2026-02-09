"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AIProvider } from "@/lib/types";
import { setApiKey, getApiKey } from "@/lib/api-keys";
import { Key, ExternalLink, Check } from "lucide-react";

interface ApiKeyFormProps {
  provider: AIProvider;
  onKeySet: () => void;
}

const providerInfo: Record<AIProvider, { name: string; placeholder: string; docsUrl: string }> = {
  anthropic: {
    name: "Anthropic (Claude)",
    placeholder: "sk-ant-...",
    docsUrl: "https://console.anthropic.com/settings/keys",
  },
  openai: {
    name: "OpenAI (GPT)",
    placeholder: "sk-...",
    docsUrl: "https://platform.openai.com/api-keys",
  },
};

export function ApiKeyForm({ provider, onKeySet }: ApiKeyFormProps) {
  const [key, setKey] = useState(getApiKey(provider) || "");
  const [saved, setSaved] = useState(false);

  const info = providerInfo[provider];

  function handleSave() {
    if (!key.trim()) return;
    setApiKey(provider, key.trim());
    setSaved(true);
    onKeySet();
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Key className="h-4 w-4 text-[#94A3B8]" />
        <span className="text-sm font-medium text-[#F8FAFC]">{info.name} API Key</span>
      </div>
      <div className="flex gap-2">
        <Input
          type="password"
          placeholder={info.placeholder}
          value={key}
          onChange={(e) => {
            setKey(e.target.value);
            setSaved(false);
          }}
          className="bg-white/5 border-[#1E293B] text-[#F8FAFC] placeholder:text-[#94A3B8]/50"
        />
        <Button
          onClick={handleSave}
          disabled={!key.trim() || saved}
          className={saved ? "bg-emerald-600 hover:bg-emerald-600" : "bg-[#3B82F6] hover:bg-[#3B82F6]/90"}
        >
          {saved ? <Check className="h-4 w-4" /> : "Save"}
        </Button>
      </div>
      <a
        href={info.docsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-[#3B82F6] hover:underline"
      >
        Get your API key <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}
