"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { mockPipelines } from "@/lib/mock-data";
import { Pipeline } from "@/lib/types";
import { PipelineCard, NewPipelineCard } from "@/components/agents/pipeline-card";

export function PipelineGrid() {
  const router = useRouter();
  const [pipelines, setPipelines] = useState<Pipeline[]>(mockPipelines);

  const handleCreatePipeline = useCallback(() => {
    const newId = `pipeline-${Date.now()}`;
    const now = new Date().toISOString();

    const newPipeline: Pipeline = {
      id: newId,
      name: "Untitled Pipeline",
      status: "draft",
      nodes: [],
      connections: [],
      assignedAccountIds: [],
      createdAt: now,
      updatedAt: now,
    };

    setPipelines((prev) => [...prev, newPipeline]);
    router.push(`/agents/${newId}`);
  }, [router]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <NewPipelineCard onCreatePipeline={handleCreatePipeline} />
      {pipelines.map((pipeline) => (
        <PipelineCard key={pipeline.id} pipeline={pipeline} />
      ))}
    </div>
  );
}
