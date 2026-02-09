import { PageHeader } from "@/components/layout/page-header";
import { PipelineGrid } from "@/components/agents/pipeline-grid";

export default function AgentsPage() {
  return (
    <div>
      <PageHeader title="Agents" description="Build and manage your AI agent pipelines" />
      <PipelineGrid />
    </div>
  );
}
