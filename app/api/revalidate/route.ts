import { revalidateTag } from 'next/cache'
import { NextResponse, type NextRequest } from 'next/server'
import { TAGS } from '@/lib/cache-tags'

// Invaliderer innholdscachen utenfra: pg_cron ved planlagt publisering, og
// skript som skriver rett til databasen (import av oversettelser). Krever
// REVALIDATE_SECRET som Bearer-token. Uten tagger invalideres alt.
export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  const auth = request.headers.get('authorization') ?? ''
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Ikke autorisert' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as { tags?: string[] }
  const all = Object.values(TAGS) as string[]
  const tags = (body.tags ?? all).filter((t) => all.includes(t))
  for (const tag of tags) revalidateTag(tag)

  return NextResponse.json({ revalidated: tags, at: new Date().toISOString() })
}
