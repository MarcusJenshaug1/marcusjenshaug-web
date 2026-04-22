# Supabase-oppsett

## Rekkefølge

1. Opprett prosjekt på [supabase.com](https://supabase.com)
2. Dashboard → **Database** → **Extensions** → aktiver `pg_cron`
3. Dashboard → **SQL Editor** → kjør migrasjonene i rekkefølge:
   - `migrations/000_extensions.sql`
   - `migrations/001_initial_schema.sql`
   - `migrations/002_cron_jobs.sql`
4. **Project Settings** → **API** → kopier URL, anon key og service role key til `.env.local`
5. **Authentication** → **URL Configuration** → sett Site URL til produksjons-URL og legg til redirect-URLer

## Type-generering

```bash
npm install -g supabase
supabase gen types typescript --project-id <prosjekt-id> > lib/types/database.ts
```

Erstatter placeholder-typene i `lib/types/database.ts`.
