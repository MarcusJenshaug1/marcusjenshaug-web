/* Admin panel screens */

function AdminShell({ active, children, title, actions }) {
  const nav = [
    { href: '/admin', label: 'Oversikt', icon: <Icon.Home/> },
    { href: '/admin/blogg', label: 'Blogg', icon: <Icon.File/>, count: posts.length, draft: 2 },
    { href: '/admin/prosjekter', label: 'Prosjekter', icon: <Icon.Grid/>, count: projects.length, draft: 1 },
    { href: '/admin/na', label: 'Nå', icon: <Icon.Clock/>, count: nowEntries.length },
    { href: '/admin/uses', label: 'Uses', icon: <Icon.Tag/>, count: Object.values(uses).flat().length },
    { href: '/admin/innstillinger', label: 'Innstillinger', icon: <Icon.Settings/> },
  ];
  return (
    <div style={{minHeight:'100vh', background:'var(--bg-sunken)'}}>
      <header style={{background:'var(--bg-elev)', borderBottom:'1px solid var(--rule)', padding:'.75rem 1.25rem', display:'flex', alignItems:'center', gap:'1rem'}}>
        <a href="/admin" style={{display:'flex', alignItems:'center', gap:'.5rem', fontWeight:600, fontSize:'.875rem'}}>
          <span style={{width:7, height:7, borderRadius:'50%', background:'var(--accent)'}}/>
          marcus<span style={{color:'var(--ink-4)'}}>.no</span>
          <span className="chip mono" style={{marginLeft:'.375rem', fontSize:'.6875rem'}}>ADMIN</span>
        </a>
        <div style={{flex:1}}/>
        <a href="/" className="btn btn-sm btn-ghost"><Icon.External/> Se siden</a>
        <div style={{display:'flex', alignItems:'center', gap:'.5rem', paddingLeft:'.75rem', borderLeft:'1px solid var(--rule)', fontSize:'.8125rem'}}>
          <span style={{width:24, height:24, borderRadius:'50%', background:'var(--accent)', color:'#fff', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'.6875rem', fontWeight:600}}>MJ</span>
          marcus@jenshaug.no
          <button className="btn btn-sm btn-ghost" title="Logg ut"><Icon.Logout/></button>
        </div>
      </header>
      <div style={{display:'grid', gridTemplateColumns:'220px 1fr', minHeight:'calc(100vh - 49px)'}}>
        <aside style={{background:'var(--bg-elev)', borderRight:'1px solid var(--rule)', padding:'1.25rem .75rem'}}>
          <nav style={{display:'flex', flexDirection:'column', gap:'2px'}}>
            {nav.map(n => {
              const isActive = active === n.href;
              return (
                <a key={n.href} href={n.href} style={{
                  display:'flex', alignItems:'center', gap:'.625rem', padding:'.4375rem .625rem',
                  fontSize:'.875rem', borderRadius:'6px',
                  background: isActive ? 'var(--bg-sunken)' : 'transparent',
                  color: isActive ? 'var(--ink)' : 'var(--ink-3)',
                  fontWeight: isActive ? 500 : 400,
                }}>
                  <span style={{color: isActive ? 'var(--accent)' : 'var(--ink-4)', fontSize:'.9375em', display:'inline-flex'}}>{n.icon}</span>
                  {n.label}
                  {n.count != null && (
                    <span className="mono dim" style={{marginLeft:'auto', fontSize:'.6875rem'}}>
                      {n.count}{n.draft ? <span style={{color:'var(--accent)'}}>·{n.draft}</span> : ''}
                    </span>
                  )}
                </a>
              );
            })}
          </nav>
          <div style={{marginTop:'2rem', padding:'.75rem', background:'var(--bg-sunken)', borderRadius:'6px', fontSize:'.75rem', color:'var(--ink-3)'}}>
            <div className="eyebrow" style={{marginBottom:'.375rem'}}>Build</div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>Vercel</span><span style={{color:'oklch(0.55 0.16 145)'}}>● Live</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>Siste</span><span className="mono">4 min</span></div>
            <div style={{display:'flex', justifyContent:'space-between'}}><span>Cache</span><span className="mono">OK</span></div>
          </div>
        </aside>
        <main style={{padding:'2rem 2.5rem', overflow:'auto'}}>
          {(title || actions) && (
            <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:'1.75rem', paddingBottom:'1rem', borderBottom:'1px solid var(--rule)'}}>
              <div>
                <h1 style={{fontSize:'1.375rem', fontFamily:'var(--ff-sans)', letterSpacing:'-.02em'}}>{title}</h1>
              </div>
              <div style={{display:'flex', gap:'.5rem'}}>{actions}</div>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}

// ── Login ─────────────────────────────────────
function AdminLoginPage() {
  const [email, setEmail] = useState('marcus@jenshaug.no');
  const [sent, setSent] = useState(false);
  return (
    <div style={{minHeight:'100vh', display:'grid', placeItems:'center', background:'var(--bg-sunken)', padding:'2rem'}}>
      <div style={{width:'100%', maxWidth:'22rem'}}>
        <div style={{textAlign:'center', marginBottom:'2rem'}}>
          <div style={{width:36, height:36, borderRadius:'8px', background:'var(--accent)', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, letterSpacing:'-.02em'}}>M</div>
          <h1 style={{fontSize:'1.125rem', marginTop:'.875rem', fontFamily:'var(--ff-sans)'}}>marcusjenshaug.no</h1>
          <p className="muted" style={{fontSize:'.875rem', marginTop:'.25rem'}}>Innlogging for admin</p>
        </div>
        <div style={{background:'var(--bg-elev)', border:'1px solid var(--rule)', borderRadius:'10px', padding:'1.5rem'}}>
          {!sent ? (
            <form onSubmit={e => {e.preventDefault(); setSent(true);}}>
              <label style={{display:'block', fontSize:'.8125rem', color:'var(--ink-3)', marginBottom:'.375rem'}}>E-post</label>
              <input value={email} onChange={e => setEmail(e.target.value)} type="email"
                style={{width:'100%', padding:'.5625rem .75rem', border:'1px solid var(--rule-strong)', borderRadius:'6px', background:'var(--bg-elev)', marginBottom:'1rem'}}/>
              <button type="submit" className="btn btn-primary" style={{width:'100%', justifyContent:'center'}}>
                Send magic link <Icon.ArrowRight/>
              </button>
              <p className="dim" style={{fontSize:'.75rem', marginTop:'.875rem', textAlign:'center', lineHeight:1.5}}>
                Kun whitelisted e-post. Lenken utløper etter 10 minutter.
              </p>
            </form>
          ) : (
            <div style={{textAlign:'center', padding:'.5rem 0'}}>
              <div style={{width:40, height:40, margin:'0 auto .875rem', borderRadius:'50%', background:'oklch(0.94 0.06 145)', color:'oklch(0.45 0.16 145)', display:'inline-flex', alignItems:'center', justifyContent:'center'}}>
                <Icon.Mail/>
              </div>
              <h3 style={{marginBottom:'.375rem'}}>Sjekk innboksen</h3>
              <p className="muted" style={{fontSize:'.875rem'}}>Vi sendte en innlogging-lenke til <span className="mono">{email}</span>.</p>
              <button onClick={() => setSent(false)} className="btn btn-sm btn-ghost" style={{marginTop:'.875rem'}}>Bruk en annen adresse</button>
            </div>
          )}
        </div>
        <a href="/" className="dim" style={{display:'block', textAlign:'center', marginTop:'1.25rem', fontSize:'.8125rem'}}>← Tilbake til siden</a>
      </div>
    </div>
  );
}

// ── Dashboard ────────────────────────────────
function AdminDashboard() {
  return (
    <AdminShell active="/admin" title="Velkommen tilbake, Marcus"
      actions={<><a href="/admin/blogg/ny" className="btn btn-sm btn-primary"><Icon.Plus/> Nytt innlegg</a></>}>
      <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'1rem', marginBottom:'2rem'}}>
        {[
          { k:'Publiserte artikler', v: posts.length, d: '+2 denne måneden' },
          { k:'Aktive prosjekter', v: 3, d: 'av 5 totalt' },
          { k:'Utkast', v: 2, d: 'venter på publisering' },
          { k:'Nå-oppføringer', v: nowEntries.length, d: `sist: ${nowEntries[0].date}` },
        ].map(c => (
          <div key={c.k} className="card" style={{padding:'1rem 1.125rem'}}>
            <div className="eyebrow" style={{marginBottom:'.5rem'}}>{c.k}</div>
            <div style={{fontSize:'1.75rem', fontWeight:500, fontFamily:'var(--ff-serif)', letterSpacing:'-.02em'}}>{c.v}</div>
            <div className="dim" style={{fontSize:'.75rem', marginTop:'.125rem'}}>{c.d}</div>
          </div>
        ))}
      </div>

      <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:'1.25rem'}}>
        <div className="card" style={{padding:0, overflow:'hidden'}}>
          <div style={{padding:'.875rem 1.125rem', borderBottom:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <h3 style={{fontSize:'.875rem'}}>Nylig aktivitet</h3>
            <span className="mono dim" style={{fontSize:'.75rem'}}>siste 7 dager</span>
          </div>
          <div>
            {[
              { t:'Publiserte', what:'Server-first med Next.js 15, uten å savne klienten', when:'14. apr 09:21', icon:<Icon.File/>, k:'post' },
              { t:'Oppdaterte', what:'Klink — lagt til ny skjermdump', when:'12. apr 14:03', icon:<Icon.Grid/>, k:'project' },
              { t:'Publiserte', what:'Nå-oppdatering (18. apr)', when:'18. apr 07:45', icon:<Icon.Clock/>, k:'now' },
              { t:'Endret', what:'site_settings.availability_note', when:'02. apr 22:11', icon:<Icon.Settings/>, k:'settings' },
              { t:'Lastet opp', what:'portrett-v2.jpg (Storage)', when:'02. apr 21:58', icon:<Icon.Upload/>, k:'storage' },
            ].map((a, i) => (
              <div key={i} style={{display:'grid', gridTemplateColumns:'auto 1fr auto', gap:'.875rem', padding:'.75rem 1.125rem', borderBottom:'1px solid var(--rule)', alignItems:'center'}}>
                <span style={{width:28, height:28, borderRadius:'6px', background:'var(--bg-sunken)', display:'inline-flex', alignItems:'center', justifyContent:'center', color:'var(--ink-3)'}}>{a.icon}</span>
                <div>
                  <span className="dim" style={{fontSize:'.75rem'}}>{a.t}</span>
                  <div style={{fontSize:'.875rem'}}>{a.what}</div>
                </div>
                <span className="mono dim" style={{fontSize:'.75rem'}}>{a.when}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          <div className="card" style={{padding:'1rem 1.125rem'}}>
            <h3 style={{fontSize:'.875rem', marginBottom:'.625rem'}}>Raske lenker</h3>
            <div style={{display:'flex', flexDirection:'column', gap:'.25rem'}}>
              {[
                { l:'Nytt blogginnlegg', h:'/admin/blogg/ny', i:<Icon.Edit/> },
                { l:'Nytt prosjekt', h:'/admin/prosjekter/ny', i:<Icon.Plus/> },
                { l:'Ny nå-oppdatering', h:'/admin/na', i:<Icon.Clock/> },
                { l:'Oppdater bio', h:'/admin/innstillinger', i:<Icon.Settings/> },
              ].map(l => (
                <a key={l.l} href={l.h} style={{display:'flex', alignItems:'center', gap:'.625rem', padding:'.375rem .5rem', borderRadius:'6px', fontSize:'.875rem'}}>
                  <span style={{color:'var(--ink-4)'}}>{l.i}</span>{l.l}
                  <Icon.ChevronR style={{marginLeft:'auto', color:'var(--ink-4)', fontSize:'.85em'}}/>
                </a>
              ))}
            </div>
          </div>
          <div className="card" style={{padding:'1rem 1.125rem'}}>
            <h3 style={{fontSize:'.875rem', marginBottom:'.625rem'}}>Site health</h3>
            <div style={{display:'flex', flexDirection:'column', gap:'.5rem', fontSize:'.8125rem'}}>
              {[
                { l:'Lighthouse (mobil)', v:'98/100', ok:true },
                { l:'Core Web Vitals', v:'Bestod', ok:true },
                { l:'Rich Results', v:'4/4 OK', ok:true },
                { l:'Sitemap sist pinget', v:'22t siden', ok:false },
              ].map(s => (
                <div key={s.l} style={{display:'flex', justifyContent:'space-between'}}>
                  <span className="muted">{s.l}</span>
                  <span style={{color: s.ok ? 'oklch(0.55 0.16 145)' : 'var(--ink-3)', fontFamily:'var(--ff-mono)', fontSize:'.75rem'}}>
                    {s.ok ? '● ' : '○ '}{s.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}

// ── Blogg-liste ───────────────────────────────
function AdminBloggList() {
  const [selected, setSelected] = useState(new Set());
  const rows = [
    { ...posts[0], status:'Publisert' },
    { ...posts[1], status:'Publisert' },
    { ...posts[2], status:'Publisert' },
    { title:'Tester med Vitest og Playwright — hva som faktisk funker', slug:'test-oppsett', status:'Utkast', date:'—', tags:['Testing'], updated:'21. apr 11:02' },
    { ...posts[3], status:'Publisert' },
    { title:'Kort om DNS og Vercel-konfigurasjon i 2026', slug:'dns-vercel', status:'Utkast', date:'—', tags:['DevOps'], updated:'19. apr 16:30' },
    { ...posts[4], status:'Publisert' },
    { ...posts[5], status:'Publisert' },
  ];
  return (
    <AdminShell active="/admin/blogg" title="Blogg"
      actions={<>
        <button className="btn btn-sm"><Icon.Search/></button>
        <a href="/admin/blogg/ny" className="btn btn-sm btn-primary"><Icon.Plus/> Nytt innlegg</a>
      </>}>
      <div style={{display:'flex', gap:'.75rem', marginBottom:'1rem', alignItems:'center'}}>
        <div className="segmented" style={{display:'inline-flex', border:'1px solid var(--rule)', borderRadius:'6px', overflow:'hidden'}}>
          {['Alle','Publisert','Utkast','Planlagt'].map((f,i) => (
            <button key={f} style={{background: i===0?'var(--ink)':'transparent', color: i===0?'var(--bg)':'var(--ink-3)', border:0, padding:'.3125rem .625rem', fontSize:'.8125rem'}}>{f}</button>
          ))}
        </div>
        <div style={{position:'relative', flex:1, maxWidth:'20rem'}}>
          <input placeholder="Søk i titler, tags, innhold…" style={{width:'100%', padding:'.375rem .625rem .375rem 1.75rem', border:'1px solid var(--rule)', borderRadius:'6px', background:'var(--bg-elev)', fontSize:'.8125rem'}}/>
          <Icon.Search style={{position:'absolute', left:'.5rem', top:'50%', transform:'translateY(-50%)', color:'var(--ink-4)', fontSize:'.9em'}}/>
        </div>
        <span className="dim mono" style={{fontSize:'.75rem', marginLeft:'auto'}}>{rows.length} rader</span>
      </div>

      <div style={{background:'var(--bg-elev)', border:'1px solid var(--rule)', borderRadius:'8px', overflow:'hidden'}}>
        <div style={{display:'grid', gridTemplateColumns:'auto 1fr 7rem 10rem 8rem 3rem', gap:'1rem', padding:'.625rem 1rem', background:'var(--bg-sunken)', borderBottom:'1px solid var(--rule)', fontSize:'.75rem', color:'var(--ink-3)', textTransform:'uppercase', letterSpacing:'.08em'}}>
          <input type="checkbox"/>
          <span>Tittel</span>
          <span>Status</span>
          <span>Tags</span>
          <span>Sist endret</span>
          <span/>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{display:'grid', gridTemplateColumns:'auto 1fr 7rem 10rem 8rem 3rem', gap:'1rem', padding:'.75rem 1rem', borderBottom: i === rows.length-1 ? 'none' : '1px solid var(--rule)', alignItems:'center', fontSize:'.875rem'}}>
            <input type="checkbox" checked={selected.has(i)} onChange={e => {
              const n = new Set(selected); e.target.checked ? n.add(i) : n.delete(i); setSelected(n);
            }}/>
            <div>
              <div style={{fontWeight:500}}>{r.title}</div>
              <div className="dim mono" style={{fontSize:'.6875rem', marginTop:'1px'}}>/blogg/{r.slug}</div>
            </div>
            <span className="chip" style={{
              background: r.status === 'Publisert' ? 'oklch(0.95 0.04 145)' : 'oklch(0.96 0.03 65)',
              color: r.status === 'Publisert' ? 'oklch(0.45 0.14 145)' : 'oklch(0.50 0.14 65)',
            }}>
              <span className="chip-dot"/>{r.status}
            </span>
            <div style={{display:'flex', gap:'.25rem', flexWrap:'wrap'}}>{(r.tags||[]).slice(0,2).map(t=><span key={t} className="chip" style={{fontSize:'.6875rem'}}>{t}</span>)}</div>
            <span className="mono dim" style={{fontSize:'.75rem'}}>{r.updated || r.date}</span>
            <div style={{display:'flex', gap:'2px', justifyContent:'flex-end'}}>
              <button className="btn btn-sm btn-ghost" title="Rediger"><Icon.Edit/></button>
            </div>
          </div>
        ))}
      </div>

      {selected.size > 0 && (
        <div style={{position:'fixed', bottom:'1.25rem', left:'50%', transform:'translateX(-50%)', background:'var(--ink)', color:'#fff', padding:'.5rem .75rem .5rem 1rem', borderRadius:'8px', display:'flex', alignItems:'center', gap:'.75rem', boxShadow:'0 10px 40px rgba(0,0,0,.2)', fontSize:'.875rem', zIndex:30}}>
          <span>{selected.size} valgt</span>
          <span style={{width:1, height:18, background:'rgba(255,255,255,.2)'}}/>
          <button className="btn btn-sm btn-ghost" style={{color:'#fff'}}>Publiser</button>
          <button className="btn btn-sm btn-ghost" style={{color:'#fff'}}>Utkast</button>
          <button className="btn btn-sm btn-ghost" style={{color:'oklch(0.75 0.16 25)'}}><Icon.Trash/> Slett</button>
          <button onClick={()=>setSelected(new Set())} className="btn btn-sm btn-ghost" style={{color:'#fff'}}><Icon.X/></button>
        </div>
      )}
    </AdminShell>
  );
}

// ── Blogg-editor ──────────────────────────────
function AdminBloggEditor() {
  const [title, setTitle] = useState('Server-first med Next.js 15, uten å savne klienten');
  const [slug, setSlug] = useState('server-first-next-15');
  const [desc, setDesc] = useState('Hvordan jeg tenker rundt server- og klientkomponenter etter et år med App Router.');
  const [content, setContent] = useState(`# Server-first med Next.js 15

Etter et drøyt år med App Router og server components som default, er det
noen mønstre jeg nå holder meg til uten å tenke.

## 1. Server som standard, klient når den trengs

Regel nummer én: alt er en server-komponent med mindre det er en tydelig
grunn til noe annet.

\`\`\`tsx
// app/prosjekter/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = createClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('draft', false)
    .order('order_index')

  return <ProjectList items={data ?? []} />
}
\`\`\`

## 2. Server actions erstatter de fleste API-ruter

> Don't build abstractions until you have real pain.
`);
  const [tags, setTags] = useState(['Next.js','React']);
  const [draft, setDraft] = useState(false);
  const [tagInput, setTagInput] = useState('');

  return (
    <AdminShell active="/admin/blogg"
      title={null}
      actions={null}>
      <div style={{display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'1.5rem'}}>
        <a href="/admin/blogg" className="dim" style={{fontSize:'.8125rem', display:'inline-flex', alignItems:'center', gap:'.25rem'}}>
          ← Tilbake
        </a>
        <span className="dim">/</span>
        <span style={{fontSize:'.8125rem'}}>Rediger innlegg</span>
        <div style={{flex:1}}/>
        <span className="chip mono" style={{fontSize:'.6875rem'}}>
          <span style={{width:6, height:6, borderRadius:'50%', background:'oklch(0.55 0.16 145)'}}/>
          Autolagret 09:42
        </span>
        <button className="btn btn-sm"><Icon.Eye/> Forhåndsvis</button>
        <label style={{display:'flex', alignItems:'center', gap:'.5rem', fontSize:'.8125rem', padding:'.25rem .5rem'}}>
          <Switch on={!draft} onChange={v => setDraft(!v)}/>
          <span>{draft ? 'Utkast' : 'Publisert'}</span>
        </label>
        <button className="btn btn-sm btn-primary"><Icon.Save/> Lagre</button>
      </div>

      <div style={{display:'grid', gridTemplateColumns:'1fr 280px', gap:'1.5rem'}}>
        <div style={{background:'var(--bg-elev)', border:'1px solid var(--rule)', borderRadius:'10px', overflow:'hidden'}}>
          {/* Title & slug */}
          <div style={{padding:'1.125rem 1.25rem', borderBottom:'1px solid var(--rule)'}}>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Tittel"
              style={{width:'100%', border:0, fontSize:'1.5rem', fontFamily:'var(--ff-serif)', fontWeight:500, letterSpacing:'-.02em', background:'transparent', padding:'.25rem 0', outline:'none'}}/>
            <div style={{display:'flex', alignItems:'center', gap:'.25rem', marginTop:'.375rem'}}>
              <span className="dim mono" style={{fontSize:'.75rem'}}>marcusjenshaug.no/blogg/</span>
              <input value={slug} onChange={e => setSlug(e.target.value)}
                style={{border:0, fontFamily:'var(--ff-mono)', fontSize:'.75rem', color:'var(--ink-2)', padding:'.125rem .25rem', background:'var(--bg-sunken)', borderRadius:'3px'}}/>
            </div>
            <textarea value={desc} onChange={e => setDesc(e.target.value)}
              placeholder="Kort beskrivelse (brukes i metadata og OG)"
              rows={2}
              style={{width:'100%', border:0, marginTop:'.75rem', fontSize:'.9375rem', color:'var(--ink-3)', background:'transparent', padding:'.25rem 0', resize:'none', outline:'none', lineHeight:1.55}}/>
          </div>

          {/* Editor / Preview split */}
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', minHeight:'28rem'}}>
            <div style={{borderRight:'1px solid var(--rule)', display:'flex', flexDirection:'column'}}>
              <div style={{padding:'.5rem .75rem', borderBottom:'1px solid var(--rule)', display:'flex', alignItems:'center', gap:'2px', background:'var(--bg-sunken)'}}>
                {[
                  <Icon.Heading/>, <Icon.Bold/>, <Icon.Italic/>, <Icon.Link/>, <Icon.Code/>, <Icon.List/>, <Icon.Image/>
                ].map((ic, i) => (
                  <button key={i} className="btn btn-sm btn-ghost" style={{padding:'.25rem .375rem'}}>{ic}</button>
                ))}
                <div style={{flex:1}}/>
                <span className="dim mono" style={{fontSize:'.6875rem'}}>MDX</span>
              </div>
              <textarea value={content} onChange={e => setContent(e.target.value)}
                style={{flex:1, width:'100%', border:0, padding:'1rem 1.125rem', fontFamily:'var(--ff-mono)', fontSize:'.8125rem', lineHeight:1.7, background:'var(--bg-elev)', resize:'none', outline:'none', color:'var(--ink-2)'}}/>
            </div>
            <div style={{display:'flex', flexDirection:'column', background:'var(--bg-sunken)'}}>
              <div style={{padding:'.5rem .75rem', borderBottom:'1px solid var(--rule)', display:'flex', alignItems:'center', background:'var(--bg-sunken)'}}>
                <span className="eyebrow">Forhåndsvis</span>
                <div style={{flex:1}}/>
                <span className="dim mono" style={{fontSize:'.6875rem'}}>rendered via next-mdx-remote</span>
              </div>
              <div style={{padding:'1.125rem 1.25rem', overflow:'auto', background:'var(--bg-elev)'}}>
                <div className="prose" style={{fontSize:'.9375rem', maxWidth:'none'}}>
                  <h1 style={{fontFamily:'var(--ff-serif)', fontSize:'1.5rem', marginBottom:'.5rem'}}>Server-first med Next.js 15</h1>
                  <p>
                    Etter et drøyt år med App Router og server components som default, er det noen
                    mønstre jeg nå holder meg til uten å tenke.
                  </p>
                  <h2>1. Server som standard, klient når den trengs</h2>
                  <p>Regel nummer én: alt er en server-komponent med mindre det er en tydelig grunn til noe annet.</p>
                  <pre><code>{`// app/prosjekter/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = createClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('draft', false)`}</code></pre>
                  <h2>2. Server actions erstatter de fleste API-ruter</h2>
                  <blockquote>Don't build abstractions until you have real pain.</blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>

        <aside style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
          <div className="card" style={{padding:0}}>
            <div style={{padding:'.75rem 1rem', borderBottom:'1px solid var(--rule)'}}>
              <span className="eyebrow">Cover-bilde</span>
            </div>
            <div style={{padding:'1rem'}}>
              <div style={{aspectRatio:'16/9', background:'var(--bg-sunken)', border:'1px dashed var(--rule-strong)', borderRadius:'6px', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'var(--ink-4)', fontSize:'.8125rem', gap:'.375rem'}}>
                <Icon.Upload/>
                <span>Dra inn eller <a href="#" className="link" style={{color:'var(--accent-ink)'}}>velg fil</a></span>
                <span className="mono" style={{fontSize:'.6875rem'}}>→ Supabase Storage</span>
              </div>
            </div>
          </div>

          <div className="card" style={{padding:0}}>
            <div style={{padding:'.75rem 1rem', borderBottom:'1px solid var(--rule)'}}>
              <span className="eyebrow">Tags</span>
            </div>
            <div style={{padding:'.875rem 1rem'}}>
              <div style={{display:'flex', flexWrap:'wrap', gap:'.375rem', marginBottom:'.5rem'}}>
                {tags.map(t => (
                  <span key={t} className="chip" style={{padding:'.25rem .5rem'}}>
                    {t}
                    <button onClick={() => setTags(tags.filter(x => x !== t))} style={{background:'none', border:0, color:'inherit', opacity:.5, padding:0, marginLeft:2}}>
                      <Icon.X style={{fontSize:'.85em'}}/>
                    </button>
                  </span>
                ))}
              </div>
              <input value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && tagInput.trim()) { setTags([...tags, tagInput.trim()]); setTagInput(''); } }}
                placeholder="Skriv og trykk Enter"
                style={{width:'100%', padding:'.375rem .5rem', border:'1px solid var(--rule)', borderRadius:'5px', fontSize:'.8125rem', background:'var(--bg-sunken)'}}/>
            </div>
          </div>

          <div className="card" style={{padding:0}}>
            <div style={{padding:'.75rem 1rem', borderBottom:'1px solid var(--rule)'}}>
              <span className="eyebrow">SEO</span>
            </div>
            <div style={{padding:'.875rem 1rem', display:'flex', flexDirection:'column', gap:'.625rem', fontSize:'.8125rem'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}><span className="muted">Tittel-lengde</span><span className="mono" style={{color:'oklch(0.55 0.16 145)'}}>52 / 60 ●</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span className="muted">Beskrivelse</span><span className="mono" style={{color:'oklch(0.55 0.16 145)'}}>96 / 155 ●</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span className="muted">Slug</span><span className="mono" style={{color:'var(--ink-4)'}}>OK</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span className="muted">OG-bilde</span><span className="mono" style={{color:'var(--accent)'}}>auto</span></div>
            </div>
          </div>

          <div className="card" style={{padding:0}}>
            <div style={{padding:'.75rem 1rem', borderBottom:'1px solid var(--rule)'}}>
              <span className="eyebrow">Publisering</span>
            </div>
            <div style={{padding:'.875rem 1rem', display:'flex', flexDirection:'column', gap:'.5rem', fontSize:'.8125rem'}}>
              <div style={{display:'flex', justifyContent:'space-between'}}><span className="muted">Status</span><span className="mono">{draft ? 'Utkast' : 'Publisert'}</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span className="muted">Publisert</span><span className="mono">14. apr 2026</span></div>
              <div style={{display:'flex', justifyContent:'space-between'}}><span className="muted">Revalidate</span><span className="mono">via tag</span></div>
              <button className="btn btn-sm" style={{color:'oklch(0.55 0.18 25)', justifyContent:'center', marginTop:'.375rem', borderColor:'oklch(0.90 0.04 25)'}}><Icon.Trash/> Slett innlegg</button>
            </div>
          </div>
        </aside>
      </div>
    </AdminShell>
  );
}

function Switch({ on, onChange }) {
  return (
    <button onClick={() => onChange(!on)} style={{
      width:32, height:18, borderRadius:10, border:'1px solid var(--rule-strong)',
      background: on ? 'var(--accent)' : 'var(--bg-sunken)', position:'relative', padding:0, cursor:'pointer',
    }}>
      <span style={{
        position:'absolute', top:1, left: on ? 15 : 1, width:14, height:14, borderRadius:'50%',
        background:'#fff', boxShadow:'0 1px 2px rgba(0,0,0,.15)', transition:'left .15s',
      }}/>
    </button>
  );
}

// ── Prosjekter CRUD ───────────────────────────
function AdminProsjekter() {
  return (
    <AdminShell active="/admin/prosjekter" title="Prosjekter"
      actions={<a href="#" className="btn btn-sm btn-primary"><Icon.Plus/> Nytt prosjekt</a>}>
      <div className="dim mono" style={{fontSize:'.75rem', marginBottom:'.75rem'}}>
        Dra i grepet for å endre rekkefølge på featured prosjekter. Utkast er skjult offentlig.
      </div>
      <div style={{background:'var(--bg-elev)', border:'1px solid var(--rule)', borderRadius:'8px', overflow:'hidden'}}>
        {projects.map((p, i) => (
          <div key={p.slug} style={{display:'grid', gridTemplateColumns:'auto auto 1fr 8rem 6rem 7rem 3rem', gap:'1rem', padding:'.75rem 1rem', borderBottom: i === projects.length-1 ? 'none' : '1px solid var(--rule)', alignItems:'center', fontSize:'.875rem'}}>
            <span style={{color:'var(--ink-4)', cursor:'grab'}}><Icon.Grip/></span>
            <button title="Featured" style={{
              width:20, height:20, borderRadius:4, border:'1px solid var(--rule-strong)',
              background: p.featured ? 'var(--accent)' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', padding:0, color:'#fff',
            }}>
              {p.featured && <Icon.Check style={{fontSize:'.7em'}}/>}
            </button>
            <div>
              <div style={{fontWeight:500}}>{p.title}</div>
              <div className="muted" style={{fontSize:'.8125rem', marginTop:'1px'}}>{p.desc}</div>
            </div>
            <span className="chip" style={{
              background: p.status === 'Aktiv' ? 'oklch(0.95 0.04 145)' : p.status === 'Arkivert' ? 'var(--bg-sunken)' : 'oklch(0.96 0.03 50)',
              color: p.status === 'Aktiv' ? 'oklch(0.45 0.14 145)' : p.status === 'Arkivert' ? 'var(--ink-4)' : 'var(--accent-ink)',
            }}><span className="chip-dot"/>{p.status}</span>
            <span className="mono dim" style={{fontSize:'.75rem'}}>{p.role}</span>
            <span className="mono dim" style={{fontSize:'.75rem'}}>{p.year}</span>
            <button className="btn btn-sm btn-ghost"><Icon.Edit/></button>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

// ── Na-admin ──────────────────────────────────
function AdminNa() {
  const [compose, setCompose] = useState('');
  return (
    <AdminShell active="/admin/na" title="Nå-oppdateringer"
      actions={<span className="dim mono" style={{fontSize:'.75rem'}}>Nå-innlegg publiseres umiddelbart · ingen utkast</span>}>
      <div className="card" style={{marginBottom:'1.5rem', padding:0, overflow:'hidden'}}>
        <div style={{padding:'.75rem 1rem', borderBottom:'1px solid var(--rule)', display:'flex', alignItems:'center', gap:'.5rem'}}>
          <span className="eyebrow">Skriv ny oppdatering</span>
          <span className="chip mono" style={{fontSize:'.6875rem'}}>MDX · markdown OK</span>
          <div style={{flex:1}}/>
          <span className="dim mono" style={{fontSize:'.75rem'}}>{compose.length} tegn</span>
        </div>
        <textarea value={compose} onChange={e => setCompose(e.target.value)}
          placeholder={`Hva er du opptatt av akkurat nå?\n\nSkriv som en loggføring — kort, ærlig, ikke for polert.`}
          rows={5}
          style={{width:'100%', border:0, padding:'1rem 1.125rem', fontFamily:'var(--ff-mono)', fontSize:'.875rem', lineHeight:1.65, resize:'vertical', outline:'none', background:'var(--bg-elev)'}}/>
        <div style={{padding:'.625rem .875rem', borderTop:'1px solid var(--rule)', display:'flex', justifyContent:'space-between', alignItems:'center', background:'var(--bg-sunken)'}}>
          <span className="dim" style={{fontSize:'.75rem'}}>Publiseres som <span className="mono">22. apr 2026</span></span>
          <button className="btn btn-sm btn-primary" disabled={!compose.trim()} style={{opacity: compose.trim()?1:.5}}>Publiser nå <Icon.ArrowRight/></button>
        </div>
      </div>

      <h3 style={{fontSize:'.875rem', marginBottom:'1rem'}}>Arkiv <span className="dim mono" style={{fontSize:'.75rem', fontWeight:400}}>({nowEntries.length} oppføringer)</span></h3>
      <div style={{display:'flex', flexDirection:'column', gap:'.75rem'}}>
        {nowEntries.map((e, i) => (
          <div key={i} className="card" style={{padding:'1rem 1.125rem'}}>
            <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:'.625rem'}}>
              <time className="mono" style={{fontSize:'.8125rem', color:'var(--ink-2)'}}>{e.date}</time>
              <div style={{display:'flex', gap:'.25rem'}}>
                <button className="btn btn-sm btn-ghost"><Icon.Edit/></button>
                <button className="btn btn-sm btn-ghost" style={{color:'oklch(0.55 0.18 25)'}}><Icon.Trash/></button>
              </div>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'.5rem', color:'var(--ink-2)', fontSize:'.875rem', lineHeight:1.55}}>
              {e.body.map((b, j) => <p key={j}>{b}</p>)}
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

// ── Uses-admin ────────────────────────────────
function AdminUses() {
  return (
    <AdminShell active="/admin/uses" title="Uses"
      actions={<button className="btn btn-sm btn-primary"><Icon.Plus/> Nytt element</button>}>
      <div className="dim mono" style={{fontSize:'.75rem', marginBottom:'1rem'}}>
        Dra-og-slipp sortering innen kategori. Ny kategori opprettes ved å skrive nytt navn.
      </div>
      <div style={{display:'flex', flexDirection:'column', gap:'1.25rem'}}>
        {Object.entries(uses).map(([cat, items]) => (
          <div key={cat} className="card" style={{padding:0, overflow:'hidden'}}>
            <div style={{padding:'.75rem 1rem', borderBottom:'1px solid var(--rule)', display:'flex', alignItems:'center', gap:'.5rem'}}>
              <h3 style={{fontSize:'.9375rem', fontWeight:500}}>{cat}</h3>
              <span className="dim mono" style={{fontSize:'.75rem'}}>· {items.length}</span>
              <div style={{flex:1}}/>
              <button className="btn btn-sm btn-ghost"><Icon.Plus/> Legg til</button>
              <button className="btn btn-sm btn-ghost"><Icon.Edit/></button>
            </div>
            {items.map((it, i) => (
              <div key={it.name} style={{display:'grid', gridTemplateColumns:'auto 14rem 1fr 8rem 3rem', gap:'1rem', padding:'.625rem 1rem', borderTop: i === 0 ? 'none' : '1px solid var(--rule)', alignItems:'center', fontSize:'.875rem'}}>
                <span style={{color:'var(--ink-4)', cursor:'grab'}}><Icon.Grip/></span>
                <div style={{fontWeight:500}}>{it.name}</div>
                <div className="muted" style={{fontSize:'.8125rem'}}>{it.desc}</div>
                <span className="mono dim" style={{fontSize:'.75rem'}}>{it.url ? 'har lenke' : '—'}</span>
                <div style={{display:'flex', gap:'2px', justifyContent:'flex-end'}}>
                  <button className="btn btn-sm btn-ghost"><Icon.Edit/></button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </AdminShell>
  );
}

// ── Innstillinger ─────────────────────────────
function AdminInnstillinger() {
  const [avail, setAvail] = useState(true);
  const [socials, setSocials] = useState([
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/marcusjenshaug', username: 'marcusjenshaug' },
    { platform: 'GitHub', url: 'https://github.com/marcusjenshaug', username: 'marcusjenshaug' },
    { platform: 'X', url: 'https://x.com/marcusjenshaug', username: '@marcusjenshaug' },
    { platform: 'Wikidata', url: 'https://wikidata.org/wiki/Q…', username: '' },
  ]);
  return (
    <AdminShell active="/admin/innstillinger" title="Innstillinger"
      actions={<>
        <span className="chip mono" style={{fontSize:'.6875rem'}}><span style={{width:6, height:6, borderRadius:'50%', background:'var(--ink-4)'}}/>Ulagrede endringer</span>
        <button className="btn btn-sm">Avbryt</button>
        <button className="btn btn-sm btn-primary"><Icon.Save/> Lagre</button>
      </>}>
      <div style={{display:'grid', gridTemplateColumns:'220px 1fr', gap:'2rem', maxWidth:'60rem'}}>
        <nav style={{position:'sticky', top:'1rem', alignSelf:'start', display:'flex', flexDirection:'column', gap:'2px', fontSize:'.875rem'}}>
          {[
            { l:'Profil', a:true },
            { l:'Bio' },
            { l:'Kontakt' },
            { l:'Sosiale lenker' },
            { l:'Tilgjengelighet' },
            { l:'CV' },
          ].map(s => (
            <a key={s.l} href="#" style={{padding:'.375rem .5rem', color: s.a?'var(--ink)':'var(--ink-3)', fontWeight: s.a?500:400, borderLeft: s.a?'2px solid var(--accent)':'2px solid transparent', paddingLeft:'.625rem'}}>{s.l}</a>
          ))}
        </nav>
        <div style={{display:'flex', flexDirection:'column', gap:'2rem'}}>
          {/* Profil */}
          <section className="card" style={{padding:'1.25rem 1.375rem'}}>
            <h3 style={{fontSize:'.9375rem', marginBottom:'.25rem'}}>Profil</h3>
            <p className="muted" style={{fontSize:'.8125rem', marginBottom:'1.25rem'}}>Brukes i Person-schema og på hele siden.</p>
            <div style={{display:'grid', gridTemplateColumns:'100px 1fr', gap:'1.25rem', alignItems:'start'}}>
              <div>
                <div style={{width:90, height:110, borderRadius:'6px', overflow:'hidden', border:'1px solid var(--rule)'}}>
                  <img src="assets/marcus.png" alt="" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
                </div>
                <button className="btn btn-sm" style={{marginTop:'.5rem', width:'100%', justifyContent:'center', fontSize:'.75rem'}}>
                  <Icon.Upload/> Bytt
                </button>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.875rem'}}>
                <AdminField label="Fullt navn" value="Marcus Jenshaug"/>
                <AdminField label="Overskrift (jobTitle)" value="Fullstack-utvikler"/>
                <AdminField label="E-post" value="marcus@jenshaug.no"/>
                <AdminField label="Sted" value="Norge"/>
                <AdminField label="worksFor.name" value="Redi AS"/>
                <AdminField label="worksFor.url" value="https://redi.as"/>
              </div>
            </div>
          </section>

          {/* Bio */}
          <section className="card" style={{padding:'1.25rem 1.375rem'}}>
            <h3 style={{fontSize:'.9375rem', marginBottom:'1rem'}}>Bio</h3>
            <AdminField label="Kort bio (hero, 1–2 setninger)" value="Fullstack-utvikler i Redi AS. Bygger Klink, skriver notater her." multiline rows={2}/>
            <div style={{height:'.875rem'}}/>
            <AdminField label="Lang bio — om-siden (MDX)" multiline rows={6}
              value={`Jeg heter Marcus Jenshaug og er fullstack-utvikler i [Redi AS](https://redi.as).\nTil daglig bygger jeg forretningssystemer for kundene våre og jobber\nmed vår egen bookingplattform, [Klink](#).`}/>
          </section>

          {/* Tilgjengelighet */}
          <section className="card" style={{padding:'1.25rem 1.375rem'}}>
            <h3 style={{fontSize:'.9375rem', marginBottom:'1rem'}}>Tilgjengelighet</h3>
            <div style={{display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'1rem'}}>
              <Switch on={avail} onChange={setAvail}/>
              <span style={{fontSize:'.875rem'}}>Åpen for nye samtaler og samarbeid</span>
            </div>
            <AdminField label="Ledighet-notat" value="Åpen for samtaler Q3 2026" disabled={!avail}/>
          </section>

          {/* Sosiale */}
          <section className="card" style={{padding:'1.25rem 1.375rem'}}>
            <div style={{display:'flex', alignItems:'center', marginBottom:'1rem'}}>
              <h3 style={{fontSize:'.9375rem'}}>Sosiale lenker <span className="dim mono" style={{fontSize:'.75rem', fontWeight:400}}>· sameAs</span></h3>
              <div style={{flex:1}}/>
              <button className="btn btn-sm"><Icon.Plus/> Legg til</button>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'.5rem'}}>
              {socials.map((s, i) => (
                <div key={i} style={{display:'grid', gridTemplateColumns:'auto 8rem 1fr 10rem 3rem', gap:'.625rem', alignItems:'center'}}>
                  <span style={{color:'var(--ink-4)', cursor:'grab'}}><Icon.Grip/></span>
                  <input value={s.platform} onChange={e => {const n=[...socials]; n[i].platform=e.target.value; setSocials(n);}}
                    style={{padding:'.375rem .5rem', border:'1px solid var(--rule)', borderRadius:'5px', fontSize:'.8125rem', background:'var(--bg-elev)'}}/>
                  <input value={s.url} onChange={e => {const n=[...socials]; n[i].url=e.target.value; setSocials(n);}}
                    style={{padding:'.375rem .5rem', border:'1px solid var(--rule)', borderRadius:'5px', fontSize:'.8125rem', background:'var(--bg-elev)', fontFamily:'var(--ff-mono)'}}/>
                  <input value={s.username} onChange={e => {const n=[...socials]; n[i].username=e.target.value; setSocials(n);}}
                    placeholder="Brukernavn (valgfritt)"
                    style={{padding:'.375rem .5rem', border:'1px solid var(--rule)', borderRadius:'5px', fontSize:'.8125rem', background:'var(--bg-elev)'}}/>
                  <button onClick={() => setSocials(socials.filter((_,j)=>j!==i))} className="btn btn-sm btn-ghost" style={{color:'oklch(0.55 0.18 25)'}}><Icon.Trash/></button>
                </div>
              ))}
            </div>
            <p className="dim mono" style={{fontSize:'.6875rem', marginTop:'.875rem'}}>
              Disse URL-ene skrives automatisk inn i <code>Person.sameAs</code> ved lagring.
            </p>
          </section>

          {/* Developer */}
          <section className="card" style={{padding:'1.25rem 1.375rem'}}>
            <h3 style={{fontSize:'.9375rem', marginBottom:'1rem'}}>Entitets-preview</h3>
            <pre style={{margin:0, fontFamily:'var(--ff-mono)', fontSize:'.75rem', lineHeight:1.65, background:'#17140f', color:'#e7e3d9', padding:'1rem', borderRadius:'6px', overflowX:'auto'}}>
{`{
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://marcusjenshaug.no/#person",
  "name": "Marcus Jenshaug",
  "jobTitle": "Fullstack-utvikler",
  "worksFor": { "@type": "Organization", "name": "Redi AS" },
  "sameAs": [${socials.map(s => `\n    "${s.url}"`).join(',')}
  ]
}`}</pre>
          </section>
        </div>
      </div>
    </AdminShell>
  );
}

function AdminField({ label, value, multiline, rows = 2, disabled }) {
  return (
    <div>
      <label style={{display:'block', fontSize:'.75rem', color:'var(--ink-3)', marginBottom:'.25rem'}}>{label}</label>
      {multiline ? (
        <textarea defaultValue={value} rows={rows} disabled={disabled}
          style={{width:'100%', padding:'.5rem .625rem', border:'1px solid var(--rule-strong)', borderRadius:'6px', background: disabled ? 'var(--bg-sunken)' : 'var(--bg-elev)', fontSize:'.875rem', lineHeight:1.55, resize:'vertical', fontFamily: multiline ? 'var(--ff-mono)' : 'var(--ff-sans)', color: disabled ? 'var(--ink-4)' : 'inherit'}}/>
      ) : (
        <input defaultValue={value} disabled={disabled}
          style={{width:'100%', padding:'.5rem .625rem', border:'1px solid var(--rule-strong)', borderRadius:'6px', background: disabled ? 'var(--bg-sunken)' : 'var(--bg-elev)', fontSize:'.875rem', color: disabled ? 'var(--ink-4)' : 'inherit'}}/>
      )}
    </div>
  );
}

Object.assign(window, {
  AdminLoginPage, AdminDashboard, AdminBloggList, AdminBloggEditor,
  AdminProsjekter, AdminNa, AdminUses, AdminInnstillinger,
});
