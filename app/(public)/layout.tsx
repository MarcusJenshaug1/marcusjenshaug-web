import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { ThemeProvider } from '@/components/motion/ThemeProvider'
import { MotionRoot } from '@/components/motion/MotionRoot'
import { getSiteSettings } from '@/lib/site-settings'

export const revalidate = 3600

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings()

  return (
    <ThemeProvider>
      <MotionRoot>
        <Header socialLinks={settings.social_links} email={settings.email} />
        <main id="main">{children}</main>
        <Footer settings={settings} />
      </MotionRoot>
    </ThemeProvider>
  )
}
