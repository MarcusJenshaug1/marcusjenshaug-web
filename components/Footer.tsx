import Link from 'next/link'
import { FiArrowUpRight } from 'react-icons/fi'
import type { SiteSettings } from '@/lib/types/app'

type Props = {
  settings: SiteSettings
}

export function Footer({ settings }: Props) {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="grid">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', fontWeight: 600, color: 'var(--ink)', marginBottom: '.5rem' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />
            {settings.full_name}
          </div>
          <p style={{ color: 'var(--ink-3)', maxWidth: '22rem', fontSize: '.8125rem' }}>
            {settings.bio_short || 'Fullstack-utvikler i Redi AS.'}
          </p>
        </div>
        <div>
          <h4>Innhold</h4>
          <ul>
            <li><Link href="/blogg">Blogg</Link></li>
            <li><Link href="/prosjekter">Prosjekter</Link></li>
            <li><Link href="/na">Nå</Link></li>
            <li><Link href="/uses">Uses</Link></li>
          </ul>
        </div>
        <div>
          <h4>Koble til</h4>
          <ul>
            {settings.social_links.map((link) => (
              <li key={link.url}>
                <a href={link.url} target="_blank" rel="me noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '.25rem' }}>
                  <span style={{ textTransform: 'capitalize' }}>{link.platform}</span>
                  <FiArrowUpRight style={{ fontSize: '.7em', opacity: 0.6 }} />
                </a>
              </li>
            ))}
            {settings.email && (
              <li><a href={`mailto:${settings.email}`}>{settings.email}</a></li>
            )}
          </ul>
        </div>
        <div>
          <h4>Feeds</h4>
          <ul>
            <li><Link href="/rss.xml">RSS</Link></li>
            <li><Link href="/feed.json">JSON Feed</Link></li>
            <li><Link href="/llms.txt">llms.txt</Link></li>
            <li><Link href="/sitemap.xml">Sitemap</Link></li>
          </ul>
        </div>
      </div>
      <div className="meta">
        <span>© {year} {settings.full_name}</span>
        <span className="mono">Bygget med Next.js · Hostet på Vercel</span>
      </div>
    </footer>
  )
}
