"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EventType } from "@/lib/api";
import { GraphMotif } from "@/components/ui/GraphMotif";
import { SectionHeader } from "@/components/ui/SectionHeader";

type EventCard = {
  slug: string;
  monthLabel: string;
  dayLabel: string;
  yearLabel: string;
  type: EventType;
  title: string;
  italicAccent: string | null;
  location: string;
  description: string;
  prizeNote: string;
};

const UPCOMING_EVENTS: EventCard[] = [
  {
    slug: "graphrag-inference-hackathon-2026",
    monthLabel: "MAY",
    dayLabel: "26",
    yearLabel: "2026",
    type: "hackathon",
    title: "GraphRAG Inference Hackathon",
    italicAccent: "by TigerGraph.",
    location: "Online · 1–5 person teams",
    description:
      "Build three pipelines side-by-side — raw LLM, Basic RAG, and GraphRAG — and prove that graphs make LLM inference faster, cheaper, and smarter. Registration closes May 10.",
    prizeNote: "₹65,795 prize pool",
  },
];

const PAST_EVENTS: EventCard[] = [
  {
    slug: "devcation-2026",
    monthLabel: "APR",
    dayLabel: "12",
    yearLabel: "2026",
    type: "hackathon",
    title: "Devcation '26 —",
    italicAccent: "TigerGraph Track.",
    location: "IIT Delhi · Premium Track sponsor",
    description:
      "TigerGraph backed the Premium Track at Devcation Delhi 2026 — teams built solutions on the TigerGraph database and competed for exclusive cash prizes at the Grand Finale at IIT Delhi.",
    prizeNote: "₹36,000 in TigerGraph track prizes",
  },
];

const TYPE_LABEL: Record<EventType, string> = {
  webinar: "WEBINAR",
  meetup: "MEETUP",
  hackathon: "HACK",
  study: "STUDY",
  qa: "Q&A",
  blog: "BLOG",
};

export default function EventsPage() {
  return (
    <div className="max-w-[1160px] mx-auto w-full">
      <section className="pt-16 pb-10 px-10">
        <SectionHeader
          kicker="/ EVENTS"
          title="Come hang out"
          italic="with us."
          sub="Weekly office hours, monthly meetups in your city, hackathons every quarter. All free, mostly caffeinated."
          size="lg"
        />
      </section>

      {/* Upcoming — agenda rows */}
      <section className="px-10 pb-16">
        <div className="flex items-end justify-between gap-6 mb-6">
          <div>
            <div className="font-mono text-[11px] tracking-[0.18em] text-[color:var(--accent)] mb-2 font-semibold">
              / UPCOMING
            </div>
            <h2 className="text-[28px] font-medium tracking-[-0.028em] text-[color:var(--ink)] leading-[1.15]">
              What&apos;s <span className="font-serif italic">next.</span>
            </h2>
          </div>
          <div className="font-mono text-[11px] tracking-[0.14em] text-[color:var(--fg-subtle)] pb-1">
            {UPCOMING_EVENTS.length} on the calendar
          </div>
        </div>

        <div className="border-t border-[color:var(--border)]">
          {UPCOMING_EVENTS.length === 0 ? (
            <div className="py-12 text-[14px] text-[color:var(--fg-muted)]">
              Nothing on the calendar yet — check back soon.
            </div>
          ) : (
            UPCOMING_EVENTS.map((ev) => (
              <Link
                key={ev.slug}
                href={`/events/${ev.slug}`}
                className="group grid grid-cols-[110px_1fr_auto] gap-7 items-center py-7 border-b border-[color:var(--border)] hover:bg-[color:var(--bg-hover)]/40 transition-colors"
              >
                <div>
                  <div className="font-mono text-[10.5px] tracking-[0.14em] text-[color:var(--accent)] font-semibold">
                    {ev.monthLabel}
                  </div>
                  <div className="font-serif italic text-[44px] leading-none tracking-[-0.03em] text-[color:var(--ink)] mt-1">
                    {ev.dayLabel}
                  </div>
                  <div className="font-mono text-[10.5px] text-[color:var(--fg-subtle)] mt-1.5">
                    {ev.yearLabel}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.14em] text-[color:var(--accent)] font-bold px-2 py-0.5 border border-[color:var(--accent)] rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
                      REGISTRATION OPEN
                    </span>
                    <span className="font-mono text-[10.5px] tracking-[0.14em] text-[color:var(--fg-subtle)]">
                      {TYPE_LABEL[ev.type]}
                    </span>
                  </div>
                  <div className="text-[20px] font-semibold text-[color:var(--ink)] tracking-[-0.014em] leading-[1.25] mb-1.5 group-hover:underline underline-offset-4">
                    {ev.title}
                    {ev.italicAccent ? (
                      <>
                        {" "}
                        <span className="font-serif italic">{ev.italicAccent}</span>
                      </>
                    ) : null}
                  </div>
                  <p className="text-[13.5px] text-[color:var(--fg-muted)] leading-[1.55] mb-2 max-w-[640px]">
                    {ev.description}
                  </p>
                  <div className="font-mono text-[11.5px] text-[color:var(--fg-subtle)] flex items-center gap-3">
                    <span>{ev.location}</span>
                    <span className="text-[color:var(--accent)] font-semibold">
                      {ev.prizeNote}
                    </span>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] text-[13px] font-semibold group-hover:opacity-90">
                  Details
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Past events — cream archive grid */}
      <section className="px-10 pb-24">
        <div className="relative rounded-[14px] border border-[color:var(--border)] bg-[color:var(--cream)] p-10 overflow-hidden">
          <GraphMotif density={0.4} opacity={0.18} seed={31} />
          <div className="relative">
            <div className="flex items-end justify-between gap-6 mb-8">
              <div>
                <div className="font-mono text-[11px] tracking-[0.18em] text-[color:var(--accent)] mb-2 font-semibold">
                  / PAST EVENTS
                </div>
                <h2 className="text-[28px] font-medium tracking-[-0.028em] text-[color:var(--ink)] leading-[1.15]">
                  From the <span className="font-serif italic">archive.</span>
                </h2>
                <p className="mt-2 text-[13.5px] text-[color:var(--fg-muted)] max-w-[520px]">
                  Hackathons and tracks TigerGraph has sponsored — recaps, prize lists, and resources.
                </p>
              </div>
              <div className="font-mono text-[11px] tracking-[0.14em] text-[color:var(--fg-subtle)] pb-1">
                {PAST_EVENTS.length} total
              </div>
            </div>

            {PAST_EVENTS.length === 0 ? (
              <div className="py-8 text-[13.5px] text-[color:var(--fg-muted)]">
                No past events yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PAST_EVENTS.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/events/${p.slug}`}
                    className="group flex flex-col gap-3 p-5 rounded-[10px] bg-[color:var(--paper)] border border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:shadow-[0_6px_20px_-12px_rgba(0,0,0,0.18)] transition"
                  >
                    <div className="inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[0.14em] text-[color:var(--fg-subtle)]">
                      <span className="text-[color:var(--accent)] font-semibold">
                        {p.monthLabel} {p.dayLabel}
                      </span>
                      <span>·</span>
                      <span>{p.yearLabel}</span>
                      <span>·</span>
                      <span>{TYPE_LABEL[p.type]}</span>
                    </div>
                    <div className="text-[16px] font-semibold text-[color:var(--ink)] leading-[1.3] tracking-[-0.012em]">
                      {p.title}
                      {p.italicAccent ? (
                        <>
                          {" "}
                          <span className="font-serif italic">{p.italicAccent}</span>
                        </>
                      ) : null}
                    </div>
                    <p className="text-[12.5px] text-[color:var(--fg-muted)] leading-[1.5] line-clamp-3">
                      {p.description}
                    </p>
                    <div className="mt-auto pt-2 flex items-center justify-between font-mono text-[11px] text-[color:var(--fg-subtle)]">
                      <span className="truncate">{p.location}</span>
                      <span className="text-[color:var(--accent)] font-semibold whitespace-nowrap inline-flex items-center gap-1">
                        {p.prizeNote}
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
