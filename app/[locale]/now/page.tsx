import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getNowEntries } from '@/lib/now'
import { localizeMany } from '@/lib/translations'
import { alternatesFor, breadcrumbs, formatDate, jsonLd } from '@/lib/site'
import { OG_LOCALE, getTranslator, isLocale, localePath } from '@/lib/i18n'
import { SafeMdx } from '@/components/SafeMdx'
import { Reveal } from '@/components/motion/Reveal'
import { OsloTerminalLine } from '@/components/OsloTerminal'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = await getTranslator(locale)
  return {
    title: t('now.title'),
    description: t('meta.now'),
    alternates: alternatesFor(locale, 'now'),
    openGraph: { locale: OG_LOCALE[locale], siteName: 'Marcus Jenshaug', title: t('now.title'), description: t('meta.now') },
  }
}

const dateFormat: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }

export default async function NowPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = await getTranslator(locale)
  const entries = await localizeMany('now_entries', await getNowEntries(), locale)
  const hasUntranslated = locale !== 'nb' && entries.some((e) => !e.localized)

  const breadcrumbSchema = breadcrumbs(locale, t, [{ name: t('now.title'), path: localePath(locale, 'now') }])

  return (
    <section className="px-5 py-12 md:px-8 md:py-16">
      <div className="container" style={{ maxWidth: '52rem' }}>
        <div className="page-head">
          <div className="eyebrow">
            {t('now.eyebrow')} ·{' '}
            <a href="https://nownownow.com" className="link" style={{ color: 'inherit' }}>
              nownownow.com
            </a>
          </div>
          <Reveal variant="lines">
            <h1 className="display display-2 page-title">{t('now.heading')}</h1>
          </Reveal>
          <p className="page-lede">
            {t('now.lede')} <code className="inline-code">/now</code>
            {t('now.ledeSuffix')}
          </p>
          {hasUntranslated && (
            <p className="mono dim" style={{ fontSize: '.8125rem' }}>{t('locale.onlyIn.nb')}</p>
          )}
        </div>

        <div className="term now-terminal na-log">
          <div className="now-terminal-bar">
            <span className="now-terminal-dot" aria-hidden />
            <span className="now-terminal-title">marcus@redi — ~/na — git log</span>
          </div>
          <OsloTerminalLine />
          <div>
            <span className="prompt">marcus@redi</span> <span className="str">~/na</span> $ git
            log --reverse=false
          </div>
          {entries.length === 0 ? (
            <p className="com" style={{ marginTop: '1rem' }}>
              # {t('now.empty')}
            </p>
          ) : (
            entries.map((e, i) => (
              <article key={e.id} className={`na-entry${i === 0 ? ' na-entry-latest' : ''}`}>
                <div className="na-entry-head">
                  <span className="str">commit</span>{' '}
                  <time dateTime={e.published_at} className="na-entry-date">
                    {formatDate(e.published_at, dateFormat, locale)}
                  </time>
                  {i === 0 && <span className="na-entry-badge">HEAD → {t('now.headBadge')}</span>}
                </div>
                <div className="now-terminal-content">
                  <SafeMdx source={e.content} />
                  {e.machineTranslated && (
                    <p className="com mono dim" style={{ fontSize: '.75rem' }}>
                      # {t('locale.machineTranslated')}
                    </p>
                  )}
                </div>
              </article>
            ))
          )}
          <div>
            <span className="prompt">marcus@redi</span> <span className="str">~/na</span> ${' '}
            <span className="term-caret" aria-hidden />
          </div>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
    </section>
  )
}
