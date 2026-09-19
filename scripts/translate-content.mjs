// AI-oversetter eksisterende norsk innhold til engelsk og lagrer i content_translations
// (og *_en-kolonnene i site_settings). Kjøres lokalt med service role-nøkkel:
//
//   npm run translate-content
//   node --env-file=.env.local scripts/translate-content.mjs [--dry] [--only <tabell>] [--force]
//
//   --dry           Oversett og logg, men ikke skriv til databasen
//   --only <tabell> Kun én av: posts | projects | now_entries | uses_items | settings
//   --force         Oversett på nytt selv om raden allerede har en engelsk oversettelse
//
// Krever i .env.local: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, OPENAI_API_KEY
// (valgfritt OPENAI_TEXT_MODEL, standard gpt-5-mini).
//
// Rader som allerede har oversettelse hoppes over (med mindre --force). Alt som skrives
// merkes machine_translated=true, så det vises som «ikke gjennomgått» i admin. Engelsk slug
// utledes av oversatt tittel og får «-2», «-3» … ved kollisjon. Maks 3 rader oversettes samtidig.

import { createClient } from '@supabase/supabase-js'

const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const FORCE = args.includes('--force')
const onlyIndex = args.indexOf('--only')
const ONLY = onlyIndex !== -1 ? args[onlyIndex + 1] : null
const CONCURRENCY = 3
const TARGET = 'en'

const ENTITIES = ['posts', 'projects', 'now_entries', 'uses_items', 'settings']
if (ONLY && !ENTITIES.includes(ONLY)) {
  console.error(`✗ Ukjent --only: ${ONLY}. Gyldige: ${ENTITIES.join(', ')}`)
  process.exit(1)
}

for (const name of ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'OPENAI_API_KEY']) {
  if (!process.env[name]) {
    console.error(`✗ ${name} mangler i .env.local`)
    process.exit(1)
  }
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const SYSTEM_PROMPT = `You translate content for the personal website of Marcus Jenshaug, a Norwegian full-stack developer at Redi AS.

Rules:
- Translate from Norwegian (bokmål) to natural, idiomatic English. Keep the author's tone: direct, concise, first person.
- Preserve MDX/markdown structure exactly: headings, lists, emphasis, tables, blockquotes, horizontal rules, JSX components and their props.
- Do not translate or alter code blocks, inline code, URLs, link targets, image paths, frontmatter keys or any HTML/JSX tag names. Link text may be translated.
- Do not translate proper nouns, product names, company names or technology names (Redi AS, Klink, Redi Hub, Supabase, Next.js, Vercel, Azure, TypeScript, etc.).
- Keep numbers, dates and units as they are.
- Do not add, remove or summarise anything. Empty input strings stay empty.
- Respond with a single JSON object with exactly the same keys as the input and string values. No prose, no code fences.`

const CONTEXT = {
  posts: 'a blog post written in MDX',
  projects: 'a portfolio project description written in MDX',
  now_entries: 'a short "now" status update written in markdown',
  uses_items: 'an item in a "uses" list of tools, hardware and software',
  settings: "the site owner's bio, headline and contact details",
}

async function callOpenAI(system, user) {
  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: process.env.OPENAI_TEXT_MODEL ?? 'gpt-5-mini',
      input: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      text: { format: { type: 'json_object' } },
      max_output_tokens: 16000,
    }),
  })
  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const json = await res.json()
  const text = (json.output ?? [])
    .filter((o) => o.type === 'message')
    .flatMap((o) => o.content ?? [])
    .filter((c) => c.type === 'output_text')
    .map((c) => c.text ?? '')
    .join('')
    .trim()
  if (!text) throw new Error('OpenAI: tomt svar')
  return text
}

function parseJsonObject(raw) {
  let text = raw.trim()
  const fence = text.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i)
  if (fence) text = fence[1].trim()
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('Svaret inneholdt ikke JSON')
  const parsed = JSON.parse(text.slice(start, end + 1))
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('Svaret var ikke et JSON-objekt')
  return parsed
}

async function translateFields(fields, entity) {
  const nonEmpty = Object.fromEntries(Object.entries(fields).filter(([, v]) => typeof v === 'string' && v.trim()))
  const out = Object.fromEntries(Object.keys(fields).map((k) => [k, '']))
  if (Object.keys(nonEmpty).length === 0) return out
  const user = [
    `Content type: ${CONTEXT[entity]}.`,
    `Source language: nb. Target language: ${TARGET}.`,
    'Translate every value in this JSON object:',
    JSON.stringify(nonEmpty, null, 2),
  ].join('\n')
  const parsed = parseJsonObject(await callOpenAI(SYSTEM_PROMPT, user))
  for (const key of Object.keys(nonEmpty)) {
    if (typeof parsed[key] !== 'string') throw new Error(`Oversettelsen mangler feltet «${key}»`)
    out[key] = parsed[key].replace(/—/g, ',')
  }
  return out
}

function slugify(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function runLimited(items, worker) {
  const queue = items.slice()
  const results = { ok: 0, skipped: 0, failed: 0 }
  async function next() {
    while (queue.length) {
      const item = queue.shift()
      try {
        const status = await worker(item)
        results[status] += 1
      } catch (e) {
        results.failed += 1
        console.error(`  ✗ ${item.label}: ${e instanceof Error ? e.message : e}`)
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, items.length) }, next))
  return results
}

async function fetchAll(table, columns) {
  const { data, error } = await supabase.from(table).select(columns)
  if (error) throw new Error(`${table}: ${error.message}`)
  return data ?? []
}

async function existingTranslations(entity) {
  const { data, error } = await supabase
    .from('content_translations')
    .select('entity_id, slug')
    .eq('entity', entity)
    .eq('locale', TARGET)
  if (error) throw new Error(`content_translations: ${error.message}`)
  return data ?? []
}

const ENTITY_FIELDS = {
  posts: { columns: 'id, slug, title, description, content', fields: (r) => ({ title: r.title, description: r.description, content: r.content }) },
  projects: { columns: 'id, slug, title, description, content, role', fields: (r) => ({ title: r.title, description: r.description, content: r.content, role: r.role ?? '' }) },
  now_entries: { columns: 'id, content', fields: (r) => ({ content: r.content }) },
  uses_items: { columns: 'id, name, description', fields: (r) => ({ title: r.name, description: r.description ?? '' }) },
}

async function translateEntity(entity) {
  const { columns, fields } = ENTITY_FIELDS[entity]
  const [rows, existing] = await Promise.all([fetchAll(entity, columns), existingTranslations(entity)])
  const translated = new Map(existing.map((t) => [t.entity_id, t.slug]))
  const usedSlugs = new Set(existing.map((t) => t.slug).filter(Boolean))
  const hasSlug = entity === 'posts' || entity === 'projects'

  console.log(`\n${entity}: ${rows.length} rader, ${translated.size} allerede oversatt`)

  const items = rows.map((r) => ({ row: r, label: r.title ?? r.name ?? r.content?.slice(0, 40) ?? r.id }))
  return runLimited(items, async ({ row, label }) => {
    if (translated.has(row.id) && !FORCE) {
      console.log(`  – ${label}: hopper over (har oversettelse)`)
      return 'skipped'
    }
    const t = await translateFields(fields(row), entity)
    let slug = null
    if (hasSlug) {
      const own = translated.get(row.id) ?? null
      const base = slugify(t.title) || row.slug
      slug = base
      let n = 2
      while (slug !== own && usedSlugs.has(slug)) slug = `${base}-${n++}`
      usedSlugs.add(slug)
    }
    const payload = {
      entity,
      entity_id: row.id,
      locale: TARGET,
      slug,
      title: t.title || null,
      description: t.description || null,
      content: t.content || null,
      role: t.role || null,
      machine_translated: true,
      updated_at: new Date().toISOString(),
    }
    if (DRY) {
      console.log(`  ✓ ${label} → ${slug ?? '(uten slug)'} [dry]`)
      return 'ok'
    }
    const { error } = await supabase
      .from('content_translations')
      .upsert(payload, { onConflict: 'entity,entity_id,locale' })
    if (error) throw new Error(error.message)
    console.log(`  ✓ ${label} → ${slug ?? '(uten slug)'}`)
    return 'ok'
  })
}

async function translateSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('headline, bio_short, bio_long, location, availability_note, headline_en, bio_short_en, bio_long_en')
    .eq('id', 1)
    .maybeSingle()
  if (error) throw new Error(`site_settings: ${error.message}`)
  if (!data) {
    console.log('\nsettings: ingen rad')
    return { ok: 0, skipped: 0, failed: 0 }
  }
  console.log('\nsettings')
  const already = data.headline_en || data.bio_short_en || data.bio_long_en
  if (already && !FORCE) {
    console.log('  – hopper over (har engelske felt)')
    return { ok: 0, skipped: 1, failed: 0 }
  }
  try {
    const t = await translateFields(
      {
        headline: data.headline,
        bio_short: data.bio_short,
        bio_long: data.bio_long,
        location: data.location ?? '',
        availability_note: data.availability_note ?? '',
      },
      'settings'
    )
    const patch = {
      headline_en: t.headline,
      bio_short_en: t.bio_short,
      bio_long_en: t.bio_long,
      location_en: t.location || null,
      availability_note_en: t.availability_note || null,
      updated_at: new Date().toISOString(),
    }
    if (DRY) {
      console.log(`  ✓ headline_en: ${patch.headline_en} [dry]`)
      return { ok: 1, skipped: 0, failed: 0 }
    }
    const { error: updateError } = await supabase.from('site_settings').update(patch).eq('id', 1)
    if (updateError) throw new Error(updateError.message)
    console.log(`  ✓ headline_en: ${patch.headline_en}`)
    return { ok: 1, skipped: 0, failed: 0 }
  } catch (e) {
    console.error(`  ✗ settings: ${e instanceof Error ? e.message : e}`)
    return { ok: 0, skipped: 0, failed: 1 }
  }
}

const targets = ONLY ? [ONLY] : ENTITIES
const totals = { ok: 0, skipped: 0, failed: 0 }
console.log(`Oversetter nb → ${TARGET}${DRY ? ' (dry run)' : ''}${FORCE ? ' (force)' : ''}: ${targets.join(', ')}`)

for (const target of targets) {
  const result = target === 'settings' ? await translateSettings() : await translateEntity(target)
  totals.ok += result.ok
  totals.skipped += result.skipped
  totals.failed += result.failed
}

console.log(`\nFerdig: ${totals.ok} oversatt, ${totals.skipped} hoppet over, ${totals.failed} feilet${DRY ? ' (ingenting skrevet)' : ''}`)
process.exit(totals.failed > 0 ? 1 : 0)

if (!DRY && process.env.REVALIDATE_SECRET && process.env.NEXT_PUBLIC_SITE_URL) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.REVALIDATE_SECRET}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  console.log(res.ok ? 'cache invalidert' : `cache: HTTP ${res.status}`)
}
