-- Flerspråk: norsk (nb) er kildespråket og bor i hovedtabellene som før.
-- Engelsk (og eventuelle flere språk senere) bor i content_translations, én rad
-- per (tabell, rad, språk), med egen slug så URL-ene kan være språkspesifikke.

create table if not exists content_translations (
  id uuid primary key default gen_random_uuid(),
  entity text not null check (entity in ('posts', 'projects', 'now_entries', 'uses_items')),
  entity_id uuid not null,
  locale text not null check (locale in ('en')),
  slug text,
  title text,
  description text,
  content text,
  role text,
  machine_translated boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (entity, entity_id, locale),
  unique (entity, locale, slug)
);

create index if not exists content_translations_lookup_idx
  on content_translations (entity, locale, entity_id);

alter table content_translations enable row level security;
drop policy if exists "translations public read" on content_translations;
create policy "translations public read" on content_translations for select using (true);

-- Engelske innstillinger ved siden av de norske.
alter table site_settings
  add column if not exists headline_en text not null default '',
  add column if not exists bio_short_en text not null default '',
  add column if not exists bio_long_en text not null default '',
  add column if not exists location_en text,
  add column if not exists availability_note_en text;

-- UI-strenger som skal kunne redigeres i admin uten deploy. Standardverdiene
-- ligger i koden (lib/i18n/dictionaries), denne tabellen overstyrer.
create table if not exists ui_strings (
  key text not null,
  locale text not null check (locale in ('nb', 'en')),
  value text not null,
  updated_at timestamptz default now(),
  primary key (key, locale)
);

alter table ui_strings enable row level security;
drop policy if exists "ui_strings public read" on ui_strings;
create policy "ui_strings public read" on ui_strings for select using (true);
