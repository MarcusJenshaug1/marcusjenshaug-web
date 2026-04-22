import type { Metadata } from 'next'
import { FiMail, FiMapPin } from 'react-icons/fi'
import { getSiteSettings } from '@/lib/site-settings'
import { ContactForm } from './ContactForm'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Ta kontakt med Marcus Jenshaug.',
  alternates: { canonical: '/kontakt' },
}

export default async function KontaktPage() {
  const s = await getSiteSettings()

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-12 max-w-4xl">
      <section>
        <p className="text-xs uppercase tracking-[0.14em] text-ink-3 font-medium mb-3">Kontakt</p>
        <h1 className="mb-4">Ta kontakt</h1>
        <p className="text-ink-3 mb-8">
          Samarbeid, spørsmål, eller bare hei. Jeg leser alt, men svarer raskere på korte meldinger.
        </p>

        <ul className="space-y-3 text-sm">
          {s.email && (
            <li className="flex items-center gap-3 text-ink-2">
              <FiMail size={16} className="text-ink-4" />
              <a
                href={`mailto:${s.email}`}
                className="underline decoration-rule-strong underline-offset-[3px] decoration-1 hover:decoration-accent"
              >
                {s.email}
              </a>
            </li>
          )}
          {s.location && (
            <li className="flex items-center gap-3 text-ink-2">
              <FiMapPin size={16} className="text-ink-4" />
              {s.location}
            </li>
          )}
        </ul>

        {s.social_links.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xs uppercase tracking-[0.14em] text-ink-3 font-medium mb-3">Koblinger</h2>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {s.social_links.map((link) => (
                <li key={link.url}>
                  <a
                    href={link.url}
                    target="_blank"
                    rel="me noopener noreferrer"
                    className="text-ink-2 hover:text-accent-ink capitalize"
                  >
                    {link.platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section>
        <ContactForm />
      </section>
    </div>
  )
}
