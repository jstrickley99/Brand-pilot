"use client";

import { PageHeader } from "@/components/layout/page-header";
import { NicheSelector } from "@/components/settings/niche-selector";
import { BrandVoiceConfig } from "@/components/settings/brand-voice-config";
import { ContentMixConfig } from "@/components/settings/content-mix-config";
import { Button } from "@/components/ui/button";
import { Save, Check } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";

export default function SettingsPage() {
  const { settings, update, saved } = useSettings();

  return (
    <div>
      <PageHeader title="Settings" description="Configure niche, brand voice, and content strategy">
        <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-[#F8FAFC]">
          {saved ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Saved
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </PageHeader>

      <div className="space-y-6 max-w-3xl">
        <NicheSelector
          selected={settings.niche}
          onSelect={(v) => update("niche", v)}
        />
        <BrandVoiceConfig
          formality={settings.formality}
          humor={settings.humor}
          inspiration={settings.inspiration}
          onFormalityChange={(v) => update("formality", v)}
          onHumorChange={(v) => update("humor", v)}
          onInspirationChange={(v) => update("inspiration", v)}
        />
        <ContentMixConfig
          educational={settings.educational}
          inspirational={settings.inspirational}
          entertaining={settings.entertaining}
          promotional={settings.promotional}
          postsPerDay={settings.postsPerDay}
          onEducationalChange={(v) => update("educational", v)}
          onInspirationalChange={(v) => update("inspirational", v)}
          onEntertainingChange={(v) => update("entertaining", v)}
          onPromotionalChange={(v) => update("promotional", v)}
          onPostsPerDayChange={(v) => update("postsPerDay", v)}
        />
      </div>
    </div>
  );
}
