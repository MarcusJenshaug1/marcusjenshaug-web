import Link from 'next/link'

const navItems = [
  { href: '/', label: 'Forside' },
  { href: '/prosjekter', label: 'Prosjekter' },
  { href: '/blogg', label: 'Blogg' },
  { href: '/na', label: 'Nå' },
  { href: '/uses', label: 'Uses' },
  { href: '/om', label: 'Om' },
  { href: '/kontakt', label: 'Kontakt' },
]

export function Header() {
  return (
    <header className="sticky top-0 z-20 bg-bg border-b border-rule">
      <div className="flex items-center justify-between px-8 py-5 max-w-[var(--max-w)] mx-auto">
        <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
          <span className="w-2 h-2 rounded-full bg-accent" aria-hidden="true" />
          Marcus Jenshaug
        </Link>
        <nav className="flex gap-6 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-ink-3 hover:text-ink transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
