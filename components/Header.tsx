'use client'

import { TransitionLink as Link } from '@/components/motion/TransitionLink'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'
import { FiArrowUpRight } from 'react-icons/fi'
import { OsloClock } from '@/components/OsloClock'
import { ThemeToggle } from '@/components/ThemeToggle'
import { SoundToggle } from '@/components/SoundToggle'
import { LocaleSwitch } from '@/components/LocaleSwitch'
import { useLenis } from '@/components/motion/LenisProvider'
import { gsap, useGSAP } from '@/lib/motion/gsap'
import { useReducedMotion } from '@/lib/motion/useReducedMotion'
import { GSAP_EASE_INOUT, GSAP_EASE_OUT } from '@/lib/motion/easings'
import {
  ROUTES,
  isLocale,
  localePath,
  routeKeyFromSegment,
  type Locale,
  type RouteKey,
} from '@/lib/i18n/config'
import { useTranslator } from '@/lib/i18n/client'

const NAV_KEYS = Object.keys(ROUTES) as RouteKey[]

// Rutenøkkel for gjeldende side, uansett språk i URL-en (/nb/blogg og /en/blog gir begge 'blog').
function currentRouteKey(pathname: string): RouteKey | null {
  const [first = '', second = ''] = pathname.split('/').filter(Boolean)
  return isLocale(first) ? routeKeyFromSegment(second) : routeKeyFromSegment(first)
}

type HeaderProps = {
  locale: Locale
  socialLinks?: { platform: string; url: string }[]
  email?: string
  portraitSrc?: string
  alternatePath?: string
}

export function Header({ locale, socialLinks = [], email, portraitSrc, alternatePath }: HeaderProps) {
  const t = useTranslator(locale)
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(0)
  const lenis = useLenis()
  const reduced = useReducedMotion()
  const overlayRef = useRef<HTMLDivElement>(null)
  const firstLinkRef = useRef<HTMLAnchorElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const descRef = useRef<HTMLSpanElement>(null)
  const wasOpen = useRef(false)

  const nav = useMemo(
    () =>
      NAV_KEYS.map((key) => ({
        key,
        href: localePath(locale, key),
        label: t(`nav.${key}`),
        desc: t(`nav.${key}.desc`),
      })),
    [locale, t]
  )

  const currentKey = currentRouteKey(pathname)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const current = nav.findIndex((n) => n.key === currentKey)
    setActiveIdx(current === -1 ? 0 : current)
  }, [open, nav, currentKey])

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
  }, [activeIdx, open, reduced, nav])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useGSAP(
    () => {
      const overlay = overlayRef.current
      if (!overlay) return
      const items = overlay.querySelectorAll('.nav-overlay-item')
      gsap.killTweensOf([overlay, ...items])

      if (open) {
        if (reduced) {
          gsap.set(overlay, { yPercent: 0, visibility: 'visible' })
          gsap.set(items, { y: 0, opacity: 1 })
          return
        }
        gsap
          .timeline()
          .set(overlay, { visibility: 'visible' })
          .fromTo(
            overlay,
            { yPercent: -100 },
            { yPercent: 0, duration: 0.5, ease: GSAP_EASE_INOUT }
          )
          .fromTo(
            items,
            { y: 48, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.55, ease: GSAP_EASE_OUT, stagger: 0.05 },
            0.15
          )
        return
      }

      if (!wasOpen.current || reduced) {
        gsap.set(overlay, { yPercent: -100, visibility: 'hidden' })
        return
      }
      gsap.to(overlay, {
        yPercent: -100,
        duration: 0.5,
        ease: GSAP_EASE_INOUT,
        onComplete: () => gsap.set(overlay, { visibility: 'hidden' }),
      })
    },
    { dependencies: [open, reduced], scope: overlayRef }
  )

  useEffect(() => {
    if (open) {
      lenis?.stop()
      document.body.style.overflow = 'hidden'
      firstLinkRef.current?.focus()
    } else {
      lenis?.start()
      document.body.style.overflow = ''
      if (wasOpen.current) triggerRef.current?.focus({ preventScroll: true })
    }
    wasOpen.current = open
    return () => {
      lenis?.start()
      document.body.style.overflow = ''
    }
  }, [open, lenis])

  return (
    <>
      <header className="nav-bar">
        <Link href={localePath(locale, 'home')} className="nav-brand mono" aria-label={t('nav.toFront')}>
          MJ<span aria-hidden>/</span>
        </Link>
        <div className="nav-right">
          <span className="nav-clock mono" suppressHydrationWarning>
            OSLO <OsloClock locale={locale} />
          </span>
          <LocaleSwitch locale={locale} alternatePath={alternatePath} />
          <SoundToggle locale={locale} />
          <ThemeToggle locale={locale} />
          <button
            ref={triggerRef}
            type="button"
            className="nav-menu-btn mono"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="nav-overlay"
          >
            {(open ? t('nav.close') : t('nav.menu')).toUpperCase()}
          </button>
        </div>
      </header>

      <div
        ref={overlayRef}
        id="nav-overlay"
        className="nav-overlay"
        role="dialog"
        aria-modal="true"
        aria-label={t('nav.menu')}
        inert={!open}
      >
        <div className="nav-overlay-inner">
          <nav className="nav-overlay-list" aria-label={t('nav.mainMenu')}>
            {nav.map((n, i) => {
              const active = n.key === currentKey
              return (
                <div key={n.key} className="nav-overlay-item">
                  <Link
                    ref={i === 0 ? firstLinkRef : undefined}
                    href={n.href}
                    className={`nav-overlay-link display display-2${active ? ' active' : ''}`}
                    aria-current={active ? 'page' : undefined}
                    onPointerEnter={() => setActiveIdx(i)}
                    onFocus={() => setActiveIdx(i)}
                  >
                    <span className="nav-overlay-index mono">00{i + 1}</span>
                    {n.label}
                    <span className="nav-overlay-link-desc mono">{n.desc}</span>
                  </Link>
                </div>
              )
            })}
          </nav>
          <div className="nav-overlay-preview" aria-hidden>
            {portraitSrc && nav[activeIdx]?.key === 'about' ? (
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
      </div>
    </>
  )
}
