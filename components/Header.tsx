'use client'

import { TransitionLink as Link } from '@/components/motion/TransitionLink'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { FiArrowUpRight } from 'react-icons/fi'
import { OsloClock } from '@/components/OsloClock'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SoundToggle } from '@/components/SoundToggle'
import { useLenis } from '@/components/motion/LenisProvider'
import { gsap } from '@/lib/motion/gsap'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'

const nav = [
  { href: '/', label: 'Hjem', desc: 'Forsiden — hero, prosjekter og det siste' },
  { href: '/prosjekter', label: 'Prosjekter', desc: 'Portefølje fra klientarbeid til sidesysler' },
  { href: '/blogg', label: 'Blogg', desc: 'Notater og lengre stykker om koden jeg skriver' },
  { href: '/na', label: 'Nå', desc: 'Hva jeg jobber med akkurat nå' },
  { href: '/uses', label: 'Uses', desc: 'Verktøy, programvare og hardware jeg bruker' },
  { href: '/om', label: 'Om', desc: 'Fullstack-utvikler i Redi AS' },
  { href: '/kontakt', label: 'Kontakt', desc: 'Kortest vei til en samtale' },
]

type HeaderProps = {
  socialLinks?: { platform: string; url: string }[]
  email?: string
  portraitSrc?: string
}

export function Header({ socialLinks = [], email, portraitSrc }: HeaderProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const lenis = useLenis()
  const reduced = useReducedMotion()
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const descRef = useRef<HTMLSpanElement>(null)

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const current = nav.findIndex((n) =>
      n.href === '/' ? pathname === '/' : pathname.startsWith(n.href)
    )
    setActiveIdx(current === -1 ? 0 : current)
  }, [open, pathname])

  useEffect(() => {
    const el = descRef.current
    if (!el || !open) return
    const text = nav[activeIdx]?.desc ?? ''
    if (reduced) {
      el.textContent = text
      return
    }
    const tween = gsap.to(el, {
      scrambleText: { text, chars: '01<>/\\_-', speed: 0.9 },
      duration: 0.5,
      ease: 'none',
    })
    return () => {
      tween.kill()
    }
  }, [activeIdx, open, reduced])

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
          <SoundToggle />
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
            <div className="nav-overlay-inner">
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
                      onPointerEnter={() => setActiveIdx(i)}
                      onFocus={() => setActiveIdx(i)}
                    >
                      <span className="nav-overlay-index mono">00{i + 1}</span>
                      {n.label}
                      <span className="nav-overlay-link-desc mono">{n.desc}</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div className="nav-overlay-preview" aria-hidden>
                {portraitSrc && nav[activeIdx]?.href === '/om' ? (
                  <div className="nav-overlay-preview-img">
                    <Image src={portraitSrc} alt="" fill sizes="40vw" style={{ objectFit: 'cover' }} />
                  </div>
                ) : (
                  <span className="nav-overlay-preview-index display">
                    {String(activeIdx + 1).padStart(2, '0')}
                  </span>
                )}
                <span ref={descRef} className="nav-overlay-preview-desc mono">
                  {nav[activeIdx]?.desc}
                </span>
              </div>
            </div>
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
