/* Shared pieces: Header, Footer, PostRow, Chip, etc. */

const { useState, useEffect, useRef, useMemo } = React;

// react-icons/fi inline SVGs (subset we actually use)
const Icon = {
  Github: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...p}><path d="M12 .5A11.5 11.5 0 0 0 .5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.8-.25.8-.56v-2.02c-3.2.7-3.88-1.37-3.88-1.37-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.33.96.1-.74.4-1.25.73-1.54-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.3 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.25 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z"/></svg>),
  Linkedin: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...p}><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5.01 2.5 2.5 0 0 1 0-5.01ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.06c.53-.94 1.82-1.93 3.74-1.93 4 0 4.74 2.63 4.74 6.05V21h-4v-5.3c0-1.27-.02-2.9-1.77-2.9-1.77 0-2.04 1.38-2.04 2.82V21h-4V9Z"/></svg>),
  Mail: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M3 6h18v12H3z"/><path d="m3 6 9 7 9-7"/></svg>),
  ArrowUpRight: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M7 17 17 7M8 7h9v9"/></svg>),
  ArrowRight: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M5 12h14M13 6l6 6-6 6"/></svg>),
  Rss: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...p}><path d="M4 11a9 9 0 0 1 9 9h-3a6 6 0 0 0-6-6v-3Zm0-7a16 16 0 0 1 16 16h-3A13 13 0 0 0 4 7V4Zm1.5 12a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5Z"/></svg>),
  Edit: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M12 20h9M16.5 3.5a2.12 2.12 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>),
  Plus: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M12 5v14M5 12h14"/></svg>),
  Trash: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M6 6v14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6"/></svg>),
  Eye: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z"/><circle cx="12" cy="12" r="3"/></svg>),
  Search: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>),
  Check: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m5 12 5 5L20 7"/></svg>),
  Chevron: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><path d="m6 9 6 6 6-6"/></svg>),
  ChevronR: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><path d="m9 6 6 6-6 6"/></svg>),
  X: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" {...p}><path d="M18 6 6 18M6 6l12 12"/></svg>),
  Circle: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="12" cy="12" r="9"/></svg>),
  Menu: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><path d="M3 6h18M3 12h18M3 18h18"/></svg>),
  Grid: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>),
  File: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/></svg>),
  Settings: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>),
  Upload: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>),
  Calendar: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>),
  Tag: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M20.59 13.41 13 21l-9-9V4h8l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01"/></svg>),
  Bold: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M6 4h8a4 4 0 0 1 0 8H6zM6 12h9a4 4 0 0 1 0 8H6z"/></svg>),
  Italic: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><path d="M19 4h-9M14 20H5M15 4 9 20"/></svg>),
  Code: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/></svg>),
  Link: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 1 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1"/></svg>),
  List: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>),
  Heading: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><path d="M6 4v16M18 4v16M6 12h12"/></svg>),
  Image: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>),
  Save: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" {...p}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>),
  Grip: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" {...p}><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>),
  External: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" {...p}><path d="M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>),
  Clock: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>),
  Home: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" {...p}><path d="m3 12 9-9 9 9M5 10v10h14V10"/></svg>),
  Logout: (p) => (<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>),
  Dot: () => (<span style={{display:'inline-block',width:3,height:3,borderRadius:'50%',background:'currentColor',opacity:.5,margin:'0 .5em',verticalAlign:'middle'}}/>),
};

function SiteHeader({ active = '/' }) {
  const nav = [
    { href: '/', label: 'Hjem' },
    { href: '/prosjekter', label: 'Prosjekter' },
    { href: '/blogg', label: 'Blogg' },
    { href: '/na', label: 'Nå' },
    { href: '/uses', label: 'Uses' },
    { href: '/om', label: 'Om' },
    { href: '/kontakt', label: 'Kontakt' },
  ];
  return (
    <header className="site-header" style={{padding:'1rem 1.5rem'}}>
      <a href="/" className="brand" style={{fontSize:'.9375rem'}}>
        <span className="dot" />
        <span>marcus<span style={{color:'var(--ink-4)'}}>.</span>no</span>
      </a>
      <nav>
        {nav.map(n => (
          <a key={n.href} href={n.href} className={active === n.href ? 'active' : ''}>{n.label}</a>
        ))}
      </nav>
      <div className="right">
        <span className="mono" style={{fontSize:'.75rem', color:'var(--ink-4)'}}>nb-NO</span>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="grid">
        <div>
          <div style={{display:'flex', alignItems:'center', gap:'.5rem', fontWeight:600, color:'var(--ink)', marginBottom:'.5rem'}}>
            <span style={{width:7, height:7, borderRadius:'50%', background:'var(--accent)'}}/>
            Marcus Jenshaug
          </div>
          <p style={{color:'var(--ink-3)', maxWidth:'22rem', fontSize:'.8125rem'}}>
            Fullstack-utvikler i Redi AS. Bygger Klink og andre digitale verktøy fra Norge.
          </p>
        </div>
        <div>
          <h4>Innhold</h4>
          <ul>
            <li><a href="/blogg">Blogg</a></li>
            <li><a href="/prosjekter">Prosjekter</a></li>
            <li><a href="/na">Nå</a></li>
            <li><a href="/uses">Uses</a></li>
          </ul>
        </div>
        <div>
          <h4>Koble til</h4>
          <ul>
            <li><a href="#">LinkedIn <Icon.ArrowUpRight style={{fontSize:'.7em',opacity:.6}}/></a></li>
            <li><a href="#">GitHub <Icon.ArrowUpRight style={{fontSize:'.7em',opacity:.6}}/></a></li>
            <li><a href="#">X / Twitter <Icon.ArrowUpRight style={{fontSize:'.7em',opacity:.6}}/></a></li>
            <li><a href="mailto:marcus@jenshaug.no">marcus@jenshaug.no</a></li>
          </ul>
        </div>
        <div>
          <h4>Feeds</h4>
          <ul>
            <li><a href="/rss.xml">RSS</a></li>
            <li><a href="/feed.json">JSON Feed</a></li>
            <li><a href="/llms.txt">llms.txt</a></li>
            <li><a href="/sitemap.xml">Sitemap</a></li>
          </ul>
        </div>
      </div>
      <div className="meta">
        <span>© 2026 Marcus Jenshaug</span>
        <span className="mono">Bygget med Next.js · Hostet på Vercel · v1.2.0</span>
      </div>
    </footer>
  );
}

function PostRow({ title, desc, date, tags = [], reading }) {
  return (
    <a className="post-row" href="#">
      <div>
        <div className="post-title">{title}</div>
        {desc && <div className="post-desc">{desc}</div>}
        {tags.length > 0 && (
          <div style={{display:'flex', gap:'.375rem', marginTop:'.5rem'}}>
            {tags.map(t => <span key={t} className="chip">{t}</span>)}
            {reading && <span className="chip"><Icon.Clock/> {reading}</span>}
          </div>
        )}
      </div>
      <span className="post-date">{date}</span>
    </a>
  );
}

Object.assign(window, { Icon, SiteHeader, SiteFooter, PostRow });
