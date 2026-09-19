import { FiClock, FiArrowUpRight } from 'react-icons/fi'
import { TransitionLink } from '@/components/motion/TransitionLink'
import { readingTime } from '@/lib/mdx'
import { localePath, type Locale } from '@/lib/i18n/config'
import { intlLocale, type Translator } from '@/lib/i18n/client'
import { tagLabel } from '@/lib/i18n/labels'
import type { Post } from '@/lib/types/app'

function formatParts(date: string | null, locale: Locale) {
  if (!date) return { day: '—', rest: '' }
  const d = new Date(date)
  if (isNaN(d.getTime())) return { day: '—', rest: '' }
  const tag = intlLocale(locale)
  return {
    day: d.toLocaleDateString(tag, { day: '2-digit', timeZone: 'Europe/Oslo' }),
    rest: d
      .toLocaleDateString(tag, { month: 'short', year: 'numeric', timeZone: 'Europe/Oslo' })
      .replace('.', ''),
  }
}

type Props = {
  locale: Locale
  t: Translator
  posts: Post[]
}

export function LatestPosts({ locale, t, posts }: Props) {
  return (
    <div className="post-list-xl">
      {posts.map((p) => {
        const { day, rest } = formatParts(p.published_at, locale)
        return (
          <TransitionLink
            key={p.id}
            href={localePath(locale, 'blog', p.slug)}
            className="post-card-xl"
            data-cursor="view"
            data-cursor-label={t('blog.read')}
          >
            <time className="post-card-date" dateTime={p.published_at ?? undefined}>
              <span className="post-card-day display tabular">{day}</span>
              <span className="post-card-rest mono">{rest}</span>
            </time>
            <span className="post-card-main">
              <span className="post-card-title display display-4">{p.title}</span>
              <span className="post-card-desc">{p.description}</span>
              <span className="post-card-meta mono">
                {p.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="post-card-tag">
                    {tagLabel(tag, locale)}
                  </span>
                ))}
                <span className="post-card-tag">
                  <FiClock aria-hidden /> {t('blog.minutes', { minutes: readingTime(p.content) })}
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
