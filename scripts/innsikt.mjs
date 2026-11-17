// Samler opp hva som har skjedd siden sist, så det er noe å skrive om.
//
//   node scripts/innsikt.mjs [--dager 7] [--siden 2026-11-01]
//
// Leser git-loggen i prosjektmappene og nøkkeltallene til Søknadsbasen, og
// skriver et sammendrag i markdown til stdout. Skriver ingenting noe sted.
// Tallene hentes med Søknadsbasens egen Prisma-klient i dens egen mappe, så
// dette skriptet trenger verken database-URL eller nye avhengigheter.

import { execFileSync } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const HJEM = homedir()
const MAPPER = [join(HJEM, 'Projects', 'personal'), join(HJEM, 'Projects', 'work')]
const SOKNADSBASEN = join(HJEM, 'Projects', 'personal', 'Soknadsbasen')

// Mappen heter ikke alltid det prosjektet heter utad.
const UTELATT = new Set(['node_modules', 'ours-tmp', 'storybook-test', 'nextjs-dashboard-learning'])

function flagg(argv) {
  const ut = {}
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) continue
    const neste = argv[i + 1]
    ut[argv[i].slice(2)] = neste && !neste.startsWith('--') ? (i++, neste) : true
  }
  return ut
}

function git(mappe, args) {
  try {
    return execFileSync('git', ['-c', 'safe.directory=*', '-C', mappe, ...args], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 20000,
    }).trim()
  } catch {
    return ''
  }
}

function repoer() {
  const ut = []
  for (const rot of MAPPER) {
    if (!existsSync(rot)) continue
    for (const navn of readdirSync(rot, { withFileTypes: true })) {
      if (!navn.isDirectory() || UTELATT.has(navn.name)) continue
      const sti = join(rot, navn.name)
      if (existsSync(join(sti, '.git'))) ut.push({ navn: navn.name, sti })
    }
  }
  return ut
}

function commits(repo, siden) {
  const linjer = git(repo.sti, ['log', '--all', `--since=${siden}`, '--date=short', '--pretty=%ad\t%s'])
  if (!linjer) return []
  return linjer
    .split('\n')
    .map((l) => {
      const [dato, ...rest] = l.split('\t')
      return { dato, melding: rest.join('\t') }
    })
    .filter((c) => c.melding && !/^Merge (branch|pull request)/.test(c.melding))
}

// Conventional commits først: feat og fix er det folk vil lese om.
function sorterEtterVerdi(liste) {
  const vekt = (m) => (/^feat/.test(m) ? 0 : /^fix/.test(m) ? 1 : /^(perf|refactor)/.test(m) ? 2 : 3)
  return [...liste].sort((a, b) => vekt(a.melding) - vekt(b.melding))
}

function tall() {
  if (!existsSync(join(SOKNADSBASEN, 'node_modules', '@prisma', 'client'))) {
    return { feil: 'Søknadsbasen har ikke node_modules. Kjør npm install der, eller hopp over tallene.' }
  }
  const kode = `
    const { PrismaClient } = require('@prisma/client')
    const p = new PrismaClient()
    const uke = new Date(Date.now() - 7 * 864e5)
    Promise.all([
      p.user.count(),
      p.user.count({ where: { createdAt: { gte: uke } } }),
      p.metricSnapshot.findMany({
        where: { capturedAt: { gte: uke } },
        orderBy: { capturedAt: 'desc' },
        take: 40,
        select: { metric: true, value: true, period: true, capturedAt: true },
      }),
    ])
      .then(([brukere, nye, maal]) => console.log(JSON.stringify({ brukere, nye, maal })))
      .catch((e) => console.log(JSON.stringify({ feil: e.message })))
      .finally(() => p.$disconnect())
  `
  try {
    const ut = execFileSync(process.execPath, ['--env-file=.env', '-e', kode], {
      cwd: SOKNADSBASEN,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 30000,
    })
    return JSON.parse(ut.trim().split('\n').pop())
  } catch (e) {
    return { feil: 'Fikk ikke kontakt med databasen: ' + e.message }
  }
}

const f = flagg(process.argv.slice(2))
const dager = Number(f.dager ?? 7)
const siden = f.siden ?? new Date(Date.now() - dager * 864e5).toISOString().slice(0, 10)

console.log(`# Hva har skjedd siden ${siden}\n`)

const funnet = []
for (const repo of repoer()) {
  const c = commits(repo, siden)
  if (c.length) funnet.push({ repo, commits: c })
}
funnet.sort((a, b) => b.commits.length - a.commits.length)

if (!funnet.length) {
  console.log('Ingen commits i perioden.\n')
} else {
  for (const { repo, commits: c } of funnet) {
    const gren = git(repo.sti, ['rev-parse', '--abbrev-ref', 'HEAD'])
    console.log(`## ${repo.navn} (${c.length} commits, gren ${gren || 'ukjent'})\n`)
    for (const x of sorterEtterVerdi(c).slice(0, 12)) console.log(`- ${x.dato}  ${x.melding}`)
    if (c.length > 12) console.log(`- … og ${c.length - 12} til`)
    console.log('')
  }
}

console.log('## Søknadsbasen i tall\n')
const t = tall()
if (t.feil) {
  console.log(`Ikke hentet: ${t.feil}\n`)
} else {
  console.log(`- Brukere totalt: ${t.brukere}`)
  console.log(`- Nye siste sju dager: ${t.nye}`)
  if (t.maal?.length) {
    console.log('\nMålepunkter siste uke:\n')
    const sett = new Set()
    for (const m of t.maal) {
      if (sett.has(m.metric)) continue
      sett.add(m.metric)
      console.log(`- ${m.metric} (${m.period}): ${m.value}`)
    }
  } else {
    console.log('- Ingen MetricSnapshot-rader den siste uka.')
  }
  console.log('')
}

console.log('---\n')
console.log('Kandidater til logg eller innlegg er det som står øverst per repo:')
console.log('feat og fix er sortert først, fordi det er der det har skjedd noe.')
