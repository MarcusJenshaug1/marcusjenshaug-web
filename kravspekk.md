# Kravspekk: marcusjenshaug.no

Personlig nettside som fungerer som entity home for Googles Knowledge Graph, porteføljeside og publiseringskanal — med eget admin-panel for innholdsforvaltning.

---

## 1. Formål og suksesskriterier

**Primære formål**
- Entity home: kanonisk kilde for identiteten "Marcus Jenshaug" mot Google/AI-crawlere
- Porteføljeside for faglig arbeid (Redi AS, Klink, andre prosjekter)
- Publiseringskanal for artikler, notater, "now"-oppdateringer og verktøylister
- Kontaktpunkt for rekrutterere og samarbeidspartnere

**Målbare suksesskriterier**
- Rangerer som #1 for `"Marcus Jenshaug"` innen 4–8 uker
- Lighthouse ≥95 i alle fire kategorier (mobil)
- Core Web Vitals består: LCP <2.5s, CLS <0.1, INP <200ms
- Godkjent av Rich Results Test for `Person`, `Article`, `BreadcrumbList`
- Utløser Google Knowledge Panel innen 3–6 måneder

---

## 2. Teknologi

Grunnprinsipp: **alt backend-relatert går gjennom Supabase**. Én tjeneste, ett auth-grensesnitt, ingen synk mellom systemer.

### 2.1 Backend (Supabase)

| Komponent | Bruk |
|---|---|
| Postgres | All data (posts, projects, now, uses, settings, rate_limits) |
| Auth | Magic link-innlogging for admin, whitelisted e-post |
| Storage | Bilder, OG-assets, CV-PDF |
| pg_cron | Planlagte jobber (scheduled publishing, rate-limit cleanup) |
| pg_net | HTTP-kall fra cron-jobber ved behov |
| RLS | Tilgangskontroll per tabell (se seksjon 5) |

### 2.2 Frontend og rendering

| Lag | Valg |
|---|---|
| Framework | Next.js 15 (App Router), React 19 |
| Språk | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| MDX-rendering | `next-mdx-remote/rsc` |
| Syntax highlighting | `shiki` (server-side) |
| Mutations | Server actions |
| Cache-invalidering | `revalidateTag` / `revalidatePath` |
| Skjemavalidering | `zod` |
| Ikoner | `react-icons/fi` |
| Fonter | `next/font` (self-hosted) |
| Type-generering | `supabase gen types typescript` |

### 2.3 Eksterne tjenester

Kun der Supabase ikke har god løsning.

| Tjeneste | Bruk |
|---|---|
| Vercel | Hosting, Edge, ISR |
| Resend | Transaksjonell e-post (kontaktskjema) |
| Vercel Analytics | Besøksstatistikk |
| Vercel Speed Insights | Core Web Vitals-måling |

### 2.4 Scheduled jobs (pg_cron)

Alle scheduled jobs kjører i Postgres via pg_cron. Ingen Vercel Cron, ingen Next.js scheduled functions.

```sql
-- Publiser posts/prosjekter når published_at/started_at er nådd
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

-- Rydd opp i rate_limits-tabellen
select cron.schedule(
  'cleanup-rate-limits',
  '0 * * * *',
  $$ delete from rate_limits where created_at < now() - interval '1 hour'; $$
);
```

---

## 3. Innholdsarkitektur

```
/                         Forside (hero + utvalgte prosjekter + siste innlegg + siste now)
/om                       Entity home – om meg + Person-schema
/prosjekter               Portefølje-indeks
/prosjekter/[slug]        Enkelt prosjekt
/blogg                    Artikkel-indeks
/blogg/[slug]             Enkeltartikkel
/na                       "Now"-side – nyeste + arkiv
/uses                     Verktøy, hardware, dev setup
/kontakt                  Skjema + direktelenker

/admin                    Login / dashboard
/admin/blogg              Liste + CRUD
/admin/blogg/ny
/admin/blogg/[id]
/admin/prosjekter         Liste + CRUD
/admin/prosjekter/ny
/admin/prosjekter/[id]
/admin/na                 Liste + CRUD for now-oppføringer
/admin/uses               CRUD for uses-items (gruppert per kategori)
/admin/innstillinger      Kontaktinfo, bio, sosiale lenker, CV-lenke

/sitemap.xml              Dynamisk
/robots.txt               Statisk (disallow /admin)
/rss.xml                  Full-text RSS for blogg
/feed.json                JSON Feed
/llms.txt                 Oversikt for AI-crawlere
/api/og                   OG-image-generator (Edge Runtime)
```

---

## 4. SEO og entitets-krav

### 4.1 Strukturerte data (JSON-LD)

**Root layout:**
```ts
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "url": "https://marcusjenshaug.no",
  "name": "Marcus Jenshaug",
  "inLanguage": "nb-NO",
  "author": { "@id": "https://marcusjenshaug.no/#person" }
}
```

**/om (kanonisk Person-entitet — hentes fra `site_settings`-tabellen):**
```ts
{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://marcusjenshaug.no/#person",
  "name": "Marcus Jenshaug",
  "url": "https://marcusjenshaug.no",
  "image": "https://marcusjenshaug.no/portrett.jpg",
  "jobTitle": "Fullstack-utvikler",
  "worksFor": {
    "@type": "Organization",
    "name": "Redi AS",
    "url": "https://redi.as"
  },
  "knowsAbout": ["Next.js", "TypeScript", "Supabase", "Azure"],
  "nationality": "Norwegian",
  "sameAs": [
    "https://www.linkedin.com/in/...",
    "https://github.com/...",
    "https://x.com/...",
    "https://www.wikidata.org/wiki/Q..."
  ]
}
```

**Blogginnlegg (`Article`):** `headline`, `author` (ref til `#person`), `datePublished`, `dateModified`, `image`, `inLanguage`, `mainEntityOfPage`.

**Prosjekter (`CreativeWork`):** `name`, `creator`, `url`, `dateCreated`, `keywords`.

**Breadcrumbs:** `BreadcrumbList` på alle undersider.

### 4.2 Metadata

- `generateMetadata()` per rute
- Dynamisk OG-bilde per innlegg/prosjekt via `/api/og`
- `alternates.canonical` på alle sider
- `<html lang="nb">`
- Title-mal: `${sidetittel} · Marcus Jenshaug` (forside uten suffix)
- Admin-ruter: `robots: { index: false, follow: false }`

### 4.3 Teknisk SEO

- `app/sitemap.ts` – statiske ruter + alle publiserte posts/prosjekter fra DB med `lastModified`
- `app/robots.ts` – `Disallow: /admin`, `Disallow: /api`, lenke til sitemap
- Én `<h1>` per side, hierarkisk headingstruktur
- `next/image` overalt, `priority` kun på LCP-bilde
- URL-struktur: `/blogg/slug-med-bindestreker`

### 4.4 Ytelse

- Public-sider: `revalidate = 3600`, invalidert via `revalidateTag` på publisering
- JS-budsjett offentlige sider: <100 kB initial
- `shiki` server-side for kodeblokker
- Admin-ruter ekskludert fra prerendering (`dynamic = 'force-dynamic'`)

---

## 5. Datamodell (Supabase)

```sql
-- Blogginnlegg
create table posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  content text not null,                -- MDX-kildekode
  cover_image text,
  tags text[] default '{}',
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  draft boolean default true
);

create index posts_published_idx on posts (published_at desc) where draft = false;
create index posts_slug_idx on posts (slug);

-- Prosjekter
create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  content text not null,                -- MDX
  cover_image text,
  tech_stack text[] default '{}',
  live_url text,
  repo_url text,
  role text,                            -- "Fullstack-utvikler", "Solo builder" osv.
  featured boolean default false,
  order_index int default 0,
  started_at date,
  ended_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  draft boolean default true
);

create index projects_featured_idx on projects (featured, order_index);

-- Now-oppdateringer (log-format)
create table now_entries (
  id uuid primary key default gen_random_uuid(),
  content text not null,                -- MDX eller ren markdown
  published_at timestamptz not null default now(),
  created_at timestamptz default now()
);

create index now_published_idx on now_entries (published_at desc);

-- Uses-items (verktøy, hardware, software)
create table uses_items (
  id uuid primary key default gen_random_uuid(),
  category text not null,               -- "hardware", "software", "dev", "desk"
  name text not null,
  description text,                     -- kort, én setning
  url text,
  order_index int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index uses_category_idx on uses_items (category, order_index);

-- Site settings (single row, nøkkel-verdi for bio/kontakt/sosiale)
create table site_settings (
  id int primary key default 1,
  full_name text not null default 'Marcus Jenshaug',
  headline text not null,               -- "Fullstack-utvikler i Redi AS"
  bio_short text not null,              -- 1–2 setninger til hero
  bio_long text not null,               -- full om-side-tekst (MDX)
  email text not null,
  location text default 'Norge',
  available_for_work boolean default false,
  availability_note text,               -- "Åpen for samarbeid Q3 2026"
  cv_url text,
  social_links jsonb not null default '[]'::jsonb,
  -- social_links: [{ platform: "linkedin", url: "...", username: "..." }, ...]
  updated_at timestamptz default now(),
  constraint single_row check (id = 1)
);

insert into site_settings (id, headline, bio_short, bio_long, email)
values (1, '', '', '', '') on conflict do nothing;

-- Rate limiting (brukes av kontaktskjema og auth-endepunkter)
create table rate_limits (
  id uuid primary key default gen_random_uuid(),
  bucket text not null,                 -- "contact:<ip>", "auth:<email>"
  created_at timestamptz default now()
);

create index rate_limits_bucket_idx on rate_limits (bucket, created_at desc);
```

**Row Level Security:**
```sql
alter table posts enable row level security;
alter table projects enable row level security;
alter table now_entries enable row level security;
alter table uses_items enable row level security;
alter table site_settings enable row level security;
alter table rate_limits enable row level security;

-- Public: les kun ikke-utkast
create policy "posts public read" on posts
  for select using (draft = false);
create policy "projects public read" on projects
  for select using (draft = false);
create policy "now public read" on now_entries
  for select using (true);
create policy "uses public read" on uses_items
  for select using (true);
create policy "settings public read" on site_settings
  for select using (true);

-- rate_limits: ingen public policy. Kun service role skriver/leser.

-- Admin: full tilgang via service role key (kun server-side)
-- Ingen anon-policy for write; server actions bruker service role.
```

---

## 6. Admin-panel

### 6.1 Tilgangskontroll

- Innlogging via Supabase Auth (magic link til whitelisted e-post)
- Middleware på `/admin/*`: sjekker sesjon og e-post mot `ADMIN_EMAIL` env-variabel
- Kun server-side Supabase-klient med service role key for mutations (aldri eksponert til klient)
- Hvis ikke autentisert → redirect til `/admin` (login-side)

### 6.2 Funksjonalitet per seksjon

**`/admin` – Dashboard**
- Login-skjema (magic link) hvis ikke autentisert
- Etter login: kort oversikt (antall utkast, siste publisering, raske lenker)

**`/admin/blogg`**
- Tabell: tittel, status (utkast/publisert), `published_at`, siste redigering
- Handlinger: Ny, Rediger, Slett (med bekreftelse), Toggle publisering
- Editor: tittel, slug (auto-generert, overstyrbar), description, tags, cover-bilde, MDX-innhold, `draft`-toggle
- Preview-knapp (åpner `/blogg/[slug]?preview=1` med utkast-modus)

**`/admin/prosjekter`**
- Som blogg, pluss: tech stack (tags), live-URL, repo-URL, rolle, datoer, featured-toggle, sortering (drag-drop eller order_index)

**`/admin/na`**
- Enkel liste over now-oppføringer, nyeste først
- Ny-knapp åpner inline MDX-editor med "Publiser nå"
- Hver oppføring kan redigeres eller slettes
- Ingen utkast-state (now-oppføringer publiseres direkte)

**`/admin/uses`**
- Gruppert per kategori
- CRUD per item, drag-drop sortering innen kategori
- Nye kategorier legges til ved å skrive nytt kategori-navn

**`/admin/innstillinger`**
- Ett skjema for `site_settings`-raden
- Felter: full_name, headline, bio_short, bio_long (MDX), email, location, availability_toggle, availability_note, cv_url
- Dynamisk liste for `social_links` (legg til/fjern/sorter)
- Lagring oppdaterer `sameAs` i Person-schema automatisk

### 6.3 UX-krav

- Ingen klient-side framework-overhead utover Next.js/React
- Server actions for alle mutations
- Optimistisk UI kun der det gir mening (sortering); ellers vent på server-respons
- Validering: `zod` både klient (UX) og server (sikkerhet)
- Alle mutations kaller relevant `revalidateTag` / `revalidatePath`
- Bildeopplastning: direkte til Supabase Storage via signed upload URLs, ikke via server
- Autosave på editor (hvert 10. sekund, kun hvis endringer)

### 6.4 MDX-editor

V1: Delt visning — `<textarea>` med monospace-font + server-rendered preview-pane.
Ingen WYSIWYG. Ingen drag-drop. Enkelt og pålitelig.

Senere upgrade-sti: CodeMirror 6 med MDX-syntax og live preview.

---

## 7. Design

### 7.1 Design-artifact (kilde til sannhet for visuelt uttrykk)

Visuelt uttrykk er definert i følgende design-artifact:

```
https://api.anthropic.com/v1/design/h/nOI56GJDNHh-X4Nzg_ZXEw?open_file=marcusjenshaug.no.html
```

Ved implementasjonsstart: hent pakken, les README, og lagre alle filer under `design/mockups/` i repoet for referanse. Artifactet definerer:

- Fargepalett (primær, aksent, nøytraler, dark/light-modi)
- Typografi (font-familier, størrelser, vekt, linjehøyde, tracking)
- Spacing-skala og layout-grid
- Komponent-utseende (cards, tabeller, skjema-elementer, knapper, tags)
- Layout per ruteklasse (forside, artikkel, admin-side osv.)

### 7.2 Ansvarsdeling mellom kravspekk og design

| Domene | Kilde til sannhet |
|---|---|
| Funksjonell oppførsel | Kravspekk |
| Datamodell og RLS | Kravspekk |
| SEO-krav og strukturerte data | Kravspekk |
| Tilgangskontroll og sikkerhet | Kravspekk |
| Fargepalett og typografi | Design-artifact |
| Spacing, layout, komponent-utseende | Design-artifact |
| Mørk/lys-modus-oppførsel | Design-artifact |
| Ikonbruk | Design-artifact (men alltid `react-icons/fi`) |

Ved konflikt mellom kravspekk og design vinner kravspekken. Ved tvetydighet i design (f.eks. en detalj som ikke er vist i mockupen), velg det som er konsistent med resten av designsystemet, ikke noe nytt.

### 7.3 Implementasjonsregler

- HTML-mockupen er **referanse, ikke produksjonskode**. Alle komponenter bygges som server components i Next.js App Router.
- Ingen UI-biblioteker (shadcn/ui, MUI, Chakra, Radix) selv om designet visuelt minner om noe av det.
- Tailwind CSS v4 brukes som styling-lag. Design-tokens (farger, font-stack, radius, shadow) defineres i `app/globals.css` via `@theme`-direktivet, avledet fra design-artifactet.
- Admin-panelet deler designsystem med offentlig side — ingen separat "dashboard-look".
- Artikkel-innhold bruker `@tailwindcss/typography` med `prose`-klasser tilpasset design-tokens.
- Ingen animasjoner som introduserer CLS eller skader INP. Transitions kun på hover/focus-state (≤150ms).

### 7.4 Komponentbudsjett

- Layout: `<Header>`, `<Footer>`, `<ThemeToggle>`
- Public: `<PostCard>`, `<ProjectCard>`, `<NowEntry>`, `<UsesGroup>`, `<Tag>`, `<Prose>`
- Admin: `<AdminNav>`, `<DataTable>`, `<MdxEditor>`, `<ImageUploader>`, `<SortableList>`
- Felles: `<CodeBlock>` (shiki output), `<Button>`, `<Input>`, `<Textarea>`, `<Label>`, `<FormField>`

---

## 8. Tilgjengelighet (WCAG 2.2 AA)

- Semantisk HTML (`<article>`, `<nav>`, `<main>`, `<time>`)
- Synlig `:focus-visible` på alle interaktive elementer
- Kontrast ≥ 4.5:1 (normal tekst), ≥ 3:1 (stor tekst)
- `alt` på alle meningsbærende bilder
- Skip-link til `<main>`
- `prefers-reduced-motion` respektert
- Skjemaer i admin: `<label>` bundet til inputs, aria-feilmeldinger

---

## 9. Sikkerhet

- CSP-header via Next.js middleware
- `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- `robots.txt` disallow `/admin`, og admin-ruter har `noindex`
- Middleware-beskyttelse på `/admin/*` basert på Supabase-sesjon + e-post-whitelist
- Supabase service role key kun i server-environment (aldri `NEXT_PUBLIC_*`)
- Rate-limit på `/api/contact` (5 req/min per IP)
- Rate-limit på auth-endepunkter
- Honeypot + `zod`-validering på kontaktskjema
- Server actions validerer både input og sesjon før mutation

---

## 10. Innholdskrav ved lansering

**Må være på plass V1:**
- `site_settings` utfylt med bio, kontaktinfo, sosiale lenker
- Profilbilde lastet opp (konsistent med LinkedIn/GitHub)
- Minst 3 prosjekter publisert (Klink, Redi Hub, ett til)
- Minst 2 blogginnlegg publisert
- Minst 1 now-oppføring
- Minst 10 uses-items på tvers av 3–4 kategorier
- Favicon-sett (32, 180, 192, 512 + `site.webmanifest`)

---

## 11. Utrullingsplan

**Fase 1 – Grunnstruktur og admin-skall (uke 1)**
- Hent design-artifact (se 7.1), pakk ut til `design/mockups/`, les README
- Avled design-tokens (farger, typografi, spacing) til `app/globals.css` via `@theme`
- Next.js + Tailwind + deploy til Vercel med `marcusjenshaug.no`
- Supabase-prosjekt satt opp, tabeller og RLS på plass
- Admin-auth fungerer (magic link, middleware, whitelist)
- `site_settings`-admin ferdig — du kan oppdatere bio og sosiale lenker
- `/`, `/om`, `/kontakt` rendres fra `site_settings`
- Root-layout med `Person`-schema (dynamisk fra DB)
- Commits i stil med: `feat: hent design-tokens fra artifact`, `feat: sett opp supabase og rls`, `feat: admin-middleware og magic link`

**Fase 2 – Portefølje (uke 2)**
- `projects`-tabell brukt i `/prosjekter` + `[slug]`
- `/admin/prosjekter` CRUD fullført
- `CreativeWork`-schema
- 3 prosjekter skrevet og publisert

**Fase 3 – Blogg (uke 3)**
- `posts`-tabell i `/blogg` + `[slug]`
- `/admin/blogg` CRUD fullført med MDX-editor + preview
- `shiki` syntax highlighting
- `Article`-schema + dynamisk OG-image
- RSS, JSON Feed
- 2 artikler publisert

**Fase 4 – Now og Uses (uke 4)**
- `/na` med siste oppføring + arkiv
- `/admin/na` CRUD
- `/uses` med kategorigrupperte items
- `/admin/uses` CRUD med drag-drop sortering

**Fase 5 – Polish (uke 5)**
- Ytelse-pass: Lighthouse ≥95 på alle offentlige ruter
- Rich Results Test passert for alle schema-typer
- `llms.txt` og `sitemap.ts` finpusset
- Autosave i editor
- Signed upload URLs for bilder

**Parallelt entitetsarbeid (fra uke 1)**
- Konsistent navn/bio/bilde på LinkedIn, GitHub, X, Bluesky
- Wikidata-entry med `official website`, `occupation`, `employer`
- Submit URL til Google Search Console
- Plan for 2–3 eksterne mentions (podcast, gjesteinnlegg, meetup-talk)

---

## 12. Ikke-mål for V1

- Kommentarer på innlegg
- Søkefunksjon
- Nyhetsbrev / e-post-abonnement
- i18n / engelsk versjon
- Flere brukere enn deg i admin
- WYSIWYG-editor
- Kommentar-moderering
- Tracking utover Vercel Analytics