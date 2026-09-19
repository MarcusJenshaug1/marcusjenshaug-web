create extension if not exists pg_net;

-- Når pg_cron flipper draft=false ved planlagt publisering, ber vi Vercel kaste
-- innholdscachen med en gang i stedet for å vente på timesutløpet. Hemmeligheten
-- hentes fra Vault (legg inn med: select vault.create_secret('<verdi>', 'revalidate_secret')).
create or replace function public.revalidate_site(tags text[] default null)
returns void
language plpgsql
security definer
set search_path = public, extensions, vault
as $$
declare
  secret text;
  site text := 'https://marcusjenshaug.no';
begin
  select decrypted_secret into secret from vault.decrypted_secrets where name = 'revalidate_secret' limit 1;
  if secret is null then
    return;
  end if;
  perform net.http_post(
    url := site || '/api/revalidate',
    headers := jsonb_build_object('Authorization', 'Bearer ' || secret, 'Content-Type', 'application/json'),
    body := case when tags is null then '{}'::jsonb else jsonb_build_object('tags', to_jsonb(tags)) end
  );
end;
$$;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'publish-scheduled-content') then
    perform cron.unschedule('publish-scheduled-content');
  end if;
end
$$;
select cron.schedule(
  'publish-scheduled-content',
  '* * * * *',
  $$
    with p as (
      update posts set draft = false, updated_at = now()
      where draft = true and published_at is not null and published_at <= now()
      returning 1
    ),
    q as (
      update projects set draft = false, updated_at = now()
      where draft = true and started_at is not null and started_at <= current_date
      returning 1
    )
    select public.revalidate_site(array['posts', 'projects', 'translations'])
    where exists (select 1 from p) or exists (select 1 from q);
  $$
);
