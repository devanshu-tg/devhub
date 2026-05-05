"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  MapPin,
  Trophy,
  Users,
  Award,
  CheckCircle2,
} from "lucide-react";
import { GraphMotif } from "@/components/ui/GraphMotif";
import { Kicker } from "@/components/ui/SectionHeader";

const RULEBOOK_URL =
  "https://docs.google.com/document/d/1JHbw0n5pgSTf7pOG8z89mN1iT4-1ue4L3vhrJrIX7aI/edit?tab=t.0";
const TIGERGRAPH_TRACK_BRIEF_URL =
  "https://docs.google.com/document/d/1eyeIV8YsxLFSc8S3DH7i6uJFk5ks-DBRisx7e52CKJs/edit?usp=sharing";

const STAGES = [
  {
    round: "S1",
    label: "Mandatory Registration",
    dates: "March 15 – April 3, 2026",
    times: "12:00 AM IST Mar 15 → 11:59 PM IST Apr 3",
    body: "Participants locked in their spot by completing the mandatory registration form to officially begin their journey at Devcation Delhi 2026.",
  },
  {
    round: "S2",
    label: "TigerGraph Track Submission",
    dates: "March 31 – April 6, 2026",
    times: "Submission window opens Mar 31 · TigerGraph track deadline Apr 6, 11:59 PM IST",
    body: "TigerGraph track teams submitted their PPT, GitHub repo, and deployed link / demo video using the dedicated TigerGraph submission form. Incomplete submissions were rejected; multiple submissions or selecting multiple tracks were not allowed.",
  },
  {
    round: "S3",
    label: "Mentorship Round",
    dates: "April 5 – April 7, 2026",
    times: "12:00 PM IST Apr 5 → 11:59 PM IST Apr 7",
    body: "Shortlisted teams received mentorship from TigerGraph experts and industry mentors to refine their projects. Eliminatory round — teams were evaluated on progress and implementation to advance to the Grand Finale.",
  },
  {
    round: "S4",
    label: "Grand Finale at IIT Delhi",
    dates: "April 12, 2026",
    times: "11:00 AM IST → 6:00 PM IST",
    body: "The best teams pitched their solutions live at IIT Delhi, presented their projects to the judges, and competed for the top TigerGraph track prizes at the Devcation Delhi 2026 Grand Finale.",
  },
];

const PRIZES = [
  { rank: "TigerGraph Track — Winner", amount: "₹24,000", note: "Cash + Certificate" },
  { rank: "TigerGraph Track — Runner Up", amount: "₹12,000", note: "Cash + Certificate" },
];

const ELIGIBILITY = [
  "Engineering Students",
  "Postgraduate",
  "Undergraduate",
  "Arts, Commerce, Sciences & Others",
];

const HOSTS = ["GDG IGDTUW", "GDG IIT Delhi", "TigerGraph (Premium Track)"];

export default function DevcationEventPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--ink)] text-[color:var(--paper)]">
        <GraphMotif density={1} opacity={0.45} seed={37} color="var(--tg-orange)" />
        <div className="relative max-w-[1160px] mx-auto px-10 pt-10 pb-16">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.15em] text-white/60 hover:text-white mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> BACK TO EVENTS
          </Link>

          <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] text-[color:var(--accent)] mb-5 px-2.5 py-1 border border-[color:var(--accent)] rounded-full font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
            PAST EVENT · HACKATHON · TIGERGRAPH TRACK
          </div>
          <h1 className="text-[56px] font-medium leading-[1.04] tracking-[-0.035em] max-w-[860px]">
            Devcation Delhi 2026{" "}
            <span className="font-serif italic">— TigerGraph Track.</span>
          </h1>
          <p className="text-[17px] text-white/70 leading-[1.55] mt-5 max-w-[700px]">
            TigerGraph sponsored the Premium Track at Devcation Delhi 2026 — the flagship hackathon
            organized by GDG IGDTUW with GDG IIT Delhi. Teams built solutions on the TigerGraph
            database and competed for exclusive cash prizes at the Grand Finale at IIT Delhi.
          </p>

          <div className="flex flex-wrap gap-x-7 gap-y-3 mt-8 font-mono text-[12.5px] text-white/70">
            <span className="inline-flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[color:var(--accent)]" /> Mar 15 – Apr 12, 2026
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[color:var(--accent)]" /> IIT Delhi, India
            </span>
            <span className="inline-flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[color:var(--accent)]" /> Teams of 1–4
            </span>
            <span className="inline-flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-[color:var(--accent)]" /> ₹36,000 track prizes
            </span>
          </div>

          <div className="mt-10 flex items-center gap-5 flex-wrap">
            <a
              href={TIGERGRAPH_TRACK_BRIEF_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[color:var(--accent)] text-[color:var(--accent-fg)] text-[14px] font-semibold hover:bg-[color:var(--accent-hover)]"
            >
              TigerGraph Track Brief <ArrowUpRight className="w-4 h-4" />
            </a>
            <a
              href={RULEBOOK_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/20 bg-white/[0.04] text-white text-[13.5px] font-medium hover:bg-white/[0.08]"
            >
              Full Rulebook <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* About — TigerGraph Track focus */}
      <section className="max-w-[1160px] mx-auto px-10 py-16">
        <div className="grid grid-cols-[1fr_280px] gap-12">
          <div>
            <Kicker className="mb-3">/ ABOUT THE TIGERGRAPH TRACK</Kicker>
            <h2 className="text-[36px] font-medium tracking-[-0.028em] text-[color:var(--ink)] leading-[1.15] mb-6">
              The Premium Track on{" "}
              <span className="font-serif italic">connected data.</span>
            </h2>
            <div className="space-y-5 text-[15.5px] text-[color:var(--fg-muted)] leading-[1.65]">
              <p>
                Devcation Delhi 2026 ran four tracks across its three-week hackathon — Hack &apos;N&apos;
                Solve, Sustainability, Duality, and the TigerGraph Track. We&apos;re showcasing only
                the TigerGraph Track here.
              </p>
              <p>
                Teams in the TigerGraph Track built solutions using the TigerGraph database and
                related technologies — graph schema design, GSQL queries, analytics, and graph-native
                applications — competing for an exclusive ₹36,000 prize purse separate from the
                broader Devcation prize pool.
              </p>
              <p>
                Guided by TigerGraph mentors and industry experts, participants moved through
                registration, submission, mentorship, and a live Grand Finale at IIT Delhi on April
                12, 2026.
              </p>
            </div>
          </div>

          <aside className="flex flex-col gap-5">
            <div>
              <div className="font-mono text-[11px] tracking-[0.18em] text-[color:var(--fg-subtle)] mb-3">
                ELIGIBILITY
              </div>
              <ul className="space-y-2">
                {ELIGIBILITY.map((tag) => (
                  <li
                    key={tag}
                    className="flex items-start gap-2 text-[13px] text-[color:var(--ink)]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[color:var(--accent)] mt-[3px] shrink-0" />
                    <span>{tag}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-mono text-[11px] tracking-[0.18em] text-[color:var(--fg-subtle)] mb-3">
                ORGANIZED BY
              </div>
              <ul className="space-y-2">
                {HOSTS.map((h) => (
                  <li
                    key={h}
                    className="text-[13px] text-[color:var(--ink)] font-serif italic"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>

      {/* Stages & Timeline */}
      <section className="bg-[color:var(--cream)] border-y border-[color:var(--border)] py-16">
        <div className="max-w-[1160px] mx-auto px-10">
          <Kicker className="mb-3">/ STAGES & TIMELINE</Kicker>
          <h2 className="text-[32px] font-medium tracking-[-0.028em] text-[color:var(--ink)] mb-10 leading-[1.15]">
            From registration to{" "}
            <span className="font-serif italic">the IIT Delhi finale.</span>
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

      {/* Prizes — TigerGraph track only */}
      <section className="max-w-[1160px] mx-auto px-10 py-16">
        <div className="grid grid-cols-[280px_1fr] gap-12 items-start">
          <div className="sticky top-10">
            <Kicker className="mb-3">/ TRACK PRIZES</Kicker>
            <h2 className="text-[32px] font-medium tracking-[-0.028em] text-[color:var(--ink)] leading-[1.15] mb-3">
              ₹36,000 <span className="font-serif italic">TigerGraph purse.</span>
            </h2>
            <p className="text-[14px] text-[color:var(--fg-muted)] leading-[1.55]">
              Exclusive cash prizes and TigerGraph certificates for the top two TigerGraph Track
              teams. Other Devcation tracks (Hack &apos;N&apos; Solve, Sustainability, Duality) had
              their own prize pools and aren&apos;t shown here.
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

      {/* Resources */}
      <section className="max-w-[1160px] mx-auto px-10 pb-20">
        <div className="relative p-8 rounded-lg bg-[color:var(--ink)] text-[color:var(--paper)] overflow-hidden">
          <GraphMotif density={0.6} opacity={0.3} seed={51} color="var(--tg-orange)" />
          <div className="relative grid grid-cols-[1fr_auto] gap-10 items-end">
            <div>
              <div className="font-mono text-[11px] tracking-[0.18em] text-[color:var(--accent)] mb-3 font-semibold">
                / RESOURCES
              </div>
              <div className="text-[24px] font-medium leading-[1.2] tracking-[-0.018em] mb-2">
                Curious how the TigerGraph Track was{" "}
                <span className="font-serif italic">scoped and judged?</span>
              </div>
              <p className="text-[13.5px] text-white/65 leading-[1.55] max-w-[560px]">
                The TigerGraph track brief lays out the problem space, evaluation rubric, and
                expected deliverables. The full Devcation rulebook covers all four tracks.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <a
                href={TIGERGRAPH_TRACK_BRIEF_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[color:var(--accent)] text-[color:var(--accent-fg)] text-[13.5px] font-semibold hover:bg-[color:var(--accent-hover)]"
              >
                Track Brief <ArrowUpRight className="w-4 h-4" />
              </a>
              <a
                href={RULEBOOK_URL}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/20 bg-white/[0.04] text-white text-[13.5px] font-medium hover:bg-white/[0.08]"
              >
                Full Rulebook <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
