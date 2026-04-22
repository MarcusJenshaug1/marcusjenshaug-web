import type { Metadata } from 'next'
import Link from 'next/link'
import { FiRss, FiClock } from 'react-icons/fi'
import { getPublishedPosts } from '@/lib/posts'
import { readingTime } from '@/lib/mdx'

export const metadata: Metadata = {
  title: 'Blogg',
  description: 'Notater og lengre stykker om koden jeg skriver.',
  alternates: { canonical: '/blogg' },
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('nb-NO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export default async function BloggPage() {
  const posts = await getPublishedPosts()

  const groups: Record<string, typeof posts> = {}
  for (const post of posts) {
    const year = post.published_at ? String(new Date(post.published_at).getFullYear()) : '—'
    if (!groups[year]) groups[year] = []
    groups[year].push(post)
  }
  const years = Object.keys(groups).sort((a, b) => Number(b) - Number(a))

  return (
    <section style={{ padding: '3rem 2rem' }}>
      <div className="container" style={{ maxWidth: '52rem' }}>
        <div className="eyebrow" style={{ marginBottom: '.75rem' }}>ARTICLE · ARKIV</div>
        <h1 style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500, maxWidth: '28rem' }}>
          Notater og lengre stykker om koden jeg skriver.
        </h1>

        <div style={{ display: 'flex', gap: '.75rem', marginTop: '1rem', alignItems: 'center' }}>
          <a href="/rss.xml" className="chip"><FiRss /> RSS</a>
          <a href="/feed.json" className="chip">JSON Feed</a>
          <span className="dim" style={{ fontSize: '.8125rem', marginLeft: 'auto' }}>
            {posts.length} {posts.length === 1 ? 'publisert notat' : 'publiserte notater'}
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="card" style={{ marginTop: '2rem' }}>
            <p className="muted">Første innlegg kommer snart.</p>
          </div>
        ) : (
          <div style={{ marginTop: '2.5rem' }}>
            {years.map((year) => (
              <div key={year} style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '.5rem' }}>
                  <h2 style={{ fontFamily: 'var(--ff-serif)', fontSize: '2rem', color: 'var(--ink-4)', fontWeight: 400 }}>{year}</h2>
                  <span className="mono dim" style={{ fontSize: '.75rem' }}>
                    {groups[year].length} {groups[year].length === 1 ? 'notat' : 'notater'}
                  </span>
                </div>
                {groups[year].map((p) => (
                  <Link key={p.id} href={`/blogg/${p.slug}`} className="post-row">
                    <div>
                      <div className="post-title">{p.title}</div>
                      <div className="post-desc">{p.description}</div>
                      <div style={{ display: 'flex', gap: '.375rem', marginTop: '.5rem', flexWrap: 'wrap' }}>
                        {p.tags.map((t) => <span key={t} className="chip">{t}</span>)}
                        <span className="chip"><FiClock /> {readingTime(p.content)} min</span>
                      </div>
                    </div>
                    <span className="post-date">{p.published_at ? formatDate(p.published_at) : ''}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
