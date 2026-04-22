import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { getSiteSettings } from '@/lib/site-settings'

export const revalidate = 3600

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <>
      <Header />
      <main id="main" className="max-w-[var(--max-w)] mx-auto px-8 py-12">
        {children}
      </main>
      <Footer settings={settings} />
    </>
  )
}
