"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Pipeline } from "@/lib/types";
import { PipelineCard, NewPipelineCard } from "@/components/agents/pipeline-card";

export function PipelineGrid() {
  const router = useRouter();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/pipelines")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPipelines(data.pipelines);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleCreatePipeline = useCallback(async () => {
    const res = await fetch("/api/pipelines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Untitled Pipeline" }),
    });
    const data = await res.json();
    if (data.success && data.id) {
      router.push(`/agents/${data.id}`);
    }
  }, [router]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      <NewPipelineCard onCreatePipeline={handleCreatePipeline} />
      {isLoading ? (
        <div className="col-span-full flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        pipelines.map((pipeline) => (
          <PipelineCard key={pipeline.id} pipeline={pipeline} />
        ))
      )}
    </div>
  );
}
