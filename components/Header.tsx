'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/', label: 'Hjem' },
  { href: '/prosjekter', label: 'Prosjekter' },
  { href: '/blogg', label: 'Blogg' },
  { href: '/na', label: 'Nå' },
  { href: '/uses', label: 'Uses' },
  { href: '/om', label: 'Om' },
  { href: '/kontakt', label: 'Kontakt' },
]

export function Header() {
  const pathname = usePathname()
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span className="dot" aria-hidden="true" />
        <span>marcus<span style={{ color: 'var(--ink-4)' }}>.</span>no</span>
      </Link>
      <nav>
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className={isActive(n.href) ? 'active' : ''}>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="right">
        <span className="mono" style={{ fontSize: '.75rem', color: 'var(--ink-4)' }}>nb-NO</span>
      </div>
    </header>
  )
}
