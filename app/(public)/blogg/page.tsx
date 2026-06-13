import type { Metadata } from 'next'
import { FiRss } from 'react-icons/fi'
import { getPublishedPosts } from '@/lib/posts'
import { LatestPosts } from '@/components/home/LatestPosts'
import { Reveal } from '@/components/motion/Reveal'

export const metadata: Metadata = {
  title: 'Blogg',
  description: 'Notater og lengre stykker om koden jeg skriver.',
  alternates: { canonical: '/blogg' },
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
    <section className="px-5 py-12 md:px-8 md:py-16">
      <div className="container">
        <div className="page-head">
          <div className="eyebrow">ARTICLE · ARKIV · {String(posts.length).padStart(2, '0')}</div>
          <Reveal variant="lines">
            <h1 className="display display-2 page-title">
              Notater og lengre stykker om koden jeg skriver
            </h1>
          </Reveal>
          <div className="feed-row mono">
            <a href="/rss.xml" className="filter-chip">
              <FiRss aria-hidden /> RSS
            </a>
            <a href="/feed.json" className="filter-chip">
              JSON Feed
            </a>
            <span className="feed-row-count">
              {posts.length} {posts.length === 1 ? 'publisert notat' : 'publiserte notater'}
            </span>
          </div>
        </div>

        {posts.length === 0 ? (
          <p className="muted">Første innlegg kommer snart.</p>
        ) : (
          years.map((year) => (
            <div key={year} className="year-group">
              <div className="year-group-head">
                <span className="year-group-year display tabular">{year}</span>
                <span className="mono dim year-group-count">
                  {groups[year].length} {groups[year].length === 1 ? 'notat' : 'notater'}
                </span>
              </div>
              <LatestPosts posts={groups[year]} />
            </div>
          ))
        )}
      </div>
    </section>
  )
}
