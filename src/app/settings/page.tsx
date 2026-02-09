"use client";

import { PageHeader } from "@/components/layout/page-header";
import { NicheSelector } from "@/components/settings/niche-selector";
import { BrandVoiceConfig } from "@/components/settings/brand-voice-config";
import { ContentMixConfig } from "@/components/settings/content-mix-config";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Configure niche, brand voice, and content strategy">
        <Button className="bg-[#3B82F6] hover:bg-[#3B82F6]/90 text-white">
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </PageHeader>

      <div className="space-y-6 max-w-3xl">
        <NicheSelector />
        <BrandVoiceConfig />
        <ContentMixConfig />
      </div>
    </div>
  );
}
