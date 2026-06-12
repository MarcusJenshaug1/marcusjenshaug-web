'use client'

import { TransitionLink as Link } from '@/components/motion/TransitionLink'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { FiArrowUpRight } from 'react-icons/fi'
import { OsloClock } from '@/components/OsloClock'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useLenis } from '@/components/motion/LenisProvider'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'

const nav = [
  { href: '/', label: 'Hjem' },
  { href: '/prosjekter', label: 'Prosjekter' },
  { href: '/blogg', label: 'Blogg' },
  { href: '/na', label: 'Nå' },
  { href: '/uses', label: 'Uses' },
  { href: '/om', label: 'Om' },
  { href: '/kontakt', label: 'Kontakt' },
]

type HeaderProps = {
  socialLinks?: { platform: string; url: string }[]
  email?: string
}

export function Header({ socialLinks = [], email }: HeaderProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const lenis = useLenis()
  const reduced = useReducedMotion()
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

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

  useEffect(() => {
    if (open) {
      lenis?.stop()
      document.body.style.overflow = 'hidden'
      firstLinkRef.current?.focus()
    } else {
      lenis?.start()
      document.body.style.overflow = ''
      triggerRef.current?.focus({ preventScroll: true })
    }
    return () => {
      lenis?.start()
      document.body.style.overflow = ''
    }
  }, [open, lenis])

  const overlayTransition = reduced
    ? { duration: 0 }
    : { duration: 0.5, ease: [0.65, 0, 0.35, 1] as const }

  return (
    <>
      <header className="nav-bar">
        <Link href="/" className="nav-brand mono" aria-label="Til forsiden">
          MJ<span aria-hidden>/</span>
        </Link>
        <div className="nav-right">
          <span className="nav-clock mono" suppressHydrationWarning>
            OSLO <OsloClock />
          </span>
          <ThemeToggle />
          <button
            ref={triggerRef}
            type="button"
            className="nav-menu-btn mono"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="nav-overlay"
          >
            {open ? 'LUKK' : 'MENY'}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="nav-overlay"
            className="nav-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Hovedmeny"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={overlayTransition}
          >
            <nav className="nav-overlay-list">
              {nav.map((n, i) => (
                <motion.div
                  key={n.href}
                  initial={reduced ? false : { y: 48, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { delay: 0.15 + i * 0.05, duration: 0.55, ease: [0.16, 1, 0.3, 1] }
                  }
                >
                  <Link
                    ref={i === 0 ? firstLinkRef : undefined}
                    href={n.href}
                    className={`nav-overlay-link display display-2${isActive(n.href) ? ' active' : ''}`}
                  >
                    <span className="nav-overlay-index mono">00{i + 1}</span>
                    {n.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="nav-overlay-foot mono">
              {email && <a href={`mailto:${email}`}>{email}</a>}
              <div className="nav-overlay-socials">
                {socialLinks.map((l) => (
                  <a key={l.url} href={l.url} target="_blank" rel="me noopener noreferrer">
                    {l.platform} <FiArrowUpRight aria-hidden />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
