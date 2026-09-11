import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FiArrowUpRight, FiCircle } from 'react-icons/fi'
import { getSiteSettings } from '@/lib/site-settings'
import { STACK } from '@/lib/stack'
import { absoluteUrl, breadcrumbs, jsonLd, siteUrl } from '@/lib/site'
import { SafeMdx } from '@/components/SafeMdx'
import { Reveal } from '@/components/motion/Reveal'

const ogImage = `/api/og?title=${encodeURIComponent('Om Marcus Jenshaug')}&type=${encodeURIComponent('Om')}`

export const metadata: Metadata = {
  title: 'Om',
  description: 'Om Marcus Jenshaug — fullstack-utvikler i Redi AS.',
  alternates: { canonical: '/om' },
  openGraph: {
    type: 'profile',
    url: `${siteUrl}/om`,
    title: 'Om Marcus Jenshaug',
    description: 'Fullstack-utvikler i Redi AS.',
    images: [{ url: ogImage, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogImage],
  },
}

export default async function OmPage() {
  const s = await getSiteSettings()

  const omTitle = s.headline?.trim() || 'Fullstack-utvikler'
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
    knowsAbout: STACK.map((item) => item.name),
    sameAs: s.social_links.map((l) => l.url).filter((url) => !/(^|\/\/|\.)redi\.as(\/|$)/i.test(url)),
  }

  const breadcrumbSchema = breadcrumbs([{ name: 'Om', path: '/om' }])

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
              <span>Navn</span>
              <span>{s.full_name}</span>
            </div>
            <div className="om-meta-row">
              <span>Rolle</span>
              <span>{s.headline}</span>
            </div>
            <div className="om-meta-row">
              <span>Bosted</span>
              <span>{s.location ?? 'Norge'}</span>
            </div>
            <div className="om-meta-row">
              <span>Jobb</span>
              <span>Redi AS</span>
            </div>
            <div className="om-meta-row">
              <span>Fokus</span>
              <span>Next.js · Supabase</span>
            </div>
            <div className="om-meta-row">
              <span>Status</span>
              <span style={{ color: s.available_for_work ? 'var(--ok)' : 'var(--ink-3)' }}>
                <FiCircle aria-hidden style={{ fontSize: '.6em', verticalAlign: 'middle', fill: 'currentColor' }} />{' '}
                {s.available_for_work ? (s.availability_note || 'Åpen for samtaler') : 'Opptatt'}
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
              Last ned CV <FiArrowUpRight aria-hidden />
            </a>
          )}
        </aside>
        <div className="om-main">
          <div className="om-header">
            <div className="eyebrow" style={{ marginBottom: '1rem' }}>OM</div>
            <Reveal variant="lines">
              <h1 className="om-title">{omTitle}</h1>
            </Reveal>
            {omLead && <p className="om-lead">{omLead}</p>}
          </div>
          <div className="prose om-prose" style={{ maxWidth: 'none' }}>
            {s.bio_long ? (
              <SafeMdx source={s.bio_long} />
            ) : (
              <p className="muted">Innhold kommer snart.</p>
            )}
          </div>

          <div className="om-contact">
            <h2 className="display display-4">Kontakt</h2>
            <p className="muted" style={{ marginTop: '.75rem' }}>
              Kortest vei er <a href={`mailto:${s.email}`} className="link">{s.email}</a>. Jeg
              svarer ofte innen ett døgn. Eller du kan bruke{' '}
              <Link href="/kontakt" className="link">skjemaet</Link>.
            </p>
          </div>

          {s.social_links.length > 0 && (
            <div className="om-elsewhere">
              <div className="eyebrow" style={{ marginBottom: '.875rem' }}>Andre steder</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                {s.social_links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="me noopener noreferrer"
                    className="filter-chip mono"
                  >
                    <FiArrowUpRight style={{ fontSize: '.85em' }} aria-hidden /> {link.platform}
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
