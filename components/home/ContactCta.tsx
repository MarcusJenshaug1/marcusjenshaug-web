import { FiArrowUpRight } from 'react-icons/fi'
import { TransitionLink } from '@/components/motion/TransitionLink'
import { Magnetic } from '@/components/motion/Magnetic'
import { MeshGlow } from '@/components/fx/MeshGlow'
import { ParallaxLayer } from '@/components/fx/ParallaxLayer'
import { localePath, type Locale } from '@/lib/i18n/config'
import type { Translator } from '@/lib/i18n/client'

type ContactCtaProps = {
  locale: Locale
  t: Translator
  email?: string
  available: boolean
  availabilityNote?: string | null
}

export function ContactCta({ locale, t, email, available, availabilityNote }: ContactCtaProps) {
  return (
    <section className="cta-section" data-section="kontakt-cta" data-parallax-root>
      <ParallaxLayer speed={-14} className="cta-glow-layer" ariaHidden>
        <MeshGlow />
      </ParallaxLayer>
      <ParallaxLayer speed={8} className="cta-inner container">
        <span className="eyebrow">
          {t('home.contact.eyebrow')}
          {available && (
            <>
              {' — '}
              <span className="cta-available">{availabilityNote || t('hero.available')}</span>
            </>
          )}
        </span>
        <Magnetic strength={0.12}>
          <TransitionLink
            href={localePath(locale, 'contact')}
            className="cta-link display display-1"
            data-cursor="view"
            data-cursor-label={t('home.contact.cursor')}
          >
            {t('hero.contact')}
            <FiArrowUpRight aria-hidden className="cta-arrow" />
          </TransitionLink>
        </Magnetic>
        {email && (
          <a href={`mailto:${email}`} className="cta-email mono">
            {email}
          </a>
        )}
      </ParallaxLayer>
    </section>
  )
}
