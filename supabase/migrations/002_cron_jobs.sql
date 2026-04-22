-- Krever pg_cron-extension (se 000_extensions.sql)

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
