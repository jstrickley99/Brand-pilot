-- BrandPilot Initial Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- ==========================================================================
-- User Settings
-- ==========================================================================

create table if not exists public.user_settings (
  user_id text primary key,
  niche text not null default 'general',
  brand_voice jsonb not null default '{"toneFormality": 50, "toneHumor": 50, "toneInspiration": 50}',
  content_mix jsonb not null default '{"educational": 25, "inspirational": 25, "entertaining": 25, "promotional": 25}',
  posts_per_day integer not null default 1,
  ai_provider text not null default 'anthropic' check (ai_provider in ('anthropic', 'openai')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==========================================================================
-- Social Media Accounts
-- ==========================================================================

create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  platform text not null check (platform in ('instagram', 'tiktok', 'youtube', 'facebook', 'twitter')),
  handle text not null,
  display_name text not null default '',
  avatar_url text,
  niche text not null default 'general',
  status text not null default 'connected' check (status in ('connected', 'disconnected', 'error', 'paused')),
  followers integer not null default 0,
  followers_growth real not null default 0,
  engagement_rate real not null default 0,
  posts_count integer not null default 0,
  last_post_at timestamptz,
  autonomy_level text not null default 'approval_required' check (autonomy_level in ('full_auto', 'semi_auto', 'approval_required')),
  brand_voice jsonb not null default '{"toneFormality": 50, "toneHumor": 50, "toneInspiration": 50, "contentMix": {"educational": 25, "inspirational": 25, "entertaining": 25, "promotional": 25}, "hashtagStrategy": [], "postsPerDay": 1, "preferredPostingTimes": []}',
  nango_connection_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_accounts_user_id on public.accounts (user_id);
create unique index if not exists idx_accounts_user_platform_handle on public.accounts (user_id, platform, handle);

-- ==========================================================================
-- Pipelines
-- ==========================================================================

create table if not exists public.pipelines (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  name text not null default 'Untitled Pipeline',
  status text not null default 'draft' check (status in ('draft', 'active', 'paused')),
  nodes jsonb not null default '[]',
  connections jsonb not null default '[]',
  assigned_account_ids text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pipelines_user_id on public.pipelines (user_id);

-- ==========================================================================
-- Content
-- ==========================================================================

create table if not exists public.content (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  account_id uuid references public.accounts(id) on delete set null,
  account_handle text not null default '',
  content_type text not null default 'image' check (content_type in ('image', 'carousel', 'reel', 'story')),
  status text not null default 'draft' check (status in ('draft', 'queued', 'scheduled', 'published', 'failed')),
  caption text not null default '',
  image_url text,
  hashtags text[] not null default '{}',
  scheduled_at timestamptz,
  published_at timestamptz,
  likes integer not null default 0,
  comments integer not null default 0,
  reach integer not null default 0,
  impressions integer not null default 0,
  is_repost boolean not null default false,
  original_creator text,
  ai_provider text check (ai_provider in ('anthropic', 'openai')),
  pipeline_run_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_content_user_id on public.content (user_id);
create index if not exists idx_content_status on public.content (user_id, status);

-- ==========================================================================
-- Pipeline Runs
-- ==========================================================================

create table if not exists public.pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  pipeline_id uuid not null references public.pipelines(id) on delete cascade,
  status text not null default 'running' check (status in ('running', 'completed', 'stopped', 'error')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_ms integer not null default 0,
  node_runs jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create index if not exists idx_pipeline_runs_pipeline on public.pipeline_runs (pipeline_id);
create index if not exists idx_pipeline_runs_user on public.pipeline_runs (user_id);

-- ==========================================================================
-- Updated_at triggers
-- ==========================================================================

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

create trigger trg_accounts_updated_at
  before update on public.accounts
  for each row execute function public.set_updated_at();

create trigger trg_pipelines_updated_at
  before update on public.pipelines
  for each row execute function public.set_updated_at();

create trigger trg_content_updated_at
  before update on public.content
  for each row execute function public.set_updated_at();

-- ==========================================================================
-- Row Level Security (RLS)
-- ==========================================================================
-- Using service role key bypasses RLS, but we enable it for safety.
-- When/if we add client-side Supabase, these policies will protect data.

alter table public.user_settings enable row level security;
alter table public.accounts enable row level security;
alter table public.pipelines enable row level security;
alter table public.content enable row level security;
alter table public.pipeline_runs enable row level security;

-- Service role has full access. These policies allow service role operations.
-- For future anon key usage, add policies matching auth.uid() to user_id.

create policy "Service role full access" on public.user_settings for all using (true);
create policy "Service role full access" on public.accounts for all using (true);
create policy "Service role full access" on public.pipelines for all using (true);
create policy "Service role full access" on public.content for all using (true);
create policy "Service role full access" on public.pipeline_runs for all using (true);
