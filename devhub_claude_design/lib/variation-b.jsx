// Variation B — Warm / community-focused homepage
// Cream paper palette, editorial rhythm, serif accents, lots of people/faces.

const VarB_TopNav = ({ onToggleTheme, isDark }) => (
  <header style={{
    position: 'sticky', top: 0, zIndex: 10,
    height: 64, display: 'flex', alignItems: 'center', gap: 20,
    padding: '0 40px', borderBottom: '1px solid var(--border)',
    background: 'color-mix(in oklab, var(--paper) 85%, transparent)', backdropFilter: 'blur(10px)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <DevHubLogo size={28}/>
      <DevHubWordmark size={16}/>
    </div>
    <nav style={{ display: 'flex', gap: 4, marginLeft: 12 }}>
      {['Resources', 'AI Chat', 'Pathfinder', 'My Learning', 'Events', 'Forum'].map((n, i) => (
        <a key={n} style={{
          padding: '8px 12px', fontSize: 14, fontWeight: 500,
          color: i === 0 ? 'var(--fg)' : 'var(--fg-muted)', borderRadius: 6, cursor: 'pointer',
          textDecoration: 'none',
        }}>{n}</a>
      ))}
    </nav>
    <div style={{ flex: 1, maxWidth: 360, marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8,
      background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 999,
      padding: '8px 14px', fontSize: 13.5, color: 'var(--fg-subtle)' }}>
      <Icons.Search size={15}/><span>Search the hub</span>
      <kbd style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10.5, padding: '1px 6px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--fg-muted)' }}>⌘K</kbd>
    </div>
    <button onClick={onToggleTheme} style={{
      width: 36, height: 36, borderRadius: 999, border: '1px solid var(--border)', background: 'var(--bg-elev)',
      color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
    }}>{isDark ? <Icons.Sun size={16}/> : <Icons.Moon size={16}/>}</button>
    <button style={{
      padding: '8px 16px', fontSize: 13.5, fontWeight: 500, borderRadius: 999,
      border: 'none', background: 'var(--accent)', color: 'var(--accent-fg)', cursor: 'pointer', fontFamily: 'inherit',
    }}>Sign in</button>
  </header>
);

// Warm editorial hero
const VarB_Hero = ({ motifDensity }) => (
  <section style={{ position: 'relative', overflow: 'hidden', padding: '72px 40px 56px' }}>
    <GraphMotif density={motifDensity * 0.7} opacity={0.45} seed={13}/>
    <div style={{ position: 'relative', maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 48, alignItems: 'center' }}>
      <div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 22 }}>
          <div style={{ display: 'flex', marginLeft: 4 }}>
            {['Ana', 'Lee', 'Mia', 'Tom'].map((n, i) => (
              <div key={n} style={{ marginLeft: i === 0 ? 0 : -8 }}><Avatar name={n} size={26}/></div>
            ))}
          </div>
          <span style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Joined by <span style={{ color: 'var(--fg)', fontWeight: 600 }}>12,840</span> builders</span>
        </div>
        <h1 style={{ fontSize: 68, lineHeight: 0.98, fontWeight: 500, letterSpacing: -2.5, margin: 0, color: 'var(--ink)' }}>
          A home for people<br/>
          who think in
          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 400, fontStyle: 'italic', color: 'var(--accent)', letterSpacing: -1 }}> graphs.</span>
        </h1>
        <p style={{ fontSize: 18, lineHeight: 1.55, color: 'var(--fg-muted)', marginTop: 22, maxWidth: 500 }}>
          Tutorials, open projects, weekly meetups, and the friendliest forum you'll find for anyone building on TigerGraph. Pull up a chair.
        </p>
        <div style={{ display: 'flex', gap: 10, marginTop: 30 }}>
          <button style={{
            padding: '13px 22px', borderRadius: 999, border: 'none', background: 'var(--accent)', color: 'var(--accent-fg)',
            fontSize: 14.5, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
          }}>Join the community <Icons.Arrow size={15}/></button>
          <button style={{
            padding: '13px 22px', borderRadius: 999, border: '1px solid var(--border-strong)', background: 'transparent',
            color: 'var(--fg)', fontSize: 14.5, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit',
          }}><Icons.Play size={14}/> Watch the 60s tour</button>
        </div>
      </div>

      {/* friendly forum-preview card */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'absolute', inset: -12, background: 'var(--cream)', borderRadius: 20, transform: 'rotate(-1.5deg)', border: '1px solid var(--border)' }}/>
        <div style={{ position: 'relative', background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 16, padding: 24, boxShadow: '0 12px 40px rgba(28,24,21,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, fontFamily: 'var(--font-mono)', letterSpacing: 1.5, color: 'var(--fg-subtle)', marginBottom: 16 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--success)' }}/>
            LIVE IN #gsql-help · 2 MIN AGO
          </div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <Avatar name="Ravi Kumar" size={36}/>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>Ravi Kumar</div>
              <div style={{ fontSize: 12, color: 'var(--fg-subtle)' }}>asking · 4 replies</div>
            </div>
          </div>
          <div style={{ fontSize: 15, color: 'var(--fg)', lineHeight: 1.5, marginBottom: 12 }}>
            How do I traverse a heterogeneous graph and weight edges by recency without blowing up the query plan?
          </div>
          <div style={{ padding: 12, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Avatar name="Soyeon Park" size={22}/>
              <span style={{ fontSize: 12.5, fontWeight: 600 }}>Soyeon Park</span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', padding: '1px 6px', borderRadius: 4, background: 'var(--accent)', color: 'var(--accent-fg)', fontWeight: 600 }}>TG TEAM</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.5 }}>
              "Try an accumulator with a time-decay kernel — I'll write up a gist, 1 min 👋"
            </div>
          </div>
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 14, fontSize: 12.5, color: 'var(--fg-subtle)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icons.Heart size={13}/> 18</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icons.Chat size={13}/> 4 replies</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icons.Eye size={13}/> 142</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Quickstart — magazine-row
const VarB_Quickstart = () => {
  const rows = [
    { n: '01', t: 'Get set up', d: 'Local install, cloud instance, or just a sandbox in the browser.', meta: '5 min · free forever' },
    { n: '02', t: 'Your first query', d: 'Load the LDBC social network, write a schema, query it in GSQL.', meta: '12 min · beginner' },
    { n: '03', t: 'Graph + AI', d: 'Use GSQL Copilot to generate queries from plain English prompts.', meta: '8 min · intermediate' },
    { n: '04', t: 'Ship it', d: 'Scale from notebook to production, monitor, version, roll back.', meta: '20 min · advanced' },
  ];
  return (
    <section style={{ padding: '12px 40px 40px', maxWidth: 1160, margin: '0 auto', width: '100%' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 6 }}>GET STARTED</div>
        <h2 style={{ fontSize: 34, fontWeight: 500, letterSpacing: -1, margin: 0, color: 'var(--ink)' }}>
          Four steps from zero to <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>production</span>.
        </h2>
      </div>
      <div style={{ borderTop: '1px solid var(--border)' }}>
        {rows.map((r, i) => (
          <div key={r.n} style={{
            display: 'grid', gridTemplateColumns: '80px 1.2fr 1.8fr auto', gap: 32, alignItems: 'center',
            padding: '22px 4px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
          }}>
            <div style={{ fontSize: 44, fontFamily: 'var(--font-serif)', color: 'var(--accent)', fontStyle: 'italic', letterSpacing: -1 }}>{r.n}</div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: -0.4, color: 'var(--ink)' }}>{r.t}</div>
            <div style={{ fontSize: 15, color: 'var(--fg-muted)', lineHeight: 1.5 }}>{r.d}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)' }}>{r.meta}</span>
              <Icons.Arrow size={16}/>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Featured tutorials as editorial tiles
const VarB_Tutorials = () => {
  const feat = { tag: 'FEATURED · GENAI', title: 'Grounding an LLM in a knowledge graph you can actually trust', by: 'Soyeon Park', desc: 'We walk through RAG that combines vector search with graph traversal for recall that holds up on complex questions.', time: '40 min read' };
  const side = [
    { tag: 'FRAUD', t: 'Detecting payment-fraud rings with graph patterns', by: 'Marcus Lin', time: '25 min' },
    { tag: 'CYBER', t: 'Modeling attack paths across an identity graph', by: 'Diego Martínez', time: '30 min' },
    { tag: 'SUPPLY', t: 'A bill-of-materials graph for 40k parts', by: 'Jin Takahashi', time: '18 min' },
  ];
  return (
    <section style={{ background: 'var(--cream)', padding: '64px 40px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 32 }}>
          <h2 style={{ fontSize: 34, fontWeight: 500, letterSpacing: -1, margin: 0, color: 'var(--ink)' }}>
            This week on <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>DevHub</span>
          </h2>
          <a style={{ fontSize: 14, color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>Browse all tutorials <Icons.ChevronR size={14}/></a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
          {/* Featured */}
          <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
            <div style={{ height: 280, position: 'relative' }}>
              <ImagePlaceholder tone="orange" h="100%" label="HERO · KG + RAG"/>
            </div>
            <div style={{ padding: 28 }}>
              <div style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', letterSpacing: 1.8, color: 'var(--accent)', marginBottom: 10 }}>{feat.tag}</div>
              <h3 style={{ fontSize: 26, fontWeight: 600, letterSpacing: -0.6, margin: 0, lineHeight: 1.2, color: 'var(--ink)' }}>{feat.title}</h3>
              <p style={{ fontSize: 14.5, color: 'var(--fg-muted)', lineHeight: 1.55, marginTop: 12 }}>{feat.desc}</p>
              <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--fg-muted)' }}>
                <Avatar name={feat.by} size={26}/> <span style={{ fontWeight: 500, color: 'var(--fg)' }}>{feat.by}</span>
                <span>·</span><span>{feat.time}</span>
              </div>
            </div>
          </div>

          {/* Side list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {side.map((s, i) => (
              <div key={i} style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, display: 'flex', gap: 16, cursor: 'pointer' }}>
                <div style={{ flexShrink: 0 }}>
                  <ImagePlaceholder tone="warm" w={100} h={100} label={s.tag}/>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 1.5, color: 'var(--accent)', marginBottom: 6 }}>{s.tag}</div>
                  <div style={{ fontSize: 15.5, fontWeight: 600, lineHeight: 1.3, color: 'var(--ink)', marginBottom: 10, letterSpacing: -0.2 }}>{s.t}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg-muted)' }}>
                    <Avatar name={s.by} size={18}/> {s.by} <span>·</span> <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>{s.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Showcase gallery
const VarB_Showcase = () => {
  const projs = [
    { name: 'graph-of-arxiv', by: 'Alex Nguyen', stars: 842, desc: 'Citation graph of 2.4M papers', lang: 'Python', tone: 'orange' },
    { name: 'gsql-lsp', by: 'Elena Ruiz', stars: 517, desc: 'Language server for GSQL', lang: 'TypeScript', tone: 'warm' },
    { name: 'tg-terraform', by: 'Samir Patel', stars: 298, desc: 'Infra as code for TG Cloud', lang: 'Go', tone: 'orange' },
    { name: 'kg-chatbot-kit', by: 'Nadia Osei', stars: 1124, desc: 'LangChain toolkit on graphs', lang: 'Python', tone: 'warm' },
  ];
  return (
    <section style={{ padding: '64px 40px', maxWidth: 1160, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 6 }}>SHOWCASE</div>
          <h2 style={{ fontSize: 34, fontWeight: 500, letterSpacing: -1, margin: 0, color: 'var(--ink)' }}>
            Built by the <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>community</span>.
          </h2>
        </div>
        <button style={{ padding: '10px 18px', fontSize: 13.5, borderRadius: 999, border: '1px solid var(--border-strong)', background: 'transparent', color: 'var(--fg)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit', fontWeight: 500 }}>
          <Icons.Plus size={14}/> Submit a project
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {projs.map((p, i) => (
          <div key={p.name} style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}>
            <ImagePlaceholder tone={p.tone} h={140}/>
            <div style={{ padding: 16 }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginBottom: 12 }}>{p.desc}</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Avatar name={p.by} size={18}/>
                  <span style={{ fontSize: 11.5, color: 'var(--fg-subtle)' }}>{p.by}</span>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--fg-subtle)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Icons.Star size={11}/>{p.stars}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// Events — split with big hero event
const VarB_Events = () => (
  <section style={{ background: 'var(--ink)', color: 'var(--paper)', padding: '64px 40px' }}>
    <div style={{ maxWidth: 1160, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 6 }}>EVENTS</div>
          <h2 style={{ fontSize: 34, fontWeight: 500, letterSpacing: -1, margin: 0, color: 'var(--paper)' }}>
            Come hang out with us <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>IRL.</span>
          </h2>
        </div>
        <a style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: 4 }}>Full calendar <Icons.ChevronR size={14}/></a>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 20 }}>
        <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: 'color-mix(in oklab, var(--accent) 12%, black)', padding: 36, minHeight: 280 }}>
          <GraphMotif density={0.8} opacity={0.5} color="#F58220" edgeColor="rgba(245,130,32,0.4)" seed={3}/>
          <div style={{ position: 'relative', maxWidth: 440 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 1.5, color: 'var(--accent)', marginBottom: 14, padding: '4px 10px', border: '1px solid var(--accent)', borderRadius: 999 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent)' }}/>
              UPCOMING · APR 28
            </div>
            <h3 style={{ fontSize: 28, fontWeight: 600, lineHeight: 1.15, letterSpacing: -0.6, margin: 0 }}>
              Graph + LLMs: building retrieval you can actually reason about
            </h3>
            <p style={{ fontSize: 14.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, marginTop: 14 }}>
              A 60-minute working session with the GSQL Copilot team. Bring questions.
            </p>
            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 14 }}>
              <button style={{ padding: '10px 18px', borderRadius: 999, border: 'none', background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>RSVP · free</button>
              <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)' }}>412 going</span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[
            { d: 'MAY 14', t: 'TigerGraph Meetup — New York', m: 'In person · Brooklyn · 86 going' },
            { d: 'MAY 22', t: 'Office hours with the GSQL core team', m: 'Virtual · Q&A · 201 going' },
            { d: 'JUN 03', t: 'Hackathon: build-a-knowledge-graph weekend', m: 'Hybrid · $5k prizes · 124 going' },
          ].map((e, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '18px 0', borderBottom: '1px solid rgba(255,255,255,0.12)', cursor: 'pointer' }}>
              <div style={{ width: 60, flexShrink: 0, textAlign: 'center', padding: '8px 4px', border: '1px solid rgba(255,255,255,0.16)', borderRadius: 8 }}>
                <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontWeight: 600 }}>{e.d.split(' ')[0]}</div>
                <div style={{ fontSize: 20, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{e.d.split(' ')[1]}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.35, marginBottom: 6 }}>{e.t}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontFamily: 'var(--font-mono)' }}>{e.m}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

// Blog
const VarB_Blog = () => {
  const posts = [
    { d: 'Apr 18', t: 'Shipping GSQL Copilot — a postmortem on prompt engineering', a: 'Soyeon Park', r: '7 min', tag: 'ENGINEERING' },
    { d: 'Apr 14', t: 'The case for property graphs over RDF in 2026', a: 'Marcus Lin', r: '12 min', tag: 'OPINION' },
    { d: 'Apr 09', t: 'Benchmarking TG 4.2 vs Neo4j on a 2B-edge dataset', a: 'Diego Martínez', r: '9 min', tag: 'PERFORMANCE' },
  ];
  return (
    <section style={{ padding: '64px 40px', maxWidth: 1160, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 6 }}>FROM THE BLOG</div>
          <h2 style={{ fontSize: 34, fontWeight: 500, letterSpacing: -1, margin: 0, color: 'var(--ink)' }}>
            Long reads, by the <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>team</span>.
          </h2>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
        {posts.map((p, i) => (
          <article key={i} style={{ cursor: 'pointer' }}>
            <ImagePlaceholder tone={i === 0 ? 'orange' : 'warm'} h={200} style={{ marginBottom: 16, borderRadius: 10 }}/>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 1.8, color: 'var(--accent)', marginBottom: 8 }}>{p.tag}</div>
            <h3 style={{ fontSize: 19, fontWeight: 600, letterSpacing: -0.3, lineHeight: 1.3, margin: 0, color: 'var(--ink)' }}>{p.t}</h3>
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--fg-muted)' }}>
              <Avatar name={p.a} size={20}/> {p.a} <span>·</span> <span>{p.d}</span> <span>·</span> <span>{p.r}</span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

// Footer
const VarB_Footer = () => (
  <footer style={{ borderTop: '1px solid var(--border)', padding: '40px', background: 'var(--cream)' }}>
    <div style={{ maxWidth: 1160, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.5fr repeat(4, 1fr)', gap: 32 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <DevHubLogo size={28}/><DevHubWordmark size={16}/>
        </div>
        <div style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.6, maxWidth: 260 }}>
          The community home for TigerGraph. Built with the community, for the community.
        </div>
      </div>
      {[
        ['Learn', ['Tutorials', 'Quickstarts', 'Docs', 'GSQL Reference']],
        ['Community', ['Forum', 'Showcase', 'Contributors', 'Code of Conduct']],
        ['Events', ['Calendar', 'Meetups', 'Office Hours', 'Past Recordings']],
        ['More', ['Blog', 'GitHub', 'Status', 'Careers']],
      ].map(([h, items]) => (
        <div key={h}>
          <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--fg-subtle)', marginBottom: 14 }}>{h.toUpperCase()}</div>
          {items.map(l => <div key={l} style={{ fontSize: 13.5, color: 'var(--fg-muted)', marginBottom: 8, cursor: 'pointer' }}>{l}</div>)}
        </div>
      ))}
    </div>
    <div style={{ maxWidth: 1160, margin: '32px auto 0', paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--fg-subtle)', fontFamily: 'var(--font-mono)' }}>
      <div>© 2026 TigerGraph · built with 🧡 by the community</div>
      <div>v4.2.1 · all systems operational</div>
    </div>
  </footer>
);

const VarB_Homepage = ({ motifDensity, isDark, onToggleTheme }) => (
  <div className={`tg-root theme-b ${isDark ? 'dark' : ''}`} style={{ minHeight: '100%', background: 'var(--paper)' }}>
    <VarB_TopNav onToggleTheme={onToggleTheme} isDark={isDark}/>
    <VarB_Hero motifDensity={motifDensity}/>
    <VarB_Quickstart/>
    <VarB_Tutorials/>
    <VarB_Showcase/>
    <VarB_Events/>
    <VarB_Blog/>
    <VarB_Footer/>
  </div>
);

Object.assign(window, { VarB_Homepage, VarB_Footer });
