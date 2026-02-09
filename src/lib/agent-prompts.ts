import type { AgentType, AgentNodeConfig, ContentResearcherConfig, ContentWriterConfig, MediaCreatorConfig, SchedulerConfig, PublisherConfig } from "./types";

// ---------------------------------------------------------------------------
// Agent-specific prompt builders
// ---------------------------------------------------------------------------

interface AgentPromptContext {
  type: AgentType;
  config: AgentNodeConfig | null;
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

interface AgentPrompt {
  system: string;
  user: string;
}

function brandToneDescription(formality: number, humor: number, inspiration: number): string {
  const parts: string[] = [];
  if (formality < 30) parts.push("very casual");
  else if (formality < 60) parts.push("conversational");
  else parts.push("professional");
  if (humor > 60) parts.push("humorous");
  if (inspiration > 60) parts.push("inspirational");
  return parts.join(", ") || "neutral";
}

export function buildAgentPrompt(ctx: AgentPromptContext): AgentPrompt {
  const { type, config, previousOutput, accountContext } = ctx;

  const nicheStr = accountContext?.niche ?? "general";
  const handleStr = accountContext?.handle ?? "the account";
  const toneStr = accountContext
    ? brandToneDescription(accountContext.brandVoice.toneFormality, accountContext.brandVoice.toneHumor, accountContext.brandVoice.toneInspiration)
    : "engaging and authentic";

  const prevContext = previousOutput
    ? `\n\nContext from the previous agent in the pipeline:\n---\n${previousOutput}\n---`
    : "";

  switch (type) {
    case "content_researcher": {
      const cfg = config as ContentResearcherConfig | null;
      const topics = cfg?.topics?.join(", ") || nicheStr;
      const competitors = cfg?.competitorAccounts?.join(", ") || "none specified";
      return {
        system: `You are a social media trend researcher specializing in the ${nicheStr} niche. You analyze trends, competitor content, and audience interests to provide actionable content recommendations.

Respond ONLY with valid JSON in this format:
{
  "trendingTopics": ["topic1", "topic2", "topic3"],
  "competitorInsights": "Brief competitor analysis",
  "contentRecommendation": "Specific content idea with reasoning",
  "predictedEngagement": "high/medium/low with brief explanation"
}`,
        user: `Research trending content opportunities for ${handleStr} in the ${nicheStr} niche.

Focus areas: ${topics}
Competitor accounts to analyze: ${competitors}
Trend sources: ${cfg?.trendSources ? Object.entries(cfg.trendSources).filter(([, v]) => v).map(([k]) => k).join(", ") : "all available"}${prevContext}

Provide trending topics, competitor insights, and a specific content recommendation.`,
      };
    }

    case "content_writer": {
      const cfg = config as ContentWriterConfig | null;
      return {
        system: `You are a social media copywriter with a ${toneStr} voice for the ${nicheStr} niche.
${cfg?.personaName ? `You write as "${cfg.personaName}".` : ""}
${cfg?.personalityDescription ? `Personality: ${cfg.personalityDescription}` : ""}
${cfg?.writingTone ? `Writing tone: ${cfg.writingTone}` : ""}
Emoji usage: ${cfg?.emojiUsage ?? "moderate"}

Respond ONLY with valid JSON in this format:
{
  "caption": "The full post caption text ready to publish",
  "hook": "The opening line/hook",
  "callToAction": "The CTA at the end"
}`,
        user: `Write an engaging social media post for ${handleStr}.
${cfg?.examplePosts?.length ? `\nExample posts for voice reference:\n${cfg.examplePosts.map((p, i) => `${i + 1}. "${p}"`).join("\n")}` : ""}${prevContext}

Create a caption that matches the brand voice. Include a strong opening hook and a clear call-to-action.`,
      };
    }

    case "media_creator": {
      const cfg = config as MediaCreatorConfig | null;
      return {
        system: `You are a visual content strategist for social media in the ${nicheStr} niche. You provide detailed visual content briefs and image descriptions.

Respond ONLY with valid JSON in this format:
{
  "imageDescription": "Detailed description of the visual to create",
  "dimensions": "1080x1080 or 1080x1350 or 1080x1920",
  "style": "Visual style description",
  "textOverlay": "Any text to overlay on the image, or null",
  "colorPalette": ["#hex1", "#hex2"]
}`,
        user: `Create a visual content brief for ${handleStr}.

Visual style: ${cfg?.visualStyle ?? "modern and clean"}
Brand colors: ${cfg?.brandColors?.join(", ") ?? "use niche-appropriate colors"}
Content formats: ${cfg?.contentFormats?.join(", ") ?? "feed post"}${prevContext}

Describe the ideal visual that would complement the content.`,
      };
    }

    case "scheduler": {
      const cfg = config as SchedulerConfig | null;
      return {
        system: `You are a social media scheduling strategist. You determine optimal posting times based on audience behavior patterns.

Respond ONLY with valid JSON in this format:
{
  "scheduledTime": "YYYY-MM-DDTHH:mm:ss",
  "dayOfWeek": "Monday/Tuesday/etc",
  "reasoning": "Why this time was chosen",
  "alternativeSlot": "YYYY-MM-DDTHH:mm:ss"
}`,
        user: `Determine the optimal posting time for ${handleStr} in the ${nicheStr} niche.

Active days: ${cfg?.activeDays?.join(", ") ?? "Monday through Friday"}
Posting window: ${cfg?.postingWindowStart ?? "09:00"} to ${cfg?.postingWindowEnd ?? "21:00"}
Timezone: ${cfg?.timezone ?? "EST"}
Posts per day: ${cfg?.postsPerDay ?? 1}${prevContext}

The current date is ${new Date().toISOString().split("T")[0]}. Schedule the next optimal post time.`,
      };
    }

    case "publisher": {
      const cfg = config as PublisherConfig | null;
      return {
        system: `You are a social media publishing assistant. You prepare final publish-ready content packages and verify everything is ready for posting.

Respond ONLY with valid JSON in this format:
{
  "publishReady": true,
  "publishSummary": "Summary of what will be published",
  "platform": "instagram",
  "contentChecklist": ["item1", "item2"],
  "estimatedReach": "Rough estimate"
}`,
        user: `Prepare a publish package for ${handleStr}.

Target accounts: ${cfg?.accountIds?.join(", ") ?? handleStr}
Cross-posting: ${cfg?.crossPostingEnabled ? "enabled" : "disabled"}${prevContext}

Review the content from previous agents and confirm it's ready to publish. Provide a final summary.`,
      };
    }

    default:
      return {
        system: "You are a helpful social media assistant. Respond with valid JSON.",
        user: `Help with a social media task for ${handleStr}.${prevContext}`,
      };
  }
}
