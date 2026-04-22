import Link from 'next/link'
import type { SiteSettings } from '@/lib/types/database'

type Props = {
  settings: SiteSettings
}

export function Footer({ settings }: Props) {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 px-8 pt-12 pb-8 border-t border-rule text-ink-3 text-sm">
      <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8 max-w-[var(--max-w)] mx-auto">
        <div>
          <h4 className="text-xs uppercase tracking-[0.1em] text-ink-4 font-medium mb-3.5">
            {settings.full_name}
          </h4>
          <p className="text-ink-2 max-w-sm">{settings.bio_short}</p>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.1em] text-ink-4 font-medium mb-3.5">
            Sider
          </h4>
          <ul className="flex flex-col gap-2">
            <li><Link href="/om" className="text-ink-2 hover:text-ink">Om</Link></li>
            <li><Link href="/prosjekter" className="text-ink-2 hover:text-ink">Prosjekter</Link></li>
            <li><Link href="/blogg" className="text-ink-2 hover:text-ink">Blogg</Link></li>
            <li><Link href="/kontakt" className="text-ink-2 hover:text-ink">Kontakt</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.1em] text-ink-4 font-medium mb-3.5">
            Koblinger
          </h4>
          <ul className="flex flex-col gap-2">
            {settings.social_links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-ink-2 hover:text-ink capitalize"
                >
                  {link.platform}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs uppercase tracking-[0.1em] text-ink-4 font-medium mb-3.5">
            Feeds
          </h4>
          <ul className="flex flex-col gap-2">
            <li><Link href="/rss.xml" className="text-ink-2 hover:text-ink">RSS</Link></li>
            <li><Link href="/feed.json" className="text-ink-2 hover:text-ink">JSON Feed</Link></li>
            <li><Link href="/sitemap.xml" className="text-ink-2 hover:text-ink">Sitemap</Link></li>
          </ul>
        </div>
      </div>
      <div className="max-w-[var(--max-w)] mx-auto mt-10 pt-6 border-t border-rule flex justify-between text-[0.8125rem] text-ink-4">
        <span>© {year} {settings.full_name}</span>
        <span className="font-mono">marcusjenshaug.no</span>
      </div>
    </footer>
  )
}
