import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { auth } from "@clerk/nextjs/server";
import type { AgentType, AgentNodeConfig, AIProvider } from "@/lib/types";
import { buildAgentPrompt } from "@/lib/agent-prompts";

// ---------------------------------------------------------------------------
// Request / Response types
// ---------------------------------------------------------------------------

interface ExecuteNodeRequest {
  type: AgentType;
  config: AgentNodeConfig | null;
  provider: AIProvider;
  previousOutput: string | null;
  accountContext: {
    handle: string;
    niche: string;
    brandVoice: {
      toneFormality: number;
      toneHumor: number;
      toneInspiration: number;
    };
  } | null;
}

interface ExecuteNodeResponse {
  success: boolean;
  output?: string;
  rawResponse?: string;
  error?: string;
}

// ---------------------------------------------------------------------------
// JSON parser (handles markdown code blocks, etc.)
// ---------------------------------------------------------------------------

function extractJsonString(text: string): string {
  // Try as-is first
  try {
    JSON.parse(text);
    return text;
  } catch {
    // Try extracting from markdown code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1].trim();
    }
    // Try finding JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }
    return text;
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse<ExecuteNodeResponse>> {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const apiKey = request.headers.get("x-ai-api-key");
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: "API key is required. Add your key in Settings." },
        { status: 401 }
      );
    }

    const body: ExecuteNodeRequest = await request.json();
    const { type, config, provider, previousOutput, accountContext } = body;

    // Build agent-specific prompts
    const { system, user } = buildAgentPrompt({
      type,
      config,
      previousOutput,
      accountContext,
    });

    let responseText = "";

    if (provider === "anthropic") {
      const client = new Anthropic({ apiKey });
      const message = await client.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 2048,
        system,
        messages: [{ role: "user", content: user }],
      });
      const block = message.content[0];
      responseText = block.type === "text" ? block.text : "";
    } else {
      const client = new OpenAI({ apiKey });
      const completion = await client.chat.completions.create({
        model: "gpt-4o-mini",
        max_tokens: 2048,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      });
      responseText = completion.choices[0]?.message?.content || "";
    }

    // Extract and validate JSON
    const jsonStr = extractJsonString(responseText);
    try {
      JSON.parse(jsonStr);
    } catch {
      // If JSON parsing fails, still return the raw text as output
      return NextResponse.json({
        success: true,
        output: responseText,
        rawResponse: responseText,
      });
    }

    // Format the JSON output nicely for display
    const parsed = JSON.parse(jsonStr);
    const formattedOutput = JSON.stringify(parsed, null, 2);

    return NextResponse.json({
      success: true,
      output: formattedOutput,
      rawResponse: responseText,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json({ success: false, error: message });
  }
}
