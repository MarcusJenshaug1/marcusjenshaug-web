import type { Metadata } from 'next'
import { FiMail, FiArrowUpRight } from 'react-icons/fi'
import { getSiteSettings } from '@/lib/site-settings'
import { Reveal } from '@/components/motion/Reveal'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Ta kontakt med Marcus Jenshaug.',
  alternates: { canonical: '/kontakt' },
}

export default async function KontaktPage() {
  const s = await getSiteSettings()

  return (
    <section className="px-5 py-12 md:px-8 md:py-16">
      <div className="container">
        <div className="page-head">
          <div className="eyebrow kontakt-eyebrow">
            /KONTAKT
            {s.available_for_work && (
              <>
                {' · '}
                <span className="status-dot kontakt-status-dot" aria-hidden />
                <span className="cta-available">
                  {s.availability_note || 'Tilgjengelig for samtaler'}
                </span>
              </>
            )}
          </div>
          <Reveal variant="chars">
            <h1 className="display display-1 kontakt-title">Si hei.</h1>
          </Reveal>
          <p className="page-lede">
            Jeg svarer som regel innen ett døgn. Klart du heller kan ta e-post direkte — eller
            koble til på en av plattformene nedenfor.
          </p>
        </div>

        <div className="kontakt-layout">
          <div className="kontakt-side">
            <div className="kontakt-links">
              {s.email && (
                <a href={`mailto:${s.email}`} className="kontakt-link">
                  <span className="kontakt-link-icon">
                    <FiMail aria-hidden />
                  </span>
                  {s.email}
                  <FiArrowUpRight aria-hidden className="kontakt-link-arrow" />
                </a>
              )}
              {s.social_links.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="me noopener noreferrer"
                  className="kontakt-link"
                >
                  <span className="kontakt-link-icon mono">
                    {link.platform.charAt(0).toUpperCase()}
                  </span>
                  {link.url.replace(/^https?:\/\//, '')}
                  <FiArrowUpRight aria-hidden className="kontakt-link-arrow" />
                </a>
              ))}
            </div>

            <div className="term" style={{ marginTop: '2rem' }}>
              <div>
                <span className="com"># svartid</span>
              </div>
              <div>Vanligvis: &lt; 24t</div>
              <div>Mest sannsynlig: morgen (CET)</div>
            </div>
          </div>
          <div className="kontakt-form">
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  )
}
