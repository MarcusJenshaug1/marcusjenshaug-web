-- Tabeller og indekser (idempotent)

create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  content text not null,
  cover_image text,
  tags text[] default '{}',
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  draft boolean default true
);
create index if not exists posts_published_idx on posts (published_at desc) where draft = false;
create index if not exists posts_slug_idx on posts (slug);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  content text not null,
  cover_image text,
  tech_stack text[] default '{}',
  live_url text,
  repo_url text,
  role text,
  featured boolean default false,
  order_index int default 0,
  started_at date,
  ended_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  draft boolean default true
);
create index if not exists projects_featured_idx on projects (featured, order_index);

create table if not exists now_entries (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  published_at timestamptz not null default now(),
  created_at timestamptz default now()
);
create index if not exists now_published_idx on now_entries (published_at desc);

create table if not exists uses_items (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  description text,
  url text,
  order_index int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists uses_category_idx on uses_items (category, order_index);

create table if not exists site_settings (
  id int primary key default 1,
  full_name text not null default 'Marcus Jenshaug',
  headline text not null default '',
  bio_short text not null default '',
  bio_long text not null default '',
  email text not null default '',
  location text default 'Norge',
  available_for_work boolean default false,
  availability_note text,
  cv_url text,
  image_url text default '/portrett.jpg',
  social_links jsonb not null default '[]'::jsonb,
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);
insert into site_settings (id) values (1) on conflict (id) do nothing;

create table if not exists rate_limits (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,
  created_at timestamptz default now()
);
create index if not exists rate_limits_bucket_idx on rate_limits (bucket, created_at desc);

-- Row Level Security
alter table posts enable row level security;
alter table projects enable row level security;
alter table now_entries enable row level security;
alter table uses_items enable row level security;
alter table site_settings enable row level security;
alter table rate_limits enable row level security;

-- Policies (drop + recreate for idempotency)
drop policy if exists "posts public read" on posts;
create policy "posts public read" on posts for select using (draft = false);

drop policy if exists "projects public read" on projects;
create policy "projects public read" on projects for select using (draft = false);

drop policy if exists "now public read" on now_entries;
create policy "now public read" on now_entries for select using (true);

drop policy if exists "uses public read" on uses_items;
create policy "uses public read" on uses_items for select using (true);

drop policy if exists "settings public read" on site_settings;
create policy "settings public read" on site_settings for select using (true);
