import { FiArrowUpRight } from 'react-icons/fi'
import { TransitionLink } from '@/components/motion/TransitionLink'
import { ParallaxLayer } from '@/components/fx/ParallaxLayer'
import type { SiteSettings } from '@/lib/types/app'

type Props = {
  settings: SiteSettings
}

export function Footer({ settings }: Props) {
  const year = new Date().getFullYear()

  return (
    <footer className="statement-footer" data-parallax-root>
      <ParallaxLayer speed={-7} className="statement-footer-name-wrap container">
        <TransitionLink href="/" className="statement-footer-name display" aria-label="Til forsiden">
          {settings.full_name.split(' ').map((line) => (
            <span key={line} className="statement-footer-name-line">
              {line}
            </span>
          ))}
        </TransitionLink>
        <p className="statement-footer-bio">
          {settings.bio_short || 'Fullstack-utvikler i Redi AS.'}
        </p>
      </ParallaxLayer>
      <div className="statement-footer-grid container">
        <div>
          <h4 className="mono">Innhold</h4>
          <ul>
            <li><TransitionLink href="/blogg">Blogg</TransitionLink></li>
            <li><TransitionLink href="/prosjekter">Prosjekter</TransitionLink></li>
            <li><TransitionLink href="/na">Nå</TransitionLink></li>
            <li><TransitionLink href="/uses">Uses</TransitionLink></li>
            <li><TransitionLink href="/om">Om</TransitionLink></li>
            <li><TransitionLink href="/kontakt">Kontakt</TransitionLink></li>
          </ul>
        </div>
        <div>
          <h4 className="mono">Koble til</h4>
          <ul>
            {settings.social_links.map((link) => (
              <li key={link.url}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="me noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '.25rem' }}
                >
                  <span style={{ textTransform: 'capitalize' }}>{link.platform}</span>
                  <FiArrowUpRight style={{ fontSize: '.7em', opacity: 0.6 }} aria-hidden />
                </a>
              </li>
            ))}
            {settings.email && (
              <li><a href={`mailto:${settings.email}`}>{settings.email}</a></li>
            )}
          </ul>
        </div>
        <div>
          <h4 className="mono">Feeds</h4>
          <ul>
            <li><a href="/rss.xml">RSS</a></li>
            <li><a href="/feed.json">JSON Feed</a></li>
            <li><a href="/llms.txt">llms.txt</a></li>
            <li><a href="/sitemap.xml">Sitemap</a></li>
          </ul>
        </div>
      </div>
      <div className="statement-footer-meta container mono">
        <span>© {year} {settings.full_name}</span>
        <span>Bygget med Next.js · Hostet på Vercel</span>
      </div>
    </footer>
  )
}
