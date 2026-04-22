import type { Metadata } from 'next'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getSiteSettings } from '@/lib/site-settings'

export const metadata: Metadata = {
  title: 'Om',
  description: 'Om Marcus Jenshaug — fullstack-utvikler i Redi AS.',
  alternates: { canonical: '/om' },
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
      { '@type': 'ListItem', position: 1, name: 'Forside', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Om', item: `${siteUrl}/om` },
    ],
  }

  return (
    <article className="max-w-[var(--reading-w)]">
      <header className="mb-10 flex flex-col md:flex-row gap-8 md:items-start">
        {s.image_url && (
          <div className="w-32 h-32 rounded-full overflow-hidden bg-bg-sunken shrink-0">
            <Image
              src={s.image_url}
              alt={s.full_name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-ink-3 font-medium mb-3">Om</p>
          <h1 className="mb-3">{s.full_name}</h1>
          <p className="text-ink-3">{s.headline}</p>
        </div>
      </header>

      <div className="prose text-[1.0625rem] leading-[1.7] text-ink-2">
        {s.bio_long ? (
          <MDXRemote source={s.bio_long} />
        ) : (
          <p className="text-ink-4">Innhold kommer snart.</p>
        )}
      </div>

      {s.social_links.length > 0 && (
        <section className="mt-12 pt-8 border-t border-rule">
          <h2 className="text-xs uppercase tracking-[0.14em] text-ink-3 font-medium mb-4">
            Finn meg andre steder
          </h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {s.social_links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="text-ink-2 hover:text-accent-ink underline decoration-rule-strong underline-offset-[3px] decoration-1"
                >
                  <span className="capitalize">{link.platform}</span>
                  {link.username && <span className="text-ink-4 ml-1">@{link.username}</span>}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </article>
  )
}
