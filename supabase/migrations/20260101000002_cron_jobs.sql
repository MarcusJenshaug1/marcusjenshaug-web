-- Scheduled jobs (idempotent — unschedule hvis finnes, deretter schedule)

do $$
begin
  if exists (select 1 from cron.job where jobname = 'publish-scheduled-content') then
    perform cron.unschedule('publish-scheduled-content');
  end if;
  if exists (select 1 from cron.job where jobname = 'cleanup-rate-limits') then
    perform cron.unschedule('cleanup-rate-limits');
  end if;
end
$$;

select cron.schedule(
  'publish-scheduled-content',
  '* * * * *',
  $$
    update posts
       set draft = false, updated_at = now()
     where draft = true and published_at is not null and published_at <= now();
    update projects
       set draft = false, updated_at = now()
     where draft = true and started_at is not null and started_at <= current_date;
  $$
);

select cron.schedule(
  'cleanup-rate-limits',
  '0 * * * *',
  $$ delete from rate_limits where created_at < now() - interval '1 hour'; $$
);
