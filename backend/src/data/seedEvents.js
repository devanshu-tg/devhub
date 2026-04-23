/**
 * Events seed script.
 *
 * Seeds the featured upcoming event and the Devcation past hackathon
 * (with photos, projects, sponsors). Removes any other events that
 * might have been seeded previously so the /events UI only shows these two.
 *
 * Idempotent: each event is upserted by slug; non-kept events are
 * deleted on every run.
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

const DEVCATION = {
  slug: 'devcation-iit-delhi-2026',
  title: 'Devcation',
  italic_accent: "Delhi '26.",
  type: 'hackathon',
  status: 'past',
  starts_at: '2026-03-24T09:00:00Z',
  ends_at: '2026-04-13T18:00:00Z',
  location: 'IIT Delhi · in person',
  description:
    "Hack 'n Solve at IIT Delhi, co-hosted by Google Developer Groups on Campus (IGDTUW × IITD). TigerGraph sponsored the graph track — Team Graphite took the ₹24,000 purse.",
  cover_image: '/event-gallery/devcation/devcation-01.jpeg',
  cover_tone: 'orange',
  stats: {
    external_url: 'https://unstop.com/hackathons/devcation-hack-n-solve-iit-delhi-1659241',
    hosts: ['GDG IGDTUW', 'GDG IITD', 'TigerGraph'],
    prize_track: 'TigerGraph track · ₹24,000',
  },
  featured: false,
};

const DEVCATION_PHOTOS = [
  { url: '/event-gallery/devcation/devcation-01.jpeg', tone: 'orange', caption: 'OPENING · IIT DELHI',     span: 'hero',    sort_order: 1 },
  { url: '/event-gallery/devcation/devcation-02.jpeg', tone: 'warm',   caption: 'KICKOFF',                 span: 'default', sort_order: 2 },
  { url: '/event-gallery/devcation/devcation-03.jpeg', tone: 'orange', caption: 'TEAM FORMATION',          span: 'default', sort_order: 3 },
  { url: '/event-gallery/devcation/devcation-04.jpeg', tone: 'warm',   caption: 'HACK IN PROGRESS',        span: 'default', sort_order: 4 },
  { url: '/event-gallery/devcation/devcation-05.jpeg', tone: 'orange', caption: 'TIGERGRAPH TRACK WINNERS', span: 'wide',   sort_order: 5 },
  { url: '/event-gallery/devcation/devcation-06.jpeg', tone: 'warm',   caption: 'MENTOR ROUNDS',           span: 'default', sort_order: 6 },
  { url: '/event-gallery/devcation/devcation-07.jpeg', tone: 'orange', caption: 'DEMO STAGE',              span: 'default', sort_order: 7 },
  { url: '/event-gallery/devcation/devcation-08.jpeg', tone: 'warm',   caption: 'PITCH NIGHT',             span: 'default', sort_order: 8 },
  { url: '/event-gallery/devcation/devcation-09.jpeg', tone: 'orange', caption: 'WORKING SESSIONS',        span: 'default', sort_order: 9 },
  { url: '/event-gallery/devcation/devcation-10.jpeg', tone: 'warm',   caption: 'JUDGING',                 span: 'default', sort_order: 10 },
  { url: '/event-gallery/devcation/devcation-11.jpeg', tone: 'orange', caption: 'AWARDS',                  span: 'default', sort_order: 11 },
  { url: '/event-gallery/devcation/devcation-12.jpeg', tone: 'warm',   caption: 'TEAM GRAPHITE',           span: 'default', sort_order: 12 },
  { url: '/event-gallery/devcation/devcation-13.jpeg', tone: 'orange', caption: 'HALLWAYS',                span: 'default', sort_order: 13 },
  { url: '/event-gallery/devcation/devcation-14.jpeg', tone: 'warm',   caption: 'LUNCH BREAK',             span: 'default', sort_order: 14 },
  { url: '/event-gallery/devcation/devcation-15.jpeg', tone: 'orange', caption: 'WHITEBOARDING',           span: 'default', sort_order: 15 },
  { url: '/event-gallery/devcation/devcation-16.jpeg', tone: 'warm',   caption: 'BUILDERS',                span: 'default', sort_order: 16 },
  { url: '/event-gallery/devcation/devcation-17.jpeg', tone: 'orange', caption: 'COLLABORATION',           span: 'default', sort_order: 17 },
  { url: '/event-gallery/devcation/devcation-18.jpeg', tone: 'warm',   caption: 'FINAL PUSH',              span: 'default', sort_order: 18 },
  { url: '/event-gallery/devcation/devcation-19.jpeg', tone: 'orange', caption: 'STAGE · RECAP',           span: 'default', sort_order: 19 },
  { url: '/event-gallery/devcation/devcation-20.jpeg', tone: 'warm',   caption: 'CLOSING',                 span: 'default', sort_order: 20 },
  { url: '/event-gallery/devcation/devcation-21.jpeg', tone: 'orange', caption: 'GROUP PHOTO',             span: 'default', sort_order: 21 },
];

const DEVCATION_SPONSORS = [
  { name: 'TigerGraph', sort_order: 1 },
  { name: 'GDG on Campus IGDTUW', sort_order: 2 },
  { name: 'GDG on Campus IITD', sort_order: 3 },
];

const KEEP_SLUGS = [FEATURED.slug, DEVCATION.slug];

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

  const keepList = `(${KEEP_SLUGS.map((s) => `"${s}"`).join(',')})`;
  const { error: delError } = await supabase
    .from('events')
    .delete()
    .not('slug', 'in', keepList);
  if (delError) throw new Error(`Wipe other events failed: ${delError.message}`);
  console.log('   🧹 removed events outside keep-list');

  const featured = await upsertEvent(FEATURED);
  console.log(`   ✅ featured: ${featured.slug}`);

  const devcation = await upsertEvent(DEVCATION);
  await replaceChildren('event_photos', devcation.id, DEVCATION_PHOTOS);
  await replaceChildren('event_sponsors', devcation.id, DEVCATION_SPONSORS);
  console.log(`   ✅ devcation: ${devcation.slug} (${DEVCATION_PHOTOS.length} photos, ${DEVCATION_SPONSORS.length} sponsors)`);

  console.log('🌱 Done.');
}

run().catch((err) => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
