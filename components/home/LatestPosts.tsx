import { FiClock, FiArrowUpRight } from 'react-icons/fi'
import { TransitionLink } from '@/components/motion/TransitionLink'
import { readingTime } from '@/lib/mdx'
import type { Post } from '@/lib/types/app'

function formatParts(date: string | null) {
  if (!date) return { day: '—', rest: '' }
  const d = new Date(date)
  return {
    day: String(d.getDate()).padStart(2, '0'),
    rest: d
      .toLocaleDateString('nb-NO', { month: 'short', year: 'numeric' })
      .replace('.', ''),
  }
}

export function LatestPosts({ posts }: { posts: Post[] }) {
  return (
    <div className="post-list-xl">
      {posts.map((p) => {
        const { day, rest } = formatParts(p.published_at)
        return (
          <TransitionLink
            key={p.id}
            href={`/blogg/${p.slug}`}
            className="post-card-xl"
            data-cursor="view"
            data-cursor-label="Les"
          >
            <span className="post-card-date">
              <span className="post-card-day display tabular">{day}</span>
              <span className="post-card-rest mono">{rest}</span>
            </span>
            <span className="post-card-main">
              <span className="post-card-title display display-4">{p.title}</span>
              <span className="post-card-desc">{p.description}</span>
              <span className="post-card-meta mono">
                {p.tags.slice(0, 2).map((t) => (
                  <span key={t} className="post-card-tag">
                    {t}
                  </span>
                ))}
                <span className="post-card-tag">
                  <FiClock aria-hidden /> {readingTime(p.content)} min
                </span>
              </span>
            </span>
            <FiArrowUpRight aria-hidden className="post-card-arrow" />
          </TransitionLink>
        )
      })}
    </div>
  )
}
