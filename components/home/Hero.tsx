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
import type { SiteSettings } from '@/lib/types/app'

function socialByPlatform(links: { platform: string; url: string }[], name: string) {
  return links.find((l) => l.platform.toLowerCase() === name)
}

export function Hero({ settings: s }: { settings: SiteSettings }) {
  const github = socialByPlatform(s.social_links, 'github')
  const linkedin = socialByPlatform(s.social_links, 'linkedin')
  const available = s.available_for_work
  const nameLines = s.full_name.split(' ')
  const roles = [s.headline || 'Fullstack-utvikler', 'Produktbygger', 'Selvhoster', 'Makkos']

  return (
    <section className="hero" data-section="hero" data-parallax-root>
      <ParallaxLayer speed={-8} start="top top" className="hero-glow-layer" ariaHidden>
        <MeshGlow />
      </ParallaxLayer>
      <div className="hero-grid container">
        <ParallaxLayer speed={-5} start="top top" className="hero-content">
          <div className="eyebrow hero-eyebrow">
            {available && <span className="status-dot hero-status-dot" />}
            {available
              ? s.availability_note || 'Tilgjengelig for samtaler'
              : 'Ikke tilgjengelig akkurat nå'}
            {' · OSLO '}
            <OsloClock />
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
            <p className="hero-bio">
              {s.bio_short ||
                'Notater, prosjekter og verktøy fra arbeidet mitt som fullstack-utvikler.'}
            </p>
          </Reveal>
          <div className="hero-ctas">
            <Magnetic>
              <TransitionLink href="/prosjekter" className="btn-xl btn-xl-solid mono">
                Se prosjekter <FiArrowRight aria-hidden />
              </TransitionLink>
            </Magnetic>
            <Magnetic>
              <TransitionLink href="/kontakt" className="btn-xl mono">
                Ta kontakt
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
                  <FiDownload aria-hidden /> CV
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
            textureSrc="/portrett.jpg"
            fallbackSrc={s.image_url ?? '/portrett.jpg'}
            alt={`Portrett av ${s.full_name}`}
          />
        </ParallaxLayer>
      </div>
      <div className="hero-foot container mono">
        <span className="hero-scroll">
          <FiArrowDown className="scroll-arrow" aria-hidden /> SCROLL
        </span>
        <SectionCounter />
      </div>
    </section>
  )
}
