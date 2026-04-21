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

  console.log('🌱 Done.');
}

run().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
