/**
 * Seed past TigerGraph events into the `events` table.
 *
 * Source: https://www.tigergraph.com/events/  (2022 industry events)
 *         Graph + AI Summit 2024 sessions
 *         https://www.tigergraph.com/webinar/  (on-demand recordings)
 *
 * Each row stores the external page URL in `stats.external_url` so the
 * frontend can link out for items that don't have an internal detail page.
 *
 * Run:  node src/scripts/seedPastEvents.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

function slugify(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

const COVER = 'https://www.tigergraph.com/wp-content/uploads/2024/03/GAI_EVERYTHING_1024x560.png.webp';

const PAST_EVENTS = [
  // ── Graph + AI Summit 2024 ──
  {
    title: "Graphs and AI in a World Where Everything Is Connected",
    italic_accent: "keynote",
    type: 'webinar',
    starts_at: '2024-05-01T15:30:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Opening keynote with TigerGraph CEO Hamid Azzawe on graph technology in the AI era.',
    external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page',
    hosts: ['Hamid Azzawe'],
  },
  {
    title: "Graph Database Technology in Fraud and Financial Crime",
    type: 'webinar',
    starts_at: '2024-05-01T16:00:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'NICE Actimize on graph-powered fraud detection in financial services.',
    external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page',
    hosts: ['Adam McLaughlin', 'Gilles Alis'],
  },
  {
    title: "Introducing GraphHouse",
    italic_accent: "turbocharge your data lake",
    type: 'webinar',
    starts_at: '2024-05-01T16:30:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Dr. Mingxi Wu unveils GraphHouse — GenAI-enhanced graph analytics on top of your data lake.',
    external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page',
    hosts: ['Dr. Mingxi Wu'],
  },
  {
    title: "Embeddings Everywhere",
    type: 'webinar',
    starts_at: '2024-05-01T17:00:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Dan McCreary on why graph embeddings are becoming foundational for AI.',
    external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page',
    hosts: ['Dan McCreary'],
  },
  {
    title: "Workshop: Customer 360 with TigerGraph in 60 Minutes",
    type: 'study',
    starts_at: '2024-05-01T18:30:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Hands-on session building a Customer 360 graph in one hour.',
    external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page',
    hosts: ['Victor Moey', 'Dr. Victor Lee'],
  },
  {
    title: "Workshop: Cut More Fraud with Graph-Powered ML",
    type: 'study',
    starts_at: '2024-05-01T19:30:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Combining graph features with ML to improve fraud detection accuracy.',
    external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page',
    hosts: ['Dr. Victor Lee', 'Robert Buechner'],
  },
  {
    title: "The Graph-AI Convergence",
    italic_accent: "in tomorrow's landscape",
    type: 'webinar',
    starts_at: '2024-05-02T15:30:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Day-2 keynote on where graph + AI are headed next.',
    external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page',
    hosts: ['Dan McCreary'],
  },
  {
    title: "Graph Representation Learning to Secure the Global Payments Ecosystem",
    type: 'webinar',
    starts_at: '2024-05-02T16:00:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Mastercard on applying graph representation learning at payments scale.',
    external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page',
    hosts: ['Nitendra Rajput', 'Elyse Cuttler'],
  },
  {
    title: "Transforming Fleet Planning with Graph + AI",
    type: 'webinar',
    starts_at: '2024-05-02T18:00:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Hoptek on graph + AI for fleet and logistics planning.',
    external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page',
    hosts: ['Balaji Guntur'],
  },
  {
    title: "Workshop: GenAI + Graph",
    italic_accent: "better answers, fewer hallucinations",
    type: 'study',
    starts_at: '2024-05-02T18:30:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Using graph context to ground LLMs and reduce hallucinations in GenAI apps.',
    external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page',
    hosts: ['Parker Erickson', 'Dan McCreary'],
  },
  {
    title: "Workshop: Real-Time Digital Twins",
    italic_accent: "from supply chains to data centers",
    type: 'study',
    starts_at: '2024-05-02T19:30:00Z',
    location: 'Virtual · Graph + AI Summit 2024',
    description: 'Building real-time digital twins for supply chains and data center operations.',
    external_url: 'https://graphsummit.tigergraph.com/series/graph-ai-summit-2024/landing_page',
    hosts: ['Dr. Victor Lee', 'Andrew Kasper'],
  },

  // ── On-demand Webinars ──
  {
    title: "Build Your First No-Code App With TigerGraph Insights",
    type: 'webinar',
    starts_at: '2023-06-19T17:00:00Z',
    location: 'On demand · Webinar',
    description: 'Hands-on intro to TigerGraph Insights — the no-code graph app builder.',
    external_url: 'https://info.tigergraph.com/insights',
  },
  {
    title: "Unlock Smarter Insights at Scale",
    italic_accent: "ML on connected data",
    type: 'webinar',
    starts_at: '2023-04-12T17:00:00Z',
    location: 'On demand · Webinar',
    description: 'A tour of ML Workbench — a Jupyter-based framework for graph deep learning.',
    external_url: 'https://info.tigergraph.com/ml-workbench-webinar',
  },
  {
    title: "Dell: Better Answers Using Graph Analytics and TigerGraph",
    type: 'webinar',
    starts_at: '2023-03-08T17:00:00Z',
    location: 'On demand · Dell HPC',
    description: 'Applications of graph analytics in fraud, recommendations, and supply chain.',
    external_url: 'https://dellhpc.org/events/24255',
  },
  {
    title: "TigerGraph Cloud",
    italic_accent: "competitive advantages",
    type: 'webinar',
    starts_at: '2023-02-15T17:00:00Z',
    location: 'On demand · Webinar',
    description: 'Why TigerGraph Cloud lets teams build apps instead of managing databases.',
    external_url: 'https://info.tigergraph.com/gain-more-competitive-advantages-with-tigergraph-cloud',
  },
  {
    title: "Fraud Detection Solutions to Fight Retail Fraud",
    type: 'webinar',
    starts_at: '2022-11-09T17:00:00Z',
    location: 'On demand · w/ Expero',
    description: 'Graph-powered fraud detection patterns for retail use cases.',
    external_url: 'https://www.experoinc.com/get/fraud-detection-solutions-to-fight-retail-fraud',
  },
  {
    title: "Forrester TEI",
    italic_accent: "cost savings & business benefits of TigerGraph",
    type: 'webinar',
    starts_at: '2022-09-21T17:00:00Z',
    location: 'On demand · Webinar',
    description: 'Forrester Consulting examines the ROI of moving to TigerGraph.',
    external_url: 'https://info.tigergraph.com/forrester-tei-webinar',
  },
  {
    title: "Graph Gurus: TigerGraph 101",
    italic_accent: "4-part intro series",
    type: 'webinar',
    starts_at: '2022-01-20T17:00:00Z',
    location: 'On demand · 4-part series',
    description: 'Four-part introduction to graph databases and TigerGraph fundamentals.',
    external_url: 'https://info.tigergraph.com/graph-gurus-intro',
  },

  // ── Industry conferences & speaking engagements ──
  {
    title: "The Knowledge Graph Conference 2022",
    type: 'meetup',
    starts_at: '2022-05-02T13:00:00Z',
    location: 'New York City',
    description: 'TigerGraph at KGC 2022 — talks, panels, and community meetups.',
    external_url: 'https://www.knowledgegraph.tech/',
  },
  {
    title: "DBTA Data Summit 2022",
    type: 'meetup',
    starts_at: '2022-05-17T13:00:00Z',
    location: 'Boston, MA',
    description: 'Database Trends and Applications annual summit.',
    external_url: 'https://www.dbta.com/DataSummit/2022/default.aspx',
  },
  {
    title: "AI4 2022 Flagship",
    type: 'meetup',
    starts_at: '2022-08-16T13:00:00Z',
    location: 'Las Vegas, NV',
    description: "One of North America's largest AI industry events.",
    external_url: 'https://ai4.io/usa/',
  },
  {
    title: "Gartner Data & Analytics Summit 2022",
    type: 'meetup',
    starts_at: '2022-08-22T13:00:00Z',
    location: 'Orlando, FL',
    description: 'Gartner Data & Analytics Summit — TigerGraph booth + speaking slots.',
    external_url: 'https://www.gartner.com/en/conferences/na/data-analytics-us',
  },
  {
    title: "ACAMS Las Vegas Conference",
    type: 'meetup',
    starts_at: '2022-10-10T13:00:00Z',
    location: 'Las Vegas, NV',
    description: "Anti-money-laundering conference — graph-powered compliance in focus.",
    external_url: 'https://www.acams.org/en/events/conferences/acams-las-vegas-conference',
  },
  {
    title: "World AI Cannes",
    type: 'meetup',
    starts_at: '2022-04-14T08:00:00Z',
    location: 'Cannes, France',
    description: "Flagship European AI summit.",
    external_url: 'https://worldaicannes.com/',
  },
  {
    title: "Big Data & AI World Frankfurt",
    type: 'meetup',
    starts_at: '2022-05-11T08:00:00Z',
    location: 'Frankfurt, Germany',
    description: "European data + AI industry showcase.",
    external_url: 'https://www.bigdataworldfrankfurt.de/',
  },
  {
    title: "Data Connectors Cybersecurity Summit — Austin",
    type: 'meetup',
    starts_at: '2022-04-13T13:00:00Z',
    location: 'Austin, TX',
    description: "Cybersecurity summit — graph for threat detection.",
    external_url: 'https://dataconnectors.com/events/2022/april/austin/',
  },
];

async function run() {
  console.log(`🔄 Seeding ${PAST_EVENTS.length} past events...`);
  let inserted = 0, updated = 0, errors = 0;

  for (const ev of PAST_EVENTS) {
    const slug = slugify(ev.title);
    const stats = { external_url: ev.external_url };
    if (ev.hosts) stats.hosts = ev.hosts;
    const row = {
      slug,
      title: ev.title,
      italic_accent: ev.italic_accent || null,
      type: ev.type,
      status: 'past',
      starts_at: ev.starts_at,
      ends_at: null,
      location: ev.location,
      description: ev.description,
      cover_image: COVER,
      cover_tone: 'orange',
      stats,
      featured: false,
    };

    try {
      const { data: existing } = await supabase
        .from('events')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase.from('events').update(row).eq('id', existing.id);
        if (error) throw error;
        updated++;
      } else {
        const { error } = await supabase.from('events').insert([row]);
        if (error) throw error;
        inserted++;
      }
    } catch (err) {
      console.error(`Failed to upsert event ${slug}:`, err.message);
      errors++;
    }
  }

  console.log(`✅ Seed complete: ${inserted} new, ${updated} updated, ${errors} errors`);
}

run().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
