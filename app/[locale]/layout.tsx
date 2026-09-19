import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PublicShell } from '@/components/PublicShell'
import { RootDocument } from '@/app/RootDocument'
import { HTML_LANG, OG_LOCALE, getTranslator, isLocale, localePath } from '@/lib/i18n'
import { alternatesFor, langTag, ogImageUrl, siteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Pick<Props, 'params'>): Promise<Metadata> {
  const { locale } = await params
  if (!isLocale(locale)) return {}
  const t = await getTranslator(locale)
  const description = t('meta.siteDescription')
  const ogImage = ogImageUrl(locale, 'Marcus Jenshaug')

  return {
    description,
    alternates: alternatesFor(locale, 'home'),
    openGraph: {
      type: 'website',
      locale: OG_LOCALE[locale],
      url: `${siteUrl}${localePath(locale, 'home')}`,
      siteName: 'Marcus Jenshaug',
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImage],
    },
  }
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params
  if (!isLocale(locale)) notFound()
  const t = await getTranslator(locale)

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteUrl,
    name: 'Marcus Jenshaug',
    inLanguage: langTag(locale),
    author: { '@id': `${siteUrl}/#person` },
  }

  return (
    <RootDocument lang={HTML_LANG[locale]} skipLabel={t('skip')} schema={websiteSchema}>
      <PublicShell locale={locale}>{children}</PublicShell>
    </RootDocument>
  )
}
