import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GenerateContentRequest, GenerateContentResponse, GeneratedContent } from "@/lib/types";
import { buildSystemPrompt, buildUserPrompt } from "@/lib/ai-prompts";

function parseJsonFromResponse(text: string): GeneratedContent | null {
  // Try parsing directly first
  try {
    return JSON.parse(text);
  } catch {
    // Try extracting from markdown code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch {
        return null;
      }
    }
    // Try finding JSON object in text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export async function POST(request: NextRequest): Promise<NextResponse<GenerateContentResponse>> {
  try {
    const apiKey = request.headers.get("x-ai-api-key");
    if (!apiKey) {
      return NextResponse.json({ success: false, error: "API key is required" }, { status: 401 });
    }

    const body: GenerateContentRequest = await request.json();
    const { provider, contentType, prompt, niche, brandVoice } = body;

    const systemPrompt = buildSystemPrompt(niche, brandVoice);
    const userPrompt = buildUserPrompt(contentType, prompt);

    let responseText = "";

    if (provider === "anthropic") {
      const client = new Anthropic({ apiKey });
      const message = await client.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      });
      const block = message.content[0];
      responseText = block.type === "text" ? block.text : "";
    } else {
      const client = new OpenAI({ apiKey });
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 1024,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });
      responseText = completion.choices[0]?.message?.content || "";
    }

    const parsed = parseJsonFromResponse(responseText);
    if (!parsed) {
      return NextResponse.json({
        success: false,
        error: "Failed to parse AI response. Please try again.",
      });
    }

    return NextResponse.json({
      success: true,
      content: {
        caption: parsed.caption,
        hashtags: parsed.hashtags,
        suggestedPostingTime: parsed.suggestedPostingTime,
        provider,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ success: false, error: message });
  }
}
