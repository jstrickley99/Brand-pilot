# Pipeline Execution View Design

**Goal:** Add a live execution mode to the pipeline builder that visually shows agents processing in sequence with streaming output.

**Architecture:** Same-page toggle between "build" and "execute" modes. A custom `useExecutionSimulator` hook drives timed mock simulation client-side. Nodes animate through idle/running/complete/error states. Clicking a node during execution shows streaming output in the existing side panel slot.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, client-side simulation with setTimeout/setInterval

---

## 1. Execution Mode & Node States

The pipeline page gets a mode toggle — Build vs Execute. When the user clicks **Run Pipeline** on an active pipeline, the canvas switches to execution mode.

**In execution mode:**
- Top bar shows Stop button (red), progress indicator ("3/5 nodes complete"), and elapsed time
- Canvas becomes read-only — no dragging, no adding/deleting nodes
- The + button is hidden

**Node visual states during execution:**
- **Idle** — Default gray, waiting in queue
- **Running** — Pulsing blue glow with spinning indicator on status dot, animated border
- **Complete** — Green border and checkmark on status dot, subtle success glow
- **Error** — Red border with X on status dot, shakes briefly

**Connection animations:**
- Connections ahead of current node stay dashed/dim
- Active connection pulses brighter and faster
- Completed connections become solid lines (no longer dashed) with green tint

**Flow:** Nodes execute sequentially following the connection chain. Each node takes 2-4 seconds with simulated streaming output.

## 2. Node Output & Side Panel

Clicking a node during execution slides in an **execution output panel** (reuses the config panel slot).

**Output panel contents:**
- **Header** — Node name, agent type, status badge (Running/Complete/Error), elapsed time
- **Live output area** — Dark terminal-style block with character-by-character streaming text. Content varies by agent type:
  - Content Researcher: trending topic analysis
  - Content Writer: generated caption streaming in
  - Hashtag Generator: tags appearing one by one
  - Media Creator: generation status + placeholder preview
  - Scheduler: optimal time calculation
  - Publisher: publishing status + post ID
  - Engagement Bot: reply monitoring activity
  - Analytics Monitor: metrics collection
- **Output preview** — Formatted preview card showing the "result" (generated post, hashtags, etc.)
- **View Config** link at bottom to see node configuration (read-only in execution mode)

## 3. Run Lifecycle & Controls

**Starting a run:**
- Active/deployed pipeline shows **Run Pipeline** button (play icon, blue) in top bar
- Clicking enters execution mode — build buttons hidden, execution controls shown

**Execution top bar:**
- Left: Back arrow + pipeline name + "Executing..." animated badge
- Center: Progress bar with "2 of 5 agents complete"
- Right: Stop button (red)

**Run completion:**
- Status badge → "Run Complete" (green) with total elapsed time
- Shows "View Results" and "Back to Builder" buttons

**Stopping mid-run:**
- Stop halts execution immediately
- Current node → "Cancelled" (gray)
- Remaining nodes stay "Idle"
- Shows "Run Stopped" + "Back to Builder"

**Error handling:**
- Node error pauses execution
- Shows "Error at [Node Name]" with Retry Node / Skip & Continue options

## 4. Data Model

**New types:**

```typescript
type NodeRunStatus = "idle" | "running" | "complete" | "error" | "cancelled" | "skipped"

interface NodeRun {
  nodeId: string
  status: NodeRunStatus
  startedAt: string | null
  completedAt: string | null
  duration: number | null
  output: string[]        // streaming text lines
  result: string | null   // final formatted output
  error: string | null
}

type PipelineRunStatus = "running" | "completed" | "stopped" | "error"

interface PipelineRun {
  id: string
  pipelineId: string
  status: PipelineRunStatus
  startedAt: string
  completedAt: string | null
  duration: number
  nodeRuns: NodeRun[]
}

type ExecutionMode = "build" | "execute"
```

**Page state additions:**
- `mode: ExecutionMode`
- `currentRun: PipelineRun | null`
- `activeNodeIndex: number`
- `streamingText: string`

**Simulation hook:** `useExecutionSimulator` — walks the connection chain, runs each node 2-4s, streams text character-by-character, exposes start/stop/retry/skip methods.

## 5. Component Structure

**New files:**
- `src/components/agents/execution-bar.tsx` — Execution top bar (progress, elapsed time, Stop/Retry/Back)
- `src/components/agents/execution-output-panel.tsx` — Side panel for streaming output + result preview
- `src/lib/use-execution-simulator.ts` — Custom hook for mock simulation engine

**Modified files:**
- `src/lib/types.ts` — Add PipelineRun, NodeRun, NodeRunStatus, PipelineRunStatus, ExecutionMode
- `src/app/agents/[id]/page.tsx` — Add mode toggle, wire simulator hook, conditional rendering
- `src/components/agents/canvas-node.tsx` — Execution visual states (pulsing, green, red, spinning)
- `src/components/agents/node-connection.tsx` — Solid/green for complete, brighter pulse for active
