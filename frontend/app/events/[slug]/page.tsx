"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Calendar, Github, Play, Users } from "lucide-react";
import {
  EventDetail,
  EventPhoto,
  HackathonProject,
  getEvent,
} from "@/lib/api";
import { MOCK_EVENT_DETAILS } from "@/lib/mockEvents";
import { GraphMotif } from "@/components/ui/GraphMotif";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { IconBadge, Chip } from "@/components/ui/Pills";

const QUICK_LINKS = [
  { Icon: Play, label: "Livestream replay", sub: "2h 14m highlights" },
  { Icon: Github, label: "All projects", sub: "on GitHub" },
  { Icon: BookOpen, label: "Judging rubric", sub: "PDF · 2 pages" },
  { Icon: Calendar, label: "Recap blog post", sub: "9 min read" },
  { Icon: Users, label: "Participant list", sub: "builders" },
];

const MONTH = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function formatDateRange(startIso: string | null, endIso: string | null) {
  if (!startIso) return "TBD";
  const start = new Date(startIso);
  const month = MONTH[start.getUTCMonth()];
  const startDay = start.getUTCDate();
  if (!endIso) return `${month} ${startDay}, ${start.getUTCFullYear()}`;
  const end = new Date(endIso);
  if (end.getUTCMonth() === start.getUTCMonth()) {
    return `${month} ${startDay}–${end.getUTCDate()}, ${end.getUTCFullYear()}`;
  }
  return `${month} ${startDay} – ${MONTH[end.getUTCMonth()]} ${end.getUTCDate()}, ${end.getUTCFullYear()}`;
}

export default function EventDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [data, setData] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const slug = params?.slug;
    if (!slug) return;
    (async () => {
      setLoading(true);
      const result = await getEvent(slug);
      const fallback = MOCK_EVENT_DETAILS[slug];
      if (result) {
        setData(result);
      } else if (fallback) {
        setData(fallback);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    })();
  }, [params?.slug]);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-10 py-12">
        <div className="h-3 w-40 bg-[color:var(--bg-hover)] rounded mb-6 animate-pulse" />
        <div className="h-16 w-2/3 bg-[color:var(--bg-hover)] rounded mb-4 animate-pulse" />
        <div className="h-4 w-1/2 bg-[color:var(--bg-hover)] rounded animate-pulse" />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="max-w-[600px] mx-auto px-10 py-24 text-center">
        <div className="font-mono text-[12px] tracking-[0.18em] text-[color:var(--accent)] mb-2">/ 404</div>
        <h1 className="text-[32px] font-medium text-[color:var(--ink)] tracking-[-0.025em] mb-3">
          Event not <span className="font-serif italic">found.</span>
        </h1>
        <p className="text-[14px] text-[color:var(--fg-muted)] mb-6">
          We don&apos;t have an event with that slug. Maybe try the events list?
        </p>
        <button
          onClick={() => router.push("/events")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] text-[13px] font-semibold"
        >
          Browse events <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const { event, photos, projects, sponsors } = data;
  const stats = event.stats as Record<string, string | number | undefined>;
  const statInlines = [
    { label: "participants", value: stats?.participants },
    { label: "projects", value: stats?.projects },
    { label: "prizes", value: stats?.prizes },
    { label: "mentors", value: stats?.mentors },
  ].filter((s) => s.value !== undefined);

  return (
    <div className="w-full">
      {/* Cover */}
      <section className="max-w-[1200px] mx-auto px-10 pt-12">
        <div className="font-mono text-[12px] tracking-[0.18em] text-[color:var(--fg-subtle)] mb-4 flex gap-2">
          <Link href="/events" className="hover:text-[color:var(--ink)]">EVENTS</Link>
          <span className="text-[color:var(--border-strong)]">/</span>
          <span>{event.type.toUpperCase()}S</span>
          <span className="text-[color:var(--border-strong)]">/</span>
          <span className="text-[color:var(--accent)]">{event.slug.toUpperCase()}</span>
        </div>

        <div className="grid grid-cols-[1.4fr_1fr] gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] text-[color:var(--accent)] mb-4 px-2.5 py-1 border border-[color:var(--accent)] rounded-full font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
              {event.status === "past" ? "PAST" : "UPCOMING"} · {formatDateRange(event.startsAt, event.endsAt).toUpperCase()} · {event.type.toUpperCase()}
            </div>
            <h1 className="text-[54px] font-medium leading-[1.02] tracking-[-0.038em] text-[color:var(--ink)]">
              {event.title}
              {event.italicAccent ? (
                <>
                  {" "}
                  <span className="font-serif italic">{event.italicAccent}</span>
                </>
              ) : null}
            </h1>
            {event.description ? (
              <p className="text-[17px] text-[color:var(--fg-muted)] leading-[1.55] mt-4 max-w-[540px]">
                {event.description}
              </p>
            ) : null}
            {statInlines.length ? (
              <div className="flex gap-5 mt-6 font-mono text-[12.5px] text-[color:var(--fg-muted)]">
                {statInlines.map((s) => (
                  <span key={s.label}>
                    <strong className="text-[color:var(--ink)] text-[14px]">{s.value}</strong> {s.label}
                  </span>
                ))}
              </div>
            ) : null}
          </div>
          <div className="relative rounded-lg overflow-hidden border border-[color:var(--border)]">
            {event.coverImage ? (
              <img src={event.coverImage} alt={event.title} className="w-full h-[320px] object-cover" />
            ) : (
              <ImagePlaceholder
                tone={(event.coverTone as any) || "orange"}
                height={320}
                label="COVER · DEMO STAGE"
              />
            )}
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="max-w-[1200px] mx-auto px-10 pt-10 pb-6">
        <div className="grid grid-cols-5 border border-[color:var(--border)] rounded-xl overflow-hidden bg-[color:var(--bg-elev)]">
          {QUICK_LINKS.map(({ Icon, label, sub }, i) => {
            const participantCount = (stats?.participants as number | undefined);
            const resolvedSub = label === "Participant list" && participantCount ? `${participantCount} builders` : sub;
            return (
              <a
                key={label}
                className={`px-5 py-5 flex items-center gap-4 cursor-pointer hover:bg-[color:var(--bg-hover)] transition-colors ${i ? "border-l border-[color:var(--border)]" : ""}`}
              >
                <IconBadge tone="cream" size={40}>
                  <Icon className="w-4 h-4" />
                </IconBadge>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-semibold text-[color:var(--ink)] tracking-[-0.005em]">{label}</div>
                  <div className="font-mono text-[11.5px] text-[color:var(--fg-subtle)] mt-0.5">{resolvedSub}</div>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Winners */}
      {projects.length ? <WinnersGrid projects={projects} /> : null}

      {/* Gallery */}
      {photos.length ? <Gallery photos={photos} /> : null}

      {/* Sponsors + next hack */}
      <section className="max-w-[1200px] mx-auto px-10 py-16">
        <div className="grid grid-cols-[1.2fr_1fr] gap-10 items-center">
          <div>
            <div className="font-mono text-[11px] tracking-[0.18em] text-[color:var(--fg-subtle)] mb-4">
              MADE POSSIBLE BY
            </div>
            <div className="flex gap-3 flex-wrap">
              {sponsors.length === 0
                ? <span className="text-[13px] text-[color:var(--fg-muted)]">No sponsors listed.</span>
                : sponsors.map((s) => (
                    <div
                      key={s.id}
                      className="px-5 py-2.5 border border-[color:var(--border)] rounded-md bg-[color:var(--bg-elev)] text-[13px] font-serif italic text-[color:var(--ink)] font-medium"
                    >
                      {s.name}
                    </div>
                  ))}
            </div>
          </div>

          <div className="p-7 bg-[color:var(--ink)] text-[color:var(--paper)] rounded-lg relative overflow-hidden">
            <GraphMotif density={0.6} opacity={0.35} seed={51} />
            <div className="relative">
              <div className="font-mono text-[11px] tracking-[0.18em] text-[color:var(--accent)] mb-3">NEXT UP</div>
              <div className="text-[22px] font-medium leading-[1.2] tracking-[-0.014em] mb-3">
                Hack #4 — <span className="font-serif italic">AI agents on graphs</span>
              </div>
              <div className="text-[13px] text-white/70 mb-5">June 14–16 · Hybrid · $10k prizes</div>
              <Link
                href="/events/hackathon-kg-june-2026"
                className="inline-flex items-center px-4 py-2.5 rounded-full bg-[color:var(--accent)] text-[color:var(--accent-fg)] text-[13px] font-semibold"
              >
                Save your spot →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function WinnersGrid({ projects }: { projects: HackathonProject[] }) {
  return (
    <section className="max-w-[1200px] mx-auto px-10 py-8">
      <div className="font-mono text-[12px] tracking-[0.18em] text-[color:var(--accent)] mb-2">WINNERS</div>
      <h2 className="text-[32px] font-medium tracking-[-0.028em] text-[color:var(--ink)] mb-6">
        The projects that <span className="font-serif italic">made us cheer.</span>
      </h2>
      <div className="grid grid-cols-2 gap-4">
        {projects.map((p, i) => (
          <article
            key={p.id}
            className="bg-[color:var(--bg-elev)] border border-[color:var(--border)] rounded-lg overflow-hidden grid grid-cols-[180px_1fr]"
          >
            <div className="relative">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
              ) : (
                <ImagePlaceholder tone={i % 2 ? "warm" : "orange"} height="100%" label="" />
              )}
              {p.place ? (
                <div
                  className={`absolute top-3 left-3 px-2.5 py-1 rounded-full font-mono text-[10.5px] font-bold tracking-[0.15em] ${
                    p.place === "1ST"
                      ? "bg-[color:var(--accent)] text-[color:var(--accent-fg)]"
                      : "bg-[color:var(--ink)] text-[color:var(--paper)]"
                  }`}
                >
                  {p.place}
                </div>
              ) : null}
            </div>
            <div className="p-5">
              <div className="flex items-baseline justify-between mb-1.5">
                <div className="font-mono text-[17px] font-semibold text-[color:var(--ink)] tracking-[-0.017em]">
                  {p.name}
                </div>
                {p.prize ? (
                  <div className="font-serif italic text-[12px] text-[color:var(--accent)]">{p.prize}</div>
                ) : null}
              </div>
              {p.team ? (
                <div className="font-mono text-[12px] text-[color:var(--fg-subtle)] mb-2.5">by {p.team}</div>
              ) : null}
              {p.description ? (
                <p className="text-[13px] text-[color:var(--fg-muted)] leading-[1.55] mb-3">{p.description}</p>
              ) : null}
              <div className="flex gap-1.5 items-center">
                {p.tags.map((t) => (
                  <Chip key={t}>#{t}</Chip>
                ))}
                {p.repoUrl ? (
                  <a
                    href={p.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-auto text-[12px] font-medium text-[color:var(--ink)] inline-flex items-center gap-1 hover:underline underline-offset-4"
                  >
                    View <ArrowRight className="w-3 h-3" />
                  </a>
                ) : null}
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="mt-6 text-center">
        <button className="px-5 py-2.5 rounded-full border border-[color:var(--border-strong)] bg-[color:var(--bg-elev)] text-[color:var(--fg)] text-[13px] font-medium hover:bg-[color:var(--bg-hover)]">
          Browse all projects →
        </button>
      </div>
    </section>
  );
}

function Gallery({ photos }: { photos: EventPhoto[] }) {
  return (
    <section className="bg-[color:var(--cream)] border-y border-[color:var(--border)] py-10">
      <div className="max-w-[1200px] mx-auto px-10">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="font-mono text-[12px] tracking-[0.18em] text-[color:var(--accent)] mb-2">GALLERY</div>
            <h2 className="text-[30px] font-medium tracking-[-0.025em] text-[color:var(--ink)]">
              48 hours in <span className="font-serif italic">photos.</span>
            </h2>
          </div>
          <a className="text-[13.5px] text-[color:var(--fg-muted)] inline-flex items-center gap-1 hover:text-[color:var(--ink)]">
            Open full album ({photos.length} photos) <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
        <div className="grid grid-cols-4 gap-2" style={{ gridAutoRows: "160px" }}>
          {photos.map((p) => {
            const style = p.span === "hero"
              ? { gridColumn: "span 2", gridRow: "span 2" }
              : p.span === "wide"
                ? { gridColumn: "span 2" }
                : {};
            return (
              <div key={p.id} className="relative rounded-md overflow-hidden cursor-pointer" style={style}>
                {p.url ? (
                  <img src={p.url} alt={p.caption ?? "photo"} className="w-full h-full object-cover" />
                ) : (
                  <ImagePlaceholder tone={(p.tone as any) || "warm"} height="100%" label={p.caption ?? ""} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
