-- Status for prosjekter: aktiv, i-drift, side, arkivert, levert
alter table projects
  add column if not exists status text not null default 'aktiv';

create index if not exists projects_status_idx on projects (status);
