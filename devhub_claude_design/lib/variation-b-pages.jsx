// Variation B pages — warm, editorial, cream-paper
// Forum · Tutorial · Showcase · Profile · Events
// Reuses VarB_TopNav + VarB_Footer for consistency.

// Tiny helper — wraps any B-themed page with consistent chrome.
const VarB_Shell = ({ isDark, onToggleTheme, children, active = 'Learn' }) => (
  <div className={`tg-root theme-b ${isDark ? 'dark' : ''}`} style={{ minHeight: '100%', background: 'var(--paper)' }}>
    <VarB_TopNav_Active onToggleTheme={onToggleTheme} isDark={isDark} active={active}/>
    {children}
    <VarB_Footer/>
  </div>
);

// Active-aware top nav
const VarB_TopNav_Active = ({ onToggleTheme, isDark, active }) => (
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
      {['Resources', 'AI Chat', 'Pathfinder', 'My Learning', 'Events', 'Forum'].map((n) => (
        <a key={n} style={{
          padding: '8px 12px', fontSize: 14, fontWeight: 500,
          color: n === active ? 'var(--fg)' : 'var(--fg-muted)', borderRadius: 6, cursor: 'pointer',
          textDecoration: 'none', position: 'relative',
        }}>
          {n}
          {n === active && <span style={{ position: 'absolute', left: 12, right: 12, bottom: -1, height: 2, background: 'var(--accent)', borderRadius: 2 }}/>}
        </a>
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <Avatar name="Priya Shah" size={32}/>
    </div>
  </header>
);

const SectionHeader = ({ kicker, title, italic, sub, right }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, gap: 40 }}>
    <div>
      {kicker && <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 6 }}>{kicker}</div>}
      <h1 style={{ fontSize: 44, fontWeight: 500, letterSpacing: -1.4, margin: 0, color: 'var(--ink)', lineHeight: 1.05 }}>
        {title} {italic && <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{italic}</span>}
      </h1>
      {sub && <p style={{ fontSize: 16, color: 'var(--fg-muted)', marginTop: 14, maxWidth: 620, lineHeight: 1.5 }}>{sub}</p>}
    </div>
    {right}
  </div>
);

// ─────────────────────────── FORUM ───────────────────────────
const VarB_Page_Forum = ({ isDark, onToggleTheme }) => {
  const threads = [
    { pinned: true, cat: 'ANNOUNCEMENTS', by: 'TG Team', title: 'DevHub v2 is live — what\'s new, what\'s next', replies: 48, views: '12.4k', ago: '2d', last: 'Priya S.', tags: ['meta', 'changelog'] },
    { cat: 'GSQL HELP', by: 'Ravi Kumar', title: 'Traversing a heterogeneous graph with time-decayed edge weights', replies: 12, views: 842, ago: '12m', last: 'Soyeon P.', tags: ['gsql', 'accumulators'], solved: true, hot: true },
    { cat: 'SHOWCASE', by: 'Alex Nguyen', title: '[Show DevHub] graph-of-arxiv — 2.4M papers, semantic clustering', replies: 34, views: '3.2k', ago: '1h', last: 'Elena R.', tags: ['project', 'python', 'academia'] },
    { cat: 'GENAI', by: 'Jin Takahashi', title: 'Best way to chunk a KG for retrieval? Node-level vs subgraph', replies: 8, views: 421, ago: '3h', last: 'Marcus L.', tags: ['rag', 'llm'] },
    { cat: 'PERFORMANCE', by: 'Nadia Osei', title: 'Query planner ignores my hint on large fan-out — reproducible', replies: 21, views: '1.8k', ago: '5h', last: 'TG Team', tags: ['bug-maybe', 'planner'], hot: true },
    { cat: 'JOBS', by: 'David Chen', title: 'Hiring: Staff Graph Engineer — remote US/EU — $220-280k', replies: 4, views: 512, ago: '8h', last: 'Mia T.', tags: ['hiring'] },
    { cat: 'GSQL HELP', by: 'Samir Patel', title: 'How do I version my queries in CI without downtime?', replies: 16, views: 987, ago: '11h', last: 'Diego M.', tags: ['gsql', 'ops', 'ci'] },
    { cat: 'GENERAL', by: 'Elena Ruiz', title: 'TIL: accumulators can hold any tuple type you define', replies: 6, views: 342, ago: '1d', last: 'Ravi K.', tags: ['til'] },
  ];
  const stats = [
    { k: '12,840', v: 'members' }, { k: '3,412', v: 'topics this week' }, { k: '94%', v: 'questions answered' }, { k: '2.1h', v: 'avg response' },
  ];
  return (
    <VarB_Shell isDark={isDark} onToggleTheme={onToggleTheme} active="Forum">
      <section style={{ padding: '48px 40px 20px', maxWidth: 1160, margin: '0 auto', width: '100%' }}>
        <SectionHeader
          kicker="/ FORUM"
          title="Where the builders"
          italic="hang out."
          sub="Ask, answer, or just lurk. The friendliest place on the internet for GSQL — we promise."
          right={
            <button style={{ padding: '12px 20px', borderRadius: 999, border: 'none', background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', flexShrink: 0 }}>
              <Icons.Plus size={15}/> Start a topic
            </button>
          }
        />
        {/* stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg-elev)', marginBottom: 32 }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding: '18px 22px', borderLeft: i ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: 26, fontWeight: 500, letterSpacing: -0.8, color: 'var(--ink)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{s.k}</div>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 1.2, color: 'var(--fg-subtle)', marginTop: 2 }}>{s.v}</div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: '0 40px 48px', maxWidth: 1160, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 28 }}>
          <div>
            {/* filter strip */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {['All', 'Latest', 'Unanswered', 'Top', 'Following'].map((t, i) => (
                <button key={t} style={{
                  padding: '7px 14px', fontSize: 13, borderRadius: 999,
                  background: i === 1 ? 'var(--ink)' : 'var(--bg-elev)',
                  color: i === 1 ? 'var(--paper)' : 'var(--fg-muted)',
                  border: '1px solid ' + (i === 1 ? 'var(--ink)' : 'var(--border)'),
                  cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                }}>{t}</button>
              ))}
            </div>

            {/* thread list */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 12, background: 'var(--bg-elev)', overflow: 'hidden' }}>
              {threads.map((t, i) => (
                <div key={i} style={{
                  padding: '22px 24px', borderTop: i ? '1px solid var(--border)' : 'none',
                  display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 18, alignItems: 'center', cursor: 'pointer',
                }}>
                  <Avatar name={t.by} size={42}/>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      {t.pinned && <Icons.Star size={12} style={{ color: 'var(--accent)' }}/>}
                      <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', letterSpacing: 1.5, color: 'var(--accent)', fontWeight: 600 }}>{t.cat}</span>
                      {t.solved && <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--success)', padding: '1px 6px', border: '1px solid var(--success)', borderRadius: 3, fontWeight: 600 }}>SOLVED</span>}
                      {t.hot && <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}><Icons.Zap size={11}/>HOT</span>}
                    </div>
                    <div style={{ fontSize: 15.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 6, letterSpacing: -0.2, lineHeight: 1.3 }}>{t.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--fg-subtle)', flexWrap: 'wrap' }}>
                      <span><strong style={{ color: 'var(--fg-muted)', fontWeight: 500 }}>{t.by}</strong></span>
                      <span>·</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{t.ago} ago</span>
                      <span>·</span>
                      {t.tags.map((tag, k) => <span key={tag} style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>#{tag}</span>)}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{t.replies}</div>
                      <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)', letterSpacing: 1 }}>replies</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{t.views}</div>
                      <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)', letterSpacing: 1 }}>views</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* right rail */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ padding: 20, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 10 }}>CATEGORIES</div>
              {[['GSQL Help', 847], ['GenAI & RAG', 312], ['Performance', 204], ['Showcase', 181], ['Jobs', 94], ['General', 573]].map(([c, n], i) => (
                <div key={c} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: i ? '1px solid var(--border)' : 'none', fontSize: 13 }}>
                  <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{c}</span>
                  <span style={{ color: 'var(--fg-subtle)', fontFamily: 'var(--font-mono)' }}>{n}</span>
                </div>
              ))}
            </div>

            <div style={{ padding: 20, background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 12 }}>
              <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 12 }}>TOP THIS WEEK</div>
              {['Soyeon Park', 'Marcus Lin', 'Elena Ruiz', 'Diego Martínez'].map((n, i) => (
                <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--accent)', width: 16 }}>{i + 1}</div>
                  <Avatar name={n} size={26}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)' }}>{n}</div>
                    <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)' }}>{[42, 31, 24, 18][i]} answers</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ padding: 20, background: 'var(--ink)', color: 'var(--paper)', borderRadius: 12, position: 'relative', overflow: 'hidden' }}>
              <GraphMotif density={0.6} opacity={0.35} seed={9}/>
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 10 }}>CODE OF CONDUCT</div>
                <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 12 }}>Be kind. Be curious. Share what you learn.</div>
                <a style={{ fontSize: 12, color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>read the full pledge →</a>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </VarB_Shell>
  );
};

// ─────────────────────────── TUTORIAL ───────────────────────────
const VarB_Page_Tutorial = ({ isDark, onToggleTheme }) => (
  <VarB_Shell isDark={isDark} onToggleTheme={onToggleTheme} active="Learn">
    {/* Editorial cover */}
    <section style={{ padding: '64px 40px 0', maxWidth: 1160, margin: '0 auto', width: '100%' }}>
      <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--fg-subtle)', marginBottom: 20, display: 'flex', gap: 8 }}>
        <span>LEARN</span><span style={{ color: 'var(--border-strong)' }}>/</span><span>GENAI</span><span style={{ color: 'var(--border-strong)' }}>/</span><span style={{ color: 'var(--accent)' }}>KG + RAG</span>
      </div>
      <div style={{ maxWidth: 860 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 1.8, padding: '4px 10px', background: 'var(--accent)', color: 'var(--accent-fg)', borderRadius: 999, fontWeight: 600 }}>FEATURED</span>
          <span style={{ fontSize: 12.5, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>40 min · Advanced · Updated 3d ago</span>
        </div>
        <h1 style={{ fontSize: 60, fontWeight: 500, letterSpacing: -2.2, lineHeight: 1.02, margin: 0, color: 'var(--ink)' }}>
          Grounding an LLM in a knowledge graph <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontWeight: 400, color: 'var(--accent)' }}>you can actually trust.</span>
        </h1>
        <p style={{ fontSize: 19, color: 'var(--fg-muted)', lineHeight: 1.5, marginTop: 22, maxWidth: 680 }}>
          Blend vector search with graph traversal. Measure when each one wins. Ship a retrieval pipeline your product team won't have to apologize for.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 28 }}>
          <Avatar name="Soyeon Park" size={44}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: 8 }}>
              Soyeon Park
              <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', padding: '2px 7px', borderRadius: 4, background: 'var(--accent)', color: 'var(--accent-fg)', fontWeight: 600, letterSpacing: 0.8 }}>TG TEAM</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--fg-muted)' }}>Principal Engineer · published Apr 17, 2026</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ padding: '9px 14px', borderRadius: 999, border: '1px solid var(--border-strong)', background: 'var(--bg-elev)', color: 'var(--fg)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'inherit', fontWeight: 500 }}><Icons.Bookmark size={13}/> Save</button>
            <button style={{ padding: '9px 14px', borderRadius: 999, border: '1px solid var(--border-strong)', background: 'var(--bg-elev)', color: 'var(--fg)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontFamily: 'inherit', fontWeight: 500 }}><Icons.Share size={13}/> Share</button>
          </div>
        </div>
      </div>
    </section>

    {/* Hero image */}
    <section style={{ padding: '40px 40px', maxWidth: 1160, margin: '0 auto', width: '100%' }}>
      <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
        <ImagePlaceholder tone="orange" h={380} label="ARCHITECTURE · KG + VECTOR RETRIEVAL"/>
      </div>
    </section>

    {/* Body + TOC */}
    <section style={{ padding: '0 40px 64px', maxWidth: 1160, margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: '1fr 220px', gap: 60 }}>
      <article style={{ fontSize: 17, color: 'var(--ink)', lineHeight: 1.7, maxWidth: 680 }}>
        <p style={{ marginTop: 0, fontSize: 21, lineHeight: 1.5, color: 'var(--fg)', fontFamily: 'var(--font-serif)', fontStyle: 'italic', borderLeft: '3px solid var(--accent)', paddingLeft: 20, marginLeft: -23 }}>
          Retrieval-augmented generation is easy when your corpus is flat. It breaks the moment your questions require reasoning across relationships.
        </p>
        <p>"Which of our customers are exposed to a supplier whose parent company is sanctioned?" No amount of similarity search will surface that answer. You need a graph. And you need the LLM to <em>see</em> the graph.</p>
        <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6, marginTop: 48, color: 'var(--ink)' }}>What we're building</h2>
        <p>A retrieval pipeline that, given a user query, does four things in under 300ms:</p>
        <ul style={{ paddingLeft: 22, lineHeight: 1.8 }}>
          <li>Embeds the query and surfaces candidate <em>entry nodes</em>.</li>
          <li>Expands a subgraph around each entry up to a depth set by the question type.</li>
          <li>Scores every path by a learned recency/relevance kernel.</li>
          <li>Serializes top-k paths as structured context for the LLM.</li>
        </ul>

        {/* Code block */}
        <div style={{ marginTop: 32, border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--ink)', color: 'var(--paper)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.12)', fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.6)' }}>
            <span style={{ color: 'var(--accent)' }}>GSQL</span>
            <span>rag_expand.gsql</span>
            <span style={{ marginLeft: 'auto', cursor: 'pointer' }}>copy</span>
          </div>
          <pre style={{ margin: 0, padding: 20, fontFamily: 'var(--font-mono)', fontSize: 13, lineHeight: 1.65, overflow: 'auto' }}>
{`CREATE QUERY rag_expand(SET<VERTEX> seeds, INT depth = 2) {
  SumAccum<FLOAT>   @score = 0;
  MapAccum<VERTEX, FLOAT> @@paths;

  Start = {seeds};
  FOREACH d IN RANGE[1, depth] DO
    Start = SELECT t FROM Start:s -(MENTIONS|RELATES_TO)- Entity:t
            ACCUM  t.@score += s.@score * exp(-0.2 * d),
                   @@paths += (t -> t.@score);
  END;

  PRINT @@paths ORDER BY $2 DESC LIMIT 20;
}`}
          </pre>
        </div>

        {/* Playground CTA */}
        <div style={{ marginTop: 40, padding: 24, borderRadius: 14, background: 'var(--cream)', border: '1px solid var(--border)', display: 'flex', gap: 20, alignItems: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: 28, background: 'var(--accent)', color: 'var(--accent-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icons.Terminal size={24}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--ink)', marginBottom: 4, letterSpacing: -0.2 }}>Try this in the playground</div>
            <div style={{ fontSize: 13.5, color: 'var(--fg-muted)' }}>One click — no install, pre-loaded with a 2.4M-node knowledge graph.</div>
          </div>
          <button style={{ padding: '11px 18px', borderRadius: 999, border: 'none', background: 'var(--ink)', color: 'var(--paper)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>Open <Icons.Arrow size={14}/></button>
        </div>

        <h2 style={{ fontSize: 28, fontWeight: 600, letterSpacing: -0.6, marginTop: 48, color: 'var(--ink)' }}>Schema design, briefly</h2>
        <p>Entities are nouns. Relations are verbs. If you can't defend why an edge exists, it doesn't exist. Start small — you will add more edges than you remove.</p>
      </article>

      {/* TOC */}
      <aside style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--fg-subtle)', marginBottom: 14 }}>ON THIS PAGE</div>
        {['Why this tutorial', 'What we\'re building', 'Schema design', 'Entity linker', 'Subgraph expansion', 'Scoring the paths', 'Evaluating recall', 'Deploying to prod'].map((s, i) => (
          <div key={s} style={{ padding: '7px 0 7px 14px', color: i === 1 ? 'var(--ink)' : 'var(--fg-muted)', borderLeft: i === 1 ? '2px solid var(--accent)' : '2px solid var(--border)', marginLeft: -2, fontSize: 13, fontWeight: i === 1 ? 600 : 400, cursor: 'pointer' }}>{s}</div>
        ))}
        <div style={{ marginTop: 24, padding: 16, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-elev)' }}>
          <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', letterSpacing: 1.8, color: 'var(--fg-subtle)', marginBottom: 10 }}>READERS</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginBottom: 6, color: 'var(--ink)' }}>
            <Icons.Heart size={13} style={{ color: 'var(--accent)' }}/> 1,247 loved this
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink)' }}>
            <Icons.Chat size={13} style={{ color: 'var(--fg-muted)' }}/> 64 comments
          </div>
        </div>
      </aside>
    </section>

    {/* Up next */}
    <section style={{ background: 'var(--cream)', padding: '56px 40px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto' }}>
        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 6 }}>UP NEXT</div>
        <h2 style={{ fontSize: 34, fontWeight: 500, letterSpacing: -1, margin: '0 0 28px', color: 'var(--ink)' }}>
          Keep <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>going.</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { tag: 'GENAI', t: 'Evaluating graph retrieval with RAGAS', time: '22 min' },
            { tag: 'GENAI', t: 'Using tool-calling LLMs as graph agents', time: '35 min' },
            { tag: 'OPS', t: 'Serving embeddings alongside graph queries', time: '18 min' },
          ].map((n, i) => (
            <div key={i} style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, cursor: 'pointer' }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 1.8, color: 'var(--accent)', marginBottom: 10 }}>{n.tag}</div>
              <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3, letterSpacing: -0.2, marginBottom: 14 }}>{n.t}</div>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)' }}>{n.time}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  </VarB_Shell>
);

// ─────────────────────────── SHOWCASE ───────────────────────────
const VarB_Page_Showcase = ({ isDark, onToggleTheme }) => {
  const hero = { name: 'kg-chatbot-kit', by: 'Nadia Osei', stars: 1124, desc: 'LangChain toolkit for building chatbots grounded in TigerGraph knowledge graphs. Includes a query planner that knows when to vector, when to traverse.', lang: 'Python', tags: ['genai', 'rag', 'langchain'] };
  const projs = [
    { name: 'graph-of-arxiv', by: 'Alex Nguyen', stars: 842, desc: 'Citation graph of 2.4M papers with semantic clustering.', lang: 'Python', tags: ['academia', 'viz'], tone: 'orange' },
    { name: 'gsql-lsp', by: 'Elena Ruiz', stars: 517, desc: 'Language server for GSQL — hover, defs, completions.', lang: 'TypeScript', tags: ['devtool', 'lsp'], tone: 'warm' },
    { name: 'tg-terraform', by: 'Samir Patel', stars: 298, desc: 'Terraform provider for TigerGraph Cloud.', lang: 'Go', tags: ['ops', 'iac'], tone: 'orange' },
    { name: 'graphql-bridge', by: 'Tom Becker', stars: 412, desc: 'Auto-generate GraphQL schema from your TG schema.', lang: 'TypeScript', tags: ['graphql', 'api'], tone: 'warm' },
    { name: 'tg-pandas', by: 'Mia Chen', stars: 689, desc: 'Pandas-style DataFrame interface for TG queries.', lang: 'Python', tags: ['dataframes'], tone: 'orange' },
    { name: 'graph-viz-3d', by: 'Kai Zhou', stars: 234, desc: 'Three.js-powered 3D graph explorer — works in-browser.', lang: 'TypeScript', tags: ['viz', 'threejs'], tone: 'warm' },
  ];
  return (
    <VarB_Shell isDark={isDark} onToggleTheme={onToggleTheme} active="Showcase">
      <section style={{ padding: '64px 40px 32px', maxWidth: 1160, margin: '0 auto', width: '100%' }}>
        <SectionHeader
          kicker="/ SHOWCASE"
          title="Built by the"
          italic="community."
          sub="1,207 projects and counting. Fork, star, or submit your own — weekend hacks more than welcome."
          right={
            <button style={{ padding: '12px 20px', borderRadius: 999, border: 'none', background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', flexShrink: 0 }}>
              <Icons.Plus size={15}/> Submit a project
            </button>
          }
        />
      </section>

      {/* Featured hero project */}
      <section style={{ padding: '0 40px 32px', maxWidth: 1160, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 0, border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', background: 'var(--bg-elev)' }}>
          <div style={{ position: 'relative', minHeight: 320 }}>
            <ImagePlaceholder tone="orange" h="100%" label="PROJECT OF THE WEEK"/>
          </div>
          <div style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 12 }}>PROJECT OF THE WEEK</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 26, fontWeight: 600, color: 'var(--ink)', marginBottom: 10, letterSpacing: -0.6 }}>{hero.name}</div>
            <p style={{ fontSize: 15, color: 'var(--fg-muted)', lineHeight: 1.6, marginBottom: 22 }}>{hero.desc}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
              <Avatar name={hero.by} size={32}/>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{hero.by}</div>
                <div style={{ fontSize: 12, color: 'var(--fg-subtle)', fontFamily: 'var(--font-mono)' }}>maintainer · since 2024</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 14, fontSize: 13, color: 'var(--fg-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icons.Star size={13}/> {hero.stars}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Icons.Branch size={13}/> 89</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ padding: '11px 18px', borderRadius: 999, border: 'none', background: 'var(--ink)', color: 'var(--paper)', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}><Icons.Github size={14}/> View on GitHub</button>
              <button style={{ padding: '11px 18px', borderRadius: 999, border: '1px solid var(--border-strong)', background: 'transparent', color: 'var(--fg)', fontSize: 13.5, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>Read the writeup</button>
            </div>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section style={{ padding: '24px 40px 16px', maxWidth: 1160, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingBottom: 20, borderBottom: '1px solid var(--border)', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All 1,207', 'Trending', 'New', 'Most starred', 'Official'].map((t, i) => (
              <button key={t} style={{
                padding: '7px 14px', fontSize: 13, borderRadius: 999,
                background: i === 0 ? 'var(--ink)' : 'var(--bg-elev)',
                color: i === 0 ? 'var(--paper)' : 'var(--fg-muted)',
                border: '1px solid ' + (i === 0 ? 'var(--ink)' : 'var(--border)'),
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
              }}>{t}</button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)', letterSpacing: 1.2, marginRight: 4 }}>TAGS</span>
            {['genai', 'ops', 'devtool', 'analytics', 'viz'].map(t => (
              <span key={t} style={{ padding: '5px 12px', fontSize: 11.5, fontFamily: 'var(--font-mono)', border: '1px solid var(--border)', borderRadius: 999, color: 'var(--fg-muted)', cursor: 'pointer' }}>#{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section style={{ padding: '16px 40px 64px', maxWidth: 1160, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {projs.map((p) => (
            <div key={p.name} style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer' }}>
              <ImagePlaceholder tone={p.tone} h={160}/>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--fg-subtle)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icons.Star size={12}/>{p.stars}
                  </div>
                </div>
                <div style={{ fontSize: 13.5, color: 'var(--fg-muted)', lineHeight: 1.5, marginBottom: 14 }}>{p.desc}</div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
                  {p.tags.map(t => <span key={t} style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', padding: '2px 8px', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 999, color: 'var(--fg-muted)' }}>#{t}</span>)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--fg-muted)', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                  <Avatar name={p.by} size={20}/> <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{p.by}</span>
                  <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'var(--font-mono)', fontSize: 11.5 }}>
                    <span style={{ width: 8, height: 8, borderRadius: 4, background: p.lang === 'Python' ? '#3776AB' : p.lang === 'TypeScript' ? '#3178C6' : '#00ADD8' }}/>{p.lang}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </VarB_Shell>
  );
};

// ─────────────────────────── EVENTS ───────────────────────────
const VarB_Page_Events = ({ isDark, onToggleTheme }) => {
  const featured = { d: 'APR 28', time: '10:00 PT', t: 'Graph + LLMs: building retrieval you can actually reason about', type: 'Webinar', attendees: 412, with: 'Soyeon Park, Marcus Lin', desc: 'A 60-minute working session with the GSQL Copilot team. Bring hard questions, we\'ll debug them live.' };
  const upcoming = [
    { d: 'MAY 14', t: 'TigerGraph Meetup — New York', where: 'Brooklyn · in person', attendees: 86, type: 'MEETUP' },
    { d: 'MAY 22', t: 'Office hours with the GSQL core team', where: 'Virtual · Q&A', attendees: 201, type: 'Q&A' },
    { d: 'JUN 03', t: 'Hackathon: build-a-knowledge-graph weekend', where: 'Hybrid · $5k prizes', attendees: 124, type: 'HACK' },
    { d: 'JUN 18', t: 'Graph ML study group — Hamilton et al., ch. 5', where: 'Virtual · book club', attendees: 56, type: 'STUDY' },
    { d: 'JUL 09', t: 'TigerGraph Meetup — London', where: 'Shoreditch · in person', attendees: 42, type: 'MEETUP' },
  ];
  const past = [
    { d: 'APR 14', t: 'Fraud detection patterns with TigerGraph', views: '2.4k' },
    { d: 'APR 02', t: 'Schema design masterclass with the core team', views: '3.8k' },
    { d: 'MAR 21', t: 'Supply chain graphs in production — 40k parts', views: '1.9k' },
  ];
  return (
    <VarB_Shell isDark={isDark} onToggleTheme={onToggleTheme} active="Events">
      <section style={{ padding: '64px 40px 40px', maxWidth: 1160, margin: '0 auto', width: '100%' }}>
        <SectionHeader
          kicker="/ EVENTS"
          title="Come hang out"
          italic="with us."
          sub="Weekly office hours, monthly meetups in your city, hackathons every quarter. All free, mostly caffeinated."
          right={
            <button style={{ padding: '12px 20px', borderRadius: 999, border: '1px solid var(--border-strong)', background: 'var(--bg-elev)', color: 'var(--fg)', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'inherit', flexShrink: 0 }}>
              <Icons.Calendar size={15}/> Subscribe to calendar
            </button>
          }
        />
      </section>

      {/* Featured event hero */}
      <section style={{ padding: '0 40px 48px', maxWidth: 1160, margin: '0 auto', width: '100%' }}>
        <div style={{ position: 'relative', background: 'var(--ink)', color: 'var(--paper)', borderRadius: 16, overflow: 'hidden', padding: '48px 52px', minHeight: 320 }}>
          <GraphMotif density={1} opacity={0.45} seed={19}/>
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '160px 1fr auto', gap: 40, alignItems: 'center' }}>
            <div style={{ textAlign: 'center', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 14, padding: '18px 12px', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 1.8, color: 'var(--accent)', fontWeight: 600 }}>{featured.d.split(' ')[0]}</div>
              <div style={{ fontSize: 56, fontWeight: 500, fontFamily: 'var(--font-serif)', fontStyle: 'italic', letterSpacing: -1, marginTop: 2 }}>{featured.d.split(' ')[1]}</div>
              <div style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.6)', marginTop: 8 }}>{featured.time}</div>
            </div>
            <div style={{ maxWidth: 520 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 1.5, color: 'var(--accent)', marginBottom: 14, padding: '4px 10px', border: '1px solid var(--accent)', borderRadius: 999, fontWeight: 600 }}>
                <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent)' }}/>
                THIS WEEK · {featured.type.toUpperCase()}
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 500, lineHeight: 1.15, letterSpacing: -0.8, margin: 0 }}>{featured.t}</h2>
              <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, marginTop: 14 }}>{featured.desc}</p>
              <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'rgba(255,255,255,0.65)' }}>
                <div style={{ display: 'flex' }}>
                  {['Soyeon', 'Marcus'].map((n, i) => <div key={n} style={{ marginLeft: i ? -6 : 0, border: '2px solid var(--ink)', borderRadius: 16 }}><Avatar name={n} size={26}/></div>)}
                </div>
                <span>with {featured.with}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button style={{ padding: '14px 26px', borderRadius: 999, border: 'none', background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>RSVP · free <Icons.Arrow size={15}/></button>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-mono)', marginTop: 10 }}>{featured.attendees} going</div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming list */}
      <section style={{ padding: '0 40px 64px', maxWidth: 1160, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 40 }}>
          <div>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 6 }}>UPCOMING</div>
            <h2 style={{ fontSize: 28, fontWeight: 500, letterSpacing: -0.8, margin: '0 0 24px', color: 'var(--ink)' }}>Next <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>few months</span></h2>
            <div style={{ borderTop: '1px solid var(--border)' }}>
              {upcoming.map((e, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '90px 1fr auto', gap: 24, alignItems: 'center',
                  padding: '24px 4px', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                }}>
                  <div>
                    <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', letterSpacing: 1.2, color: 'var(--accent)', fontWeight: 600 }}>{e.d.split(' ')[0]}</div>
                    <div style={{ fontSize: 32, fontWeight: 500, fontFamily: 'var(--font-serif)', fontStyle: 'italic', letterSpacing: -1, color: 'var(--ink)' }}>{e.d.split(' ')[1]}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', letterSpacing: 1.5, color: 'var(--fg-subtle)', marginBottom: 6 }}>{e.type}</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--ink)', letterSpacing: -0.3, lineHeight: 1.3, marginBottom: 6 }}>{e.t}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>{e.where} · {e.attendees} going</div>
                  </div>
                  <button style={{ padding: '9px 16px', borderRadius: 999, border: '1px solid var(--border-strong)', background: 'var(--bg-elev)', color: 'var(--fg)', cursor: 'pointer', fontSize: 12.5, fontWeight: 500, fontFamily: 'inherit' }}>RSVP</button>
                </div>
              ))}
            </div>
          </div>

          {/* sidebar */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ padding: 22, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 14 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 12 }}>HOST YOUR OWN</div>
              <div style={{ fontSize: 20, fontWeight: 500, color: 'var(--ink)', letterSpacing: -0.3, lineHeight: 1.3, marginBottom: 10, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                Start a meetup in your city.
              </div>
              <p style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.5, margin: 0 }}>We'll help with venue, snacks, and speakers. Just bring the community.</p>
              <button style={{ marginTop: 16, padding: '10px 18px', borderRadius: 999, border: 'none', background: 'var(--ink)', color: 'var(--paper)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Apply to host →</button>
            </div>

            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--fg-subtle)', marginBottom: 12 }}>PAST · WATCH ON DEMAND</div>
              {past.map((p, i) => (
                <div key={i} style={{ padding: '12px 0', borderTop: i ? '1px solid var(--border)' : '1px solid var(--border)', cursor: 'pointer' }}>
                  <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)', letterSpacing: 1.2, marginBottom: 4 }}>{p.d}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--ink)', lineHeight: 1.35, marginBottom: 4 }}>{p.t}</div>
                  <div style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icons.Play size={10}/> {p.views} views
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </VarB_Shell>
  );
};

// ─────────────────────────── PROFILE ───────────────────────────
const VarB_Page_Profile = ({ isDark, onToggleTheme }) => {
  const cells = Array.from({ length: 7 * 26 }, (_, i) => {
    const x = (i * 2654435761) % 100;
    return x < 50 ? 0 : x < 70 ? 1 : x < 85 ? 2 : x < 95 ? 3 : 4;
  });
  return (
    <VarB_Shell isDark={isDark} onToggleTheme={onToggleTheme} active="Forum">
      {/* editorial banner */}
      <section style={{ position: 'relative', background: 'var(--cream)', borderBottom: '1px solid var(--border)', overflow: 'hidden' }}>
        <GraphMotif density={0.9} opacity={0.4} seed={27}/>
        <div style={{ position: 'relative', maxWidth: 1160, margin: '0 auto', padding: '64px 40px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 28 }}>
            <div style={{ padding: 5, background: 'var(--paper)', borderRadius: 72 }}>
              <Avatar name="Soyeon Park" size={108}/>
            </div>
            <div style={{ flex: 1, paddingBottom: 8 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 10 }}>CONTRIBUTOR · TG TEAM</div>
              <h1 style={{ fontSize: 52, fontWeight: 500, letterSpacing: -1.8, margin: 0, color: 'var(--ink)', lineHeight: 1 }}>
                Soyeon <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Park</span>
              </h1>
              <div style={{ fontSize: 14, color: 'var(--fg-muted)', marginTop: 10, fontFamily: 'var(--font-mono)' }}>@soyeon · Principal Engineer · Seoul → SF · joined Mar 2024</div>
            </div>
            <div style={{ display: 'flex', gap: 8, paddingBottom: 8 }}>
              <button style={{ padding: '11px 20px', borderRadius: 999, border: 'none', background: 'var(--ink)', color: 'var(--paper)', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'inherit' }}>Follow</button>
              <button style={{ padding: '11px 20px', borderRadius: 999, border: '1px solid var(--border-strong)', background: 'var(--bg-elev)', color: 'var(--fg)', cursor: 'pointer', fontSize: 14, fontWeight: 500, fontFamily: 'inherit' }}>Message</button>
            </div>
          </div>

          {/* stat row */}
          <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0 }}>
            {[['8,420', 'reputation'], ['142', 'answers'], ['24', 'tutorials'], ['6', 'projects']].map(([k, v], i) => (
              <div key={v} style={{ borderLeft: i ? '1px solid var(--border)' : 'none', paddingLeft: i ? 24 : 0 }}>
                <div style={{ fontSize: 40, fontWeight: 500, fontFamily: 'var(--font-serif)', fontStyle: 'italic', letterSpacing: -1, color: 'var(--ink)', lineHeight: 1 }}>{k}</div>
                <div style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)', letterSpacing: 1.2, marginTop: 6 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 40px 64px', maxWidth: 1160, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 40 }}>
          <div>
            {/* contribution grid */}
            <div style={{ padding: 24, border: '1px solid var(--border)', borderRadius: 14, background: 'var(--bg-elev)', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 4 }}>ACTIVITY</div>
                  <div style={{ fontSize: 22, fontWeight: 500, color: 'var(--ink)', letterSpacing: -0.4 }}>
                    <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>2,314</span> contributions this year
                  </div>
                </div>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)' }}>longest streak: 84 days</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(26, 1fr)', gridAutoRows: '12px', gap: 3 }}>
                {cells.map((v, i) => (
                  <div key={i} style={{ background: v === 0 ? 'var(--cream)' : `color-mix(in oklab, var(--accent) ${25 + v * 20}%, var(--paper))`, borderRadius: 2 }}/>
                ))}
              </div>
              <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, color: 'var(--fg-subtle)', fontFamily: 'var(--font-mono)' }}>
                less
                {[0, 1, 2, 3, 4].map(v => <div key={v} style={{ width: 12, height: 12, borderRadius: 2, background: v === 0 ? 'var(--cream)' : `color-mix(in oklab, var(--accent) ${25 + v * 20}%, var(--paper))` }}/>)}
                more
              </div>
            </div>

            {/* recent activity */}
            <div style={{ border: '1px solid var(--border)', borderRadius: 14, background: 'var(--bg-elev)' }}>
              <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)' }}>RECENT ACTIVITY</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {['All', 'Answers', 'Posts', 'Starred'].map((t, i) => (
                    <button key={t} style={{ padding: '4px 10px', fontSize: 11.5, borderRadius: 999, background: i === 0 ? 'var(--ink)' : 'transparent', color: i === 0 ? 'var(--paper)' : 'var(--fg-muted)', border: '1px solid ' + (i === 0 ? 'var(--ink)' : 'var(--border)'), cursor: 'pointer', fontFamily: 'inherit' }}>{t}</button>
                  ))}
                </div>
              </div>
              {[
                { type: 'ANSWERED', t: 'Traversing a heterogeneous graph with time-decayed edge weights', when: '12m ago', accepted: true, votes: 18 },
                { type: 'PUBLISHED', t: 'Grounding an LLM in a knowledge graph you can actually trust', when: '3d ago', votes: 247 },
                { type: 'COMMENTED', t: 'The case for property graphs over RDF in 2026', when: '5d ago', votes: 12 },
                { type: 'STARRED', t: 'graph-of-arxiv by Alex Nguyen', when: '1w ago' },
                { type: 'ANSWERED', t: 'Query planner ignores my hint on large fan-out — reproducible', when: '1w ago', accepted: true, votes: 31 },
              ].map((a, i) => (
                <div key={i} style={{ padding: '18px 22px', borderTop: i ? '1px solid var(--border)' : 'none', display: 'grid', gridTemplateColumns: '100px 1fr auto', gap: 16, alignItems: 'center' }}>
                  <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', letterSpacing: 1.2, color: a.type === 'ANSWERED' ? 'var(--success)' : 'var(--fg-subtle)', fontWeight: 600 }}>{a.type}</div>
                  <div style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 500, lineHeight: 1.4 }}>
                    {a.t}
                    {a.accepted && <Icons.Check size={13} style={{ color: 'var(--success)', marginLeft: 6, verticalAlign: 'middle' }}/>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: 'var(--fg-subtle)', fontFamily: 'var(--font-mono)' }}>
                    {a.votes && <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Icons.Heart size={11}/>{a.votes}</span>}
                    <span>{a.when}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* right rail */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ padding: 20, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 14 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 10 }}>BIO</div>
              <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                "Building GSQL Copilot. Graph algorithms nerd. Former academia. Reply fast if you ping me."
              </p>
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', gap: 10 }}>
                <a style={{ color: 'var(--fg-muted)', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 4 }}><Icons.Github size={14}/> soyeon</a>
                <a style={{ color: 'var(--fg-muted)', fontSize: 12.5, display: 'flex', alignItems: 'center', gap: 4 }}><Icons.Globe size={14}/> soyeon.dev</a>
              </div>
            </div>

            <div style={{ padding: 20, background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 14 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--fg-subtle)', marginBottom: 14 }}>BADGES EARNED</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[['First 100', 'var(--accent)'], ['Core team', 'var(--ink)'], ['Top writer \'25', 'var(--accent)'], ['10k rep', 'var(--ink)'], ['Patron', 'var(--accent)'], ['Helpful × 50', 'var(--ink)']].map(([b, c]) => (
                  <div key={b} style={{ fontSize: 11.5, padding: '5px 12px', background: c, color: c === 'var(--ink)' ? 'var(--paper)' : 'var(--accent-fg)', borderRadius: 999, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>{b}</div>
                ))}
              </div>
            </div>

            <div style={{ padding: 20, background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 14 }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--fg-subtle)', marginBottom: 12 }}>TOP TAGS</div>
              {['gsql', 'genai', 'accumulators', 'performance', 'schema-design'].map((t, i) => (
                <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, padding: '8px 0', borderTop: i ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--ink)' }}>#{t}</span>
                  <span style={{ fontSize: 12, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--accent)' }}>{[142, 98, 64, 51, 39][i]}</span>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </VarB_Shell>
  );
};

Object.assign(window, { VarB_Page_Forum, VarB_Page_Tutorial, VarB_Page_Showcase, VarB_Page_Events, VarB_Page_Profile });
