/**
 * Mock events used as a fallback when the backend API returns nothing.
 * Keeps /events looking alive without depending on the DB being seeded.
 */
import type {
  EventDetail,
  EventSummary,
  EventPhoto,
  HackathonProject,
  EventSponsor,
} from "./api";

function summary(
  id: string,
  slug: string,
  overrides: Partial<EventSummary>
): EventSummary {
  return {
    id,
    slug,
    title: "",
    italicAccent: null,
    type: "webinar",
    status: "upcoming",
    startsAt: null,
    endsAt: null,
    location: null,
    description: null,
    coverImage: null,
    coverTone: null,
    stats: {},
    featured: false,
    createdAt: new Date().toISOString(),
    rsvpCount: 0,
    ...overrides,
  };
}

export const MOCK_FEATURED: EventSummary = summary("mock-featured", "graph-llms-retrieval-2026", {
  title: "Graph + LLMs: building retrieval you can actually reason about",
  type: "webinar",
  status: "upcoming",
  startsAt: "2026-04-28T17:00:00Z",
  endsAt: "2026-04-28T18:00:00Z",
  location: "Virtual · 10:00 PT",
  description:
    "A 60-minute working session with the GSQL Copilot team. Bring hard questions, we'll debug them live.",
  coverTone: "orange",
  stats: { hosts: ["Soyeon Park", "Marcus Lin"], seats: 500 },
  featured: true,
  rsvpCount: 312,
});

export const MOCK_UPCOMING: EventSummary[] = [
  summary("mock-up-1", "meetup-nyc-may-2026", {
    title: "TigerGraph Meetup — New York",
    type: "meetup",
    startsAt: "2026-05-14T23:00:00Z",
    location: "Brooklyn · in person",
    description: "Pizza, lightning talks, and graph war stories. Come for the graphs, stay for the slices.",
    stats: { expected: 86 },
    rsvpCount: 86,
  }),
  summary("mock-up-2", "office-hours-gsql-may-2026", {
    title: "Office hours with the GSQL core team",
    type: "qa",
    startsAt: "2026-05-22T16:00:00Z",
    location: "Virtual · Q&A",
    description: "Open Q&A with the people who write GSQL. No topic off-limits.",
    stats: { expected: 201 },
    rsvpCount: 201,
  }),
  summary("mock-up-3", "hackathon-kg-june-2026", {
    title: "Hackathon: build-a-knowledge-graph",
    italicAccent: "weekend",
    type: "hackathon",
    startsAt: "2026-06-03T16:00:00Z",
    endsAt: "2026-06-05T23:00:00Z",
    location: "Hybrid · $5k prizes",
    description: "48 hours, one theme: graphs that mean something. Solo or teams up to 4.",
    stats: { expected: 124, prizes: "$5k" },
    rsvpCount: 124,
  }),
  summary("mock-up-4", "study-graph-ml-hamilton-ch5", {
    title: "Graph ML study group — Hamilton et al., ch. 5",
    type: "study",
    startsAt: "2026-06-18T23:00:00Z",
    location: "Virtual · book club",
    description: "Cowork through chapter 5. Bring a laptop and don't be shy about asking basics.",
    stats: { expected: 56 },
    rsvpCount: 56,
  }),
  summary("mock-up-5", "meetup-london-jul-2026", {
    title: "TigerGraph Meetup — London",
    type: "meetup",
    startsAt: "2026-07-09T18:00:00Z",
    location: "Shoreditch · in person",
    description: "A smaller room, louder voices. First UK meetup since 2024.",
    stats: { expected: 42 },
    rsvpCount: 42,
  }),
];

const MOCK_DEVCATION: EventSummary = summary("mock-past-devcation", "devcation-2026", {
  title: "Devcation",
  italicAccent: "'26.",
  type: "hackathon",
  status: "past",
  startsAt: "2026-04-04T15:00:00Z",
  endsAt: "2026-04-06T22:00:00Z",
  location: "Lisbon · in person + livestream",
  description:
    "Three days, one beach town, one brief: ship something graphy. 240 builders, 62 teams, a lot of bica. Here's what went down.",
  coverTone: "warm",
  stats: { participants: 240, projects: 62, prizes: "$10k", mentors: 22, views: "4.1k" },
  featured: false,
  rsvpCount: 240,
});

export const MOCK_PAST: EventSummary[] = [
  MOCK_DEVCATION,
  summary("mock-past-1", "fraud-detection-apr-2026", {
    title: "Fraud detection patterns with TigerGraph",
    type: "webinar",
    status: "past",
    startsAt: "2026-04-14T16:00:00Z",
    location: "Virtual · on demand",
    description: "Three production patterns for spotting fraud rings with graph queries.",
    stats: { views: "2.4k" },
  }),
  summary("mock-past-2", "schema-design-apr-2026", {
    title: "Schema design masterclass with the core team",
    type: "webinar",
    status: "past",
    startsAt: "2026-04-02T16:00:00Z",
    location: "Virtual · on demand",
    description: "Two hours on how to think about vertices, edges, and compound keys.",
    stats: { views: "3.8k" },
  }),
  summary("mock-past-3", "supply-chain-mar-2026", {
    title: "Supply chain graphs in production — 40k parts",
    type: "webinar",
    status: "past",
    startsAt: "2026-03-21T16:00:00Z",
    location: "Virtual · on demand",
    description: "How one EV maker spots single points of failure across a 40k-node bill of materials.",
    stats: { views: "1.9k" },
  }),
];

const DEVCATION_PHOTOS: EventPhoto[] = [
  { id: "dp1",  url: null, caption: "ARRIVAL · LISBON",      tone: "warm",   span: "hero",    sortOrder: 1 },
  { id: "dp2",  url: null, caption: "KICKOFF · BEACH DECK",  tone: "orange", span: "default", sortOrder: 2 },
  { id: "dp3",  url: null, caption: "TEAM FORMATION",        tone: "warm",   span: "default", sortOrder: 3 },
  { id: "dp4",  url: null, caption: "MENTOR WALK",           tone: "orange", span: "default", sortOrder: 4 },
  { id: "dp5",  url: null, caption: "SUNSET PAIR-PROGRAM",   tone: "warm",   span: "default", sortOrder: 5 },
  { id: "dp6",  url: null, caption: "DEMO NIGHT",            tone: "orange", span: "wide",    sortOrder: 6 },
  { id: "dp7",  url: null, caption: "JUDGE HUDDLE",          tone: "warm",   span: "default", sortOrder: 7 },
  { id: "dp8",  url: null, caption: "AWARDS · MAIN STAGE",   tone: "orange", span: "default", sortOrder: 8 },
  { id: "dp9",  url: null, caption: "GROUP PHOTO · 240",     tone: "warm",   span: "default", sortOrder: 9 },
  { id: "dp10", url: null, caption: "BEACH AFTERPARTY",      tone: "orange", span: "default", sortOrder: 10 },
];

const DEVCATION_PROJECTS: HackathonProject[] = [
  {
    id: "dpr1",
    place: "1ST",
    name: "tide-charts",
    team: "low-water-mark",
    description:
      "Coastal-resilience graph linking tide gauges, storm drains, and historic flood zones. Flags neighborhoods likely to flood in the next 48 hours.",
    tags: ["climate", "geospatial"],
    prize: "$5,000",
    imageUrl: null,
    repoUrl: null,
    sortOrder: 1,
  },
  {
    id: "dpr2",
    place: "2ND",
    name: "bica-flow",
    team: "espresso-depth-first",
    description:
      "Realtime coffee supply-chain graph from bean to cup. Built in 40 hours with a live feed from 12 Lisbon cafés.",
    tags: ["supply", "iot"],
    prize: "$2,500",
    imageUrl: null,
    repoUrl: null,
    sortOrder: 2,
  },
  {
    id: "dpr3",
    place: "3RD",
    name: "fado-atlas",
    team: "saudade-net",
    description:
      "Interactive graph of Portuguese fado singers — who accompanied whom, across 120 years of recordings.",
    tags: ["music", "culture"],
    prize: "$1,500",
    imageUrl: null,
    repoUrl: null,
    sortOrder: 3,
  },
  {
    id: "dpr4",
    place: "PEOPLE",
    name: "surf-buddy",
    team: "three-wave-rule",
    description:
      "Pair-up app for surfers at unfamiliar breaks. Graphs local regulars and skill levels so no one paddles out alone.",
    tags: ["social", "fun"],
    prize: "Crowd favorite",
    imageUrl: null,
    repoUrl: null,
    sortOrder: 4,
  },
];

const DEVCATION_SPONSORS: EventSponsor[] = [
  { id: "ds1", name: "TigerGraph",    url: null, sortOrder: 1 },
  { id: "ds2", name: "Vercel",        url: null, sortOrder: 2 },
  { id: "ds3", name: "Supabase",      url: null, sortOrder: 3 },
  { id: "ds4", name: "Hugging Face",  url: null, sortOrder: 4 },
  { id: "ds5", name: "Linear",        url: null, sortOrder: 5 },
  { id: "ds6", name: "Turso",         url: null, sortOrder: 6 },
];

export const MOCK_EVENT_DETAILS: Record<string, EventDetail> = {
  "devcation-2026": {
    event: MOCK_DEVCATION,
    photos: DEVCATION_PHOTOS,
    projects: DEVCATION_PROJECTS,
    sponsors: DEVCATION_SPONSORS,
    userRsvped: false,
  },
};
