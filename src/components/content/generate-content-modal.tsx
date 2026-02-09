"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ApiKeyForm } from "./api-key-form";
import { GenerationResult } from "./generation-result";
import { AIProvider, ContentType, GeneratedContent, GenerateContentResponse } from "@/lib/types";
import { hasApiKey, getApiKey } from "@/lib/api-keys";
import { saveGeneratedContent } from "@/lib/content-store";
import { mockAccounts } from "@/lib/mock-data";
import { getNicheEmoji } from "@/lib/utils";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";

type ModalState = "setup" | "api-key" | "generating" | "result" | "error";

interface GenerateContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContentSaved?: () => void;
}

export function GenerateContentModal({ open, onOpenChange, onContentSaved }: GenerateContentModalProps) {
  const [state, setState] = useState<ModalState>("setup");
  const [provider, setProvider] = useState<AIProvider>("anthropic");
  const [accountId, setAccountId] = useState("");
  const [contentType, setContentType] = useState<ContentType>("image");
  const [topic, setTopic] = useState("");
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState("");

  function resetState() {
    setState("setup");
    setTopic("");
    setResult(null);
    setError("");
  }

  function handleOpenChange(open: boolean) {
    if (!open) resetState();
    onOpenChange(open);
  }

  async function handleGenerate() {
    if (!hasApiKey(provider)) {
      setState("api-key");
      return;
    }

    const account = mockAccounts.find((a) => a.id === accountId);
    if (!account) return;

    setState("generating");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ai-api-key": getApiKey(provider) || "",
        },
        body: JSON.stringify({
          provider,
          accountId,
          contentType,
          prompt: topic,
          niche: account.niche,
          brandVoice: account.brandVoice,
        }),
      });

      const data: GenerateContentResponse = await res.json();

      if (data.success && data.content) {
        setResult(data.content);
        setState("result");

        saveGeneratedContent({
          caption: data.content.caption,
          hashtags: data.content.hashtags,
          suggestedPostingTime: data.content.suggestedPostingTime,
          provider: data.content.provider,
          contentType,
          accountId,
          accountHandle: account.handle,
        });
        onContentSaved?.();
      } else {
        setError(data.error || "Failed to generate content");
        setState("error");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setState("error");
    }
  }

  const canGenerate = accountId && topic.trim();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl bg-[#0A0F1C] border-[#1E293B] text-[#F8FAFC]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-[#3B82F6]" />
            AI Content Generator
          </DialogTitle>
          <DialogDescription className="text-[#94A3B8]">
            Generate engaging social media content with AI
          </DialogDescription>
        </DialogHeader>

        {state === "setup" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#94A3B8] mb-1.5 block">AI Provider</label>
                <Select value={provider} onValueChange={(v) => setProvider(v as AIProvider)}>
                  <SelectTrigger className="bg-white/5 border-[#1E293B] text-[#F8FAFC]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-[#1E293B]">
                    <SelectItem value="anthropic">Claude (Anthropic)</SelectItem>
                    <SelectItem value="openai">GPT (OpenAI)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-[#94A3B8] mb-1.5 block">Account</label>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger className="bg-white/5 border-[#1E293B] text-[#F8FAFC]">
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#111827] border-[#1E293B]">
                    {mockAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {getNicheEmoji(account.niche)} {account.handle}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm text-[#94A3B8] mb-1.5 block">Content Type</label>
              <Select value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                <SelectTrigger className="bg-white/5 border-[#1E293B] text-[#F8FAFC]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#111827] border-[#1E293B]">
                  <SelectItem value="image">Image Post</SelectItem>
                  <SelectItem value="carousel">Carousel</SelectItem>
                  <SelectItem value="reel">Reel</SelectItem>
                  <SelectItem value="story">Story</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm text-[#94A3B8] mb-1.5 block">Topic / Prompt</label>
              <Input
                placeholder="E.g., Morning workout motivation for beginners..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="bg-white/5 border-[#1E293B] text-[#F8FAFC] placeholder:text-[#94A3B8]/50"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!canGenerate}
              className="w-full bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Generate Content
            </Button>
          </div>
        )}

        {state === "api-key" && (
          <div className="space-y-4">
            <p className="text-sm text-[#94A3B8]">
              Enter your API key to start generating content. Your key is stored locally and never sent to our servers.
            </p>
            <ApiKeyForm provider={provider} onKeySet={() => handleGenerate()} />
          </div>
        )}

        {state === "generating" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-[#3B82F6] animate-spin mb-4" />
            <p className="text-sm text-[#94A3B8]">Generating content with {provider === "anthropic" ? "Claude" : "GPT"}...</p>
          </div>
        )}

        {state === "result" && result && (
          <GenerationResult
            content={result}
            onRegenerate={() => {
              setState("setup");
              setResult(null);
            }}
            onAddToQueue={() => handleOpenChange(false)}
          />
        )}

        {state === "error" && (
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-red-400/10 border border-red-400/20">
              <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-400">Generation Failed</p>
                <p className="text-sm text-red-400/80 mt-1">{error}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={resetState}
                className="border-[#1E293B] bg-transparent text-[#F8FAFC] hover:bg-white/5"
              >
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => setState("api-key")}
                className="border-[#1E293B] bg-transparent text-[#F8FAFC] hover:bg-white/5"
              >
                Update API Key
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
