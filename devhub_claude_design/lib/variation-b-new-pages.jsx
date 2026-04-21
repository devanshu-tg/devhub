// New DevHub pages — Resources, AI Chat, Pathfinder, My Learning, Event Detail/Gallery
// All in the warm editorial Variation B style. Reuse VarB_Shell for consistent chrome.

// ─────────────────────────── RESOURCES ───────────────────────────
// One wall · all videos, courses, docs, blogs, tutorials — unified filter.
const VarB_Page_Resources = ({ isDark, onToggleTheme }) => {
  const types = [
    { k: 'all', l: 'Everything', n: 428, icon: 'Compass' },
    { k: 'video', l: 'Videos', n: 84, icon: 'Play' },
    { k: 'course', l: 'Courses', n: 32, icon: 'Compass' },
    { k: 'tutorial', l: 'Tutorials', n: 146, icon: 'Book' },
    { k: 'doc', l: 'Docs', n: 112, icon: 'Book' },
    { k: 'blog', l: 'Blog posts', n: 54, icon: 'Book' },
  ];
  const [active, setActive] = React.useState('all');

  const resources = [
    { type: 'course', badge: 'COURSE', title: 'Graph Databases 101 — from zero to first query', desc: 'A 6-lesson on-ramp. By the end you can model a schema and write GSQL that compiles.', meta: '6 lessons · 2h 40m', level: 'Beginner', by: 'TG Academy', tone: 'orange', icon: 'Compass' },
    { type: 'video', badge: 'VIDEO', title: 'Office hours: debugging query plans with the core team', desc: 'Live 45-minute session. Three real queries torn apart and rebuilt on-stream.', meta: '45 min · Apr 2', level: 'Intermediate', by: 'Marcus Lin', tone: 'warm', icon: 'Play' },
    { type: 'tutorial', badge: 'TUTORIAL', title: 'Grounding an LLM in a knowledge graph you can actually trust', desc: 'Combine vector search with graph traversal. Production pipeline in under 300ms.', meta: '40 min read', level: 'Advanced', by: 'Soyeon Park', tone: 'orange', icon: 'Book' },
    { type: 'doc', badge: 'DOCS', title: 'GSQL language reference — Accumulators', desc: 'Canonical reference. All built-in accumulator types with semantics and examples.', meta: 'reference', level: 'All levels', by: 'TG Docs', tone: 'warm', icon: 'Book' },
    { type: 'blog', badge: 'BLOG', title: 'The case for property graphs over RDF in 2026', desc: 'Pick your model before you pick your engine. Honest take from someone who\'s run both.', meta: '12 min read', level: 'Intermediate', by: 'Marcus Lin', tone: 'warm', icon: 'Book' },
    { type: 'course', badge: 'COURSE', title: 'Graph ML with TigerGraph — node, edge, graph embeddings', desc: 'Practical ML on graphs. Node2Vec, GraphSAGE, and when to use neither.', meta: '9 lessons · 4h 10m', level: 'Advanced', by: 'TG Academy', tone: 'orange', icon: 'Compass' },
    { type: 'video', badge: 'VIDEO', title: 'Fraud detection patterns — 15 minutes, one whiteboard', desc: 'Ring detection, velocity rules, and why your graph is better than your rules engine.', meta: '15 min · Mar 21', level: 'Intermediate', by: 'Diego Martínez', tone: 'orange', icon: 'Play' },
    { type: 'tutorial', badge: 'TUTORIAL', title: 'Schema design masterclass — heterogeneous graphs that scale', desc: 'What changes when you go from 10 vertex types to 100. Real lessons, real regret.', meta: '28 min read', level: 'Advanced', by: 'Elena Ruiz', tone: 'warm', icon: 'Book' },
    { type: 'doc', badge: 'DOCS', title: 'Cloud Quickstart — spin up a free instance in 3 clicks', desc: 'Zero-install. Pre-loaded LDBC social network. Connect your notebook in 90 seconds.', meta: 'quickstart', level: 'Beginner', by: 'TG Docs', tone: 'orange', icon: 'Book' },
  ];

  const filtered = active === 'all' ? resources : resources.filter(r => r.type === active);

  return (
    <VarB_Shell isDark={isDark} onToggleTheme={onToggleTheme} active="Resources">
      <section style={{ padding: '56px 40px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <SectionHeader
          kicker="/ RESOURCES"
          title="Everything you need,"
          italic="in one wall."
          sub="Videos, courses, docs, tutorials, blog posts. Filter by type or level, or just scroll until something catches your eye."
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 999, padding: '10px 18px', minWidth: 320, flexShrink: 0 }}>
              <Icons.Search size={15}/>
              <input placeholder="Search 428 resources…" style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13.5, color: 'var(--fg)', outline: 'none', fontFamily: 'inherit' }}/>
              <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, padding: '1px 6px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--fg-muted)' }}>⌘K</kbd>
            </div>
          }
        />
      </section>

      {/* Type filter chips */}
      <section style={{ padding: '0 40px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {types.map(t => {
            const Ic = Icons[t.icon];
            const on = active === t.k;
            return (
              <button key={t.k} onClick={() => setActive(t.k)} style={{
                padding: '9px 16px', fontSize: 13, borderRadius: 999,
                background: on ? 'var(--ink)' : 'var(--bg-elev)',
                color: on ? 'var(--paper)' : 'var(--fg-muted)',
                border: '1px solid ' + (on ? 'var(--ink)' : 'var(--border)'),
                cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                <Ic size={13}/>{t.l}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, opacity: 0.7, marginLeft: 2 }}>{t.n}</span>
              </button>
            );
          })}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)', letterSpacing: 1.2 }}>LEVEL</span>
            {['All', 'Beginner', 'Intermediate', 'Advanced'].map((l, i) => (
              <button key={l} style={{
                padding: '6px 12px', fontSize: 12, borderRadius: 999,
                background: i === 0 ? 'var(--cream)' : 'transparent',
                color: i === 0 ? 'var(--ink)' : 'var(--fg-muted)',
                border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500,
              }}>{l}</button>
            ))}
          </div>
        </div>
      </section>

      {/* Resource grid */}
      <section style={{ padding: '8px 40px 64px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {filtered.map((r, i) => {
            const Ic = Icons[r.icon];
            return (
              <article key={i} style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', height: 160 }}>
                  <ImagePlaceholder tone={r.tone} h="100%"/>
                  <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 999, fontSize: 10.5, fontFamily: 'var(--font-mono)', letterSpacing: 1.5, color: 'var(--ink)', fontWeight: 600 }}>
                    <Ic size={11}/> {r.badge}
                  </div>
                  <button style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 999, border: '1px solid var(--border)', background: 'var(--paper)', color: 'var(--fg-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icons.Bookmark size={13}/>
                  </button>
                </div>
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3, margin: 0, letterSpacing: -0.2, marginBottom: 8 }}>{r.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.5, margin: 0, marginBottom: 16, flex: 1 }}>{r.desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
                    <span>{r.meta}</span>
                    <span>·</span>
                    <span style={{ color: 'var(--accent)' }}>{r.level}</span>
                    <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Avatar name={r.by} size={18}/>
                      <span style={{ color: 'var(--fg-muted)', fontFamily: 'inherit', fontSize: 12 }}>{r.by}</span>
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <button style={{ padding: '12px 24px', fontSize: 13.5, borderRadius: 999, border: '1px solid var(--border-strong)', background: 'var(--bg-elev)', color: 'var(--fg)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>Load 419 more →</button>
        </div>
      </section>
    </VarB_Shell>
  );
};


// ─────────────────────────── AI CHAT ───────────────────────────
// Two modes: Learning (guided paths, quizzes, drills) + Q&A (ask anything).
const VarB_Page_AIChat = ({ isDark, onToggleTheme }) => {
  const [mode, setMode] = React.useState('learning');

  const learningConversation = [
    { role: 'ai', content: (
      <div>
        <div style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 19, color: 'var(--ink)', marginBottom: 10, lineHeight: 1.4 }}>
          Welcome back, Priya. Last time we covered accumulators — ready to go deeper?
        </div>
        <p style={{ margin: 0, fontSize: 14.5, color: 'var(--fg-muted)', lineHeight: 1.6 }}>I'll pick up where we left off. Today's lesson is about <strong style={{ color: 'var(--ink)' }}>traversal patterns with SELECT-FROM-ACCUM</strong>. I'll show you the pattern, then hand you a small exercise.</p>
      </div>
    )},
    { role: 'user', content: 'Okay, let\'s do it. Go slow though — I got confused last time.' },
    { role: 'ai', content: (
      <div>
        <p style={{ margin: 0, fontSize: 14.5, color: 'var(--fg)', lineHeight: 1.65 }}>Deal. Here's the mental model in one sentence: <strong>SELECT walks the graph, ACCUM runs code for every edge you touch.</strong></p>
        <div style={{ marginTop: 12, padding: 16, background: 'var(--ink)', color: 'var(--paper)', borderRadius: 10, fontFamily: 'var(--font-mono)', fontSize: 12.5, lineHeight: 1.65 }}>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10.5, marginBottom: 8, letterSpacing: 1.2 }}>GSQL · tiny example</div>
          Start = {'{'}Person.*{'}'};<br/>
          Result = <span style={{ color: 'var(--accent)' }}>SELECT</span> p <span style={{ color: 'var(--accent)' }}>FROM</span> Start:s -(KNOWS)- Person:p<br/>
          &nbsp;&nbsp;<span style={{ color: 'var(--accent)' }}>ACCUM</span> p.@score += 1;
        </div>
        <p style={{ margin: '14px 0 0', fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.6 }}>Want me to explain each line, or shall I throw you a question?</p>
        <div style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button style={{ padding: '7px 14px', fontSize: 12.5, borderRadius: 999, background: 'var(--cream)', border: '1px solid var(--border)', color: 'var(--ink)', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 500 }}>Walk me through it</button>
          <button style={{ padding: '7px 14px', fontSize: 12.5, borderRadius: 999, background: 'var(--accent)', border: 'none', color: 'var(--accent-fg)', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 600 }}>Quiz me →</button>
          <button style={{ padding: '7px 14px', fontSize: 12.5, borderRadius: 999, background: 'var(--bg-elev)', border: '1px solid var(--border)', color: 'var(--fg-muted)', fontFamily: 'inherit', cursor: 'pointer', fontWeight: 500 }}>Show another example</button>
        </div>
      </div>
    )},
    { role: 'user', content: 'Quiz me.' },
    { role: 'ai', content: (
      <div>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 1.8, color: 'var(--accent)', marginBottom: 10, fontWeight: 600 }}>QUICK CHECK · 1 of 3</div>
        <p style={{ margin: 0, fontSize: 15, color: 'var(--ink)', lineHeight: 1.55, fontWeight: 500 }}>In the snippet above, what happens if I change <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--cream)', padding: '1px 6px', borderRadius: 4, fontSize: 13 }}>ACCUM</code> to <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--cream)', padding: '1px 6px', borderRadius: 4, fontSize: 13 }}>POST-ACCUM</code>?</p>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { l: 'A', t: 'It runs the code once per vertex instead of once per edge.' },
            { l: 'B', t: 'It runs the code after the traversal finishes, on the result set.' },
            { l: 'C', t: 'Nothing — POST-ACCUM is an alias for ACCUM.' },
            { l: 'D', t: 'The query fails to compile.' },
          ].map(o => (
            <button key={o.l} style={{ textAlign: 'left', padding: '12px 16px', background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 10, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ width: 24, height: 24, flexShrink: 0, borderRadius: 12, background: 'var(--cream)', border: '1px solid var(--border)', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{o.l}</span>
              <span style={{ fontSize: 13.5, color: 'var(--fg)', lineHeight: 1.5 }}>{o.t}</span>
            </button>
          ))}
        </div>
      </div>
    )},
  ];

  const qaConversation = [
    { role: 'user', content: 'My query times out on a 2-hop traversal with a LIMIT 20. What am I doing wrong?' },
    { role: 'ai', content: (
      <div>
        <p style={{ margin: 0, fontSize: 14.5, color: 'var(--fg)', lineHeight: 1.65 }}>Short answer: <strong>LIMIT doesn't prune the traversal, it prunes the output.</strong> You're still walking every edge before throwing most of them away.</p>
        <p style={{ margin: '12px 0 0', fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.6 }}>Three things to try, in order of effort:</p>
        <ol style={{ margin: '10px 0 0', paddingLeft: 20, fontSize: 13.5, color: 'var(--fg)', lineHeight: 1.75 }}>
          <li>Move the selectivity into a <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--cream)', padding: '0 5px', borderRadius: 3 }}>WHERE</code> clause on the first hop.</li>
          <li>Add a <code style={{ fontFamily: 'var(--font-mono)', background: 'var(--cream)', padding: '0 5px', borderRadius: 3 }}>HeapAccum</code> sized at 20 to bound the work early.</li>
          <li>If hop-1 is still huge, consider a pre-indexed "entry point" vertex type.</li>
        </ol>
        <div style={{ marginTop: 16, padding: 14, border: '1px solid var(--border)', borderRadius: 10, background: 'var(--cream)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--paper)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
            <Icons.Book size={15}/>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', letterSpacing: 1.5, color: 'var(--fg-subtle)', marginBottom: 2 }}>RECOMMENDED READING</div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>Bounded traversals with HeapAccum — 8 min read</div>
          </div>
          <Icons.Arrow size={14}/>
        </div>
      </div>
    )},
    { role: 'user', content: 'Option 2 worked. Can you explain why HeapAccum is faster than sorting afterward?' },
    { role: 'ai', content: (
      <div>
        <p style={{ margin: 0, fontSize: 14.5, color: 'var(--fg)', lineHeight: 1.65 }}>Because the heap keeps only the top-N as it goes. Sorting afterward means you materialize everything first — that's where the memory explodes on dense graphs.</p>
        <p style={{ margin: '12px 0 0', fontSize: 14, color: 'var(--fg-muted)', lineHeight: 1.6 }}>Rule of thumb: if you know N up front and N is small, heap. If you need the full sorted list, sort. For your 2-hop with LIMIT 20, heap wins by an order of magnitude.</p>
      </div>
    )},
  ];

  const convo = mode === 'learning' ? learningConversation : qaConversation;
  const suggestions = mode === 'learning'
    ? ['Continue where I left off', 'Test me on what I learned', 'Suggest a new topic', 'Show my progress']
    : ['How do I version a query?', 'Explain accumulators simply', 'Best schema for a social network', 'Debug my timeout'];

  return (
    <VarB_Shell isDark={isDark} onToggleTheme={onToggleTheme} active="AI Chat">
      {/* Header */}
      <section style={{ padding: '40px 40px 24px', maxWidth: 980, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 24, marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 6 }}>/ AI CHAT</div>
            <h1 style={{ fontSize: 38, fontWeight: 500, letterSpacing: -1.2, margin: 0, color: 'var(--ink)', lineHeight: 1.1 }}>
              Your AI guide to <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>mastering</span> graphs.
            </h1>
            <p style={{ fontSize: 14.5, color: 'var(--fg-muted)', marginTop: 10, maxWidth: 540, lineHeight: 1.55 }}>
              Two modes. <strong style={{ color: 'var(--ink)' }}>Learning</strong> walks you through concepts and quizzes you. <strong style={{ color: 'var(--ink)' }}>Q&amp;A</strong> answers anything you ask, with code and links back to resources.
            </p>
          </div>
          <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--fg-muted)' }}>
            <Avatar name="Priya Shah" size={28}/>
            <span style={{ fontFamily: 'var(--font-mono)' }}>devanshucodes</span>
          </div>
        </div>

        {/* Mode switcher — pill */}
        <div style={{ display: 'inline-flex', padding: 4, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 999, gap: 2 }}>
          {[
            { k: 'learning', l: 'Learning', ic: 'Compass', d: 'Guided, structured, with quizzes' },
            { k: 'qa', l: 'Q&A', ic: 'Sparkle', d: 'Ask anything, get an answer' },
          ].map(m => {
            const Ic = Icons[m.ic];
            const on = mode === m.k;
            return (
              <button key={m.k} onClick={() => setMode(m.k)} style={{
                padding: '10px 20px', fontSize: 13.5, borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                background: on ? 'var(--ink)' : 'transparent', color: on ? 'var(--paper)' : 'var(--fg-muted)',
                display: 'flex', alignItems: 'center', gap: 8, fontWeight: 500,
              }}>
                <Ic size={13}/>{m.l}
              </button>
            );
          })}
          <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', fontSize: 12, color: 'var(--fg-subtle)', fontFamily: 'var(--font-mono)' }}>
            {mode === 'learning' ? 'Guided · quizzes · remembers progress' : 'Ask anything · cites sources · no memory'}
          </div>
        </div>
      </section>

      {/* Conversation */}
      <section style={{ padding: '0 40px 20px', maxWidth: 980, margin: '0 auto', width: '100%' }}>
        <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: 'var(--fg-muted)' }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: 'var(--success)' }}/>
            <span style={{ fontFamily: 'var(--font-mono)', letterSpacing: 1.2 }}>
              {mode === 'learning' ? 'LESSON · traversals · session 3 of 8' : 'Q&A · new thread · no history saved'}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)' }}>haiku 4.5</span>
          </div>
          <div style={{ padding: '28px 28px 8px', display: 'flex', flexDirection: 'column', gap: 22 }}>
            {convo.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 14, flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ flexShrink: 0 }}>
                  {m.role === 'ai'
                    ? <div style={{ width: 36, height: 36, borderRadius: 18, background: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><Icons.Sparkle size={16}/></div>
                    : <Avatar name="Priya Shah" size={36}/>}
                </div>
                <div style={{
                  flex: m.role === 'user' ? '0 1 auto' : 1,
                  maxWidth: m.role === 'user' ? '72%' : '100%',
                  padding: m.role === 'user' ? '12px 18px' : 0,
                  background: m.role === 'user' ? 'var(--cream)' : 'transparent',
                  border: m.role === 'user' ? '1px solid var(--border)' : 'none',
                  borderRadius: m.role === 'user' ? 14 : 0,
                  fontSize: 14, color: 'var(--fg)', lineHeight: 1.55,
                }}>
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          {/* Composer */}
          <div style={{ padding: '16px 20px 20px', borderTop: '1px solid var(--border)', marginTop: 16 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {suggestions.map(s => (
                <button key={s} style={{ padding: '6px 12px', fontSize: 12, background: 'transparent', border: '1px dashed var(--border-strong)', borderRadius: 999, color: 'var(--fg-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>{s}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px 16px', background: 'var(--paper)', border: '1px solid var(--border-strong)', borderRadius: 12 }}>
              <Icons.Chat size={15} style={{ color: 'var(--fg-subtle)' }}/>
              <input placeholder={mode === 'learning' ? 'Answer the question, or ask me to explain it differently…' : 'Ask anything about TigerGraph, GSQL, graph algorithms…'} style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 14, color: 'var(--fg)', outline: 'none', fontFamily: 'inherit' }}/>
              <button style={{ width: 36, height: 36, borderRadius: 999, border: 'none', background: 'var(--accent)', color: 'var(--accent-fg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icons.Arrow size={15}/>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mode comparison strip */}
      <section style={{ padding: '8px 40px 56px', maxWidth: 980, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {[
            { on: mode === 'learning', ic: 'Compass', l: 'Learning mode', d: 'Remembers where you are in a path. Quizzes you. Sends you to the next lesson when you\'re ready.' },
            { on: mode === 'qa',       ic: 'Sparkle', l: 'Q&A mode',      d: 'No memory between threads. Cites docs and forum posts. Great for quick stuck-on-a-bug moments.' },
          ].map(c => {
            const Ic = Icons[c.ic];
            return (
              <div key={c.l} style={{ padding: 20, border: '1px solid ' + (c.on ? 'var(--accent)' : 'var(--border)'), borderRadius: 12, background: c.on ? 'var(--cream)' : 'var(--bg-elev)', display: 'flex', gap: 14 }}>
                <div style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 20, background: c.on ? 'var(--accent)' : 'var(--cream)', color: c.on ? 'var(--accent-fg)' : 'var(--fg-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ic size={18}/>
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>{c.l}</div>
                  <div style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.5 }}>{c.d}</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </VarB_Shell>
  );
};


// ─────────────────────────── PATHFINDER ───────────────────────────
// Short quiz → generated learning path stitched from existing resources.
const VarB_Page_Pathfinder = ({ isDark, onToggleTheme }) => {
  const step = 2; // mid-quiz screenshot
  const total = 5;
  return (
    <VarB_Shell isDark={isDark} onToggleTheme={onToggleTheme} active="Pathfinder">
      <section style={{ padding: '56px 40px 32px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 48, alignItems: 'flex-start' }}>
          {/* Left — intro */}
          <div>
            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 8 }}>/ PATHFINDER</div>
            <h1 style={{ fontSize: 48, fontWeight: 500, letterSpacing: -1.6, margin: 0, color: 'var(--ink)', lineHeight: 1.05 }}>
              Tell us what you're up to. We'll <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>build you a path.</span>
            </h1>
            <p style={{ fontSize: 16, color: 'var(--fg-muted)', lineHeight: 1.6, marginTop: 18, maxWidth: 480 }}>
              Answer 5 quick questions. Pathfinder stitches together courses, tutorials, videos, and docs from our library into a plan that matches your goal, level, and time budget.
            </p>

            <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { ic: 'Compass', t: 'Personalised', d: 'Built from your answers — no generic "learn GSQL in 30 days" stuff.' },
                { ic: 'Book',    t: 'Made from real resources', d: 'Every step is something you can actually click, read, or watch today.' },
                { ic: 'Check',   t: 'Tracks your progress', d: 'Saved to My Learning. Tick off as you go. Reshuffles if you stall.' },
              ].map(f => {
                const Ic = Icons[f.ic];
                return (
                  <div key={f.t} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                    <div style={{ width: 36, height: 36, flexShrink: 0, borderRadius: 18, background: 'var(--cream)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}><Ic size={15}/></div>
                    <div>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)' }}>{f.t}</div>
                      <div style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 2, lineHeight: 1.5 }}>{f.d}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — quiz card */}
          <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, boxShadow: '0 12px 40px rgba(28,24,21,.05)' }}>
            {/* Progress */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 1.8, color: 'var(--accent)', fontWeight: 600 }}>QUESTION {step} OF {total}</span>
              <div style={{ flex: 1, height: 3, background: 'var(--cream)', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${(step / total) * 100}%`, height: '100%', background: 'var(--accent)' }}/>
              </div>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)' }}>~2 min left</span>
            </div>

            <h2 style={{ fontSize: 24, fontWeight: 500, letterSpacing: -0.6, color: 'var(--ink)', margin: 0, lineHeight: 1.25 }}>
              What's the <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>one project</span> you want to ship with a graph?
            </h2>
            <p style={{ fontSize: 13, color: 'var(--fg-muted)', marginTop: 10 }}>Pick the closest — we'll tune the path around it.</p>

            <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: 'A', t: 'A recommendation engine', d: 'Similar items, collaborative filtering', on: false },
                { l: 'B', t: 'Fraud or anomaly detection', d: 'Rings, unusual paths, risk scoring', on: true },
                { l: 'C', t: 'An LLM grounded in a knowledge graph', d: 'RAG that reasons over relations', on: false },
                { l: 'D', t: 'A supply-chain / network analysis tool', d: 'Paths, bottlenecks, dependencies', on: false },
                { l: 'E', t: 'Something else — I\'ll describe it', d: 'We\'ll ask a short follow-up', on: false },
              ].map(o => (
                <label key={o.l} style={{
                  display: 'flex', gap: 14, alignItems: 'flex-start', padding: '14px 16px',
                  border: '1px solid ' + (o.on ? 'var(--accent)' : 'var(--border)'),
                  background: o.on ? 'var(--cream)' : 'var(--paper)',
                  borderRadius: 12, cursor: 'pointer',
                }}>
                  <span style={{
                    width: 28, height: 28, flexShrink: 0, borderRadius: 14,
                    background: o.on ? 'var(--accent)' : 'var(--paper)',
                    color: o.on ? 'var(--accent-fg)' : 'var(--ink)',
                    border: '1px solid ' + (o.on ? 'var(--accent)' : 'var(--border)'),
                    fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{o.l}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14.5, color: 'var(--ink)', fontWeight: 600 }}>{o.t}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--fg-muted)', marginTop: 2 }}>{o.d}</div>
                  </div>
                  {o.on && <Icons.Check size={16} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 4 }}/>}
                </label>
              ))}
            </div>

            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button style={{ padding: '10px 16px', fontSize: 13, borderRadius: 999, border: '1px solid var(--border)', background: 'transparent', color: 'var(--fg-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>← Back</button>
              <button style={{ padding: '11px 22px', fontSize: 13.5, borderRadius: 999, border: 'none', background: 'var(--ink)', color: 'var(--paper)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                Next <Icons.Arrow size={14}/>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* What you'll get preview */}
      <section style={{ padding: '24px 40px 64px', maxWidth: 1100, margin: '0 auto', width: '100%' }}>
        <div style={{ padding: '40px 32px', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, gap: 24 }}>
            <div>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 8 }}>WHAT YOU'LL GET · PREVIEW</div>
              <h3 style={{ fontSize: 26, fontWeight: 500, letterSpacing: -0.6, color: 'var(--ink)', margin: 0 }}>
                Something like <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>this.</span>
              </h3>
              <p style={{ fontSize: 14, color: 'var(--fg-muted)', marginTop: 8, maxWidth: 520 }}>An example path for "Fraud detection, intermediate, 4 hrs/week" — stitched from our library. Yours will differ based on your answers.</p>
            </div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)', textAlign: 'right' }}>
              <div>5 steps · ~16 hours total</div>
              <div>mix of videos, tutorials, and one hands-on</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {[
              { n: '01', t: 'Graph fundamentals', type: 'VIDEO', time: '35 min' },
              { n: '02', t: 'Schema for fraud graphs', type: 'TUTORIAL', time: '1h 20m' },
              { n: '03', t: 'Pattern queries in GSQL', type: 'COURSE', time: '4 lessons' },
              { n: '04', t: 'Ring & velocity detection', type: 'HANDS-ON', time: '3 hrs' },
              { n: '05', t: 'Deploy + monitor', type: 'TUTORIAL', time: '45 min' },
            ].map((s, i) => (
              <div key={s.n} style={{ background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 12, padding: 18, position: 'relative' }}>
                <div style={{ fontSize: 32, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--accent)', letterSpacing: -1, lineHeight: 1, marginBottom: 14 }}>{s.n}</div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: 1.5, color: 'var(--fg-subtle)', marginBottom: 6 }}>{s.type}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3, letterSpacing: -0.2 }}>{s.t}</div>
                <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)', marginTop: 10 }}>{s.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </VarB_Shell>
  );
};


// ─────────────────────────── MY LEARNING ───────────────────────────
// Saved path + saved resources + progress.
const VarB_Page_MyLearning = ({ isDark, onToggleTheme }) => {
  const pathSteps = [
    { n: '01', t: 'Graph fundamentals', type: 'VIDEO', time: '35 min', status: 'done' },
    { n: '02', t: 'Schema for fraud graphs', type: 'TUTORIAL', time: '1h 20m', status: 'done' },
    { n: '03', t: 'Pattern queries in GSQL', type: 'COURSE', time: '4 lessons', status: 'active', progress: 0.6 },
    { n: '04', t: 'Ring & velocity detection', type: 'HANDS-ON', time: '3 hrs', status: 'todo' },
    { n: '05', t: 'Deploy + monitor', type: 'TUTORIAL', time: '45 min', status: 'todo' },
  ];

  const saved = [
    { title: 'Grounding an LLM in a knowledge graph', type: 'TUTORIAL', by: 'Soyeon Park', progress: 0.7, tone: 'orange' },
    { title: 'Bounded traversals with HeapAccum', type: 'BLOG', by: 'Marcus Lin', progress: 1, tone: 'warm' },
    { title: 'Graph Databases 101', type: 'COURSE', by: 'TG Academy', progress: 0.3, tone: 'orange' },
    { title: 'Office hours: debugging query plans', type: 'VIDEO', by: 'Marcus Lin', progress: 0, tone: 'warm' },
    { title: 'Schema design masterclass', type: 'TUTORIAL', by: 'Elena Ruiz', progress: 0.45, tone: 'orange' },
    { title: 'GSQL accumulators reference', type: 'DOCS', by: 'TG Docs', progress: 0, tone: 'warm' },
  ];

  return (
    <VarB_Shell isDark={isDark} onToggleTheme={onToggleTheme} active="My Learning">
      {/* Banner */}
      <section style={{ position: 'relative', overflow: 'hidden', borderBottom: '1px solid var(--border)' }}>
        <GraphMotif density={0.7} opacity={0.4} seed={41}/>
        <div style={{ position: 'relative', padding: '56px 40px 40px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 10 }}>/ MY LEARNING</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32 }}>
            <h1 style={{ fontSize: 52, fontWeight: 500, letterSpacing: -1.8, margin: 0, color: 'var(--ink)', lineHeight: 1.02 }}>
              Welcome back, <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>Priya.</span>
            </h1>
            <div style={{ display: 'flex', gap: 32 }}>
              {[['12', 'completed'], ['3', 'in progress'], ['8', 'saved'], ['47h', 'time invested']].map(([k, v]) => (
                <div key={v}>
                  <div style={{ fontSize: 32, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--ink)', letterSpacing: -1, lineHeight: 1 }}>{k}</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)', letterSpacing: 1.2, marginTop: 6 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Active path */}
      <section style={{ padding: '48px 40px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 6 }}>YOUR ACTIVE PATH</div>
            <h2 style={{ fontSize: 30, fontWeight: 500, letterSpacing: -0.8, margin: 0, color: 'var(--ink)' }}>
              Fraud detection <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>pathway.</span>
            </h2>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button style={{ padding: '10px 16px', fontSize: 13, borderRadius: 999, border: '1px solid var(--border)', background: 'var(--bg-elev)', color: 'var(--fg-muted)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>Edit path</button>
            <button style={{ padding: '10px 16px', fontSize: 13, borderRadius: 999, border: '1px solid var(--border)', background: 'var(--bg-elev)', color: 'var(--fg-muted)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>Start another</button>
          </div>
        </div>

        <div style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 16, padding: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
            <div style={{ flex: 1, height: 6, background: 'var(--cream)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: '52%', height: '100%', background: 'var(--accent)' }}/>
            </div>
            <span style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-muted)' }}>2.6 of 5 steps · 52% · ~7h left</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
            {pathSteps.map((s, i) => {
              const done = s.status === 'done';
              const active = s.status === 'active';
              return (
                <div key={s.n} style={{
                  background: active ? 'var(--cream)' : 'var(--paper)',
                  border: '1px solid ' + (active ? 'var(--accent)' : 'var(--border)'),
                  borderRadius: 12, padding: 18, position: 'relative',
                  opacity: s.status === 'todo' ? 0.7 : 1,
                }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ fontSize: 28, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: done ? 'var(--fg-subtle)' : 'var(--accent)', letterSpacing: -1, lineHeight: 1 }}>{s.n}</div>
                    {done && <div style={{ width: 22, height: 22, borderRadius: 11, background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Check size={12}/></div>}
                    {active && <div style={{ width: 22, height: 22, borderRadius: 11, background: 'var(--accent)', color: 'var(--accent-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icons.Play size={10}/></div>}
                  </div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: 1.5, color: 'var(--fg-subtle)', marginBottom: 6 }}>{s.type}</div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3, letterSpacing: -0.2, marginBottom: 10 }}>{s.t}</div>
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)' }}>{s.time}</div>
                  {active && (
                    <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed var(--border-strong)' }}>
                      <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--accent)', marginBottom: 4, fontWeight: 600 }}>IN PROGRESS · 60%</div>
                      <div style={{ height: 3, background: 'var(--paper)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ width: '60%', height: '100%', background: 'var(--accent)' }}/>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Saved courses */}
      <section style={{ padding: '16px 40px 64px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 24, fontWeight: 500, letterSpacing: -0.5, margin: 0, color: 'var(--ink)' }}>
            Saved <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>for later</span>
          </h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {['All', 'In progress', 'Completed', 'Not started'].map((t, i) => (
              <button key={t} style={{ padding: '7px 14px', fontSize: 12.5, borderRadius: 999, background: i === 0 ? 'var(--ink)' : 'var(--bg-elev)', color: i === 0 ? 'var(--paper)' : 'var(--fg-muted)', border: '1px solid ' + (i === 0 ? 'var(--ink)' : 'var(--border)'), cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>{t}</button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {saved.map((r, i) => (
            <div key={i} style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', cursor: 'pointer' }}>
              <div style={{ position: 'relative', height: 120 }}>
                <ImagePlaceholder tone={r.tone} h="100%"/>
                <div style={{ position: 'absolute', top: 12, left: 12, padding: '3px 9px', background: 'var(--paper)', border: '1px solid var(--border)', borderRadius: 999, fontSize: 10, fontFamily: 'var(--font-mono)', letterSpacing: 1.5, fontWeight: 600, color: 'var(--ink)' }}>{r.type}</div>
                <button style={{ position: 'absolute', top: 10, right: 10, width: 28, height: 28, borderRadius: 999, border: 'none', background: 'var(--accent)', color: 'var(--accent-fg)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icons.Bookmark size={12}/>
                </button>
              </div>
              <div style={{ padding: 18 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.3, letterSpacing: -0.2, marginBottom: 10 }}>{r.title}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--fg-muted)', marginBottom: 14 }}>
                  <Avatar name={r.by} size={18}/>{r.by}
                </div>
                {r.progress === 1 ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--success)', fontWeight: 600 }}>
                    <Icons.Check size={12}/> COMPLETED
                  </div>
                ) : r.progress > 0 ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)', marginBottom: 5, letterSpacing: 1 }}>
                      <span>{Math.round(r.progress * 100)}% DONE</span><span>CONTINUE →</span>
                    </div>
                    <div style={{ height: 3, background: 'var(--cream)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${r.progress * 100}%`, height: '100%', background: 'var(--accent)' }}/>
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)', letterSpacing: 1 }}>NOT STARTED · START →</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </VarB_Shell>
  );
};


// ─────────────────────────── EVENT DETAIL + GALLERY ───────────────────────────
// Single past event page — details, all important links, project list, photo gallery.
const VarB_Page_EventDetail = ({ isDark, onToggleTheme }) => {
  const photos = [
    { tone: 'orange', label: 'OPENING · 9:00am' },
    { tone: 'warm',   label: 'TEAM FORMATION' },
    { tone: 'orange', label: 'LATE NIGHT HACK' },
    { tone: 'warm',   label: 'MENTOR SESSION' },
    { tone: 'orange', label: 'DEMO STAGE' },
    { tone: 'warm',   label: 'AWARDS' },
    { tone: 'orange', label: 'GROUP PHOTO' },
    { tone: 'warm',   label: 'AFTER-PARTY' },
  ];
  const projects = [
    { place: '1ST', name: 'graph-of-grief', team: 'team-empath', desc: 'Mental-health support graph that surfaces similar stories anonymously. Built in 36 hours, plugged into live moderation.', tags: ['social', 'genai'], prize: '$3,000' },
    { place: '2ND', name: 'supplychain-sense', team: 'nodes-and-noodles', desc: 'Real-time bill-of-materials tracker for a fictional EV maker. Detects single points of failure across 40k parts.', tags: ['supply', 'viz'], prize: '$1,500' },
    { place: '3RD', name: 'kg-copilot-lite', team: 'three-graph-wranglers', desc: 'A pocket-sized RAG server you can run on a laptop — no cloud, no API key.', tags: ['genai', 'local-first'], prize: '$500' },
    { place: 'PEOPLE', name: 'bandstand', team: 'loud-and-graphy', desc: 'Concert discovery app that graphs who-toured-with-who over 15 years of setlist data.', tags: ['music', 'fun'], prize: 'Crowd favorite' },
  ];
  return (
    <VarB_Shell isDark={isDark} onToggleTheme={onToggleTheme} active="Events">
      {/* Cover */}
      <section style={{ padding: '48px 40px 0', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--fg-subtle)', marginBottom: 16, display: 'flex', gap: 8 }}>
          <span>EVENTS</span><span style={{ color: 'var(--border-strong)' }}>/</span><span>HACKATHONS</span><span style={{ color: 'var(--border-strong)' }}>/</span><span style={{ color: 'var(--accent)' }}>KG WEEKEND '26</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40, alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 1.5, color: 'var(--accent)', marginBottom: 14, padding: '4px 10px', border: '1px solid var(--accent)', borderRadius: 999, fontWeight: 600 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--accent)' }}/>
              PAST · MAR 22–24, 2026 · HACKATHON
            </div>
            <h1 style={{ fontSize: 54, fontWeight: 500, letterSpacing: -2, margin: 0, color: 'var(--ink)', lineHeight: 1.02 }}>
              Build-a-knowledge-graph <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>weekend.</span>
            </h1>
            <p style={{ fontSize: 17, color: 'var(--fg-muted)', lineHeight: 1.55, marginTop: 16, maxWidth: 540 }}>
              214 builders, 58 teams, 48 hours, one theme: graphs that mean something. Here's everything that happened — the winners, the projects, the photos, and the livestream.
            </p>
            <div style={{ display: 'flex', gap: 20, marginTop: 24, fontSize: 12.5, color: 'var(--fg-muted)', fontFamily: 'var(--font-mono)' }}>
              <span><strong style={{ color: 'var(--ink)', fontSize: 14 }}>214</strong> participants</span>
              <span><strong style={{ color: 'var(--ink)', fontSize: 14 }}>58</strong> projects</span>
              <span><strong style={{ color: 'var(--ink)', fontSize: 14 }}>$5k</strong> prizes</span>
              <span><strong style={{ color: 'var(--ink)', fontSize: 14 }}>18</strong> mentors</span>
            </div>
          </div>
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--border)' }}>
            <ImagePlaceholder tone="orange" h={320} label="COVER · DEMO STAGE"/>
          </div>
        </div>
      </section>

      {/* Quick links strip */}
      <section style={{ padding: '40px 40px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0, border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', background: 'var(--bg-elev)' }}>
          {[
            { ic: 'Play',     l: 'Livestream replay', s: '2h 14m highlights' },
            { ic: 'Github',   l: 'All 58 projects',   s: 'on GitHub' },
            { ic: 'Book',     l: 'Judging rubric',    s: 'PDF · 2 pages' },
            { ic: 'Calendar', l: 'Recap blog post',   s: '9 min read' },
            { ic: 'Users',    l: 'Participant list',  s: '214 builders' },
          ].map((l, i) => {
            const Ic = Icons[l.ic];
            return (
              <a key={l.l} style={{ padding: '20px 20px', display: 'flex', alignItems: 'center', gap: 14, borderLeft: i ? '1px solid var(--border)' : 'none', cursor: 'pointer' }}>
                <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: 20, background: 'var(--cream)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Ic size={16}/>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', letterSpacing: -0.1 }}>{l.l}</div>
                  <div style={{ fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)', marginTop: 2 }}>{l.s}</div>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Winners + projects */}
      <section style={{ padding: '24px 40px 32px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 6 }}>WINNERS</div>
        <h2 style={{ fontSize: 32, fontWeight: 500, letterSpacing: -1, margin: '0 0 24px', color: 'var(--ink)' }}>
          The projects that <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>made us cheer.</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {projects.map((p, i) => (
            <article key={p.name} style={{ background: 'var(--bg-elev)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', display: 'grid', gridTemplateColumns: '180px 1fr' }}>
              <div style={{ position: 'relative' }}>
                <ImagePlaceholder tone={i % 2 ? 'warm' : 'orange'} h="100%" label=""/>
                <div style={{ position: 'absolute', top: 12, left: 12, padding: '5px 11px', background: i === 0 ? 'var(--accent)' : 'var(--ink)', color: i === 0 ? 'var(--accent-fg)' : 'var(--paper)', fontSize: 10.5, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: 1.5, borderRadius: 999 }}>{p.place}</div>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 600, color: 'var(--ink)', letterSpacing: -0.4 }}>{p.name}</div>
                  <div style={{ fontSize: 12, fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--accent)' }}>{p.prize}</div>
                </div>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-subtle)', marginBottom: 10 }}>by {p.team}</div>
                <p style={{ fontSize: 13, color: 'var(--fg-muted)', lineHeight: 1.55, margin: 0, marginBottom: 12 }}>{p.desc}</p>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {p.tags.map(t => <span key={t} style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', padding: '2px 8px', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 999, color: 'var(--fg-muted)' }}>#{t}</span>)}
                  <a style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--ink)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4 }}>View <Icons.Arrow size={12}/></a>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <button style={{ padding: '11px 22px', fontSize: 13, borderRadius: 999, border: '1px solid var(--border-strong)', background: 'var(--bg-elev)', color: 'var(--fg)', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>Browse all 58 projects →</button>
        </div>
      </section>

      {/* Gallery */}
      <section style={{ padding: '40px 40px 24px', background: 'var(--cream)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 6 }}>GALLERY</div>
              <h2 style={{ fontSize: 30, fontWeight: 500, letterSpacing: -0.8, margin: 0, color: 'var(--ink)' }}>
                48 hours in <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>photos.</span>
              </h2>
            </div>
            <a style={{ fontSize: 13.5, color: 'var(--fg-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>Open full album (212 photos) <Icons.Arrow size={13}/></a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: '160px', gap: 8 }}>
            {photos.map((p, i) => {
              // Make a few span 2 for rhythm
              const span = i === 0 ? { gridColumn: 'span 2', gridRow: 'span 2' } : i === 5 ? { gridColumn: 'span 2' } : {};
              return (
                <div key={i} style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', ...span }}>
                  <ImagePlaceholder tone={p.tone} h="100%" label={p.label}/>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sponsors + coming back */}
      <section style={{ padding: '48px 40px 64px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 40, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--fg-subtle)', marginBottom: 14 }}>MADE POSSIBLE BY</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {['TigerGraph', 'GitHub', 'Weights & Biases', 'Modal', 'Anthropic', 'HuggingFace'].map(s => (
                <div key={s} style={{ padding: '10px 20px', border: '1px solid var(--border)', borderRadius: 10, background: 'var(--bg-elev)', fontSize: 13, fontWeight: 500, color: 'var(--ink)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{s}</div>
              ))}
            </div>
          </div>
          <div style={{ padding: 28, background: 'var(--ink)', color: 'var(--paper)', borderRadius: 16, position: 'relative', overflow: 'hidden' }}>
            <GraphMotif density={0.6} opacity={0.35} seed={51}/>
            <div style={{ position: 'relative' }}>
              <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', letterSpacing: 2, color: 'var(--accent)', marginBottom: 10 }}>NEXT UP</div>
              <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: -0.4, lineHeight: 1.2, marginBottom: 10 }}>
                Hack #4 — <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>AI agents on graphs</span>
              </div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginBottom: 18 }}>June 14–16 · Hybrid · $10k prizes</div>
              <button style={{ padding: '10px 18px', borderRadius: 999, border: 'none', background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>Save your spot →</button>
            </div>
          </div>
        </div>
      </section>
    </VarB_Shell>
  );
};

Object.assign(window, {
  VarB_Page_Resources,
  VarB_Page_AIChat,
  VarB_Page_Pathfinder,
  VarB_Page_MyLearning,
  VarB_Page_EventDetail,
});
