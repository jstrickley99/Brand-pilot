# Agents Page — Visual Pipeline Builder

## Overview

A visual node-based pipeline builder (similar to Make.com/Zapier) where users create AI agent workflows for automated social media content production. Agents are reusable — created independently, then assigned to Instagram/TikTok accounts.

## Page Layout & Canvas

### Pipeline List View (default landing)

The Agents page starts with a **pipeline list** — all saved pipelines displayed as cards in a grid.

Each pipeline card shows:
- Pipeline name
- Node count with small icons showing which agent types are included
- Assigned accounts (avatar thumbnails)
- Status badge: Draft (gray), Active (green), Paused (orange)
- Last edited timestamp

A **"+ New Pipeline"** card at the start of the grid creates a fresh canvas. Clicking a pipeline card enters the canvas builder.

### Canvas Builder View

Full-screen interactive canvas replacing the typical scrollable content area.

**Top bar:**
- Pipeline name (editable inline text, e.g., "Fitness Content Pipeline")
- "Assign Accounts" button
- **Save as Draft** (ghost button) + **Deploy Agent** (primary blue button)

**Canvas area:**
- Dark background (`#0B0F19`) with subtle dot grid pattern
- Pan by clicking and dragging the background
- Zoom via scroll wheel or bottom-center controls (zoom out, percentage, zoom in, fit-to-screen)
- Nodes connected by animated dashed lines showing data flow direction

**Starting state (empty pipeline):**
- Single **Start** node (robot icon in dashed circle) centered on canvas
- Tooltip card: "Add your first step — Click the + button to add agents to your pipeline"
- Floating **+** button (blue, bottom-right corner)

## Agent Types (Nodes)

8 available agent types, each with a unique icon and accent color:

| Agent Type | Icon (Lucide) | Description |
|---|---|---|
| Content Researcher | Search / Globe | Finds trending topics, competitor analysis, niche research |
| Content Writer | PenTool | Generates captions, scripts, copy with brand voice |
| Hashtag Generator | Hash | Researches and selects optimal hashtags |
| Image/Video Creator | Image / Video | Generates or selects visual content |
| Scheduler | Clock | Determines optimal posting times and queues content |
| Publisher | Send | Posts content to connected accounts |
| Engagement Bot | MessageCircle | Auto-replies to comments, DMs, follows/unfollows |
| Analytics Monitor | BarChart3 | Tracks performance and feeds insights back |

## Agent Picker

Clicking the **+** button opens a modal with a 2-column grid of agent type cards. Each card shows icon + name + one-line description. Hover highlights with blue border. Clicking one adds a new node to the canvas, auto-connected to the end of the chain.

## Node Appearance on Canvas

Each node displays:
- Color-coded icon (unique accent per agent type)
- Agent type name
- Custom name (if set)
- Status indicator: unconfigured (orange dot), configured (green dot), error (red dot)
- Output connector (small blue dot, right edge) and input connector (left edge)

## Connection Behavior

- New nodes auto-connect to end of pipeline
- Users can drag from output connector to input connector to rewire
- Nodes can be reordered by dragging on canvas
- Deleting a node auto-reconnects surrounding nodes

## Side Panel Configuration

Clicking a node opens a **right-side panel** (~400px wide) that slides in.

### Panel Header
- Agent type icon + name
- Custom name field (editable)
- Close (X) button
- Delete node button (trash icon, red on hover)

### Shared Configuration (all agents)
- **Autonomy Level** — Three toggle buttons: Full Auto / Semi-Auto / Approval Required
- **Status** — Active/Paused toggle

### Agent-Specific Configuration

**Content Researcher:**
- Topics/niches to monitor (tag input)
- Competitor accounts to track (@ input)
- Trend sources (checkboxes: TikTok trending, Instagram explore, industry news)

**Content Writer:**
- Persona name & personality description (textarea)
- Writing tone selector (casual, professional, witty, educational, etc.)
- Language & emoji usage preferences
- Example posts (paste examples for AI to learn from)

**Hashtag Generator:**
- Hashtag strategy (max reach, niche-specific, mixed)
- Banned hashtags (tag input)
- Hashtag count range (slider, e.g., 5-15)

**Image/Video Creator:**
- Visual style preferences (aesthetic, minimalist, bold, etc.)
- Brand colors reference
- Content format preference (reels, carousels, stories)

**Scheduler:**
- Active days (day-of-week checkboxes)
- Posting windows (time range pickers)
- Timezone selector
- Posts per day (slider)

**Publisher:**
- Connected accounts selector (multi-select from existing accounts)
- Cross-posting rules

**Engagement Bot:**
- Reply tone & personality
- Auto-reply triggers (keywords, all comments, questions only)
- DM auto-responses (on/off + templates)

**Analytics Monitor:**
- Metrics to track (checkboxes: followers, engagement rate, reach, saves)
- Reporting frequency (daily, weekly)
- Performance thresholds for alerts

## Pipeline Management

**Assigning pipelines to accounts:**
- "Assign Accounts" button in canvas top bar opens a dropdown of all connected accounts
- Toggle accounts on/off for that pipeline
- Account can only be assigned to one pipeline at a time — reassignment shows warning

**Pipeline controls:**
- **Deploy Agent** — Activates pipeline (only when all nodes are configured/green)
- **Save as Draft** — Saves without activating
- **Pause/Resume** — Available on active pipelines
- **Duplicate Pipeline** — Creates a copy
- **Delete Pipeline** — With confirmation dialog

## Technical Architecture

### Data Types (additions to `types.ts`)

```typescript
type AgentType =
  | "content_researcher"
  | "content_writer"
  | "hashtag_generator"
  | "media_creator"
  | "scheduler"
  | "publisher"
  | "engagement_bot"
  | "analytics_monitor";

interface AgentNode {
  id: string;
  type: AgentType;
  name: string;
  position: { x: number; y: number };
  config: Record<string, unknown>; // type-specific config
  status: "unconfigured" | "configured" | "error";
}

interface PipelineConnection {
  sourceNodeId: string;
  targetNodeId: string;
}

type PipelineStatus = "draft" | "active" | "paused";

interface Pipeline {
  id: string;
  name: string;
  status: PipelineStatus;
  nodes: AgentNode[];
  connections: PipelineConnection[];
  assignedAccountIds: string[];
  createdAt: string;
  updatedAt: string;
}
```

### Component Structure

```
/src/app/agents/page.tsx                — Pipeline list view
/src/components/agents/
  pipeline-grid.tsx                     — Grid of pipeline cards + new pipeline card
  pipeline-card.tsx                     — Individual pipeline card
  pipeline-canvas.tsx                   — The canvas builder (main workspace)
  canvas-node.tsx                       — Individual draggable node
  node-connection.tsx                   — SVG line/arrow between nodes
  agent-picker.tsx                      — Modal with agent type selection grid
  config-panel.tsx                      — Right-side configuration panel
  config-sections/
    autonomy-config.tsx                 — Shared autonomy level selector
    content-researcher-config.tsx       — Config for researcher
    content-writer-config.tsx           — Config for writer
    hashtag-config.tsx                  — Config for hashtag gen
    media-creator-config.tsx            — Config for image/video
    scheduler-config.tsx                — Config for scheduler
    publisher-config.tsx                — Config for publisher
    engagement-config.tsx               — Config for engagement bot
    analytics-config.tsx                — Config for analytics
  assign-accounts.tsx                   — Account assignment dropdown
```

### Canvas Implementation
- Built with plain React + SVG for connections (no heavy library dependency)
- Node dragging via pointer events
- Canvas panning via background drag
- Zoom via CSS transform on wrapper div

### Mock Data
- 2-3 sample pipelines with pre-configured nodes to demonstrate UI

## Design System Compliance

Follow existing BrandPilot patterns:
- Dark theme: Background `#0B0F19`, Cards `#111827`, Borders `#1E293B`
- Primary blue `#3B82F6`, Accent orange `#F97316`, Success green `#10B981`
- shadcn/ui components, Lucide icons
- Rounded corners (`rounded-xl`), hover transitions
- PageHeader component for consistent page headers
