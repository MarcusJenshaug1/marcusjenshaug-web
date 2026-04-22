-- Storage bucket for bilder (cover, portrett, osv.)
-- Offentlig lesetilgang. Kun service role kan skrive (via server actions).

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media public read"
  on storage.objects for select
  using (bucket_id = 'media');
