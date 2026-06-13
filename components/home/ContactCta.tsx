import { FiArrowUpRight } from 'react-icons/fi'
import { TransitionLink } from '@/components/motion/TransitionLink'
import { Magnetic } from '@/components/motion/Magnetic'
import { MeshGlow } from '@/components/fx/MeshGlow'

type ContactCtaProps = {
  email?: string
  available: boolean
  availabilityNote?: string | null
}

export function ContactCta({ email, available, availabilityNote }: ContactCtaProps) {
  return (
    <section className="cta-section" data-section="kontakt-cta">
      <MeshGlow />
      <div className="cta-inner container">
        <span className="eyebrow">
          008 · Neste steg
          {available && (
            <>
              {' — '}
              <span className="cta-available">
                {availabilityNote || 'Tilgjengelig for samtaler'}
              </span>
            </>
          )}
        </span>
        <Magnetic strength={0.12}>
          <TransitionLink
            href="/kontakt"
            className="cta-link display display-1"
            data-cursor="view"
            data-cursor-label="Si hei"
          >
            Ta kontakt
            <FiArrowUpRight aria-hidden className="cta-arrow" />
          </TransitionLink>
        </Magnetic>
        {email && (
          <a href={`mailto:${email}`} className="cta-email mono">
            {email}
          </a>
        )}
      </div>
    </section>
  )
}
