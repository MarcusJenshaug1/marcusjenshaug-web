import Link from 'next/link'
import Image from 'next/image'
import { FiArrowRight } from 'react-icons/fi'
import { getSiteSettings } from '@/lib/site-settings'

export default async function HomePage() {
  const s = await getSiteSettings()

  return (
    <div className="space-y-16">
      <section className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-10 items-start">
        <div className="max-w-[var(--reading-w)]">
          <p className="eyebrow mb-4 text-[0.6875rem] uppercase tracking-[0.18em] text-ink-4 font-mono font-medium">
            {s.location ?? 'Norge'}
            {s.available_for_work && s.availability_note && (
              <> · <span className="text-accent-ink">{s.availability_note}</span></>
            )}
          </p>
          <h1 className="mb-6">{s.headline || 'Fullstack-utvikler'}</h1>
          <p className="text-lg text-ink-2 leading-relaxed">{s.bio_short}</p>
          <div className="flex gap-3 mt-8">
            <Link
              href="/prosjekter"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md bg-ink text-bg-elev hover:bg-ink-2 transition-colors"
            >
              Se prosjekter <FiArrowRight size={14} />
            </Link>
            <Link
              href="/kontakt"
              className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium rounded-md border border-rule-strong hover:bg-bg-sunken transition-colors"
            >
              Ta kontakt
            </Link>
          </div>
        </div>
        {s.image_url && (
          <div className="w-40 h-40 rounded-full overflow-hidden bg-bg-sunken shrink-0">
            <Image
              src={s.image_url}
              alt={s.full_name}
              width={160}
              height={160}
              priority
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </section>

      <section>
        <header className="flex items-baseline justify-between mb-6">
          <h2 className="text-xs uppercase tracking-[0.14em] text-ink-3 font-medium">
            Utvalgte prosjekter
          </h2>
          <Link href="/prosjekter" className="text-[0.8125rem] text-ink-3 hover:text-ink">
            Alle →
          </Link>
        </header>
        <p className="text-sm text-ink-4">Kommer snart.</p>
      </section>

      <section>
        <header className="flex items-baseline justify-between mb-6">
          <h2 className="text-xs uppercase tracking-[0.14em] text-ink-3 font-medium">
            Siste innlegg
          </h2>
          <Link href="/blogg" className="text-[0.8125rem] text-ink-3 hover:text-ink">
            Alle →
          </Link>
        </header>
        <p className="text-sm text-ink-4">Kommer snart.</p>
      </section>
    </div>
  )
}
