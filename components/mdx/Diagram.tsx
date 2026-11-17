'use client'

import { useEffect, useId, useRef, useState } from 'react'

type Props = {
  /** Mermaid-kilde, for eksempel «graph TD\n A --> B». */
  children: string
  /** Vises under figuren, og brukes som tilgjengelig beskrivelse. */
  tekst?: string
}

// Mermaid tegner i nettleseren og er stor, så den lastes først når figuren er
// i ferd med å bli synlig. Fram til da står kilden som forhåndsformatert tekst,
// slik at den som leser uten JavaScript fortsatt får med seg innholdet.
export function Diagram({ children, tekst }: Props) {
  const kilde = typeof children === 'string' ? children.trim() : String(children ?? '').trim()
  const id = useId().replace(/:/g, '')
  const boks = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState('')
  const [feilet, setFeilet] = useState(false)

  useEffect(() => {
    if (!kilde || !boks.current) return
    let avbrutt = false

    const observer = new IntersectionObserver(
      (poster) => {
        if (!poster.some((p) => p.isIntersecting)) return
        observer.disconnect()
        tegn()
      },
      { rootMargin: '300px' }
    )
    observer.observe(boks.current)

    async function tegn() {
      try {
        const { default: mermaid } = await import('mermaid')
        const stil = getComputedStyle(document.documentElement)
        const hent = (navn: string, reserve: string) => stil.getPropertyValue(navn).trim() || reserve

        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          fontFamily: hent('--ff-sans', 'system-ui'),
          theme: 'base',
          themeVariables: {
            background: hent('--bg', '#fff'),
            primaryColor: hent('--bg-elev', '#f4f4f4'),
            primaryTextColor: hent('--ink', '#111'),
            primaryBorderColor: hent('--rule-strong', '#999'),
            secondaryColor: hent('--bg-sunken', '#eee'),
            tertiaryColor: hent('--bg-sunken', '#eee'),
            lineColor: hent('--rule-strong', '#999'),
            textColor: hent('--ink-2', '#333'),
            mainBkg: hent('--bg-elev', '#f4f4f4'),
            nodeBorder: hent('--rule-strong', '#999'),
            clusterBkg: hent('--bg-sunken', '#eee'),
            clusterBorder: hent('--rule', '#ccc'),
          },
        })

        const { svg: tegnet } = await mermaid.render(`d${id}`, kilde)
        if (!avbrutt) setSvg(tegnet)
      } catch (error) {
        console.error('Mermaid feilet:', error)
        if (!avbrutt) setFeilet(true)
      }
    }

    return () => {
      avbrutt = true
      observer.disconnect()
    }
  }, [kilde, id])

  return (
    <figure ref={boks} className="my-8 not-prose">
      {svg && !feilet ? (
        <div
          className="overflow-x-auto [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
          role="img"
          aria-label={tekst ?? 'Diagram'}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <pre className="overflow-x-auto rounded-md border border-rule bg-bg-sunken px-3 py-2.5 font-mono text-[.8125rem] text-ink-3">
          {kilde}
        </pre>
      )}
      {tekst && <figcaption className="mt-2 text-[.8125rem] text-ink-4">{tekst}</figcaption>}
    </figure>
  )
}
