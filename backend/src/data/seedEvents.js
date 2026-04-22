/**
 * Events seed script.
 *
 * Populates the events + event_photos + hackathon_projects + event_sponsors
 * tables with a featured upcoming event, a handful of upcoming/past events,
 * and one fully-fleshed hackathon (KG Weekend '26) so the /events UI has
 * real content without a CMS.
 *
 * Idempotent: each event is upserted by slug. Child rows (photos/projects/
 * sponsors) are deleted and re-inserted for the seeded events.
 *
 * Run:
 *   cd backend
 *   npm run seed:events
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or ANON) required.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const FEATURED = {
  slug: 'graph-llms-retrieval-2026',
  title: 'Graph + LLMs: building retrieval you can actually reason about',
  italic_accent: null,
  type: 'webinar',
  status: 'upcoming',
  starts_at: '2026-04-28T17:00:00Z',
  ends_at: '2026-04-28T18:00:00Z',
  location: 'Virtual · 10:00 PT',
  description:
    "A 60-minute working session with the GSQL Copilot team. Bring hard questions, we'll debug them live.",
  cover_tone: 'orange',
  stats: { hosts: ['Soyeon Park', 'Marcus Lin'], seats: 500 },
  featured: true,
};

const UPCOMING = [
  {
    slug: 'meetup-nyc-may-2026',
    title: 'TigerGraph Meetup — New York',
    type: 'meetup',
    status: 'upcoming',
    starts_at: '2026-05-14T23:00:00Z',
    location: 'Brooklyn · in person',
    description: 'Pizza, lightning talks, and graph war stories. Come for the graphs, stay for the slices.',
    stats: { expected: 86 },
  },
  {
    slug: 'office-hours-gsql-may-2026',
    title: 'Office hours with the GSQL core team',
    type: 'qa',
    status: 'upcoming',
    starts_at: '2026-05-22T16:00:00Z',
    location: 'Virtual · Q&A',
    description: 'Open Q&A with the people who write GSQL. No topic off-limits.',
    stats: { expected: 201 },
  },
  {
    slug: 'hackathon-kg-june-2026',
    title: 'Hackathon: build-a-knowledge-graph weekend',
    italic_accent: 'weekend',
    type: 'hackathon',
    status: 'upcoming',
    starts_at: '2026-06-03T16:00:00Z',
    ends_at: '2026-06-05T23:00:00Z',
    location: 'Hybrid · $5k prizes',
    description: '48 hours, one theme: graphs that mean something. Solo or teams up to 4.',
    stats: { expected: 124, prizes: '$5k' },
  },
  {
    slug: 'study-graph-ml-hamilton-ch5',
    title: 'Graph ML study group — Hamilton et al., ch. 5',
    type: 'study',
    status: 'upcoming',
    starts_at: '2026-06-18T23:00:00Z',
    location: 'Virtual · book club',
    description: "Cowork through chapter 5. Bring a laptop and don't be shy about asking basics.",
    stats: { expected: 56 },
  },
  {
    slug: 'meetup-london-jul-2026',
    title: 'TigerGraph Meetup — London',
    type: 'meetup',
    status: 'upcoming',
    starts_at: '2026-07-09T18:00:00Z',
    location: 'Shoreditch · in person',
    description: 'A smaller room, louder voices. First UK meetup since 2024.',
    stats: { expected: 42 },
  },
];

const PAST = [
  {
    slug: 'fraud-detection-apr-2026',
    title: 'Fraud detection patterns with TigerGraph',
    type: 'webinar',
    status: 'past',
    starts_at: '2026-04-14T16:00:00Z',
    location: 'Virtual · on demand',
    description: 'Three production patterns for spotting fraud rings with graph queries.',
    stats: { views: '2.4k' },
  },
  {
    slug: 'schema-design-apr-2026',
    title: 'Schema design masterclass with the core team',
    type: 'webinar',
    status: 'past',
    starts_at: '2026-04-02T16:00:00Z',
    location: 'Virtual · on demand',
    description: 'Two hours on how to think about vertices, edges, and compound keys.',
    stats: { views: '3.8k' },
  },
  {
    slug: 'supply-chain-mar-2026',
    title: 'Supply chain graphs in production — 40k parts',
    type: 'webinar',
    status: 'past',
    starts_at: '2026-03-21T16:00:00Z',
    location: 'Virtual · on demand',
    description: 'How one EV maker spots single points of failure across a 40k-node bill of materials.',
    stats: { views: '1.9k' },
  },
];

const KG_WEEKEND = {
  slug: 'kg-weekend-26',
  title: 'Build-a-knowledge-graph',
  italic_accent: 'weekend.',
  type: 'hackathon',
  status: 'past',
  starts_at: '2026-03-22T16:00:00Z',
  ends_at: '2026-03-24T23:00:00Z',
  location: 'Hybrid · San Francisco + Virtual',
  description:
    "214 builders, 58 teams, 48 hours, one theme: graphs that mean something. Here's everything that happened — the winners, the projects, the photos, and the livestream.",
  cover_tone: 'orange',
  stats: { participants: 214, projects: 58, prizes: '$5k', mentors: 18 },
  featured: false,
};

const KG_PHOTOS = [
  { tone: 'orange', caption: 'OPENING · 9:00am',   span: 'hero',    sort_order: 1 },
  { tone: 'warm',   caption: 'TEAM FORMATION',     span: 'default', sort_order: 2 },
  { tone: 'orange', caption: 'LATE NIGHT HACK',    span: 'default', sort_order: 3 },
  { tone: 'warm',   caption: 'MENTOR SESSION',     span: 'default', sort_order: 4 },
  { tone: 'orange', caption: 'DEMO STAGE',         span: 'default', sort_order: 5 },
  { tone: 'warm',   caption: 'AWARDS',             span: 'wide',    sort_order: 6 },
  { tone: 'orange', caption: 'GROUP PHOTO',        span: 'default', sort_order: 7 },
  { tone: 'warm',   caption: 'AFTER-PARTY',        span: 'default', sort_order: 8 },
];

const KG_PROJECTS = [
  {
    place: '1ST',
    name: 'graph-of-grief',
    team: 'team-empath',
    description: 'Mental-health support graph that surfaces similar stories anonymously. Built in 36 hours, plugged into live moderation.',
    tags: ['social', 'genai'],
    prize: '$3,000',
    sort_order: 1,
  },
  {
    place: '2ND',
    name: 'supplychain-sense',
    team: 'nodes-and-noodles',
    description: 'Real-time bill-of-materials tracker for a fictional EV maker. Detects single points of failure across 40k parts.',
    tags: ['supply', 'viz'],
    prize: '$1,500',
    sort_order: 2,
  },
  {
    place: '3RD',
    name: 'kg-copilot-lite',
    team: 'three-graph-wranglers',
    description: 'A pocket-sized RAG server you can run on a laptop — no cloud, no API key.',
    tags: ['genai', 'local-first'],
    prize: '$500',
    sort_order: 3,
  },
  {
    place: 'PEOPLE',
    name: 'bandstand',
    team: 'loud-and-graphy',
    description: 'Concert discovery app that graphs who-toured-with-who over 15 years of setlist data.',
    tags: ['music', 'fun'],
    prize: 'Crowd favorite',
    sort_order: 4,
  },
];

const KG_SPONSORS = [
  { name: 'TigerGraph', sort_order: 1 },
  { name: 'GitHub', sort_order: 2 },
  { name: 'Weights & Biases', sort_order: 3 },
  { name: 'Modal', sort_order: 4 },
  { name: 'Anthropic', sort_order: 5 },
  { name: 'HuggingFace', sort_order: 6 },
];

const AGENTS_HACK = {
  slug: 'let-the-agent-plan-winter-25',
  title: 'Let-the-agent-plan',
  italic_accent: 'hack.',
  type: 'hackathon',
  status: 'past',
  starts_at: '2025-12-06T16:00:00Z',
  ends_at: '2025-12-08T23:00:00Z',
  location: 'Hybrid · Berlin + Virtual',
  description:
    "180 builders, 44 teams, 48 hours. One prompt: \"let the agent plan the traversal.\" Here's everything they shipped — the winners, the photos, the livestream.",
  cover_tone: 'warm',
  stats: { participants: 180, projects: 44, prizes: '$7k', mentors: 14 },
  featured: false,
};

const AGENTS_PHOTOS = [
  { tone: 'warm',   caption: 'OPENING · BERLIN',    span: 'hero',    sort_order: 1 },
  { tone: 'orange', caption: 'KICKOFF KEYNOTE',     span: 'default', sort_order: 2 },
  { tone: 'warm',   caption: 'WHITEBOARDING',       span: 'default', sort_order: 3 },
  { tone: 'orange', caption: 'MENTOR 1:1s',         span: 'default', sort_order: 4 },
  { tone: 'warm',   caption: 'COFFEE RUN · 3AM',    span: 'default', sort_order: 5 },
  { tone: 'orange', caption: 'DEMO DAY',            span: 'wide',    sort_order: 6 },
  { tone: 'warm',   caption: 'CLOSING REMARKS',     span: 'default', sort_order: 7 },
  { tone: 'orange', caption: 'GROUP SHOT',          span: 'default', sort_order: 8 },
  { tone: 'warm',   caption: 'PRIZE CEREMONY',      span: 'default', sort_order: 9 },
  { tone: 'orange', caption: 'AFTERGLOW',           span: 'default', sort_order: 10 },
];

const AGENTS_PROJECTS = [
  {
    place: '1ST',
    name: 'plan-walker',
    team: 'four-hops-ahead',
    description:
      'Agent that plans traversals by asking the graph for its own schema — no hard-coded queries. Uses GSQL as its action space.',
    tags: ['agents', 'gsql'],
    prize: '$4,000',
    sort_order: 1,
  },
  {
    place: '2ND',
    name: 'hop-tutor',
    team: 'edge-cases',
    description:
      'Teaches GSQL by letting a student drive a voice-controlled agent. "Show me a three-hop query between users and purchases."',
    tags: ['edu', 'voice'],
    prize: '$2,000',
    sort_order: 2,
  },
  {
    place: '3RD',
    name: 'city-scout',
    team: 'north-by-northgraph',
    description:
      'Urban planning agent that walks a city transit graph and proposes new bus routes. Built on real Berlin MVG data.',
    tags: ['urbanism', 'routing'],
    prize: '$1,000',
    sort_order: 3,
  },
  {
    place: 'PEOPLE',
    name: 'lore-weaver',
    team: 'plot-twist',
    description:
      'Story-writing tool that treats characters and plot beats as a graph. The agent suggests what should happen next.',
    tags: ['creative', 'fun'],
    prize: 'Crowd favorite',
    sort_order: 4,
  },
];

const AGENTS_SPONSORS = [
  { name: 'TigerGraph', sort_order: 1 },
  { name: 'Vercel', sort_order: 2 },
  { name: 'LangChain', sort_order: 3 },
  { name: 'Supabase', sort_order: 4 },
  { name: 'Cloudflare', sort_order: 5 },
  { name: 'OpenAI', sort_order: 6 },
];

const DEVCATION = {
  slug: 'devcation-2026',
  title: 'Devcation',
  italic_accent: "'26.",
  type: 'hackathon',
  status: 'past',
  starts_at: '2026-04-04T15:00:00Z',
  ends_at: '2026-04-06T22:00:00Z',
  location: 'Lisbon · in person + livestream',
  description:
    "Three days, one beach town, one brief: ship something graphy. 240 builders, 62 teams, a lot of bica. Here's what went down.",
  cover_tone: 'warm',
  stats: { participants: 240, projects: 62, prizes: '$10k', mentors: 22, views: '4.1k' },
  featured: false,
};

const DEVCATION_PHOTOS = [
  { tone: 'warm',   caption: 'ARRIVAL · LISBON',     span: 'hero',    sort_order: 1 },
  { tone: 'orange', caption: 'KICKOFF · BEACH DECK', span: 'default', sort_order: 2 },
  { tone: 'warm',   caption: 'TEAM FORMATION',       span: 'default', sort_order: 3 },
  { tone: 'orange', caption: 'MENTOR WALK',          span: 'default', sort_order: 4 },
  { tone: 'warm',   caption: 'SUNSET PAIR-PROGRAM',  span: 'default', sort_order: 5 },
  { tone: 'orange', caption: 'DEMO NIGHT',           span: 'wide',    sort_order: 6 },
  { tone: 'warm',   caption: 'JUDGE HUDDLE',         span: 'default', sort_order: 7 },
  { tone: 'orange', caption: 'AWARDS · MAIN STAGE',  span: 'default', sort_order: 8 },
  { tone: 'warm',   caption: 'GROUP PHOTO · 240',    span: 'default', sort_order: 9 },
  { tone: 'orange', caption: 'BEACH AFTERPARTY',     span: 'default', sort_order: 10 },
];

const DEVCATION_PROJECTS = [
  {
    place: '1ST',
    name: 'tide-charts',
    team: 'low-water-mark',
    description:
      'Coastal-resilience graph linking tide gauges, storm drains, and historic flood zones. Flags neighborhoods likely to flood in the next 48 hours.',
    tags: ['climate', 'geospatial'],
    prize: '$5,000',
    sort_order: 1,
  },
  {
    place: '2ND',
    name: 'bica-flow',
    team: 'espresso-depth-first',
    description:
      'Realtime coffee supply-chain graph from bean to cup. Built in 40 hours with a live feed from 12 Lisbon cafés.',
    tags: ['supply', 'iot'],
    prize: '$2,500',
    sort_order: 2,
  },
  {
    place: '3RD',
    name: 'fado-atlas',
    team: 'saudade-net',
    description:
      'Interactive graph of Portuguese fado singers — who accompanied whom, across 120 years of recordings.',
    tags: ['music', 'culture'],
    prize: '$1,500',
    sort_order: 3,
  },
  {
    place: 'PEOPLE',
    name: 'surf-buddy',
    team: 'three-wave-rule',
    description:
      'Pair-up app for surfers at unfamiliar breaks. Graphs local regulars and skill levels so no one paddles out alone.',
    tags: ['social', 'fun'],
    prize: 'Crowd favorite',
    sort_order: 4,
  },
];

const DEVCATION_SPONSORS = [
  { name: 'TigerGraph', sort_order: 1 },
  { name: 'Vercel', sort_order: 2 },
  { name: 'Supabase', sort_order: 3 },
  { name: 'Hugging Face', sort_order: 4 },
  { name: 'Linear', sort_order: 5 },
  { name: 'Turso', sort_order: 6 },
];

async function upsertEvent(row) {
  const { data, error } = await supabase
    .from('events')
    .upsert(row, { onConflict: 'slug' })
    .select()
    .single();
  if (error) throw new Error(`Upsert '${row.slug}' failed: ${error.message}`);
  return data;
}

async function replaceChildren(table, eventId, rows) {
  const { error: delError } = await supabase.from(table).delete().eq('event_id', eventId);
  if (delError) throw new Error(`Wipe ${table} for ${eventId} failed: ${delError.message}`);
  if (!rows.length) return;
  const payload = rows.map((r) => ({ ...r, event_id: eventId }));
  const { error } = await supabase.from(table).insert(payload);
  if (error) throw new Error(`Insert ${table} for ${eventId} failed: ${error.message}`);
}

async function run() {
  console.log('🌱 Seeding events...');

  // Clear featured flag on any other events first, so only our featured row wins.
  await supabase.from('events').update({ featured: false }).neq('slug', FEATURED.slug);

  const featured = await upsertEvent(FEATURED);
  console.log(`   ✅ featured: ${featured.slug}`);

  for (const row of UPCOMING) {
    const ev = await upsertEvent(row);
    console.log(`   ✅ upcoming: ${ev.slug}`);
  }

  for (const row of PAST) {
    const ev = await upsertEvent(row);
    console.log(`   ✅ past:     ${ev.slug}`);
  }

  const kg = await upsertEvent(KG_WEEKEND);
  await replaceChildren('event_photos', kg.id, KG_PHOTOS);
  await replaceChildren('hackathon_projects', kg.id, KG_PROJECTS);
  await replaceChildren('event_sponsors', kg.id, KG_SPONSORS);
  console.log(`   ✅ hackathon: ${kg.slug} (${KG_PROJECTS.length} projects, ${KG_PHOTOS.length} photos, ${KG_SPONSORS.length} sponsors)`);

  const agents = await upsertEvent(AGENTS_HACK);
  await replaceChildren('event_photos', agents.id, AGENTS_PHOTOS);
  await replaceChildren('hackathon_projects', agents.id, AGENTS_PROJECTS);
  await replaceChildren('event_sponsors', agents.id, AGENTS_SPONSORS);
  console.log(`   ✅ hackathon: ${agents.slug} (${AGENTS_PROJECTS.length} projects, ${AGENTS_PHOTOS.length} photos, ${AGENTS_SPONSORS.length} sponsors)`);

  const devcation = await upsertEvent(DEVCATION);
  await replaceChildren('event_photos', devcation.id, DEVCATION_PHOTOS);
  await replaceChildren('hackathon_projects', devcation.id, DEVCATION_PROJECTS);
  await replaceChildren('event_sponsors', devcation.id, DEVCATION_SPONSORS);
  console.log(`   ✅ hackathon: ${devcation.slug} (${DEVCATION_PROJECTS.length} projects, ${DEVCATION_PHOTOS.length} photos, ${DEVCATION_SPONSORS.length} sponsors)`);

  console.log('🌱 Done.');
}

run().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
