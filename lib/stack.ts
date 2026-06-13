export type StackItem = {
  name: string
  category: 'språk' | 'rammeverk' | 'verktøy' | 'infra'
  note?: string
}

export const STACK: StackItem[] = [
  { name: 'TypeScript', category: 'språk', note: 'Strict, alltid' },
  { name: 'Next.js', category: 'rammeverk', note: 'App Router, server-first' },
  { name: 'React', category: 'rammeverk', note: 'Server components som default' },
  { name: 'Tailwind CSS', category: 'rammeverk', note: 'v4 med semantiske tokens' },
  { name: 'Supabase', category: 'infra', note: 'Postgres, Auth og Storage' },
  { name: 'PostgreSQL', category: 'infra', note: 'RLS og pg_cron' },
  { name: 'Node.js', category: 'språk', note: 'Runtime for det meste' },
  { name: 'Vercel', category: 'infra', note: 'Edge og ISR' },
  { name: 'Azure', category: 'infra', note: 'Skydrift i jobbsammenheng' },
  { name: 'Docker', category: 'verktøy', note: 'Selvhosting og dev-miljø' },
  { name: 'Git', category: 'verktøy', note: 'Conventional Commits' },
  { name: 'MDX', category: 'verktøy', note: 'Innhold som kode' },
]
