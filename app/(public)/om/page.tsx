import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FiArrowUpRight } from 'react-icons/fi'
import { getSiteSettings } from '@/lib/site-settings'
import { SafeMdx } from '@/components/SafeMdx'

const siteUrlForMeta = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marcusjenshaug.no'
const ogImage = `/api/og?title=${encodeURIComponent('Om Marcus Jenshaug')}&type=${encodeURIComponent('Om')}`

export const metadata: Metadata = {
  title: 'Om',
  description: 'Om Marcus Jenshaug — fullstack-utvikler i Redi AS.',
  alternates: { canonical: '/om' },
  openGraph: {
    type: 'profile',
    url: `${siteUrlForMeta}/om`,
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://marcusjenshaug.no'

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${siteUrl}/#person`,
    name: s.full_name,
    url: siteUrl,
    image: s.image_url ? `${siteUrl}${s.image_url}` : undefined,
    jobTitle: s.headline,
    email: s.email ? `mailto:${s.email}` : undefined,
    nationality: 'Norwegian',
    worksFor: {
      '@type': 'Organization',
      name: 'Redi AS',
      url: 'https://redi.as',
    },
    sameAs: s.social_links.map((l) => l.url),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Hjem', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Om', item: `${siteUrl}/om` },
    ],
  }

  return (
    <section className="px-5 py-10 md:px-8 md:py-12">
      <div className="container grid gap-8 md:gap-12 items-start grid-cols-1 md:grid-cols-[1fr_2fr]">
        <aside className="md:sticky md:top-20 max-w-sm w-full mx-auto md:mx-0">
          {s.image_url && (
            <div style={{ aspectRatio: '4/5', overflow: 'hidden', borderRadius: '6px', border: '1px solid var(--rule)', position: 'relative' }}>
              <Image
                src={s.image_url}
                alt={s.full_name}
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                style={{ objectFit: 'cover' }}
              />
            </div>
          )}
          <div style={{ marginTop: '1rem' }}>
            <div style={{ fontWeight: 600, letterSpacing: '-.01em' }}>{s.full_name}</div>
            <div className="muted" style={{ fontSize: '.875rem' }}>{s.headline}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.25rem', marginTop: '.875rem', fontSize: '.8125rem', color: 'var(--ink-3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Bosted</span><span>{s.location ?? 'Norge'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Jobb</span><span>Redi AS</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Fokus</span><span>Next.js · Supabase</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Status</span>
                <span style={{ color: s.available_for_work ? 'oklch(0.55 0.16 145)' : 'var(--ink-3)' }}>
                  ● {s.available_for_work ? (s.availability_note || 'Åpen for samtaler') : 'Opptatt'}
                </span>
              </div>
            </div>
            {s.cv_url && (
              <a href={s.cv_url} className="btn btn-sm" style={{ marginTop: '.875rem', width: '100%', justifyContent: 'center' }} target="_blank" rel="noopener noreferrer">
                Last ned CV <FiArrowUpRight />
              </a>
            )}
          </div>
        </aside>
        <div>
          <div className="eyebrow" style={{ marginBottom: '.75rem' }}>OM · PERSON · @id=#person</div>
          <h1 style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500, marginBottom: '1.5rem' }}>
            {s.bio_short || 'Jeg bygger digitale verktøy.'}
          </h1>
          <div className="prose" style={{ maxWidth: 'none' }}>
            {s.bio_long ? (
              <SafeMdx source={s.bio_long} />
            ) : (
              <p className="muted">Innhold kommer snart.</p>
            )}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500, fontSize: '1.375rem', marginBottom: '.5rem' }}>Kontakt</h2>
            <p className="muted">
              Kortest vei er <a href={`mailto:${s.email}`} className="link">{s.email}</a>. Jeg svarer ofte innen ett døgn. Eller du kan bruke <Link href="/kontakt" className="link">skjemaet</Link>.
            </p>
          </div>

          {s.social_links.length > 0 && (
            <div style={{ marginTop: '3rem', padding: '1.25rem 1.375rem', background: 'var(--bg-sunken)', borderRadius: '8px', border: '1px solid var(--rule)' }}>
              <div className="eyebrow" style={{ marginBottom: '.5rem' }}>Elsewhere · sameAs</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
                {s.social_links.map((link) => (
                  <a key={link.url} href={link.url} target="_blank" rel="me noopener noreferrer" className="chip" style={{ padding: '.375rem .625rem', textTransform: 'capitalize' }}>
                    <FiArrowUpRight style={{ fontSize: '.75em', opacity: 0.6 }} /> {link.platform}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    </section>
  )
}
