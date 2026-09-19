import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FiArrowUpRight } from 'react-icons/fi'
import { getUsesItems, groupByCategory } from '@/lib/uses'
import { localizeMany } from '@/lib/translations'
import { alternatesFor, breadcrumbs, jsonLd } from '@/lib/site'
import { OG_LOCALE, getTranslator, isLocale, localePath, type DictionaryKey, type Translator } from '@/lib/i18n'
import { Reveal } from '@/components/motion/Reveal'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = await getTranslator(locale)
  return {
    title: t('uses.title'),
    description: t('meta.uses'),
    alternates: alternatesFor(locale, 'uses'),
    openGraph: { locale: OG_LOCALE[locale], siteName: 'Marcus Jenshaug', title: t('uses.title'), description: t('meta.uses') },
  }
}

// Kategoriene i admin er norske («Maskinvare», «Utvikling» …). Kjente navn
// oversettes via ordboken; ukjente vises som de er.
const CATEGORY_KEYS: Record<string, DictionaryKey> = {
  maskinvare: 'uses.category.hardware',
  hardware: 'uses.category.hardware',
  programvare: 'uses.category.software',
  software: 'uses.category.software',
  tjenester: 'uses.category.services',
  utvikling: 'uses.category.dev',
  dev: 'uses.category.dev',
  hverdag: 'uses.category.everyday',
  skrivebord: 'uses.category.desk',
  desk: 'uses.category.desk',
}

function categoryLabel(t: Translator, category: string): string {
  const key = CATEGORY_KEYS[category.toLowerCase()]
  return key ? t(key) : category
}

export default async function UsesPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = await getTranslator(locale)
  const items = await localizeMany('uses_items', await getUsesItems(), locale)
  const groups = groupByCategory(items)
  const categories = Object.keys(groups)

  const breadcrumbSchema = breadcrumbs(locale, t, [{ name: t('uses.title'), path: localePath(locale, 'uses') }])

  return (
    <section className="px-5 py-12 md:px-8 md:py-16">
      <div className="container">
        <div className="page-head">
          <div className="eyebrow">{t('uses.eyebrow')} · {String(items.length).padStart(2, '0')}</div>
          <Reveal variant="lines">
            <h1 className="display display-2 page-title">{t('uses.heading')}</h1>
          </Reveal>
          <p className="page-lede">
            {t('uses.ledeBefore')}{' '}
            <a href="https://usesthis.com" className="link">
              usesthis.com
            </a>
            {t('uses.ledeAfter')}
          </p>
        </div>

        {categories.length === 0 ? (
          <p className="muted">{t('uses.empty')}</p>
        ) : (
          <div className="uses-layout">
            <nav className="uses-rail mono" aria-label={t('uses.categories')}>
              {categories.map((cat, i) => (
                <a key={cat} href={`#uses-${i}`} className="uses-rail-link">
                  <span className="uses-rail-index">{String(i + 1).padStart(2, '0')}</span>
                  {categoryLabel(t, cat)}
                  <span className="uses-rail-count">{groups[cat].length}</span>
                </a>
              ))}
            </nav>
            <div className="uses-groups">
              {categories.map((cat, i) => (
                <section key={cat} id={`uses-${i}`} className="uses-group">
                  <div className="uses-group-head">
                    <h2 className="display display-3">{categoryLabel(t, cat)}</h2>
                    <span className="mono dim uses-group-count">
                      {String(groups[cat].length).padStart(2, '0')}
                    </span>
                  </div>
                  <ul className="uses-table">
                    {groups[cat].map((it) => {
                      const inner = (
                        <>
                          <span className="uses-item-name">{it.name}</span>
                          <span className="uses-item-desc">{it.description ?? ''}</span>
                          {it.url && <FiArrowUpRight aria-hidden className="uses-item-arrow" />}
                        </>
                      )
                      return (
                        <li key={it.id}>
                          {it.url ? (
                            <a
                              href={it.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="uses-item"
                            >
                              {inner}
                            </a>
                          ) : (
                            <span className="uses-item">{inner}</span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </section>
              ))}
            </div>
          </div>
        )}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
    </section>
  )
}
