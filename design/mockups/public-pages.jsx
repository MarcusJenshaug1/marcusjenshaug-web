/* Public page screens */

// ── Data ──────────────────────────────────────
const projects = [
  { slug: 'klink', title: 'Klink', role: 'Fullstack', year: '2025—', stack: ['Next.js','Supabase','Azure'], desc: 'Bookingplattform for frisørsalonger med timeplanlegging, SMS-varsler og selvbetjening.', featured: true, status: 'Aktiv' },
  { slug: 'redi-hub', title: 'Redi Hub', role: 'Fullstack', year: '2024', stack: ['Next.js','TypeScript','Postgres'], desc: 'Internt verktøypanel for prosjektstyring og kundeoppfølging i Redi AS.', featured: true, status: 'I drift' },
  { slug: 'bokhylle', title: 'Bokhylle', role: 'Solo builder', year: '2024', stack: ['SvelteKit','SQLite'], desc: 'Minimal leseliste og notat-verktøy for bøker. Personlig prosjekt.', featured: true, status: 'Side' },
  { slug: 'loop', title: 'Loop', role: 'Teknisk rådgiver', year: '2023', stack: ['React Native','Firebase'], desc: 'Trenings-app for intervalltrening. Konsulentoppdrag via Redi.', status: 'Levert' },
  { slug: 'flyt', title: 'Flyt', role: 'Fullstack', year: '2023', stack: ['Remix','Prisma'], desc: 'Skjemabygger for kommunale tjenester. Sluttet lansert.', status: 'Arkivert' },
];

const posts = [
  { slug: 'server-first-next-15', title: 'Server-first med Next.js 15, uten å savne klienten', desc: 'Hvordan jeg tenker rundt server- og klientkomponenter etter et år med App Router.', date: '14. apr 2026', tags: ['Next.js','React'], reading: '9 min' },
  { slug: 'supabase-rls-oppskrift', title: 'Supabase RLS: en liten oppskrift som faktisk holder', desc: 'Policyer som er trivielle å lese, trygge å skrive, og lette å teste.', date: '02. apr 2026', tags: ['Supabase','Sikkerhet'], reading: '6 min' },
  { slug: 'mdx-i-postgres', title: 'MDX i Postgres: ja, det går helt fint', desc: 'Hvorfor jeg droppet filbasert innhold og flyttet alt inn i databasen.', date: '19. mar 2026', tags: ['MDX','Arkitektur'], reading: '7 min' },
  { slug: 'norsk-tastatur-dev', title: 'Norsk tastatur + utviklerliv: noen snarveier jeg ikke kan være uten', desc: 'Karpe hjørner på AltGr-rutinger og Æ/Ø/Å i terminalen.', date: '28. feb 2026', tags: ['Verktøy'], reading: '4 min' },
  { slug: 'oklch-i-tailwind-v4', title: 'OKLCH i Tailwind v4 føles litt som å se farger for første gang', desc: 'Et kort notat om hvordan fargepalettene mine endret seg.', date: '11. feb 2026', tags: ['Design','CSS'], reading: '3 min' },
  { slug: 'liten-commit-stor-gev', title: 'Små commits, stor gevinst', desc: 'Hvorfor jeg har begynt å skrive commit-meldinger på norsk.', date: '26. jan 2026', tags: ['Arbeidsflyt'], reading: '5 min' },
];

const nowEntries = [
  { date: '18. apr 2026', body: [
      'Bygger på Klink sin ny-kundeflyt — fjernet tre steg og la til SMS-bekreftelse. Resultatet er at de første bookingene kommer inn på under ett minutt.',
      'Leser *A Philosophy of Software Design* (2. utg) for andre gang. Ousterhout sine punkter om «deep modules» holder seg pinlig godt.',
      'Prøver å gå 8 km om morgenen før jeg setter meg ved maskinen. Fungerer når det ikke regner.',
    ]},
  { date: '02. apr 2026', body: [
      'Ferdig med en stor Supabase-migrering på Redi Hub — fra RLS med JWT-claims til policy-funksjoner. Mye renere.',
      'Lanserte personlig nettside (denne). Entity home mot Google/AI — målet er Knowledge Panel i løpet av sommeren.',
    ]},
  { date: '14. mar 2026', body: [
      'Har lagt inn Norges største frisør-salong på Klink denne uka. Noen interessante skaleringsutfordringer i kalenderen.',
      'Startet på en serie med korte notater om MDX-pipelinen min. Første del er publisert.',
    ]},
];

const uses = {
  'Hardware': [
    { name: 'MacBook Pro 14" (M3 Pro, 36 GB)', desc: 'Daglig driver. Stille nok til å kode på kjøkkenet.', url:'#' },
    { name: 'Apple Studio Display', desc: 'Én skjerm, hele dagen. Nok til meg.', url:'#' },
    { name: 'Logitech MX Master 3S', desc: 'Stille klikk. Batteriet holder i evigheter.', url:'#' },
    { name: 'Keychron Q1 Pro', desc: 'Gateron Pro Brown. ISO-Nordic fordi Æ/Ø/Å.', url:'#' },
    { name: 'Herman Miller Aeron', desc: 'Brukt, kjøpt på Finn. Ingen anger.', url:'#' },
  ],
  'Utvikling': [
    { name: 'Visual Studio Code', desc: 'Night Owl Light. Zed prøvd, VSCode vant.', url:'#' },
    { name: 'Warp', desc: 'Terminalen jeg ikke trodde jeg trengte.', url:'#' },
    { name: 'Raycast', desc: 'Spotlight-erstatning. Clipboard-historikk alene er verdt prisen.', url:'#' },
    { name: 'Arc', desc: 'Profiler per klient = mindre kaos.', url:'#' },
    { name: 'Linear', desc: 'Issues, sykluser, roadmaps. Eneste prosjektverktøy jeg holder ut med.', url:'#' },
  ],
  'Design & skriving': [
    { name: 'Figma', desc: 'Skisser og utforsking av visuelle retninger.', url:'#' },
    { name: 'Obsidian', desc: 'Andre hjernen. Markdown, lokale filer, graph view.', url:'#' },
    { name: 'iA Writer', desc: 'For lengre tekster. Når Obsidian føles for støyete.', url:'#' },
  ],
};

// ── Hero ─────────────────────────────────────
function HeroHome() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 30000); return () => clearInterval(t); }, []);
  const oslo = time.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Oslo' });

  return (
    <section style={{padding:'3.5rem 2rem 3rem'}}>
      <div className="container" style={{display:'grid', gridTemplateColumns:'1fr 280px', gap:'3rem', alignItems:'start'}}>
        <div>
          <div className="eyebrow" style={{marginBottom:'1rem'}}>
            <span style={{display:'inline-block', width:6, height:6, borderRadius:'50%', background:'oklch(0.70 0.16 145)', marginRight:8, verticalAlign:'middle'}}/>
            Tilgjengelig for samtaler · Oslo {oslo}
          </div>
          <h1 style={{fontFamily:'var(--ff-serif)', fontWeight:500, marginBottom:'1.25rem'}}>
            Marcus Jenshaug.<br/>
            <span style={{color:'var(--ink-3)'}}>Fullstack-utvikler i <a href="https://redi.as" className="link" style={{color:'inherit', textDecorationColor:'var(--accent)'}}>Redi AS</a>, bygger <a href="#" className="link" style={{color:'inherit', textDecorationColor:'var(--accent)'}}>Klink</a> på si.</span>
          </h1>
          <p style={{fontSize:'1.0625rem', color:'var(--ink-2)', maxWidth:'36rem', lineHeight:1.65, marginTop:'1.5rem'}}>
            Jeg skriver TypeScript på server-first Next.js, lagrer data i Postgres, og har et stort svakt
            punkt for verktøy som forsvinner i arbeidsflyten. Denne siden er notater fra det arbeidet —
            prosjekter, artikler, og hva jeg gjør akkurat nå.
          </p>
          <div style={{display:'flex', gap:'.75rem', marginTop:'1.75rem', flexWrap:'wrap'}}>
            <a href="/prosjekter" className="btn btn-primary"><Icon.Grid/> Se prosjekter</a>
            <a href="/blogg" className="btn"><Icon.File/> Les blogg</a>
            <a href="/kontakt" className="btn btn-ghost">Ta kontakt <Icon.ArrowRight style={{fontSize:'.85em'}}/></a>
          </div>
          <div style={{display:'flex', gap:'1.25rem', marginTop:'2rem', alignItems:'center'}}>
            <a href="#" className="muted" style={{display:'flex', alignItems:'center', gap:'.375rem', fontSize:'.875rem'}}><Icon.Github/> github.com/marcusjenshaug</a>
            <a href="#" className="muted" style={{display:'flex', alignItems:'center', gap:'.375rem', fontSize:'.875rem'}}><Icon.Linkedin/> linkedin.com/in/marcusjenshaug</a>
          </div>
        </div>
        <aside>
          <div style={{position:'relative', aspectRatio:'4/5', background:'var(--bg-sunken)', borderRadius:'8px', overflow:'hidden', border:'1px solid var(--rule)'}}>
            <img src="assets/marcus.png" alt="Portrett av Marcus Jenshaug" style={{width:'100%', height:'100%', objectFit:'cover', display:'block'}}/>
            <div style={{position:'absolute', bottom:0, left:0, right:0, padding:'.75rem .875rem', background:'linear-gradient(to top, rgba(0,0,0,.7), transparent)', color:'#fff', fontFamily:'var(--ff-mono)', fontSize:'.6875rem', letterSpacing:'.05em'}}>
              MARCUS · NO · 1998
            </div>
          </div>
          <div className="mono" style={{marginTop:'.75rem', fontSize:'.75rem', color:'var(--ink-4)', display:'flex', justifyContent:'space-between'}}>
            <span>↓ SCROLL</span>
            <span>001 / 007</span>
          </div>
        </aside>
      </div>
    </section>
  );
}

function FeaturedProjects() {
  return (
    <section style={{padding:'2.5rem 2rem'}}>
      <div className="container">
        <div className="section-head">
          <h2>Utvalgte prosjekter</h2>
          <a href="/prosjekter" className="muted" style={{fontSize:'.8125rem'}}>Alle prosjekter →</a>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'1rem'}}>
          {projects.filter(p => p.featured).map(p => (
            <a key={p.slug} className="card" href={`/prosjekter/${p.slug}`} style={{display:'flex', flexDirection:'column', gap:'.875rem'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline'}}>
                <h3>{p.title}</h3>
                <span className="mono dim" style={{fontSize:'.75rem'}}>{p.year}</span>
              </div>
              <p style={{color:'var(--ink-3)', fontSize:'.9375rem', lineHeight:1.55, flex:1}}>{p.desc}</p>
              <div style={{display:'flex', gap:'.375rem', flexWrap:'wrap'}}>
                {p.stack.map(s => <span key={s} className="chip">{s}</span>)}
              </div>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'.5rem', borderTop:'1px dashed var(--rule)'}}>
                <span className="mono dim" style={{fontSize:'.75rem'}}>{p.role}</span>
                <span className="chip chip-accent"><span className="chip-dot"/>{p.status}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function LatestPosts() {
  return (
    <section style={{padding:'2.5rem 2rem'}}>
      <div className="container" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem'}}>
        <div>
          <div className="section-head">
            <h2>Siste notater</h2>
            <a href="/blogg" className="muted" style={{fontSize:'.8125rem'}}>Alle →</a>
          </div>
          <div>
            {posts.slice(0,4).map(p => <PostRow key={p.slug} {...p}/>)}
          </div>
        </div>
        <div>
          <div className="section-head">
            <h2>Akkurat nå</h2>
            <a href="/na" className="muted" style={{fontSize:'.8125rem'}}>Arkiv →</a>
          </div>
          <div className="card" style={{padding:'1.25rem 1.375rem'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:'.75rem'}}>
              <span className="eyebrow">Sist oppdatert</span>
              <span className="mono dim" style={{fontSize:'.75rem'}}>{nowEntries[0].date}</span>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'.75rem', color:'var(--ink-2)', fontSize:'.9375rem', lineHeight:1.6}}>
              {nowEntries[0].body.map((b,i) => <p key={i}>{b}</p>)}
            </div>
          </div>
          <div className="term" style={{marginTop:'1rem', fontSize:'.75rem'}}>
            <div><span className="com"># lokal tid i Oslo</span></div>
            <div><span className="prompt">marcus@redi</span> <span className="str">~/jenshaug</span> $ date +"%A %H:%M"</div>
            <div style={{color:'#d4cfc1'}}>onsdag 22:14</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  return (
    <>
      <SiteHeader active="/"/>
      <main>
        <HeroHome/>
        <hr className="rule" style={{margin:'0 2rem', maxWidth:'var(--max-w)'}}/>
        <FeaturedProjects/>
        <hr className="rule" style={{margin:'0 2rem', maxWidth:'var(--max-w)'}}/>
        <LatestPosts/>
      </main>
      <SiteFooter/>
    </>
  );
}

// ── /om ───────────────────────────────────────
function OmPage() {
  return (
    <>
      <SiteHeader active="/om"/>
      <main style={{padding:'3rem 2rem'}}>
        <div className="container" style={{display:'grid', gridTemplateColumns:'1fr 2fr', gap:'3rem', alignItems:'start'}}>
          <aside style={{position:'sticky', top:'5rem'}}>
            <div style={{aspectRatio:'4/5', overflow:'hidden', borderRadius:'6px', border:'1px solid var(--rule)'}}>
              <img src="assets/marcus.png" alt="Marcus Jenshaug" style={{width:'100%', height:'100%', objectFit:'cover'}}/>
            </div>
            <div style={{marginTop:'1rem'}}>
              <div style={{fontWeight:600, letterSpacing:'-.01em'}}>Marcus Jenshaug</div>
              <div className="muted" style={{fontSize:'.875rem'}}>Fullstack-utvikler</div>
              <div style={{display:'flex', flexDirection:'column', gap:'.25rem', marginTop:'.875rem', fontSize:'.8125rem', color:'var(--ink-3)'}}>
                <div style={{display:'flex', justifyContent:'space-between'}}><span>Bosted</span><span>Norge</span></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span>Jobb</span><span>Redi AS</span></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span>Fokus</span><span>Next.js · Supabase</span></div>
                <div style={{display:'flex', justifyContent:'space-between'}}><span>Status</span><span style={{color:'oklch(0.55 0.16 145)'}}>● Åpen for samtaler</span></div>
              </div>
              <a href="#" className="btn btn-sm" style={{marginTop:'.875rem', width:'100%', justifyContent:'center'}}>Last ned CV <Icon.ArrowUpRight/></a>
            </div>
          </aside>
          <div>
            <div className="eyebrow" style={{marginBottom:'.75rem'}}>OM · PERSON · @id=#person</div>
            <h1 style={{fontFamily:'var(--ff-serif)', fontWeight:500, marginBottom:'1.5rem'}}>
              Jeg bygger digitale verktøy — helst de som forsvinner i arbeidsflyten.
            </h1>
            <div className="prose" style={{maxWidth:'none'}}>
              <p>
                Jeg heter Marcus Jenshaug og er fullstack-utvikler i <a href="https://redi.as">Redi AS</a>,
                et lite utviklingshus i Norge. Til daglig bygger jeg forretningssystemer for våre kunder og
                jobber med <a href="#">Klink</a>, vår egen plattform for timebooking.
              </p>
              <p>
                Jeg har tro på server-first arkitektur, trygg typing og færre abstraksjoner enn strengt
                nødvendig. Stacken min er Next.js 15, React 19, TypeScript i <code>strict</code>, Supabase
                (Postgres + Auth + Storage), Tailwind CSS v4, og Vercel.
              </p>

              <h2>Hva jeg jobber med</h2>
              <p>
                Brorparten av tiden går til produktarbeid — å velge riktig abstraksjonsnivå, skrive kode
                som kolleger liker å lese, og sørge for at flyter som «book en time», «send SMS» og «logg
                inn som admin» fungerer på tvers av kanter som alltid vil finnes.
              </p>
              <p>
                På si eksperimenterer jeg med mindre verktøy, skriver korte notater her på bloggen, og
                prøver å holde et sunt forhold til RSS.
              </p>

              <h2>Før Redi</h2>
              <p>
                Jeg studerte informatikk ved UiO og har tidligere jobbet med mobile apper i React Native,
                dataintegrasjoner og litt offentlig sektor. Det er det rare blandingen av erfaringer som
                gjør at jeg fortsatt lurer på hvorfor skjema-systemer er så vanskelige.
              </p>

              <h2>Utenfor maskinen</h2>
              <p>
                Lange turer, espresso som tåler å stå litt, og bøker om arkitektur — både den i murstein
                og den i kode.
              </p>

              <h2>Kontakt</h2>
              <p>
                Kortest vei er <a href="mailto:marcus@jenshaug.no">marcus@jenshaug.no</a>. Jeg svarer
                ofte innen ett døgn. Eller du kan bruke <a href="/kontakt">skjemaet</a>.
              </p>
            </div>

            <div style={{marginTop:'3rem', padding:'1.25rem 1.375rem', background:'var(--bg-sunken)', borderRadius:'8px', border:'1px solid var(--rule)'}}>
              <div className="eyebrow" style={{marginBottom:'.5rem'}}>Elsewhere · sameAs</div>
              <div style={{display:'flex', flexWrap:'wrap', gap:'.5rem'}}>
                {['LinkedIn','GitHub','X','Bluesky','Mastodon','Wikidata'].map(s => (
                  <a key={s} href="#" className="chip" style={{padding:'.375rem .625rem'}}>
                    <Icon.ArrowUpRight style={{fontSize:'.75em', opacity:.6}}/> {s}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter/>
    </>
  );
}

// ── /prosjekter ───────────────────────────────
function ProsjekterPage() {
  const [filter, setFilter] = useState('Alle');
  const filters = ['Alle', 'Aktiv', 'I drift', 'Side', 'Arkivert'];
  const list = filter === 'Alle' ? projects : projects.filter(p => p.status === filter);
  return (
    <>
      <SiteHeader active="/prosjekter"/>
      <main style={{padding:'3rem 2rem'}}>
        <div className="container">
          <div className="eyebrow" style={{marginBottom:'.75rem'}}>CREATIVEWORK · ARKIV</div>
          <h1 style={{fontFamily:'var(--ff-serif)', fontWeight:500, maxWidth:'32rem'}}>
            Prosjekter, fra klientarbeid til sidesysler.
          </h1>
          <p className="muted" style={{marginTop:'.75rem', maxWidth:'32rem'}}>
            Et utvalg ting jeg har designet, bygget eller hjulpet med å flytte framover. Noen er fortsatt i
            drift, andre har gjort jobben sin og blitt arkivert.
          </p>

          <div style={{display:'flex', alignItems:'center', gap:'.75rem', marginTop:'2rem', marginBottom:'1.25rem'}}>
            <div className="segmented" style={{display:'inline-flex', border:'1px solid var(--rule)', borderRadius:'6px', overflow:'hidden'}}>
              {filters.map(f => (
                <button key={f} onClick={() => setFilter(f)}
                  style={{background: filter===f ? 'var(--ink)' : 'transparent',
                    color: filter===f ? 'var(--bg)' : 'var(--ink-3)',
                    border:0, padding:'.375rem .75rem', fontSize:'.8125rem'}}>
                  {f} <span style={{opacity:.55, marginLeft:4}}>{f==='Alle' ? projects.length : projects.filter(p=>p.status===f).length}</span>
                </button>
              ))}
            </div>
            <span className="dim mono" style={{fontSize:'.75rem', marginLeft:'auto'}}>sortert: nyeste først</span>
          </div>

          <div style={{display:'grid', gap:'0'}}>
            {list.map((p, i) => (
              <a key={p.slug} href={`/prosjekter/${p.slug}`} style={{
                display:'grid', gridTemplateColumns:'3rem 1fr auto auto', gap:'1.5rem', alignItems:'baseline',
                padding:'1.25rem 0', borderTop:'1px solid var(--rule)', borderBottom: i === list.length-1 ? '1px solid var(--rule)' : 'none',
                transition:'background .15s, padding-left .15s',
              }}
              onMouseEnter={(e)=>{e.currentTarget.style.paddingLeft='.5rem'}}
              onMouseLeave={(e)=>{e.currentTarget.style.paddingLeft='0'}}>
                <span className="mono dim" style={{fontSize:'.75rem'}}>#{String(i+1).padStart(2,'0')}</span>
                <div>
                  <div style={{display:'flex', alignItems:'baseline', gap:'.75rem'}}>
                    <h3 style={{fontSize:'1.125rem'}}>{p.title}</h3>
                    <span className="chip">{p.status}</span>
                  </div>
                  <p className="muted" style={{fontSize:'.9375rem', marginTop:'.25rem'}}>{p.desc}</p>
                  <div style={{display:'flex', gap:'.375rem', marginTop:'.5rem', flexWrap:'wrap'}}>
                    {p.stack.map(s => <span key={s} className="chip">{s}</span>)}
                  </div>
                </div>
                <span className="mono dim" style={{fontSize:'.75rem', whiteSpace:'nowrap'}}>{p.role}</span>
                <span className="mono dim" style={{fontSize:'.75rem', whiteSpace:'nowrap'}}>{p.year}</span>
              </a>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter/>
    </>
  );
}

// ── /blogg ────────────────────────────────────
function BloggPage() {
  return (
    <>
      <SiteHeader active="/blogg"/>
      <main style={{padding:'3rem 2rem'}}>
        <div className="container" style={{maxWidth:'52rem'}}>
          <div className="eyebrow" style={{marginBottom:'.75rem'}}>ARTICLE · ARKIV</div>
          <h1 style={{fontFamily:'var(--ff-serif)', fontWeight:500, maxWidth:'28rem'}}>
            Notater og lengre stykker om koden jeg skriver.
          </h1>
          <div style={{display:'flex', gap:'.75rem', marginTop:'1rem', alignItems:'center'}}>
            <a href="/rss.xml" className="chip"><Icon.Rss/> RSS</a>
            <a href="/feed.json" className="chip">JSON Feed</a>
            <span className="dim" style={{fontSize:'.8125rem', marginLeft:'auto'}}>{posts.length} publiserte notater</span>
          </div>

          <div style={{marginTop:'2.5rem'}}>
            {(() => {
              // group by year
              const groups = {};
              posts.forEach(p => {
                const y = p.date.slice(-4);
                (groups[y] = groups[y] || []).push(p);
              });
              return Object.entries(groups).map(([y, list]) => (
                <div key={y} style={{marginBottom:'2.5rem'}}>
                  <div style={{display:'flex', alignItems:'baseline', justifyContent:'space-between', marginBottom:'.5rem'}}>
                    <h2 style={{fontFamily:'var(--ff-serif)', fontSize:'2rem', color:'var(--ink-4)', fontWeight:400}}>{y}</h2>
                    <span className="mono dim" style={{fontSize:'.75rem'}}>{list.length} {list.length === 1 ? 'notat' : 'notater'}</span>
                  </div>
                  {list.map(p => <PostRow key={p.slug} {...p}/>)}
                </div>
              ));
            })()}
          </div>
        </div>
      </main>
      <SiteFooter/>
    </>
  );
}

// ── /na ──────────────────────────────────────
function NaPage() {
  return (
    <>
      <SiteHeader active="/na"/>
      <main style={{padding:'3rem 2rem'}}>
        <div className="container" style={{maxWidth:'44rem'}}>
          <div className="eyebrow" style={{marginBottom:'.75rem'}}>
            /NA · NOW-PAGE · <a href="https://nownownow.com" className="link" style={{color:'inherit'}}>nownownow.com</a>
          </div>
          <h1 style={{fontFamily:'var(--ff-serif)', fontWeight:500}}>
            Hva jeg jobber med akkurat nå.
          </h1>
          <p className="muted" style={{marginTop:'.75rem', maxWidth:'34rem'}}>
            Dette er ikke en blogg. Det er en logg — korte oppdateringer om hva som opptar meg akkurat nå.
            Inspirert av Derek Sivers sin <code style={{background:'var(--bg-sunken)', padding:'1px 5px', borderRadius:4, fontSize:'.875em'}}>/now</code>-konvensjon.
          </p>

          <div style={{marginTop:'2.5rem', display:'flex', flexDirection:'column', gap:'2rem'}}>
            {nowEntries.map((e, i) => (
              <article key={i} style={{paddingLeft:'1.25rem', borderLeft: i === 0 ? '2px solid var(--accent)' : '1px solid var(--rule)'}}>
                <div style={{display:'flex', alignItems:'baseline', gap:'.75rem', marginBottom:'.75rem'}}>
                  <time className="mono" style={{fontSize:'.8125rem', color: i === 0 ? 'var(--accent-ink)' : 'var(--ink-3)'}}>{e.date}</time>
                  {i === 0 && <span className="chip chip-accent"><span className="chip-dot"/>Siste</span>}
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:'.625rem', color:'var(--ink-2)', fontSize:'.9375rem', lineHeight:1.6}}>
                  {e.body.map((b, j) => <p key={j}>{b}</p>)}
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter/>
    </>
  );
}

// ── /uses ────────────────────────────────────
function UsesPage() {
  return (
    <>
      <SiteHeader active="/uses"/>
      <main style={{padding:'3rem 2rem'}}>
        <div className="container" style={{maxWidth:'48rem'}}>
          <div className="eyebrow" style={{marginBottom:'.75rem'}}>/USES · SETUP</div>
          <h1 style={{fontFamily:'var(--ff-serif)', fontWeight:500}}>
            Verktøy, programvare og hardware jeg faktisk bruker.
          </h1>
          <p className="muted" style={{marginTop:'.75rem', maxWidth:'34rem'}}>
            Inspirert av <a href="https://usesthis.com" className="link">usesthis.com</a>. Jeg prøver å holde
            dette ærlig: kun ting jeg bruker daglig eller ukentlig.
          </p>

          <div style={{marginTop:'2.5rem', display:'flex', flexDirection:'column', gap:'2.5rem'}}>
            {Object.entries(uses).map(([cat, items]) => (
              <section key={cat}>
                <div style={{display:'flex', alignItems:'baseline', gap:'.75rem', marginBottom:'1rem'}}>
                  <h2 style={{fontFamily:'var(--ff-serif)', fontWeight:500, fontSize:'1.5rem'}}>{cat}</h2>
                  <span className="mono dim" style={{fontSize:'.75rem'}}>· {items.length}</span>
                </div>
                <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column'}}>
                  {items.map(it => (
                    <li key={it.name} style={{display:'grid', gridTemplateColumns:'14rem 1fr auto', gap:'1rem', padding:'.75rem 0', borderTop:'1px solid var(--rule)', alignItems:'baseline'}}>
                      <div style={{fontWeight:500}}>{it.name}</div>
                      <div className="muted" style={{fontSize:'.9375rem'}}>{it.desc}</div>
                      <a href={it.url} className="dim" style={{fontSize:'.8125rem'}}><Icon.External/></a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter/>
    </>
  );
}

// ── /kontakt ─────────────────────────────────
function KontaktPage() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <SiteHeader active="/kontakt"/>
      <main style={{padding:'3rem 2rem'}}>
        <div className="container" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem', maxWidth:'56rem'}}>
          <div>
            <div className="eyebrow" style={{marginBottom:'.75rem'}}>/KONTAKT</div>
            <h1 style={{fontFamily:'var(--ff-serif)', fontWeight:500, marginBottom:'1rem'}}>
              Send meg en beskjed.
            </h1>
            <p className="muted" style={{marginBottom:'2rem', maxWidth:'22rem'}}>
              Jeg svarer som regel innen ett døgn. Klart du heller kan ta e-post direkte — eller koble til på
              en av plattformene nedenfor.
            </p>
            <div style={{display:'flex', flexDirection:'column', gap:'.75rem'}}>
              {[
                { icon: <Icon.Mail/>, label: 'marcus@jenshaug.no', href: 'mailto:marcus@jenshaug.no' },
                { icon: <Icon.Linkedin/>, label: 'linkedin.com/in/marcusjenshaug', href: '#' },
                { icon: <Icon.Github/>, label: 'github.com/marcusjenshaug', href: '#' },
              ].map(l => (
                <a key={l.label} href={l.href} style={{display:'flex', alignItems:'center', gap:'.625rem', padding:'.625rem .875rem', border:'1px solid var(--rule)', borderRadius:'8px', fontSize:'.9375rem', color:'var(--ink-2)'}}>
                  <span style={{color:'var(--accent)'}}>{l.icon}</span>
                  {l.label}
                  <Icon.ArrowUpRight style={{marginLeft:'auto', fontSize:'.85em', color:'var(--ink-4)'}}/>
                </a>
              ))}
            </div>
            <div className="term" style={{marginTop:'2rem'}}>
              <div><span className="com"># svartid</span></div>
              <div>Vanligvis: &lt; 24t</div>
              <div>Mest sannsynlig: morgen (CET)</div>
            </div>
          </div>
          <div>
            {!sent ? (
              <form onSubmit={(e)=>{e.preventDefault(); setSent(true);}} style={{display:'flex', flexDirection:'column', gap:'1rem'}}>
                <Field label="Navn" name="name" placeholder="Ola Nordmann"/>
                <Field label="E-post" name="email" type="email" placeholder="ola@example.no"/>
                <Field label="Emne" name="subject" placeholder="Kort om hva det gjelder"/>
                <div>
                  <label style={{display:'block', fontSize:'.8125rem', color:'var(--ink-3)', marginBottom:'.375rem'}}>Melding</label>
                  <textarea rows={6} placeholder="Skriv fritt. Jeg leser alt." style={{
                    width:'100%', padding:'.625rem .75rem', border:'1px solid var(--rule-strong)', borderRadius:'6px',
                    background:'var(--bg-elev)', resize:'vertical', lineHeight:1.55,
                  }}/>
                </div>
                <input type="text" name="website" tabIndex={-1} aria-hidden style={{position:'absolute', left:'-9999px'}}/>
                <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'.5rem'}}>
                  <span className="dim" style={{fontSize:'.75rem'}}>Beskyttet av honeypot + rate-limit.</span>
                  <button type="submit" className="btn btn-primary">Send melding <Icon.ArrowRight/></button>
                </div>
              </form>
            ) : (
              <div style={{padding:'2rem', border:'1px solid var(--rule)', borderRadius:'8px', textAlign:'center'}}>
                <div style={{width:'2.5rem', height:'2.5rem', borderRadius:'50%', background:'oklch(0.94 0.06 145)', color:'oklch(0.45 0.16 145)', display:'inline-flex', alignItems:'center', justifyContent:'center', marginBottom:'.75rem'}}>
                  <Icon.Check/>
                </div>
                <h3>Takk — meldingen er sendt.</h3>
                <p className="muted" style={{marginTop:'.375rem', fontSize:'.9375rem'}}>Jeg svarer så snart jeg kan.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <SiteFooter/>
    </>
  );
}

function Field({ label, name, type = 'text', placeholder }) {
  return (
    <div>
      <label htmlFor={name} style={{display:'block', fontSize:'.8125rem', color:'var(--ink-3)', marginBottom:'.375rem'}}>{label}</label>
      <input id={name} name={name} type={type} placeholder={placeholder}
        style={{width:'100%', padding:'.5625rem .75rem', border:'1px solid var(--rule-strong)', borderRadius:'6px', background:'var(--bg-elev)'}}/>
    </div>
  );
}

// ── Article detail ──
function ArticlePage() {
  const post = posts[0];
  return (
    <>
      <SiteHeader active="/blogg"/>
      <main style={{padding:'3rem 2rem'}}>
        <div className="container" style={{maxWidth:'44rem'}}>
          <nav className="mono dim" style={{fontSize:'.75rem', marginBottom:'1.5rem'}}>
            <a href="/" style={{color:'inherit'}}>hjem</a> / <a href="/blogg" style={{color:'inherit'}}>blogg</a> / <span style={{color:'var(--ink-2)'}}>{post.slug}</span>
          </nav>
          <div style={{display:'flex', gap:'.5rem', marginBottom:'1rem', alignItems:'center'}}>
            {post.tags.map(t => <span key={t} className="chip">{t}</span>)}
            <span className="dim" style={{fontSize:'.8125rem'}}>· {post.date} · {post.reading}</span>
          </div>
          <h1 style={{fontFamily:'var(--ff-serif)', fontWeight:500, marginBottom:'1rem', fontSize:'clamp(1.75rem, 3.5vw, 2.5rem)'}}>{post.title}</h1>
          <p style={{fontSize:'1.125rem', color:'var(--ink-3)', lineHeight:1.55, marginBottom:'2.5rem'}}>{post.desc}</p>

          <div className="prose" style={{maxWidth:'none'}}>
            <p>
              Etter et drøyt år med App Router og server components som default, er det noen mønstre jeg
              nå holder meg til uten å tenke. Dette er ikke en introduksjonsguide — det er notater fra å
              bygge Klink og Redi Hub med Next.js 15 i produksjon.
            </p>

            <h2>1. Server som standard, klient når den trengs</h2>
            <p>
              Regel nummer én: alt er en server-komponent med mindre det er en tydelig grunn til noe
              annet. «Tydelig grunn» betyr: state som må overleve en re-render, event handlers på
              elementer, eller bruk av et bibliotek som kun finnes i browseren.
            </p>
            <pre><code>{`// app/prosjekter/page.tsx
import { createClient } from '@/lib/supabase/server'

export default async function Page() {
  const supabase = createClient()
  const { data } = await supabase
    .from('projects')
    .select('*')
    .eq('draft', false)
    .order('order_index')

  return <ProjectList items={data ?? []} />
}`}</code></pre>
            <p>
              Ingen <code>useEffect</code>. Ingen loading-state. Ingen N+1 på klienten. Data hentes der
              den hører hjemme — på serveren, før markupen sendes.
            </p>

            <h2>2. Server actions erstatter de fleste API-ruter</h2>
            <p>
              Jeg har ikke skrevet en <code>route.ts</code> for skjema-submits siden App Router ble
              stabilt. Server actions er bedre i nesten alle aspekter — de får type-trygge argumenter,
              kjører nær dataen, og kan kalle <code>revalidateTag()</code> rett etter mutation.
            </p>
            <blockquote>
              «Don't build abstractions until you have real pain.» — noen jeg var enig med før jeg
              begynte å jobbe med Next.js 15, og som jeg er enda mer enig med nå.
            </blockquote>

            <h2>3. Cache-tagging er underkommunisert</h2>
            <p>
              Tagge alt som kan tagges. Det gir deg presise invalideringer uten å måtte huske hvilke
              ruter som leser hvilke data. Jeg har dette som en liten regel:
              <em> én tag per tabell + optional slug-qualifier.</em>
            </p>
            <hr/>
            <p className="muted">
              Fortsetter nedover med alle triksene, ja…
            </p>
          </div>

          <div style={{marginTop:'3rem', padding:'1.5rem', background:'var(--bg-sunken)', borderRadius:'8px'}}>
            <div className="eyebrow" style={{marginBottom:'.5rem'}}>Hvis du likte dette</div>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <span>Del på <a href="#" className="link">LinkedIn</a> eller <a href="#" className="link">X</a>, eller abonnér via <a href="/rss.xml" className="link">RSS</a>.</span>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter/>
    </>
  );
}

Object.assign(window, {
  HomePage, OmPage, ProsjekterPage, BloggPage, NaPage, UsesPage, KontaktPage, ArticlePage,
  projects, posts, nowEntries, uses,
});
