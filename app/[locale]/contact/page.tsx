import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FiMail, FiArrowUpRight } from 'react-icons/fi'
import { getSiteSettings, localizeSettings } from '@/lib/site-settings'
import { alternatesFor, breadcrumbs, jsonLd } from '@/lib/site'
import { OG_LOCALE, getTranslator, isLocale, localePath } from '@/lib/i18n'
import { Reveal } from '@/components/motion/Reveal'
import { ContactForm, type ContactLabels } from './ContactForm'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = await getTranslator(locale)
  return {
    title: t('contact.title'),
    description: t('meta.contact'),
    alternates: alternatesFor(locale, 'contact'),
    openGraph: { locale: OG_LOCALE[locale], siteName: 'Marcus Jenshaug', title: t('contact.title'), description: t('meta.contact') },
  }
}

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = await getTranslator(locale)
  const s = localizeSettings(await getSiteSettings(), locale)

  const labels: ContactLabels = {
    name: t('contact.form.name'),
    email: t('contact.form.email'),
    message: t('contact.form.message'),
    namePlaceholder: t('contact.form.namePlaceholder'),
    emailPlaceholder: t('contact.form.emailPlaceholder'),
    messagePlaceholder: t('contact.form.messagePlaceholder'),
    send: t('contact.form.send'),
    sending: t('contact.form.sending'),
    note: t('contact.form.note'),
    successTitle: t('contact.form.successTitle'),
    successBody: t('contact.form.successBody'),
    errors: {
      'contact.form.error.name': t('contact.form.error.name'),
      'contact.form.error.nameLong': t('contact.form.error.nameLong'),
      'contact.form.error.email': t('contact.form.error.email'),
      'contact.form.error.message': t('contact.form.error.message'),
      'contact.form.error.messageLong': t('contact.form.error.messageLong'),
    },
  }

  const breadcrumbSchema = breadcrumbs(locale, t, [{ name: t('contact.title'), path: localePath(locale, 'contact') }])

  return (
    <section className="px-5 py-12 md:px-8 md:py-16">
      <div className="container">
        <div className="page-head">
          <div className="eyebrow kontakt-eyebrow">
            /{t('contact.eyebrow')}
            {s.available_for_work && (
              <>
                {' · '}
                <span className="status-dot kontakt-status-dot" aria-hidden />
                <span className="cta-available">{s.availability_note || t('hero.available')}</span>
              </>
            )}
          </div>
          <Reveal variant="chars">
            <h1 className="display display-1 kontakt-title">{t('contact.heading')}</h1>
          </Reveal>
          <p className="page-lede">{t('contact.lede')}</p>
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
                <span className="com">{t('contact.responseTime')}</span>
              </div>
              <div>{t('contact.usually')}</div>
              <div>{t('contact.likely')}</div>
            </div>
          </div>
          <div className="kontakt-form">
            <ContactForm locale={locale} labels={labels} />
          </div>
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }} />
    </section>
  )
}
