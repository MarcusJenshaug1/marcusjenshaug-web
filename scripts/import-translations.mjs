// Importerer ferdige engelske oversettelser fra JSON-filer til content_translations
// og site_settings. Brukes når oversettelsene er laget utenfor translate-content.mjs
// (for eksempel manuelt eller med en annen modell).
//
//   node --env-file=.env.local scripts/import-translations.mjs <mappe> [--reviewed]
//
// Mappen kan inneholde posts.json, projects.json, now.json, uses.json, settings.json.
// Alle unntatt settings er lister av { id, slug?, title?, description?, content?, role? }
// (uses: name → title). settings er { headline_en, bio_short_en, bio_long_en,
// location_en, availability_note_en }. Uten --reviewed merkes radene som maskinoversatt.

import { createClient } from '@supabase/supabase-js'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const dir = process.argv[2]
if (!dir) {
  console.error('Bruk: node --env-file=.env.local scripts/import-translations.mjs <mappe> [--reviewed]')
  process.exit(2)
}
const reviewed = process.argv.includes('--reviewed')

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const ENTITIES = {
  posts: 'posts',
  projects: 'projects',
  now: 'now_entries',
  uses: 'uses_items',
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function uniqueSlug(entity, base, entityId) {
  const { data } = await supabase
    .from('content_translations')
    .select('slug, entity_id')
    .eq('entity', entity)
    .eq('locale', 'en')
    .like('slug', `${base}%`)
  const taken = new Set((data ?? []).filter((r) => r.entity_id !== entityId).map((r) => r.slug))
  if (!taken.has(base)) return base
  for (let i = 2; i < 100; i++) if (!taken.has(`${base}-${i}`)) return `${base}-${i}`
  return `${base}-${Date.now()}`
}

// Interne lenker i engelsk innhold skal peke på engelske URL-er. Bygger et kart
// norsk slug → engelsk slug fra filene som importeres, og skriver om
// /prosjekter/<nb> og /blogg/<nb> (med eller uten /nb-prefiks) til /en/….
const slugMap = { projects: new Map(), posts: new Map() }
for (const [file, entity] of Object.entries(ENTITIES)) {
  if (!(entity in slugMap)) continue
  const p = path.join(dir, `${file}.json`)
  if (!existsSync(p)) continue
  for (const row of JSON.parse(readFileSync(p, 'utf8'))) {
    if (row.sourceSlug && row.slug) slugMap[entity].set(row.sourceSlug, slugify(row.slug))
  }
}
function rewriteLinks(content) {
  if (!content) return content
  const sections = { na: 'now', om: 'about', kontakt: 'contact', uses: 'uses' }
  return content
    .replace(/\(\/(?:nb\/)?prosjekter\/([a-z0-9-]+)/g, (_m, nb) => `(/en/projects/${slugMap.projects.get(nb) ?? nb}`)
    .replace(/\(\/(?:nb\/)?blogg\/([a-z0-9-]+)/g, (_m, nb) => `(/en/blog/${slugMap.posts.get(nb) ?? nb}`)
    .replace(/\(\/(?:nb\/)?(na|om|kontakt|uses)(\)|\/|#)/g, (_m, seg, tail) => `(/en/${sections[seg]}${tail}`)
}

for (const [file, entity] of Object.entries(ENTITIES)) {
  const p = path.join(dir, `${file}.json`)
  if (!existsSync(p)) continue
  const rows = JSON.parse(readFileSync(p, 'utf8'))
  let ok = 0
  for (const row of rows) {
    const title = row.title ?? row.name ?? null
    const wantsSlug = entity === 'posts' || entity === 'projects'
    const slug = wantsSlug ? await uniqueSlug(entity, row.slug ? slugify(row.slug) : slugify(title ?? row.id), row.id) : null
    const { error } = await supabase.from('content_translations').upsert(
      {
        entity,
        entity_id: row.id,
        locale: 'en',
        slug,
        title,
        description: row.description ?? null,
        content: rewriteLinks(row.content) ?? null,
        role: row.role ?? null,
        machine_translated: !reviewed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'entity,entity_id,locale' }
    )
    if (error) console.error(`  ✗ ${entity} ${row.id}: ${error.message}`)
    else ok++
  }
  console.log(`${entity}: ${ok}/${rows.length} importert`)
}

const settingsPath = path.join(dir, 'settings.json')
if (existsSync(settingsPath)) {
  const s = JSON.parse(readFileSync(settingsPath, 'utf8'))
  const { error } = await supabase
    .from('site_settings')
    .update({
      headline_en: s.headline_en ?? '',
      bio_short_en: s.bio_short_en ?? '',
      bio_long_en: rewriteLinks(s.bio_long_en) ?? '',
      location_en: s.location_en ?? null,
      availability_note_en: s.availability_note_en ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1)
  console.log(error ? `settings: ✗ ${error.message}` : 'settings: importert')
}

// Be produksjonen kaste innholdscachen så oversettelsene vises med en gang.
if (process.env.REVALIDATE_SECRET && process.env.NEXT_PUBLIC_SITE_URL) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.REVALIDATE_SECRET}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  })
  console.log(res.ok ? 'cache invalidert' : `cache: HTTP ${res.status} (kjør POST /api/revalidate manuelt)`)
} else {
  console.log('cache ikke invalidert (mangler REVALIDATE_SECRET); innholdet vises innen en time')
}
