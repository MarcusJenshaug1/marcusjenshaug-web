'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'

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
  const [open, setOpen] = useState(false)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <header className="site-header">
      <Link href="/" className="brand">
        <span className="dot" aria-hidden="true" />
        <span>marcus<span style={{ color: 'var(--ink-4)' }}>.</span>no</span>
      </Link>
      <nav className="desktop-nav">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className={isActive(n.href) ? 'active' : ''}>
            {n.label}
          </Link>
        ))}
      </nav>
      <div className="right">
        <span className="mono" style={{ fontSize: '.75rem', color: 'var(--ink-4)' }}>nb-NO</span>
      </div>
      <button
        type="button"
        className="mobile-menu-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Lukk meny' : 'Åpne meny'}
        aria-expanded={open}
      >
        {open ? <FiX size={18} /> : <FiMenu size={18} />}
      </button>
      <div className={`mobile-nav-panel${open ? ' open' : ''}`}>
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className={isActive(n.href) ? 'active' : ''}>
            {n.label}
          </Link>
        ))}
      </div>
    </header>
  )
}
