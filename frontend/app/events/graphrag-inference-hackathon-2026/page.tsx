"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  MapPin,
  Trophy,
  Users,
  Mail,
  Phone,
  Award,
} from "lucide-react";
import { GraphMotif } from "@/components/ui/GraphMotif";
import { Kicker } from "@/components/ui/SectionHeader";

const REGISTER_URL =
  "https://unstop.com/o/97bGeFT?lb=tLVWYby&utm_medium=Share&utm_source=online_coding_challenge&utm_campaign=Devansax4514";

const STAGES = [
  {
    round: "R1",
    label: "Building & Submission Phase",
    dates: "May 4 – May 16, 2026",
    times: "12:00 PM IST May 4 → 11:59 PM IST May 16",
    body: "Teams build their three-pipeline GraphRAG system (LLM-Only, Basic RAG, and GraphRAG) and submit all deliverables through Unstop before the deadline. Detailed submission guidelines will be shared separately with all registered teams. After Round 1, the Top 10 teams will be shortlisted and move forward to mentoring sessions and the final judging round.",
  },
  {
    round: "R2",
    label: "Final Judging & Winner Announcement",
    dates: "May 18 – May 26, 2026",
    times: "1:1 mentoring May 18–24 · Final pitches May 25 · Winners May 26",
    body: "Top 10 teams receive 1:1 mentoring sessions with TigerGraph experts between May 18–24 to refine their solutions. On May 25, teams present their GraphRAG solutions live to the judging panel — demoing the three-pipeline system, showcasing the benchmark dashboard, and defending their results in Q&A. Winners announced May 26.",
  },
];

const KEY_DATES = [
  { label: "Registration closes", value: "May 10, 2026", note: "11:59 PM IST" },
  { label: "Round 1 submission", value: "May 16, 2026", note: "11:59 PM IST" },
  { label: "Winners announced", value: "May 26, 2026", note: "After final pitches" },
];

const PRIZES = [
  { rank: "Winner — 1st Place", amount: "₹23,499", note: "Cash + Certificate" },
  { rank: "1st Runner-Up — 2nd Place", amount: "₹14,099", note: "Cash + Certificate" },
  { rank: "2nd Runner-Up — 3rd Place", amount: "₹9,399", note: "Cash + Certificate" },
  { rank: "Community Leads' Exclusive Winner", amount: "₹9,399", note: "Cash + Certificate" },
  {
    rank: "Content Creation Bounty",
    amount: "₹9,399",
    note: "Cash + Certificate · Sign up: luma.com/2djtowt9",
  },
  { rank: "Top 10 Teams", amount: "Certificate", note: "Appreciation certificates" },
  { rank: "All Participants", amount: "Certificate", note: "Participation certificate" },
];

const THEMES = ["Applied AI", "Data Science", "GraphRAG", "RAG Systems", "LLM Inference"];

export default function GraphRAGEventPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--ink)] text-[color:var(--paper)]">
        <GraphMotif density={1} opacity={0.45} seed={19} color="var(--tg-orange)" />
        <div className="relative max-w-[1160px] mx-auto px-10 pt-10 pb-16">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.15em] text-white/60 hover:text-white mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> BACK TO EVENTS
          </Link>

          <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] text-[color:var(--accent)] mb-5 px-2.5 py-1 border border-[color:var(--accent)] rounded-full font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
            REGISTRATION OPEN · HACKATHON
          </div>
          <h1 className="text-[56px] font-medium leading-[1.04] tracking-[-0.035em] max-w-[820px]">
            GraphRAG Inference Hackathon{" "}
            <span className="font-serif italic">by TigerGraph.</span>
          </h1>
          <p className="text-[17px] text-white/70 leading-[1.55] mt-5 max-w-[680px]">
            A beginner-friendly online coding challenge. Build three pipelines side-by-side — raw LLM,
            Basic RAG, and GraphRAG — and prove that graphs make LLM inference faster, cheaper, and
            smarter than vector-based RAG alone.
          </p>

          <div className="flex flex-wrap gap-x-7 gap-y-3 mt-8 font-mono text-[12.5px] text-white/70">
            <span className="inline-flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[color:var(--accent)]" /> May 4 – May 26, 2026
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[color:var(--accent)]" /> Online
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[color:var(--accent)]" /> Teams of 1–5
            </span>
            <span className="inline-flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-[color:var(--accent)]" /> ₹65,795 prize pool
            </span>
          </div>

          <div className="mt-10 flex items-center gap-5 flex-wrap">
            <a
              href={REGISTER_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 px-7 py-4 rounded-full bg-[color:var(--accent)] text-[color:var(--accent-fg)] text-[15px] font-semibold hover:bg-[color:var(--accent-hover)]"
            >
              Register on Unstop <ArrowUpRight className="w-4 h-4" />
            </a>
            <span className="font-mono text-[12px] text-white/55">
              Closes May 10 · 11:59 PM IST
            </span>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="max-w-[1160px] mx-auto px-10 py-16">
        <div className="grid grid-cols-[1fr_280px] gap-12">
          <div>
            <Kicker className="mb-3">/ ABOUT</Kicker>
            <h2 className="text-[36px] font-medium tracking-[-0.028em] text-[color:var(--ink)] leading-[1.15] mb-6">
              Prove that graphs solve the{" "}
              <span className="font-serif italic">token explosion.</span>
            </h2>
            <div className="space-y-5 text-[15.5px] text-[color:var(--fg-muted)] leading-[1.65]">
              <p>
                LLMs are spreading rapidly across every industry, and as they do, token consumption
                is exploding. Companies pay more, wait longer, and hit context limits faster every
                quarter. This isn&apos;t an academic exercise — it&apos;s a real, growing pain in
                production AI today.
              </p>
              <p>
                The GraphRAG Inference Hackathon by TigerGraph is your chance to prove that graphs
                solve this. You&apos;ll build three pipelines side-by-side (raw LLM, Basic RAG, and
                GraphRAG) and let the numbers tell the story.
              </p>
              <p>
                <strong className="text-[color:var(--ink)]">The headline metric:</strong> token
                reduction with maintained accuracy. Show us how much GraphRAG cuts down inference
                cost without sacrificing answer quality.
              </p>
            </div>
          </div>

          <aside className="flex flex-col gap-2.5">
            <div className="font-mono text-[11px] tracking-[0.18em] text-[color:var(--fg-subtle)] mb-1">
              THEMES
            </div>
            {THEMES.map((tag) => (
              <div
                key={tag}
                className="px-4 py-2.5 border border-[color:var(--border)] rounded-md bg-[color:var(--bg-elev)] text-[13px] text-[color:var(--ink)] font-medium"
              >
                {tag}
              </div>
            ))}
          </aside>
        </div>
      </section>

      {/* Stages & Timeline */}
      <section className="bg-[color:var(--cream)] border-y border-[color:var(--border)] py-16">
        <div className="max-w-[1160px] mx-auto px-10">
          <Kicker className="mb-3">/ STAGES & TIMELINE</Kicker>
          <h2 className="text-[32px] font-medium tracking-[-0.028em] text-[color:var(--ink)] mb-10 leading-[1.15]">
            Two rounds, <span className="font-serif italic">three weeks.</span>
          </h2>
          <div className="space-y-5">
            {STAGES.map((s) => (
              <div
                key={s.round}
                className="grid grid-cols-[80px_1fr] gap-6 p-7 bg-[color:var(--paper)] border border-[color:var(--border)] rounded-lg"
              >
                <div className="text-[color:var(--accent)] font-mono text-[15px] font-semibold tracking-[0.1em]">
                  {s.round}
                </div>
                <div>
                  <div className="font-mono text-[11px] tracking-[0.18em] text-[color:var(--accent)] font-semibold mb-2">
                    {s.dates.toUpperCase()}
                  </div>
                  <h3 className="text-[20px] font-semibold text-[color:var(--ink)] tracking-[-0.012em] mb-2">
                    {s.label}
                  </h3>
                  <div className="font-mono text-[12px] text-[color:var(--fg-subtle)] mb-3">
                    {s.times}
                  </div>
                  <p className="text-[14.5px] text-[color:var(--fg-muted)] leading-[1.65]">
                    {s.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key dates */}
      <section className="max-w-[1160px] mx-auto px-10 py-14">
        <Kicker className="mb-3">/ IMPORTANT DATES</Kicker>
        <h2 className="text-[28px] font-medium tracking-[-0.028em] text-[color:var(--ink)] leading-[1.15] mb-7">
          Mark your <span className="font-serif italic">calendar.</span>
        </h2>
        <div className="grid grid-cols-3 gap-4">
          {KEY_DATES.map((d) => (
            <div
              key={d.label}
              className="p-6 border border-[color:var(--border)] rounded-lg bg-[color:var(--bg-elev)]"
            >
              <div className="font-mono text-[10.5px] tracking-[0.16em] text-[color:var(--fg-subtle)] mb-2">
                {d.label.toUpperCase()}
              </div>
              <div className="text-[18px] font-semibold text-[color:var(--ink)] tracking-[-0.012em]">
                {d.value}
              </div>
              <div className="font-mono text-[11.5px] text-[color:var(--fg-muted)] mt-1">
                {d.note}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Prizes */}
      <section className="max-w-[1160px] mx-auto px-10 py-12">
        <div className="grid grid-cols-[280px_1fr] gap-12 items-start">
          <div className="sticky top-10">
            <Kicker className="mb-3">/ PRIZES</Kicker>
            <h2 className="text-[32px] font-medium tracking-[-0.028em] text-[color:var(--ink)] leading-[1.15] mb-3">
              ₹65,795 <span className="font-serif italic">prize pool.</span>
            </h2>
            <p className="text-[14px] text-[color:var(--fg-muted)] leading-[1.55]">
              Cash, certificates, and TigerGraph recognition. All prizes and certificates released
              within 30 days after the event.
            </p>
          </div>
          <div className="space-y-3">
            {PRIZES.map((p) => (
              <div
                key={p.rank}
                className="grid grid-cols-[1fr_auto] gap-6 items-center p-5 border border-[color:var(--border)] rounded-lg bg-[color:var(--paper)] hover:border-[color:var(--border-strong)] transition"
              >
                <div>
                  <div className="text-[15px] font-semibold text-[color:var(--ink)] tracking-[-0.005em] flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-[color:var(--accent)]" />
                    {p.rank}
                  </div>
                  <div className="font-mono text-[12px] text-[color:var(--fg-muted)] mt-1.5 ml-[22px]">
                    {p.note}
                  </div>
                </div>
                <div className="text-[18px] font-semibold text-[color:var(--accent)] font-mono whitespace-nowrap">
                  {p.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact + Final CTA */}
      <section className="max-w-[1160px] mx-auto px-10 py-16">
        <div className="grid grid-cols-2 gap-6">
          <div className="p-7 border border-[color:var(--border)] rounded-lg bg-[color:var(--bg-elev)]">
            <Kicker className="mb-3">/ ORGANIZER</Kicker>
            <div className="text-[20px] font-semibold text-[color:var(--ink)] mb-1 tracking-[-0.01em]">
              Devanshu Saxena
            </div>
            <div className="font-mono text-[12px] text-[color:var(--fg-muted)] mb-5">
              TigerGraph
            </div>
            <div className="space-y-2.5">
              <a
                href="mailto:devanshu.saxena@tigergraph.com"
                className="flex items-center gap-2.5 text-[13.5px] text-[color:var(--ink)] hover:text-[color:var(--accent)]"
              >
                <Mail className="w-4 h-4" /> devanshu.saxena@tigergraph.com
              </a>
              <a
                href="tel:+917404313376"
                className="flex items-center gap-2.5 text-[13.5px] text-[color:var(--ink)] hover:text-[color:var(--accent)]"
              >
                <Phone className="w-4 h-4" /> +91 74043 13376
              </a>
            </div>
          </div>

          <div className="relative p-7 rounded-lg bg-[color:var(--ink)] text-[color:var(--paper)] overflow-hidden">
            <GraphMotif density={0.6} opacity={0.35} seed={51} color="var(--tg-orange)" />
            <div className="relative h-full flex flex-col">
              <div className="font-mono text-[11px] tracking-[0.18em] text-[color:var(--accent)] mb-3 font-semibold">
                / READY?
              </div>
              <div className="text-[24px] font-medium leading-[1.2] tracking-[-0.018em] mb-3">
                Lock in your team and{" "}
                <span className="font-serif italic">start shipping.</span>
              </div>
              <p className="text-[13px] text-white/65 leading-[1.55] mb-auto">
                Registration is on Unstop. Free entry. Closes May 10 at 11:59 PM IST.
              </p>
              <a
                href={REGISTER_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="mt-6 inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[color:var(--accent)] text-[color:var(--accent-fg)] text-[13.5px] font-semibold hover:bg-[color:var(--accent-hover)] self-start"
              >
                Register on Unstop <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
