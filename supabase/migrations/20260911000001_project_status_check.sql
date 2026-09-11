-- Speiler PROJECT_STATUSES i lib/types/app.ts.

alter table projects
  drop constraint if exists projects_status_check;

alter table projects
  add constraint projects_status_check
  check (status in ('aktiv', 'i-drift', 'side', 'avsluttet', 'levert', 'arkivert'));
