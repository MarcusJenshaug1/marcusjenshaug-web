import { FiArrowUpRight } from 'react-icons/fi'
import { TransitionLink } from '@/components/motion/TransitionLink'
import { ParallaxLayer } from '@/components/fx/ParallaxLayer'
import { localePath, type Locale, type RouteKey } from '@/lib/i18n/config'
import type { Translator } from '@/lib/i18n/client'
import type { SiteSettings } from '@/lib/types/app'

type Props = {
  locale: Locale
  t: Translator
  settings: SiteSettings
}

const CONTENT_LINKS: RouteKey[] = ['blog', 'projects', 'now', 'uses', 'about', 'contact']

export function Footer({ locale, t, settings }: Props) {
  const year = new Date().getFullYear()

  return (
    <footer className="statement-footer" data-parallax-root>
      <ParallaxLayer speed={-7} className="statement-footer-name-wrap container">
        <TransitionLink
          href={localePath(locale, 'home')}
          className="statement-footer-name display"
          aria-label={t('nav.toFront')}
        >
          {settings.full_name.split(' ').map((line) => (
            <span key={line} className="statement-footer-name-line">
              {line}
            </span>
          ))}
        </TransitionLink>
        <p className="statement-footer-bio">{settings.bio_short || t('hero.bioFallback')}</p>
      </ParallaxLayer>
      <div className="statement-footer-grid container">
        <div>
          <h3 className="mono">{t('footer.content')}</h3>
          <ul>
            {CONTENT_LINKS.map((key) => (
              <li key={key}>
                <TransitionLink href={localePath(locale, key)}>{t(`nav.${key}`)}</TransitionLink>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mono">{t('footer.connect')}</h3>
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
          <h3 className="mono">{t('footer.feeds')}</h3>
          <ul>
            <li><a href="/rss.xml">RSS</a></li>
            <li><a href="/feed.json">JSON Feed</a></li>
            <li><a href="/llms.txt">llms.txt</a></li>
            <li><a href="/sitemap.xml">{t('footer.sitemap')}</a></li>
          </ul>
        </div>
      </div>
      <div className="statement-footer-meta container mono">
        <span>© {year} {settings.full_name}</span>
        <span>{t('footer.builtWith')}</span>
      </div>
    </footer>
  )
}
