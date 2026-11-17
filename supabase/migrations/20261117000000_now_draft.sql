-- Utkast for logg-oppføringer, slik posts og projects allerede har.
-- Kolonnen legges til med false og får default true etterpå. Motsatt rekkefølge
-- ville satt alle eksisterende oppføringer til utkast og tømt /now-siden.
alter table now_entries add column if not exists draft boolean not null default false;
alter table now_entries alter column draft set default true;

create index if not exists now_draft_published_idx on now_entries (draft, published_at desc);

-- Ingen planlagt publisering her, i motsetning til posts: now_entries.published_at
-- er not null og settes til now() som standard, så cron-jobben ville publisert
-- hvert utkast ett minutt etter at det ble laget.
