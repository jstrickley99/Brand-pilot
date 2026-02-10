"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { AgentCard, NewAgentCard } from "@/components/agents/agent-card";
import { AgentSetupWizard } from "@/components/agents/agent-setup-wizard";
import type { Pipeline, InstagramAccount, AgentConfig } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function AgentsPage() {
  const router = useRouter();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [accounts, setAccounts] = useState<InstagramAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/pipelines").then((r) => r.json()),
      fetch("/api/accounts").then((r) => r.json()),
    ])
      .then(([pData, aData]) => {
        if (pData.success) setPipelines(pData.pipelines);
        if (aData.success) setAccounts(aData.accounts);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreateAgent = useCallback(
    async (agentConfig: AgentConfig, name: string) => {
      const res = await fetch("/api/pipelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, agentConfig }),
      });
      const data = await res.json();
      if (data.success && data.id) {
        router.push(`/agents/${data.id}`);
      }
    },
    [router]
  );

  // Separate agents (with agentConfig) from legacy pipelines
  const agents = pipelines.filter((p) => p.agentConfig);
  const legacyPipelines = pipelines.filter((p) => !p.agentConfig);

  return (
    <div>
      <PageHeader
        title="Agents"
        description="Your autonomous AI social media managers"
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-[#3B82F6] animate-spin" />
        </div>
      ) : (
        <>
          {/* Agent grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            <NewAgentCard onClick={() => setShowWizard(true)} />
            {agents.map((pipeline) => (
              <AgentCard key={pipeline.id} pipeline={pipeline} />
            ))}
          </div>

          {/* Legacy pipelines section */}
          {legacyPipelines.length > 0 && (
            <div className="mt-10">
              <h3 className="text-sm font-medium text-[#64748B] uppercase tracking-wider mb-4">
                Legacy Pipelines
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {legacyPipelines.map((pipeline) => (
                  <AgentCard key={pipeline.id} pipeline={pipeline} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Agent Setup Wizard */}
      <AgentSetupWizard
        open={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={handleCreateAgent}
        accounts={accounts}
      />
    </div>
  );
}
