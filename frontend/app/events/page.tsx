"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { ArrowRight, Calendar, Play } from "lucide-react";
import {
  EventSummary,
  EventType,
  getEvents,
  getFeaturedEvent,
  rsvpEvent,
} from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { GraphMotif } from "@/components/ui/GraphMotif";
import { Avatar } from "@/components/ui/Avatar";
import { SectionHeader } from "@/components/ui/SectionHeader";

const MONTH = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

function splitDate(iso: string | null) {
  if (!iso) return { month: "TBD", day: "--", time: "" };
  const d = new Date(iso);
  const month = MONTH[d.getUTCMonth()];
  const day = String(d.getUTCDate()).padStart(2, "0");
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });
  return { month, day, time };
}

const TYPE_LABEL: Record<EventType, string> = {
  webinar: "WEBINAR",
  meetup: "MEETUP",
  hackathon: "HACK",
  study: "STUDY",
  qa: "Q&A",
  blog: "BLOG",
};

export default function EventsPage() {
  const [featured, setFeatured] = useState<EventSummary | null>(null);
  const [upcoming, setUpcoming] = useState<EventSummary[]>([]);
  const [past, setPast] = useState<EventSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvping, setRsvping] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [f, up, ps] = await Promise.all([
        getFeaturedEvent(),
        getEvents("upcoming"),
        getEvents("past"),
      ]);
      if (cancelled) return;
      setFeatured(f);
      setUpcoming(up.filter((e) => e.slug !== f?.slug).slice(0, 8));
      setPast(ps);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const pastSidebar = useMemo(() => past.slice(0, 3), [past]);

  async function handleRsvp(e: React.MouseEvent, ev: EventSummary) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Sign in to RSVP");
      return;
    }
    setRsvping(ev.id);
    const ok = await rsvpEvent(ev.id);
    setRsvping(null);
    if (ok) {
      toast.success(`You're in. See you ${splitDate(ev.startsAt).month} ${splitDate(ev.startsAt).day}.`);
    } else {
      toast.error("RSVP failed");
    }
  }

  const featuredHosts = useMemo(() => {
    const hosts = (featured?.stats as any)?.hosts;
    return Array.isArray(hosts) ? hosts : [];
  }, [featured]);

  return (
    <div className="max-w-[1160px] mx-auto w-full">
      <section className="pt-16 pb-10 px-10">
        <SectionHeader
          kicker="/ EVENTS"
          title="Come hang out"
          italic="with us."
          sub="Weekly office hours, monthly meetups in your city, hackathons every quarter. All free, mostly caffeinated."
          size="lg"
          right={
            <button className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-[color:var(--border-strong)] bg-[color:var(--bg-elev)] text-[color:var(--fg)] text-[13px] font-medium hover:bg-[color:var(--bg-hover)]">
              <Calendar className="w-4 h-4" /> Subscribe to calendar
            </button>
          }
        />
      </section>

      {/* Featured dark hero */}
      {featured ? (
        <section className="px-10 pb-12">
          <div className="relative rounded-lg overflow-hidden p-12 bg-[color:var(--ink)] text-[color:var(--paper)] min-h-[320px]">
            <GraphMotif density={1} opacity={0.45} seed={19} color="var(--tg-orange)" />
            <div className="relative grid grid-cols-[160px_1fr_auto] gap-10 items-center">
              {/* Date block */}
              <div className="text-center border border-white/15 rounded-lg px-3 py-4 bg-white/[0.03]">
                <div className="font-mono text-[12px] tracking-[0.18em] text-[color:var(--accent)] font-semibold">
                  {splitDate(featured.startsAt).month}
                </div>
                <div className="font-serif italic text-[56px] leading-none mt-1 tracking-[-0.03em]">
                  {splitDate(featured.startsAt).day}
                </div>
                <div className="font-mono text-[11.5px] text-white/60 mt-2">
                  {splitDate(featured.startsAt).time} UTC
                </div>
              </div>

              {/* Content */}
              <div className="max-w-[520px]">
                <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] text-[color:var(--accent)] mb-4 px-2.5 py-1 border border-[color:var(--accent)] rounded-full font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
                  THIS WEEK · {TYPE_LABEL[featured.type]}
                </div>
                <h2 className="text-[32px] font-medium leading-[1.15] tracking-[-0.025em]">
                  {featured.title}
                  {featured.italicAccent ? (
                    <>
                      {" "}
                      <span className="font-serif italic">{featured.italicAccent}</span>
                    </>
                  ) : null}
                </h2>
                {featured.description ? (
                  <p className="text-[15px] text-white/70 leading-[1.55] mt-4">{featured.description}</p>
                ) : null}
                {featuredHosts.length ? (
                  <div className="mt-5 flex items-center gap-3 text-[12.5px] text-white/65">
                    <div className="flex">
                      {featuredHosts.slice(0, 3).map((name: string, i: number) => (
                        <div
                          key={name}
                          style={{ marginLeft: i ? -6 : 0, borderRadius: 16 }}
                          className="border-2 border-[color:var(--ink)]"
                        >
                          <Avatar name={name} size={26} />
                        </div>
                      ))}
                    </div>
                    <span>with {featuredHosts.join(", ")}</span>
                  </div>
                ) : null}
              </div>

              {/* RSVP */}
              <div className="text-right">
                <button
                  onClick={(e) => handleRsvp(e, featured)}
                  disabled={rsvping === featured.id}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[color:var(--accent)] text-[color:var(--accent-fg)] text-[15px] font-semibold hover:bg-[color:var(--accent-hover)] disabled:opacity-60"
                >
                  RSVP · free <ArrowRight className="w-4 h-4" />
                </button>
                <div className="font-mono text-[12px] text-white/60 mt-3">
                  {featured.rsvpCount ?? 0} going
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Upcoming list + sidebar */}
      <section className="px-10 pb-16">
        <div className="grid grid-cols-[1fr_320px] gap-10">
          <div>
            <div className="font-mono text-[12px] tracking-[0.18em] text-[color:var(--accent)] mb-2">UPCOMING</div>
            <h2 className="text-[28px] font-medium tracking-[-0.028em] text-[color:var(--ink)] mb-6">
              Next <span className="font-serif italic">few months</span>
            </h2>

            <div className="border-t border-[color:var(--border)]">
              {loading ? (
                <UpcomingSkeleton />
              ) : upcoming.length === 0 ? (
                <div className="py-10 text-[color:var(--fg-muted)] text-[14px]">No upcoming events yet.</div>
              ) : (
                upcoming.map((ev) => {
                  const d = splitDate(ev.startsAt);
                  return (
                    <div
                      key={ev.id}
                      className="grid grid-cols-[90px_1fr_auto] gap-6 items-center py-6 border-b border-[color:var(--border)] hover:bg-[color:var(--bg-hover)]/30 transition-colors"
                    >
                      <div>
                        <div className="font-mono text-[10.5px] tracking-[0.12em] text-[color:var(--accent)] font-semibold">
                          {d.month}
                        </div>
                        <div className="font-serif italic text-[32px] leading-none tracking-[-0.03em] text-[color:var(--ink)]">
                          {d.day}
                        </div>
                      </div>
                      <div>
                        <div className="font-mono text-[10.5px] tracking-[0.15em] text-[color:var(--fg-subtle)] mb-1.5">
                          {TYPE_LABEL[ev.type]}
                        </div>
                        <Link
                          href={`/events/${ev.slug}`}
                          className="text-[18px] font-semibold text-[color:var(--ink)] tracking-[-0.012em] leading-[1.3] mb-1.5 hover:underline underline-offset-4 block"
                        >
                          {ev.title}
                          {ev.italicAccent ? (
                            <>
                              {" "}
                              <span className="font-serif italic">{ev.italicAccent}</span>
                            </>
                          ) : null}
                        </Link>
                        <div className="font-mono text-[12.5px] text-[color:var(--fg-muted)]">
                          {ev.location ?? "Location TBD"} · {ev.rsvpCount ?? 0} going
                        </div>
                      </div>
                      <button
                        onClick={(e) => handleRsvp(e, ev)}
                        disabled={rsvping === ev.id}
                        className="px-4 py-2.5 rounded-full border border-[color:var(--border-strong)] bg-[color:var(--bg-elev)] text-[color:var(--fg)] text-[12.5px] font-medium hover:bg-[color:var(--bg-hover)] disabled:opacity-60"
                      >
                        RSVP
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-5">
            <div className="p-6 bg-[color:var(--cream)] border border-[color:var(--border)] rounded-lg">
              <div className="font-mono text-[11px] tracking-[0.18em] text-[color:var(--accent)] mb-3">HOST YOUR OWN</div>
              <div className="font-serif italic text-[20px] leading-[1.3] text-[color:var(--ink)] mb-2.5">
                Start a meetup in your city.
              </div>
              <p className="text-[13px] text-[color:var(--fg-muted)] leading-[1.5]">
                We&apos;ll help with venue, snacks, and speakers. Just bring the community.
              </p>
              <Link
                href="/events/apply-to-host"
                className="mt-4 inline-flex items-center px-4 py-2.5 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] text-[13px] font-semibold hover:opacity-90"
              >
                Apply to host →
              </Link>
            </div>

            <div>
              <div className="font-mono text-[11px] tracking-[0.18em] text-[color:var(--fg-subtle)] mb-3">
                PAST · WATCH ON DEMAND
              </div>
              {pastSidebar.length === 0 ? (
                <div className="text-[12.5px] text-[color:var(--fg-muted)]">No past events yet.</div>
              ) : (
                pastSidebar.map((p) => {
                  const d = splitDate(p.startsAt);
                  const views = (p.stats as { views?: string })?.views;
                  return (
                    <Link
                      key={p.id}
                      href={`/events/${p.slug}`}
                      className="block py-3 border-t border-[color:var(--border)] group"
                    >
                      <div className="font-mono text-[10.5px] text-[color:var(--fg-subtle)] tracking-[0.12em] mb-1">
                        {d.month} {d.day}
                      </div>
                      <div className="text-[13.5px] font-medium text-[color:var(--ink)] leading-[1.35] mb-1 group-hover:underline underline-offset-4">
                        {p.title}
                      </div>
                      <div className="font-mono text-[11.5px] text-[color:var(--fg-subtle)] flex items-center gap-1">
                        <Play className="w-3 h-3" /> {views ?? "on demand"}
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </aside>
        </div>
      </section>

      {/* Past events — highlighted section */}
      {past.length > 0 ? (
        <section className="px-10 pb-24">
          <div className="relative rounded-[14px] border border-[color:var(--border)] bg-[color:var(--cream)] p-10 overflow-hidden">
            <GraphMotif density={0.4} opacity={0.18} seed={31} />
            <div className="relative">
              <div className="flex items-end justify-between gap-6 mb-8">
                <div>
                  <div className="font-mono text-[11px] tracking-[0.18em] text-[color:var(--accent)] mb-2 font-semibold">
                    / PAST EVENTS
                  </div>
                  <h2 className="text-[28px] font-medium tracking-[-0.028em] text-[color:var(--ink)]">
                    From the <span className="font-serif italic">archive.</span>
                  </h2>
                  <p className="mt-2 text-[13.5px] text-[color:var(--fg-muted)] max-w-[520px]">
                    Talks, workshops, and community meetups we&apos;ve hosted — most have recordings or slides.
                  </p>
                </div>
                <div className="font-mono text-[11px] tracking-[0.14em] text-[color:var(--fg-subtle)]">
                  {past.length} total
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {past.map((p) => {
                  const d = splitDate(p.startsAt);
                  const hosts = (p.stats as { hosts?: string[] })?.hosts;
                  return (
                    <Link
                      key={p.id}
                      href={`/events/${p.slug}`}
                      className="group flex flex-col gap-3 p-5 rounded-[10px] bg-[color:var(--paper)] border border-[color:var(--border)] hover:border-[color:var(--border-strong)] hover:shadow-[0_6px_20px_-12px_rgba(0,0,0,0.18)] transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 font-mono text-[10.5px] tracking-[0.14em] text-[color:var(--fg-subtle)]">
                          <span className="text-[color:var(--accent)] font-semibold">{d.month} {d.day}</span>
                          <span>·</span>
                          <span>{TYPE_LABEL[p.type]}</span>
                        </div>
                      </div>
                      <div className="text-[15.5px] font-semibold text-[color:var(--ink)] leading-[1.3] tracking-[-0.012em]">
                        {p.title}
                        {p.italicAccent ? (
                          <>
                            {" "}
                            <span className="font-serif italic">{p.italicAccent}</span>
                          </>
                        ) : null}
                      </div>
                      {p.description ? (
                        <p className="text-[12.5px] text-[color:var(--fg-muted)] leading-[1.5] line-clamp-2">
                          {p.description}
                        </p>
                      ) : null}
                      <div className="mt-auto pt-1 font-mono text-[11px] text-[color:var(--fg-subtle)] flex items-center gap-1.5">
                        {hosts?.length ? (
                          <span className="truncate">{hosts.slice(0, 2).join(", ")}{hosts.length > 2 ? " +" : ""}</span>
                        ) : p.location ? (
                          <span className="truncate">{p.location}</span>
                        ) : (
                          <span>On demand</span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function UpcomingSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[90px_1fr_auto] gap-6 items-center py-6 border-b border-[color:var(--border)] animate-pulse"
        >
          <div>
            <div className="h-3 w-10 bg-[color:var(--bg-hover)] rounded mb-2" />
            <div className="h-8 w-14 bg-[color:var(--bg-hover)] rounded" />
          </div>
          <div>
            <div className="h-3 w-16 bg-[color:var(--bg-hover)] rounded mb-2" />
            <div className="h-4 w-2/3 bg-[color:var(--bg-hover)] rounded mb-2" />
            <div className="h-3 w-1/2 bg-[color:var(--bg-hover)] rounded" />
          </div>
          <div className="h-8 w-16 bg-[color:var(--bg-hover)] rounded-full" />
        </div>
      ))}
    </>
  );
}
