// Shared UI primitives — Icons, Logo, GraphMotif
// Exposed on window so Babel scripts in other files can use them.

// ── Icons: minimalist 1.5px stroke, 18/20/22 viewBox
const Icon = ({ d, size = 18, fill = 'none', stroke = 'currentColor', sw = 1.6, children, vb = 24 }) => (
  <svg width={size} height={size} viewBox={`0 0 ${vb} ${vb}`} fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {children || <path d={d} />}
  </svg>
);

const Icons = {
  Home:     (p) => <Icon {...p} d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V11z"/>,
  Book:     (p) => <Icon {...p} d="M4 4h6a3 3 0 013 3v13M20 4h-6a3 3 0 00-3 3v13M4 4v15h7M20 4v15h-7"/>,
  Compass:  (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-1.8 5.2-5.2 1.8 1.8-5.2 5.2-1.8z"/></Icon>,
  Sparkle:  (p) => <Icon {...p} d="M12 3l1.8 5.4L19 10l-5.2 1.6L12 17l-1.8-5.4L5 10l5.2-1.6L12 3z"/>,
  Search:   (p) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></Icon>,
  Chat:     (p) => <Icon {...p} d="M3 6a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2h-9l-4 4v-4H5a2 2 0 01-2-2V6z"/>,
  Calendar: (p) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></Icon>,
  Users:    (p) => <Icon {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2 20c.6-3.5 3.5-5.5 7-5.5s6.4 2 7 5.5"/><circle cx="17" cy="7" r="2.5"/><path d="M22 18c-.4-2.5-2.2-4-4.5-4.2"/></Icon>,
  Code:     (p) => <Icon {...p} d="M8 6l-5 6 5 6M16 6l5 6-5 6M14 4l-4 16"/>,
  Github:   (p) => <Icon {...p} vb={24} d="M9 19c-4 1-4-2-6-2m12 5v-3.5a3 3 0 00-.8-2.2c2.7-.3 5.5-1.3 5.5-6 0-1.2-.4-2.3-1.2-3.2.3-1 .3-2.1-.2-3 0 0-1-.3-3.2 1.2a11 11 0 00-6 0C7.9 3.8 7 4 7 4c-.5 1-.5 2.1-.2 3A4.6 4.6 0 005.5 10c0 4.7 2.8 5.7 5.5 6A3 3 0 0010 18.5V22"/>,
  External: (p) => <Icon {...p} d="M7 7h10v10M7 17L17 7"/>,
  ChevronR: (p) => <Icon {...p} d="M9 6l6 6-6 6"/>,
  ChevronD: (p) => <Icon {...p} d="M6 9l6 6 6-6"/>,
  Arrow:    (p) => <Icon {...p} d="M5 12h14M13 6l6 6-6 6"/>,
  Play:     (p) => <Icon {...p} fill="currentColor" stroke="none" d="M6 4l14 8-14 8V4z"/>,
  Moon:     (p) => <Icon {...p} d="M20 14.5A8 8 0 119.5 4a7 7 0 0010.5 10.5z"/>,
  Sun:      (p) => <Icon {...p}><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></Icon>,
  Heart:    (p) => <Icon {...p} d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0112 5.5 5.5 5.5 0 0121.5 12c-2.5 4.5-9.5 9-9.5 9z"/>,
  Star:     (p) => <Icon {...p} d="M12 3l2.9 6 6.6.9-4.8 4.6 1.2 6.6L12 18l-5.9 3.1 1.2-6.6L2.5 9.9l6.6-.9L12 3z"/>,
  Bookmark: (p) => <Icon {...p} d="M6 3h12v18l-6-4-6 4V3z"/>,
  Plus:     (p) => <Icon {...p} d="M12 5v14M5 12h14"/>,
  Eye:      (p) => <Icon {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></Icon>,
  Tag:      (p) => <Icon {...p} d="M3 12V4a1 1 0 011-1h8l9 9-9 9-9-9z M8 8h.01"/>,
  Clock:    (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>,
  Trending: (p) => <Icon {...p} d="M3 17l6-6 4 4 8-8M15 7h6v6"/>,
  Download: (p) => <Icon {...p} d="M12 4v12m-5-5l5 5 5-5M4 20h16"/>,
  Check:    (p) => <Icon {...p} d="M4 12l5 5L20 6"/>,
  Filter:   (p) => <Icon {...p} d="M3 5h18M6 12h12M10 19h4"/>,
  Zap:      (p) => <Icon {...p} d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>,
  Menu:     (p) => <Icon {...p} d="M4 7h16M4 12h16M4 17h16"/>,
  Bell:     (p) => <Icon {...p} d="M6 8a6 6 0 1112 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 004 0"/>,
  Share:    (p) => <Icon {...p}><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6"/></Icon>,
  Globe:    (p) => <Icon {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18"/></Icon>,
  Terminal: (p) => <Icon {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3M13 15h4"/></Icon>,
  Database: (p) => <Icon {...p}><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v7c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12v7c0 1.7 3.6 3 8 3s8-1.3 8-3v-7"/></Icon>,
  Branch:   (p) => <Icon {...p}><circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="8" r="2"/><path d="M6 7v10M6 14c0-4 6-4 6-7v-1"/></Icon>,
};

// ── TigerGraph DevHub Logo
// Custom geometric mark: angular tiger-inspired chevron + connected nodes.
// NOT the TigerGraph corporate logo — original DevHub submark.
const DevHubLogo = ({ size = 32, mono = false }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
    <rect width="40" height="40" rx="9" fill={mono ? 'currentColor' : 'var(--tg-orange)'}/>
    {/* Angular chevron (tiger stripe) */}
    <path d="M9 14L15 22L9 30" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    <path d="M17 14L23 22L17 30" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55"/>
    {/* Linked node */}
    <circle cx="29" cy="14" r="2.2" fill="#fff"/>
    <circle cx="29" cy="30" r="2.2" fill="#fff"/>
    <path d="M29 16.2V27.8" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

const DevHubWordmark = ({ size = 18, color = 'currentColor' }) => (
  <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 2, fontFamily: 'var(--font-sans)', fontWeight: 700, fontSize: size, letterSpacing: -0.4, color }}>
    <span>Dev</span>
    <span style={{ color: 'var(--tg-orange)' }}>Hub</span>
  </span>
);

// ── Graph motif background — animated node/edge pattern
// Seedable, density knob, renders as an SVG with gentle drift.
const GraphMotif = ({ density = 1, opacity = 1, color = 'var(--tg-orange)', edgeColor = 'var(--edge)', w = 1200, h = 600, seed = 7 }) => {
  // Deterministic PRNG
  const rand = React.useMemo(() => {
    let s = seed;
    return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  }, [seed]);
  const n = Math.max(6, Math.round(24 * density));
  const nodes = React.useMemo(() => {
    const r = [];
    for (let i = 0; i < n; i++) r.push({ x: rand() * w, y: rand() * h, r: 1.5 + rand() * 2.5 });
    return r;
  }, [n, w, h]);
  const edges = React.useMemo(() => {
    const out = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
        const d = Math.sqrt(dx*dx + dy*dy);
        if (d < 180 && rand() > 0.55) out.push([i, j, d]);
      }
    }
    return out;
  }, [nodes]);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity, pointerEvents: 'none' }}>
      <defs>
        <radialGradient id={`g-${seed}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </radialGradient>
      </defs>
      {edges.map(([a, b, d], i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y} stroke={edgeColor} strokeWidth={0.7} opacity={Math.max(0.1, 1 - d / 180)}/>
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle cx={n.x} cy={n.y} r={n.r * 3} fill={`url(#g-${seed})`} opacity={0.35}/>
          <circle cx={n.x} cy={n.y} r={n.r} fill={color}/>
        </g>
      ))}
    </svg>
  );
};

// ── Dotted background for panels
const DotGrid = ({ color = 'var(--grid-line)', size = 24 }) => (
  <div style={{
    position: 'absolute', inset: 0,
    backgroundImage: `radial-gradient(${color} 1px, transparent 1px)`,
    backgroundSize: `${size}px ${size}px`,
    pointerEvents: 'none',
  }}/>
);

// ── Avatar (initials, deterministic color)
const Avatar = ({ name = 'U', size = 32, src }) => {
  const hue = React.useMemo(() => {
    let h = 0; for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return h;
  }, [name]);
  const initials = name.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  if (src) return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: size/2, objectFit: 'cover' }}/>;
  return (
    <div style={{
      width: size, height: size, borderRadius: size/2,
      background: `oklch(0.72 0.12 ${hue})`,
      color: '#fff', fontSize: size * 0.38, fontWeight: 600,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-sans)', flexShrink: 0,
    }}>{initials}</div>
  );
};

// ── Image placeholder with striped texture
const ImagePlaceholder = ({ label = 'IMAGE', w = '100%', h = 200, tone = 'orange', style = {} }) => {
  const stripes = {
    orange:   ['#FFE8D4', '#FFD5A8'],
    warm:     ['#F5EEDF', '#E8DEC9'],
    slate:    ['#1E232A', '#171A1F'],
    dark:     ['#2A261F', '#23201B'],
  }[tone] || ['#E8DEC9', '#D4C9B4'];
  return (
    <div style={{ width: w, height: h, position: 'relative', overflow: 'hidden', background: stripes[0], borderRadius: 6, ...style }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `repeating-linear-gradient(135deg, ${stripes[0]} 0 14px, ${stripes[1]} 14px 28px)`,
      }}/>
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: 2, color: 'rgba(0,0,0,0.4)', fontWeight: 500,
      }}>{label}</div>
    </div>
  );
};

Object.assign(window, { Icons, DevHubLogo, DevHubWordmark, GraphMotif, DotGrid, Avatar, ImagePlaceholder });
