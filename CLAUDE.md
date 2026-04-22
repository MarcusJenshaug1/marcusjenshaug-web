# marcusjenshaug.no

Personlig nettside og entity home for Google Knowledge Graph. Eier: Marcus Jenshaug (Redi AS).

## Kilder til sannhet

- Kravspekk: @kravspekk.md
- Design-mockups: @design/mockups/
- Design-notater: @design/design-notes.md

Ved konflikt: kravspekken vinner over mockups, mockups vinner over antagelser.

## Stack (låst)

Next.js 15 (App Router), React 19, TypeScript strict, Tailwind CSS v4, Supabase (Postgres + Auth + Storage), Vercel, `next-mdx-remote/rsc`, `shiki`, `zod`, Resend, `react-icons/fi`.

Ingen UI-biblioteker (shadcn/ui, MUI, Chakra, Radix). Komponenter bygges selv.

## Konvensjoner

- Språk: norsk bokmål i UI-tekst, commits, og kommunikasjon med meg
- Commits: Conventional Commits med norsk beskrivelse (`feat: ...`, `fix: ...`, `refactor: ...`)
- Server components som default, `'use client'` kun når strengt nødvendig
- Server actions for alle mutations, aldri route handlers for skjema-submits
- Ingen kommentarer, docstrings eller type annotations der de er åpenbare
- Ingen `any`, ingen `@ts-ignore`
- Ingen emojier som ikoner — kun `react-icons/fi`
- Ikke over-engineer. Enkle løsninger først.
- Ved feilsøking: finn rotårsaken, ikke patch symptomer

## Arbeidsform

- Lever i små, committable enheter som hver kan beskrives med én Conventional Commit-linje
- Ved usikkerhet: still maks 3 avklaringsspørsmål før du starter, ikke gjett
- Ved bugs: reproduser først, deretter finn rotårsaken før løsning
- Når en feature er ferdig: foreslå commit-melding på norsk

## Struktur

```
app/
  (public)/            # Offentlige sider – forside, om, blogg osv.
  admin/               # Beskyttet admin-panel
  api/
components/
lib/
  supabase/
    server.ts          # RSC-klient (cookies-basert)
    admin.ts           # Service role, KUN i server actions
content/               # Dersom MDX trengs lokalt (assets)
middleware.ts          # Auth-sjekk på /admin/*
```

## Miljøvariabler

Alle dokumenteres i `.env.example` med kommentar om hvor verdien hentes fra.

Kritisk: `SUPABASE_SERVICE_ROLE_KEY` skal ALDRI være `NEXT_PUBLIC_*`, og skal aldri brukes i client components.

## Ikke-mål

Seksjon 12 i kravspekken er hard. Ikke bygg kommentarer, søk, nyhetsbrev, i18n, flerbrukers admin, eller WYSIWYG-editor i V1.

## Når du er i tvil

Still spørsmål. Ikke anta.