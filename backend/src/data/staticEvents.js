/**
 * Static events data — used as a fallback when the Supabase `events`
 * tables don't exist / are empty, and as the source-of-truth for the
 * seed script. Shapes match the route's `toCamel` output so the route
 * can just hand this data back to the frontend unchanged.
 */

// Deterministic pseudo-UUID derived from slug so IDs are stable across restarts.
function fakeId(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  const hex = h.toString(16).padStart(8, '0');
  return `${hex}-0000-4000-8000-${hex}${hex}`.slice(0, 36);
}

const DEFAULT_COVER = 'https://www.tigergraph.com/wp-content/uploads/2024/03/GAI_EVERYTHING_1024x560.png.webp';

function evt(o) {
  return {
    id: fakeId(o.slug),
    slug: o.slug,
    title: o.title,
    italicAccent: o.italicAccent ?? null,
    type: o.type,
    status: o.status,
    startsAt: o.startsAt,
    endsAt: o.endsAt ?? null,
    location: o.location ?? null,
    description: o.description ?? null,
    coverImage: o.coverImage ?? DEFAULT_COVER,
    coverTone: o.coverTone ?? 'orange',
    stats: o.stats ?? {},
    featured: !!o.featured,
    createdAt: o.createdAt ?? '2026-01-01T00:00:00Z',
    rsvpCount: o.rsvpCount ?? 0,
  };
}

// ─────────────────────────── UPCOMING ───────────────────────────
const UPCOMING = [
  evt({
    slug: 'graph-llms-retrieval-2026',
    title: 'Graph + LLMs: building retrieval you can actually reason about',
    type: 'webinar',
    status: 'upcoming',
    startsAt: '2026-04-28T17:00:00Z',
    endsAt: '2026-04-28T18:00:00Z',
    location: 'Virtual · 10:00 PT',
    description: "A 60-minute working session with the GSQL Copilot team. Bring hard questions, we'll debug them live.",
    stats: { hosts: ['Soyeon Park', 'Marcus Lin'], seats: 500 },
    featured: true,
  }),
  evt({
    slug: 'meetup-nyc-may-2026',
    title: 'TigerGraph Meetup — New York',
    type: 'meetup',
    status: 'upcoming',
    startsAt: '2026-05-14T23:00:00Z',
    location: 'Brooklyn · in person',
    description: 'Pizza, lightning talks, and graph war stories. Come for the graphs, stay for the slices.',
    stats: { expected: 86 },
  }),
  evt({
    slug: 'office-hours-gsql-may-2026',
    title: 'Office hours with the GSQL core team',
    type: 'qa',
    status: 'upcoming',
    startsAt: '2026-05-22T16:00:00Z',
    location: 'Virtual · Q&A',
    description: 'Open Q&A with the people who write GSQL. No topic off-limits.',
    stats: { expected: 201 },
  }),
  evt({
    slug: 'hackathon-kg-june-2026',
    title: 'Hackathon: build-a-knowledge-graph weekend',
    italicAccent: 'weekend',
    type: 'hackathon',
    status: 'upcoming',
    startsAt: '2026-06-03T16:00:00Z',
    endsAt: '2026-06-05T23:00:00Z',
    location: 'Hybrid · $5k prizes',
    description: '48 hours, one theme: graphs that mean something. Solo or teams up to 4.',
    stats: { expected: 124, prizes: '$5k' },
  }),
  evt({
    slug: 'study-graph-ml-hamilton-ch5',
    title: 'Graph ML study group — Hamilton et al., ch. 5',
    type: 'study',
    status: 'upcoming',
    startsAt: '2026-06-18T23:00:00Z',
    location: 'Virtual · book club',
    description: "Cowork through chapter 5. Bring a laptop and don't be shy about asking basics.",
    stats: { expected: 56 },
  }),
  evt({
    slug: 'meetup-london-jul-2026',
    title: 'TigerGraph Meetup — London',
    type: 'meetup',
    status: 'upcoming',
    startsAt: '2026-07-09T18:00:00Z',
    location: 'Shoreditch · in person',
    description: 'A smaller room, louder voices. First UK meetup since 2024.',
    stats: { expected: 42 },
  }),
];

// ─────────────────────────── PAST ───────────────────────────
const PAST = [
  // Devcation — flagship recent
  evt({
    slug: 'devcation-iit-delhi-2026',
    title: 'Devcation',
    italicAccent: "Delhi '26.",
    type: 'hackathon',
    status: 'past',
    startsAt: '2026-03-24T09:00:00Z',
    endsAt: '2026-04-13T18:00:00Z',
    location: 'IIT Delhi · in person',
    description: "Hack 'n Solve at IIT Delhi, co-hosted by Google Developer Groups on Campus (IGDTUW × IITD). TigerGraph sponsored the graph track — Team Graphite took the ₹24,000 purse.",
    coverImage: '/event-gallery/devcation/devcation-01.jpeg',
    coverTone: 'orange',
    stats: {
      external_url: 'https://unstop.com/hackathons/devcation-hack-n-solve-iit-delhi-1659241',
      hosts: ['GDG IGDTUW', 'GDG IITD', 'TigerGraph'],
      prize_track: 'TigerGraph track · ₹24,000',
    },
  }),

  // Recent webinars (from original seedEvents.js)
  evt({
    slug: 'fraud-detection-apr-2026',
    title: 'Fraud detection patterns with TigerGraph',
    type: 'webinar',
    status: 'past',
    startsAt: '2026-04-14T16:00:00Z',
    location: 'Virtual · on demand',
    description: 'Three production patterns for spotting fraud rings with graph queries.',
    stats: { views: '2.4k' },
  }),
  evt({
    slug: 'schema-design-apr-2026',
    title: 'Schema design masterclass with the core team',
    type: 'webinar',
    status: 'past',
    startsAt: '2026-04-02T16:00:00Z',
    location: 'Virtual · on demand',
    description: 'Two hours on how to think about vertices, edges, and compound keys.',
    stats: { views: '3.8k' },
  }),
  evt({
    slug: 'supply-chain-mar-2026',
    title: 'Supply chain graphs in production — 40k parts',
    type: 'webinar',
    status: 'past',
    startsAt: '2026-03-21T16:00:00Z',
    location: 'Virtual · on demand',
    description: 'How one EV maker spots single points of failure across a 40k-node bill of materials.',
    stats: { views: '1.9k' },
  }),

  // Graph + AI Summit 2024 sessions
  evt({
    slug: 'gais24-keynote-day1',
    title: 'Graphs and AI in a World Where Everything Is Connected',
    italicAccent: 'keynote',
    type: 'webinar',
    status: 'past',
    startsAt: '2024-05-01T15:30:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Opening keynote with TigerGraph CEO Hamid Azzawe on graph technology in the AI era.',
    stats: { external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page', hosts: ['Hamid Azzawe'] },
  }),
  evt({
    slug: 'gais24-fraud-financial-crime',
    title: 'Graph Database Technology in Fraud and Financial Crime',
    type: 'webinar',
    status: 'past',
    startsAt: '2024-05-01T16:00:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'NICE Actimize on graph-powered fraud detection in financial services.',
    stats: { external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page', hosts: ['Adam McLaughlin', 'Gilles Alis'] },
  }),
  evt({
    slug: 'gais24-graphhouse',
    title: 'Introducing GraphHouse',
    italicAccent: 'turbocharge your data lake',
    type: 'webinar',
    status: 'past',
    startsAt: '2024-05-01T16:30:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Dr. Mingxi Wu unveils GraphHouse — GenAI-enhanced graph analytics on top of your data lake.',
    stats: { external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page', hosts: ['Dr. Mingxi Wu'] },
  }),
  evt({
    slug: 'gais24-embeddings-everywhere',
    title: 'Embeddings Everywhere',
    type: 'webinar',
    status: 'past',
    startsAt: '2024-05-01T17:00:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Dan McCreary on why graph embeddings are becoming foundational for AI.',
    stats: { external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page', hosts: ['Dan McCreary'] },
  }),
  evt({
    slug: 'gais24-workshop-customer360',
    title: 'Workshop: Customer 360 with TigerGraph in 60 Minutes',
    type: 'study',
    status: 'past',
    startsAt: '2024-05-01T18:30:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Hands-on session building a Customer 360 graph in one hour.',
    stats: { external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page', hosts: ['Victor Moey', 'Dr. Victor Lee'] },
  }),
  evt({
    slug: 'gais24-workshop-fraud-ml',
    title: 'Workshop: Cut More Fraud with Graph-Powered ML',
    type: 'study',
    status: 'past',
    startsAt: '2024-05-01T19:30:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Combining graph features with ML to improve fraud detection accuracy.',
    stats: { external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page', hosts: ['Dr. Victor Lee', 'Robert Buechner'] },
  }),
  evt({
    slug: 'gais24-graph-ai-convergence',
    title: 'The Graph-AI Convergence',
    italicAccent: "in tomorrow's landscape",
    type: 'webinar',
    status: 'past',
    startsAt: '2024-05-02T15:30:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Day-2 keynote on where graph + AI are headed next.',
    stats: { external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page', hosts: ['Dan McCreary'] },
  }),
  evt({
    slug: 'gais24-mastercard-payments',
    title: 'Graph Representation Learning to Secure the Global Payments Ecosystem',
    type: 'webinar',
    status: 'past',
    startsAt: '2024-05-02T16:00:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Mastercard on applying graph representation learning at payments scale.',
    stats: { external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page', hosts: ['Nitendra Rajput', 'Elyse Cuttler'] },
  }),
  evt({
    slug: 'gais24-hoptek-fleet',
    title: 'Transforming Fleet Planning with Graph + AI',
    type: 'webinar',
    status: 'past',
    startsAt: '2024-05-02T18:00:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Hoptek on graph + AI for fleet and logistics planning.',
    stats: { external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page', hosts: ['Balaji Guntur'] },
  }),
  evt({
    slug: 'gais24-workshop-genai-graph',
    title: 'Workshop: GenAI + Graph',
    italicAccent: 'better answers, fewer hallucinations',
    type: 'study',
    status: 'past',
    startsAt: '2024-05-02T18:30:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Using graph context to ground LLMs and reduce hallucinations in GenAI apps.',
    stats: { external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page', hosts: ['Parker Erickson', 'Dan McCreary'] },
  }),
  evt({
    slug: 'gais24-workshop-digital-twins',
    title: 'Workshop: Real-Time Digital Twins',
    italicAccent: 'from supply chains to data centers',
    type: 'study',
    status: 'past',
    startsAt: '2024-05-02T19:30:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Building real-time digital twins for supply chains and data center operations.',
    stats: { external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page', hosts: ['Dr. Victor Lee', 'Andrew Kasper'] },
  }),

  // On-demand webinars
  evt({
    slug: 'webinar-insights-nocode',
    title: 'Build Your First No-Code App With TigerGraph Insights',
    type: 'webinar',
    status: 'past',
    startsAt: '2023-06-19T17:00:00Z',
    location: 'On demand · Webinar',
    description: 'Hands-on intro to TigerGraph Insights — the no-code graph app builder.',
    stats: { external_url: 'https://info.tigergraph.com/insights' },
  }),
  evt({
    slug: 'webinar-ml-workbench',
    title: 'Unlock Smarter Insights at Scale',
    italicAccent: 'ML on connected data',
    type: 'webinar',
    status: 'past',
    startsAt: '2023-04-12T17:00:00Z',
    location: 'On demand · Webinar',
    description: 'A tour of ML Workbench — a Jupyter-based framework for graph deep learning.',
    stats: { external_url: 'https://info.tigergraph.com/ml-workbench-webinar' },
  }),
  evt({
    slug: 'webinar-dell-graph-analytics',
    title: 'Dell: Better Answers Using Graph Analytics and TigerGraph',
    type: 'webinar',
    status: 'past',
    startsAt: '2023-03-08T17:00:00Z',
    location: 'On demand · Dell HPC',
    description: 'Applications of graph analytics in fraud, recommendations, and supply chain.',
    stats: { external_url: 'https://dellhpc.org/events/24255' },
  }),
  evt({
    slug: 'webinar-tg-cloud-advantages',
    title: 'TigerGraph Cloud',
    italicAccent: 'competitive advantages',
    type: 'webinar',
    status: 'past',
    startsAt: '2023-02-15T17:00:00Z',
    location: 'On demand · Webinar',
    description: 'Why TigerGraph Cloud lets teams build apps instead of managing databases.',
    stats: { external_url: 'https://info.tigergraph.com/gain-more-competitive-advantages-with-tigergraph-cloud' },
  }),
  evt({
    slug: 'webinar-expero-retail-fraud',
    title: 'Fraud Detection Solutions to Fight Retail Fraud',
    type: 'webinar',
    status: 'past',
    startsAt: '2022-11-09T17:00:00Z',
    location: 'On demand · w/ Expero',
    description: 'Graph-powered fraud detection patterns for retail use cases.',
    stats: { external_url: 'https://www.experoinc.com/get/fraud-detection-solutions-to-fight-retail-fraud' },
  }),
  evt({
    slug: 'webinar-forrester-tei',
    title: 'Forrester TEI',
    italicAccent: 'cost savings & business benefits of TigerGraph',
    type: 'webinar',
    status: 'past',
    startsAt: '2022-09-21T17:00:00Z',
    location: 'On demand · Webinar',
    description: 'Forrester Consulting examines the ROI of moving to TigerGraph.',
    stats: { external_url: 'https://info.tigergraph.com/forrester-tei-webinar' },
  }),
  evt({
    slug: 'webinar-graph-gurus-101',
    title: 'Graph Gurus: TigerGraph 101',
    italicAccent: '4-part intro series',
    type: 'webinar',
    status: 'past',
    startsAt: '2022-01-20T17:00:00Z',
    location: 'On demand · 4-part series',
    description: 'Four-part introduction to graph databases and TigerGraph fundamentals.',
    stats: { external_url: 'https://info.tigergraph.com/graph-gurus-intro' },
  }),

  // Industry conferences
  evt({
    slug: 'kgc-2022',
    title: 'The Knowledge Graph Conference 2022',
    type: 'meetup',
    status: 'past',
    startsAt: '2022-05-02T13:00:00Z',
    location: 'New York City',
    description: 'TigerGraph at KGC 2022 — talks, panels, and community meetups.',
    stats: { external_url: 'https://www.knowledgegraph.tech/' },
  }),
  evt({
    slug: 'dbta-data-summit-2022',
    title: 'DBTA Data Summit 2022',
    type: 'meetup',
    status: 'past',
    startsAt: '2022-05-17T13:00:00Z',
    location: 'Boston, MA',
    description: 'Database Trends and Applications annual summit.',
    stats: { external_url: 'https://www.dbta.com/DataSummit/2022/default.aspx' },
  }),
  evt({
    slug: 'ai4-2022',
    title: 'AI4 2022 Flagship',
    type: 'meetup',
    status: 'past',
    startsAt: '2022-08-16T13:00:00Z',
    location: 'Las Vegas, NV',
    description: "One of North America's largest AI industry events.",
    stats: { external_url: 'https://ai4.io/usa/' },
  }),
  evt({
    slug: 'gartner-da-summit-2022',
    title: 'Gartner Data & Analytics Summit 2022',
    type: 'meetup',
    status: 'past',
    startsAt: '2022-08-22T13:00:00Z',
    location: 'Orlando, FL',
    description: 'Gartner Data & Analytics Summit — TigerGraph booth + speaking slots.',
    stats: { external_url: 'https://www.gartner.com/en/conferences/na/data-analytics-us' },
  }),
  evt({
    slug: 'acams-lv-2022',
    title: 'ACAMS Las Vegas Conference',
    type: 'meetup',
    status: 'past',
    startsAt: '2022-10-10T13:00:00Z',
    location: 'Las Vegas, NV',
    description: 'Anti-money-laundering conference — graph-powered compliance in focus.',
    stats: { external_url: 'https://www.acams.org/en/events/conferences/acams-las-vegas-conference' },
  }),
  evt({
    slug: 'world-ai-cannes-2022',
    title: 'World AI Cannes',
    type: 'meetup',
    status: 'past',
    startsAt: '2022-04-14T08:00:00Z',
    location: 'Cannes, France',
    description: 'Flagship European AI summit.',
    stats: { external_url: 'https://worldaicannes.com/' },
  }),
  evt({
    slug: 'bigdata-ai-frankfurt-2022',
    title: 'Big Data & AI World Frankfurt',
    type: 'meetup',
    status: 'past',
    startsAt: '2022-05-11T08:00:00Z',
    location: 'Frankfurt, Germany',
    description: 'European data + AI industry showcase.',
    stats: { external_url: 'https://www.bigdataworldfrankfurt.de/' },
  }),
  evt({
    slug: 'dataconnectors-austin-2022',
    title: 'Data Connectors Cybersecurity Summit — Austin',
    type: 'meetup',
    status: 'past',
    startsAt: '2022-04-13T13:00:00Z',
    location: 'Austin, TX',
    description: 'Cybersecurity summit — graph for threat detection.',
    stats: { external_url: 'https://dataconnectors.com/events/2022/april/austin/' },
  }),
];

const ALL = [...UPCOMING, ...PAST];
const FEATURED = ALL.find((e) => e.featured && e.status === 'upcoming') || null;

// ─────────────── Event detail (photos/projects/sponsors) ───────────────
const DEVCATION_PHOTOS = Array.from({ length: 21 }, (_, i) => {
  const idx = i + 1;
  const span = idx === 1 ? 'hero' : idx === 5 ? 'wide' : 'default';
  const captions = [
    'OPENING · IIT DELHI', 'KICKOFF', 'TEAM FORMATION', 'HACK IN PROGRESS',
    'TIGERGRAPH TRACK WINNERS', 'MENTOR ROUNDS', 'DEMO STAGE', 'PITCH NIGHT',
    'WORKING SESSIONS', 'JUDGING', 'AWARDS', 'TEAM GRAPHITE',
    'HALLWAYS', 'LUNCH BREAK', 'WHITEBOARDING', 'BUILDERS',
    'COLLABORATION', 'FINAL PUSH', 'STAGE · RECAP', 'CLOSING', 'GROUP PHOTO',
  ];
  return {
    id: `devcation-photo-${idx}`,
    url: `/event-gallery/devcation/devcation-${String(idx).padStart(2, '0')}.jpeg`,
    caption: captions[i],
    tone: idx % 2 ? 'orange' : 'warm',
    span,
    sortOrder: idx,
  };
});

const DETAILS = {
  'devcation-iit-delhi-2026': {
    photos: DEVCATION_PHOTOS,
    projects: [], // awaiting user list
    sponsors: [
      { id: 'dev-sp-1', name: 'TigerGraph', url: null, sortOrder: 1 },
      { id: 'dev-sp-2', name: 'GDG on Campus IGDTUW', url: null, sortOrder: 2 },
      { id: 'dev-sp-3', name: 'GDG on Campus IITD', url: null, sortOrder: 3 },
    ],
  },
};

function listEvents(status) {
  let items = ALL.slice();
  if (status === 'upcoming' || status === 'past') items = items.filter((e) => e.status === status);
  items.sort((a, b) => {
    const cmp = a.startsAt.localeCompare(b.startsAt);
    return status === 'past' ? -cmp : cmp;
  });
  return items;
}

function getFeatured() {
  return FEATURED;
}

function getEventDetail(slug) {
  const event = ALL.find((e) => e.slug === slug);
  if (!event) return null;
  const extras = DETAILS[slug] || { photos: [], projects: [], sponsors: [] };
  return { event, ...extras };
}

module.exports = {
  listEvents,
  getFeatured,
  getEventDetail,
};
