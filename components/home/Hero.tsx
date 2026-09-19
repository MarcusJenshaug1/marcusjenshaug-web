import { FiArrowRight, FiDownload, FiGithub, FiLinkedin, FiArrowDown } from 'react-icons/fi'
import { OsloClock } from '@/components/OsloClock'
import { TransitionLink } from '@/components/motion/TransitionLink'
import { Magnetic } from '@/components/motion/Magnetic'
import { Reveal } from '@/components/motion/Reveal'
import { HeroVisual } from '@/components/fx/HeroVisual'
import { MeshGlow } from '@/components/fx/MeshGlow'
import { ParallaxLayer } from '@/components/fx/ParallaxLayer'
import { RoleRotator } from '@/components/home/RoleRotator'
import { SectionCounter } from '@/components/home/SectionCounter'
import { localePath, type Locale } from '@/lib/i18n/config'
import type { Translator } from '@/lib/i18n/client'
import type { SiteSettings } from '@/lib/types/app'

function socialByPlatform(links: { platform: string; url: string }[], name: string) {
  return links.find((l) => l.platform.toLowerCase() === name)
}

type Props = {
  locale: Locale
  t: Translator
  settings: SiteSettings
}

export function Hero({ locale, t, settings: s }: Props) {
  const github = socialByPlatform(s.social_links, 'github')
  const linkedin = socialByPlatform(s.social_links, 'linkedin')
  const available = s.available_for_work
  const nameLines = s.full_name.split(' ')
  const roles = [
    s.headline || t('hero.role.fallback'),
    t('hero.role.builder'),
    t('hero.role.selfhoster'),
    'Makkos',
  ]
  const portrait = s.image_url || '/portrett.jpg'
  const staticPortrait = /(^|\/)portrett\.jpg$/.test(portrait)

  return (
    <section className="hero" data-section="hero" data-parallax-root>
      <ParallaxLayer speed={-8} start="top top" className="hero-glow-layer" ariaHidden>
        <MeshGlow />
      </ParallaxLayer>
      <div className="hero-grid container">
        <ParallaxLayer speed={-5} start="top top" className="hero-content">
          <div className="eyebrow hero-eyebrow">
            {available && <span className="status-dot hero-status-dot" />}
            {available ? s.availability_note || t('hero.available') : t('hero.unavailable')}
            {' · OSLO '}
            <OsloClock locale={locale} />
          </div>
          <Reveal variant="chars">
            <h1 className="hero-name display display-1">
              {nameLines.map((line) => (
                <span key={line} className="hero-name-line">
                  {line}
                </span>
              ))}
            </h1>
          </Reveal>
          <div className="hero-role mono">
            <span className="hero-role-prefix" aria-hidden>
              ~/{' '}
            </span>
            <RoleRotator roles={roles} />
          </div>
          <Reveal variant="fade" delay={0.3}>
            <p className="hero-bio">{s.bio_short || t('hero.bioFallback')}</p>
          </Reveal>
          <div className="hero-ctas">
            <Magnetic>
              <TransitionLink href={localePath(locale, 'projects')} className="btn-xl btn-xl-solid mono">
                {t('hero.seeProjects')} <FiArrowRight aria-hidden />
              </TransitionLink>
            </Magnetic>
            <Magnetic>
              <TransitionLink href={localePath(locale, 'contact')} className="btn-xl mono">
                {t('hero.contact')}
              </TransitionLink>
            </Magnetic>
            {s.cv_url && (
              <Magnetic>
                <a
                  href={s.cv_url}
                  className="btn-xl mono"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FiDownload aria-hidden /> {t('hero.cv')}
                </a>
              </Magnetic>
            )}
          </div>
          {(github || linkedin) && (
            <div className="hero-socials mono">
              {github && (
                <a href={github.url} target="_blank" rel="me noopener noreferrer">
                  <FiGithub aria-hidden /> {github.url.replace(/^https?:\/\//, '')}
                </a>
              )}
              {linkedin && (
                <a href={linkedin.url} target="_blank" rel="me noopener noreferrer">
                  <FiLinkedin aria-hidden /> {linkedin.url.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>
          )}
        </ParallaxLayer>
        <ParallaxLayer speed={14} start="top top" className="hero-visual">
          <HeroVisual
            textureSrc={portrait}
            depthSrc={staticPortrait ? '/portrett-depth.webp' : undefined}
            faceMesh={staticPortrait}
            fallbackSrc={portrait}
            alt={t('hero.portraitAlt', { name: s.full_name })}
          />
        </ParallaxLayer>
      </div>
      <div className="hero-foot container mono">
        <span className="hero-scroll">
          <FiArrowDown className="scroll-arrow" aria-hidden /> {t('hero.scroll').toUpperCase()}
        </span>
        <SectionCounter />
      </div>
    </section>
  )
}
