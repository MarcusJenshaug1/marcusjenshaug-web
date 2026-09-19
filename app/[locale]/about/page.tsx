import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { FiArrowUpRight, FiCircle } from 'react-icons/fi'
import { getSiteSettings, localizeSettings } from '@/lib/site-settings'
import { STACK_NAMES } from '@/lib/stack'
import { absoluteUrl, alternatesFor, breadcrumbs, jsonLd, ogImageUrl, siteUrl } from '@/lib/site'
import { OG_LOCALE, getTranslator, isLocale, localePath } from '@/lib/i18n'
import { platformLabel } from '@/lib/i18n/labels'
import { SafeMdx } from '@/components/SafeMdx'
import { Reveal } from '@/components/motion/Reveal'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = await getTranslator(locale)
  const title = t('about.title')
  const ogTitle = `${title} Marcus Jenshaug`
  const ogImage = ogImageUrl(locale, ogTitle, t('og.about'))

  return {
    title,
    description: t('meta.about'),
    alternates: alternatesFor(locale, 'about'),
    openGraph: {
      type: 'profile',
      locale: OG_LOCALE[locale],
      siteName: 'Marcus Jenshaug',
      url: `${siteUrl}${localePath(locale, 'about')}`,
      title: ogTitle,
      description: t('meta.about'),
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImage],
    },
  }
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = await getTranslator(locale)
  const s = localizeSettings(await getSiteSettings(), locale)

  const omTitle = s.headline?.trim() || t('hero.role.fallback')
  const bioShort = s.bio_short?.trim() || ''
  const omLead =
    omTitle && bioShort.toLowerCase().startsWith(omTitle.toLowerCase())
      ? bioShort.slice(omTitle.length).replace(/^[\s.,—–-]+/, '').trim()
      : bioShort

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: s.full_name,
    alternateName: 'Makkos',
    url: siteUrl,
    image: absoluteUrl(s.image_url),
    jobTitle: s.headline,
    email: s.email ? `mailto:${s.email}` : undefined,
    nationality: 'Norwegian',
    worksFor: {
      '@type': 'Organization',
      name: 'Redi AS',
      url: 'https://redi.as',
    },
    knowsAbout: STACK_NAMES,
    sameAs: s.social_links.map((l) => l.url).filter((url) => !/(^|\/\/|\.)redi\.as(\/|$)/i.test(url)),
  }

  const breadcrumbSchema = breadcrumbs(locale, t, [{ name: t('about.title'), path: localePath(locale, 'about') }])

  return (
    <section className="px-5 py-12 md:px-8 md:py-16">
      <div className="container om-layout">
        <aside className="om-sidebar">
          {s.image_url && (
            <div className="om-portrait">
              <Image
                src={s.image_url}
                alt={s.full_name}
                fill
                sizes="(max-width: 768px) 100vw, 340px"
                priority
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}
          <div className="om-meta mono">
            <div className="om-meta-row">
              <span>{t('about.meta.name')}</span>
              <span>{s.full_name}</span>
            </div>
            <div className="om-meta-row">
              <span>{t('about.meta.role')}</span>
              <span>{s.headline}</span>
            </div>
            <div className="om-meta-row">
              <span>{t('about.location')}</span>
              <span>{s.location ?? t('about.locationFallback')}</span>
            </div>
            <div className="om-meta-row">
              <span>{t('about.meta.work')}</span>
              <span>Redi AS</span>
            </div>
            <div className="om-meta-row">
              <span>{t('about.meta.focus')}</span>
              <span>Next.js · Supabase</span>
            </div>
            <div className="om-meta-row">
              <span>{t('about.meta.status')}</span>
              <span style={{ color: s.available_for_work ? 'var(--ok)' : 'var(--ink-3)' }}>
                <FiCircle aria-hidden style={{ fontSize: '.6em', verticalAlign: 'middle', fill: 'currentColor' }} />{' '}
                {s.available_for_work ? (s.availability_note || t('about.status.open')) : t('about.status.busy')}
              </span>
            </div>
          </div>
          {s.cv_url && (
            <a
              href={s.cv_url}
              className="btn-xl mono om-cv"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('about.downloadCv')} <FiArrowUpRight aria-hidden />
            </a>
          )}
        </aside>
        <div className="om-main">
          <div className="om-header">
            <div className="eyebrow" style={{ marginBottom: '1rem' }}>{t('about.eyebrow')}</div>
            <Reveal variant="lines">
              <h1 className="om-title">{omTitle}</h1>
            </Reveal>
            {omLead && <p className="om-lead">{omLead}</p>}
          </div>
          <div className="prose om-prose" style={{ maxWidth: 'none' }}>
            {s.bio_long ? (
              <SafeMdx source={s.bio_long} />
            ) : (
              <p className="muted">{t('about.contentSoon')}</p>
            )}
          </div>

          <div className="om-contact">
            <h2 className="display display-4">{t('about.contactTitle')}</h2>
            <p className="muted" style={{ marginTop: '.75rem' }}>
              {t('about.contact.body')} <a href={`mailto:${s.email}`} className="link">{s.email}</a>.{' '}
              {t('about.contact.orForm')}{' '}
              <Link href={localePath(locale, 'contact')} className="link">{t('about.contact.formLink')}</Link>.
            </p>
          </div>

          {s.social_links.length > 0 && (
            <div className="om-elsewhere">
              <div className="eyebrow" style={{ marginBottom: '.875rem' }}>{t('about.elsewhere')}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                {s.social_links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="me noopener noreferrer"
                    className="filter-chip mono"
                  >
                    <FiArrowUpRight style={{ fontSize: '.85em' }} aria-hidden /> {platformLabel(link.platform, locale)}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
    </section>
  )
}
