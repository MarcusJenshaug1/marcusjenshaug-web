// Skriver innhold til nettstedet fra kommandolinja, uten adminpanelet.
//
//   node --env-file=.env.local scripts/publiser.mjs <kommando> [flagg]
//
//   logg      --fil <sti> [--dato <ISO>]
//   innlegg   --slug <s> --tittel <t> --ingress <i> --fil <sti> [--tagger a,b] [--dato <ISO>]
//   prosjekt  --slug <s> [--beskrivelse <t>] [--innhold-fil <sti>] [--status <s>]
//   liste     <logg|innlegg|prosjekt>
//
// Nye rader opprettes alltid som utkast. Oppdatering av noe som allerede ligger
// ute rører ikke publiseringsstatusen, så et prosjekt som er synlig forblir
// synlig. Ingenting her kan publisere noe på egen hånd.

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const STATUSER = ['aktiv', 'i-drift', 'side', 'arkivert', 'levert']

function flagg(argv) {
  const ut = {}
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue
    const navn = argv[i].slice(2)
    const neste = argv[i + 1]
    ut[navn] = neste && !neste.startsWith('--') ? (i++, neste) : true
  }
  return ut
}

function stopp(melding) {
  console.error('Feil: ' + melding)
  process.exit(1)
}

function les(sti) {
  try {
    return readFileSync(sti, 'utf8').trim()
  } catch {
    stopp(`fant ikke fila «${sti}»`)
  }
}

function klient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    stopp('mangler NEXT_PUBLIC_SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY. Kjør med --env-file=.env.local')
  }
  return createClient(url, key, { auth: { persistSession: false } })
}

// Lagret tid er UTC. Vis den i norsk tid, ellers ser 08:00 ut som 07:00.
function norsktid(iso) {
  return new Date(iso)
    .toLocaleString('nb-NO', {
      timeZone: 'Europe/Oslo',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    .replace(',', ' kl.')
}

// Em-dash er bannlyst i dette repoet, så den strippes her også.
function vask(tekst) {
  return typeof tekst === 'string' ? tekst.replace(/\s*—\s*/g, ' - ') : tekst
}

async function revalider() {
  const base = process.env.NEXT_PUBLIC_SITE_URL
  const hemmelighet = process.env.REVALIDATE_SECRET
  if (!base || !hemmelighet) return
  try {
    await fetch(`${base}/api/revalidate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${hemmelighet}` },
      body: JSON.stringify({}),
    })
  } catch {
    console.warn('Advarsel: fikk ikke varslet nettstedet om endringen. Den ligger i databasen uansett.')
  }
}

async function logg(f) {
  if (!f.fil) stopp('logg krever --fil')
  const innhold = vask(les(f.fil))
  const published_at = f.dato ? new Date(f.dato).toISOString() : new Date().toISOString()
  if (isNaN(new Date(published_at).getTime())) stopp(`ugyldig dato «${f.dato}»`)

  const { data, error } = await klient()
    .from('now_entries')
    .insert({ content: innhold, published_at, draft: true })
    .select('id')
    .single()
  if (error) stopp(error.message)

  console.log(`Logg-oppføring lagret som utkast (${data.id}).`)
  console.log('Se over og publiser i /admin/na.')
}

async function innlegg(f) {
  for (const p of ['slug', 'tittel', 'ingress', 'fil']) {
    if (!f[p]) stopp(`innlegg krever --${p}`)
  }
  const rad = {
    slug: f.slug,
    title: vask(f.tittel),
    description: vask(f.ingress),
    content: vask(les(f.fil)),
    tags: f.tagger ? String(f.tagger).split(',').map((s) => s.trim()).filter(Boolean) : [],
    published_at: null,
    draft: true,
    updated_at: new Date().toISOString(),
  }

  // Med --dato blir innlegget liggende som utkast til tidspunktet er nådd, og
  // pg_cron slipper det ut selv. Uten --dato blir det liggende til du trykker.
  if (f.dato) {
    const d = new Date(f.dato)
    if (isNaN(d.getTime())) stopp(`ugyldig dato «${f.dato}»`)
    rad.published_at = d.toISOString()
  }

  const supabase = klient()
  const { data: finnes } = await supabase.from('posts').select('id, draft').eq('slug', f.slug).maybeSingle()

  if (finnes) {
    // Et innlegg som allerede ligger ute skal ikke forsvinne fordi teksten endres.
    delete rad.draft
    delete rad.published_at
    const { error } = await supabase.from('posts').update(rad).eq('id', finnes.id)
    if (error) stopp(error.message)
    console.log(`Innlegget «${f.slug}» er oppdatert (${finnes.draft ? 'utkast' : 'publisert'}).`)
  } else {
    const { error } = await supabase.from('posts').insert(rad)
    if (error) stopp(error.message)
    const naar = rad.published_at ? ` Publiseres av seg selv ${norsktid(rad.published_at)}.` : ''
    console.log(`Innlegget «${f.slug}» er lagret som utkast.${naar}`)
  }
  await revalider()
}

async function prosjekt(f) {
  if (!f.slug) stopp('prosjekt krever --slug')
  if (f.status && !STATUSER.includes(f.status)) {
    stopp(`ukjent status «${f.status}». Gyldige: ${STATUSER.join(', ')}`)
  }

  const supabase = klient()
  const { data: rad, error: lesefeil } = await supabase
    .from('projects')
    .select('id, title, draft')
    .eq('slug', f.slug)
    .maybeSingle()
  if (lesefeil) stopp(lesefeil.message)
  if (!rad) stopp(`fant ikke prosjektet «${f.slug}». Nye prosjekter lages i /admin/prosjekter.`)

  const endring = { updated_at: new Date().toISOString() }
  if (f.beskrivelse) endring.description = vask(f.beskrivelse)
  if (f['innhold-fil']) endring.content = vask(les(f['innhold-fil']))
  if (f.status) endring.status = f.status
  if (Object.keys(endring).length === 1) stopp('ingenting å endre. Oppgi --beskrivelse, --innhold-fil eller --status')

  const { error } = await supabase.from('projects').update(endring).eq('id', rad.id)
  if (error) stopp(error.message)

  console.log(`Prosjektet «${rad.title}» er oppdatert.`)
  if (!rad.draft) console.log('Det ligger ute, så endringen er synlig med én gang.')
  await revalider()
}

async function liste(hva) {
  const supabase = klient()
  if (hva === 'logg') {
    const { data } = await supabase
      .from('now_entries')
      .select('id, published_at, draft, content')
      .order('published_at', { ascending: false })
      .limit(15)
    for (const r of data ?? []) {
      console.log(`${r.draft ? 'UTKAST   ' : 'publisert'}  ${r.published_at.slice(0, 10)}  ${r.content.slice(0, 60).replace(/\s+/g, ' ')}…`)
    }
    return
  }
  if (hva === 'innlegg') {
    const { data } = await supabase.from('posts').select('slug, title, draft').order('updated_at', { ascending: false }).limit(20)
    for (const r of data ?? []) console.log(`${r.draft ? 'UTKAST   ' : 'publisert'}  ${r.slug.padEnd(40)} ${r.title}`)
    return
  }
  if (hva === 'prosjekt') {
    const { data } = await supabase.from('projects').select('slug, title, status, draft').order('order_index')
    for (const r of data ?? []) console.log(`${r.draft ? 'UTKAST   ' : 'publisert'}  ${r.status.padEnd(10)} ${r.slug.padEnd(28)} ${r.title}`)
    return
  }
  stopp('liste tar logg, innlegg eller prosjekt')
}

const [kommando, ...resten] = process.argv.slice(2)
const f = flagg(resten)

switch (kommando) {
  case 'logg':
    await logg(f)
    break
  case 'innlegg':
    await innlegg(f)
    break
  case 'prosjekt':
    await prosjekt(f)
    break
  case 'liste':
    await liste(resten[0])
    break
  default:
    console.log(readFileSync(new URL(import.meta.url)).toString().split('\n').slice(0, 13).join('\n').replace(/^\/\/ ?/gm, ''))
    process.exit(kommando ? 1 : 0)
}
