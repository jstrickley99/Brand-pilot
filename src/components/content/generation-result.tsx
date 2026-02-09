"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GeneratedContent } from "@/lib/types";
import { getApiKey, hasApiKey } from "@/lib/api-keys";
import { Copy, Check, Clock, RefreshCw, Plus, ImageIcon, Loader2 } from "lucide-react";

interface GenerationResultProps {
  content: GeneratedContent;
  onRegenerate: () => void;
  onAddToQueue: () => void;
}

export function GenerationResult({ content, onRegenerate, onAddToQueue }: GenerationResultProps) {
  const [copied, setCopied] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  async function handleCopy() {
    await navigator.clipboard.writeText(content.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleGenerateImage() {
    if (!hasApiKey("openai")) {
      setImageError("OpenAI API key required. Add your key in Settings to generate images.");
      return;
    }

    setImageLoading(true);
    setImageError(null);

    try {
      const imagePrompt = `Social media post image: ${content.caption.slice(0, 500)}. Style: professional, high quality, suitable for Instagram.`;

      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-ai-api-key": getApiKey("openai") || "",
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          size: "1024x1024",
          style: "natural",
        }),
      });

      const data = await res.json();

      if (data.success && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      } else {
        setImageError(data.error || "Failed to generate image");
      }
    } catch (err) {
      setImageError(err instanceof Error ? err.message : "Network error");
    } finally {
      setImageLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="rounded-lg bg-white/5 border border-[#1E293B] p-4">
          <p className="text-sm text-[#F8FAFC] whitespace-pre-wrap pr-8">{content.caption}</p>
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-white/10 transition-colors"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Copy className="h-4 w-4 text-[#94A3B8]" />
            )}
          </button>
        </div>
      </div>

      <div>
        <span className="text-xs text-[#94A3B8] mb-2 block">Hashtags</span>
        <div className="flex flex-wrap gap-1.5">
          {content.hashtags.map((tag) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20 text-xs"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
        <Clock className="h-4 w-4" />
        <span>Suggested posting time: {content.suggestedPostingTime}</span>
      </div>

      {/* AI Image Generation Section */}
      <div className="rounded-lg bg-white/5 border border-[#1E293B] p-4 space-y-3">
        <span className="text-xs text-[#94A3B8] block">AI Image</span>

        {generatedImageUrl ? (
          <div className="space-y-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={generatedImageUrl}
              alt="AI generated content"
              className="w-full rounded-lg border border-[#1E293B]"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateImage}
              disabled={imageLoading}
              className="border-[#1E293B] bg-transparent text-[#F8FAFC] hover:bg-white/5"
            >
              <RefreshCw className="h-3 w-3 mr-2" />
              Regenerate Image
            </Button>
          </div>
        ) : imageLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-6 w-6 text-[#F97316] animate-spin mb-2" />
            <p className="text-xs text-[#94A3B8]">Generating image with DALL-E...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {imageError && (
              <p className="text-xs text-red-400">{imageError}</p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateImage}
              className="border-[#1E293B] bg-transparent text-[#F8FAFC] hover:bg-white/5"
            >
              <ImageIcon className="h-3 w-3 mr-2" />
              Generate Image
            </Button>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          variant="outline"
          onClick={onRegenerate}
          className="border-[#1E293B] bg-transparent text-[#F8FAFC] hover:bg-white/5"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
        <Button
          onClick={onAddToQueue}
          className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add to Queue
        </Button>
      </div>
    </div>
  );
}
