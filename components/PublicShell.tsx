import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { LocaleBanner } from '@/components/LocaleBanner'
import { ThemeProvider } from '@/components/motion/ThemeProvider'
import { MotionRoot } from '@/components/motion/MotionRoot'
import { getSiteSettings, localizeSettings } from '@/lib/site-settings'
import { getTranslator, type Locale } from '@/lib/i18n'

type Props = {
  locale: Locale
  children: React.ReactNode
}

export async function PublicShell({ locale, children }: Props) {
  const [rawSettings, t] = await Promise.all([getSiteSettings(), getTranslator(locale)])
  const settings = localizeSettings(rawSettings, locale)

  return (
    <ThemeProvider>
      <MotionRoot>
        <Header
          locale={locale}
          socialLinks={settings.social_links}
          email={settings.email}
          portraitSrc={settings.image_url ?? '/portrett.jpg'}
        />
        <LocaleBanner locale={locale} />
        <main id="main">{children}</main>
        <Footer locale={locale} t={t} settings={settings} />
      </MotionRoot>
    </ThemeProvider>
  )
}
