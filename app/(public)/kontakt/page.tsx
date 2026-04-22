import type { Metadata } from 'next'
import { FiMail, FiArrowUpRight } from 'react-icons/fi'
import { getSiteSettings } from '@/lib/site-settings'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Ta kontakt med Marcus Jenshaug.',
  alternates: { canonical: '/kontakt' },
}

const platformIconMap: Record<string, string> = {
  linkedin: 'FiLinkedin',
  github: 'FiGithub',
  twitter: 'FiTwitter',
  x: 'FiTwitter',
}

export default async function KontaktPage() {
  const s = await getSiteSettings()

  return (
    <section style={{ padding: '3rem 2rem' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', maxWidth: '56rem' }}>
        <div>
          <div className="eyebrow" style={{ marginBottom: '.75rem' }}>/KONTAKT</div>
          <h1 style={{ fontFamily: 'var(--ff-serif)', fontWeight: 500, marginBottom: '1rem' }}>
            Send meg en beskjed.
          </h1>
          <p className="muted" style={{ marginBottom: '2rem', maxWidth: '22rem' }}>
            Jeg svarer som regel innen ett døgn. Klart du heller kan ta e-post direkte — eller koble til på en av plattformene nedenfor.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
            {s.email && (
              <a
                href={`mailto:${s.email}`}
                style={{ display: 'flex', alignItems: 'center', gap: '.625rem', padding: '.625rem .875rem', border: '1px solid var(--rule)', borderRadius: '8px', fontSize: '.9375rem', color: 'var(--ink-2)' }}
              >
                <span style={{ color: 'var(--accent)' }}><FiMail /></span>
                {s.email}
                <FiArrowUpRight style={{ marginLeft: 'auto', fontSize: '.85em', color: 'var(--ink-4)' }} />
              </a>
            )}
            {s.social_links.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="me noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '.625rem', padding: '.625rem .875rem', border: '1px solid var(--rule)', borderRadius: '8px', fontSize: '.9375rem', color: 'var(--ink-2)' }}
              >
                <span style={{ color: 'var(--accent)', textTransform: 'capitalize', fontFamily: 'var(--ff-mono)', fontSize: '.75rem', width: '1em', textAlign: 'center' }}>
                  {link.platform.charAt(0).toUpperCase()}
                </span>
                {link.url.replace(/^https?:\/\//, '')}
                <FiArrowUpRight style={{ marginLeft: 'auto', fontSize: '.85em', color: 'var(--ink-4)' }} />
              </a>
            ))}
          </div>

          <div className="term" style={{ marginTop: '2rem' }}>
            <div><span className="com"># svartid</span></div>
            <div>Vanligvis: &lt; 24t</div>
            <div>Mest sannsynlig: morgen (CET)</div>
          </div>
        </div>
        <div>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
