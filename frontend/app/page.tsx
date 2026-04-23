"use client";

import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Eye,
  Heart,
  Library,
  MessageCircle,
  Play,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";
import { GraphMotif } from "@/components/ui/GraphMotif";
import { Kicker } from "@/components/ui/SectionHeader";

const STATS: Array<[string, string]> = [
  ["2,000+", "builders"],
  ["1,200+", "resources"],
  ["100+", "hackathon projects"],
  ["50+", "events"],
];

const FEATURES = [
  {
    kicker: "RESOURCE WALL",
    title: "Everything, in one wall.",
    desc: "Videos, courses, hands-on tutorials, docs, and blog posts. One grid, one set of filters. Bookmarks land in My Learning.",
    icon: Library,
    href: "/resources",
    tone: "orange" as const,
  },
  {
    kicker: "AI CHAT",
    title: "A guide you can talk to.",
    desc: "Learning mode walks you through concepts and quizzes you. Q&A answers whatever you're stuck on, with sources.",
    icon: Sparkles,
    href: "/chat",
    tone: "warm" as const,
  },
  {
    kicker: "PATHFINDER",
    title: "A plan, not a library.",
    desc: "Five quick questions. We stitch a path from real resources — courses, videos, tutorials — that matches your goal and pace.",
    icon: Compass,
    href: "/pathfinder",
    tone: "orange" as const,
  },
];

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="w-full">
      <HeroSection />
      <StatsStrip />
      <FeatureGrid />
      {user ? null : <NewToTGBanner />}
      <ContinueLearningRail loggedIn={!!user} />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-[color:var(--border)]">
      <GraphMotif density={0.9} opacity={0.4} seed={13} />
      <div className="relative max-w-[1200px] mx-auto px-10 pt-20 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
          {/* Left column */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex">
                {["Ana", "Lee", "Mia", "Tom"].map((n, i) => (
                  <div key={n} style={{ marginLeft: i === 0 ? 0 : -8 }}>
                    <Avatar name={n} size={26} />
                  </div>
                ))}
              </div>
              <span className="text-[13px] text-[color:var(--fg-muted)]">
                Joined by <strong className="text-[color:var(--fg)] font-semibold">2,000+</strong> builders
              </span>
            </div>
            <h1 className="text-[54px] sm:text-[58px] lg:text-[60px] font-medium text-[color:var(--ink)] tracking-[-0.04em] leading-[1.02]">
              Master TigerGraph <span className="font-serif italic text-[color:var(--accent)]">faster</span> than ever.
            </h1>
            <p className="mt-5 text-[17px] text-[color:var(--fg-muted)] leading-[1.55] max-w-[500px]">
              Tutorials, AI-guided learning, a community forum, and events. One editorial home for everyone building on TigerGraph.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/pathfinder"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[color:var(--accent)] text-[color:var(--accent-fg)] text-[14.5px] font-semibold hover:bg-[color:var(--accent-hover)] transition"
              >
                Build my path <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[color:var(--border-strong)] bg-transparent text-[color:var(--fg)] text-[14.5px] font-medium hover:bg-[color:var(--bg-hover)] transition"
              >
                <Play className="w-3.5 h-3.5" /> Browse the wall
              </Link>
            </div>
          </div>

          {/* Right column — forum thread preview */}
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-3 bg-[color:var(--cream)] border border-[color:var(--border)] rounded-[20px]"
              style={{ transform: "rotate(-1.5deg)" }}
            />
            <ForumPreviewCard />
          </div>
        </div>
      </div>
    </section>
  );
}

function ForumPreviewCard() {
  return (
    <article className="relative bg-[color:var(--bg-elev)] border border-[color:var(--border)] rounded-[16px] p-6 shadow-soft">
      <div className="flex items-center gap-2 mb-4 font-mono text-[11.5px] tracking-[0.14em] text-[color:var(--fg-subtle)]">
        <span className="w-2 h-2 rounded-full bg-[color:var(--success)]" />
        LIVE IN #gsql-help · 2 MIN AGO
      </div>
      <div className="flex items-center gap-3 mb-3">
        <Avatar name="Ravi Kumar" size={36} />
        <div>
          <div className="text-[14px] font-semibold text-[color:var(--fg)]">Ravi Kumar</div>
          <div className="text-[12px] text-[color:var(--fg-subtle)]">asking · 4 replies</div>
        </div>
      </div>
      <p className="text-[15px] text-[color:var(--fg)] leading-[1.5] mb-3">
        How do I traverse a heterogeneous graph and weight edges by recency without blowing up the query plan?
      </p>
      <div className="p-3 bg-[color:var(--paper)] rounded-md border border-[color:var(--border)]">
        <div className="flex items-center gap-2 mb-2">
          <Avatar name="Soyeon Park" size={22} />
          <span className="text-[12.5px] font-semibold text-[color:var(--ink)]">Soyeon Park</span>
          <span className="font-mono text-[10.5px] font-semibold tracking-[0.08em] px-1.5 py-0.5 rounded bg-[color:var(--accent)] text-[color:var(--accent-fg)]">
            TG TEAM
          </span>
        </div>
        <p className="text-[13px] text-[color:var(--fg-muted)] leading-[1.5]">
          Try an accumulator with a time-decay kernel — I'll write up a gist, 1 min.
        </p>
      </div>
      <div className="mt-4 flex items-center gap-4 text-[12.5px] text-[color:var(--fg-subtle)]">
        <span className="inline-flex items-center gap-1.5"><Heart className="w-3.5 h-3.5" /> 18</span>
        <span className="inline-flex items-center gap-1.5"><MessageCircle className="w-3.5 h-3.5" /> 4 replies</span>
        <span className="inline-flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> 142</span>
      </div>
    </article>
  );
}

function StatsStrip() {
  return (
    <section className="bg-[color:var(--cream)] border-b border-[color:var(--border)]">
      <div className="max-w-[1200px] mx-auto px-10 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        {STATS.map(([value, label]) => (
          <div key={label} className="flex flex-col items-center text-center">
            <div className="font-serif italic text-[46px] leading-none tracking-[-0.028em] text-[color:var(--ink)]">
              {value}
            </div>
            <div className="mt-3 font-mono text-[11px] tracking-kicker text-[color:var(--fg-subtle)]">
              {label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeatureGrid() {
  return (
    <section className="max-w-[1200px] mx-auto px-10 py-20">
      <div className="flex items-end justify-between gap-6 mb-10">
        <div>
          <Kicker className="mb-2">/ WHAT'S INSIDE</Kicker>
          <h2 className="text-[36px] font-medium text-[color:var(--ink)] tracking-[-0.028em] leading-[1.1]">
            Three things that <span className="font-serif italic">work together.</span>
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Link
              key={f.kicker}
              href={f.href}
              className="group block bg-[color:var(--bg-elev)] border border-[color:var(--border)] rounded-[14px] p-7 hover:border-[color:var(--border-strong)] transition"
            >
              <div className="flex items-start justify-between mb-6">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center"
                  style={{
                    background: f.tone === "orange" ? "var(--tg-orange-100)" : "var(--cream)",
                    color: "var(--accent)",
                  }}
                >
                  <Icon className="w-[19px] h-[19px]" />
                </div>
                <ArrowRight className="w-4 h-4 text-[color:var(--fg-subtle)] group-hover:text-[color:var(--accent)] group-hover:translate-x-1 transition" />
              </div>
              <Kicker className="mb-2">{f.kicker}</Kicker>
              <h3 className="text-[22px] font-medium text-[color:var(--ink)] tracking-[-0.02em] leading-[1.2] mb-3">
                {splitLastItalic(f.title)}
              </h3>
              <p className="text-[13.5px] text-[color:var(--fg-muted)] leading-[1.55]">{f.desc}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function NewToTGBanner() {
  return (
    <section className="max-w-[1200px] mx-auto px-10 pb-20">
      <div className="relative overflow-hidden rounded-[16px] bg-[color:var(--ink)] text-[color:var(--paper)] p-10 md:p-14">
        <GraphMotif density={0.7} opacity={0.45} color="#F58220" edgeColor="rgba(245,130,32,0.35)" seed={3} />
        <div className="relative max-w-[640px]">
          <div className="font-mono text-[11px] tracking-kicker text-[color:var(--accent)] mb-4">
            NEW TO TIGERGRAPH?
          </div>
          <h2 className="text-[38px] md:text-[44px] font-medium tracking-[-0.034em] leading-[1.08]">
            Start with a <span className="font-serif italic">path.</span>
          </h2>
          <p className="mt-4 text-[15.5px] text-white/70 leading-[1.55]">
            Skip the hunt for the right tutorial. Tell us your goal and level, and Pathfinder builds a weekly plan from real TigerGraph resources.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/pathfinder"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[color:var(--accent)] text-[color:var(--accent-fg)] text-[14px] font-semibold hover:bg-[color:var(--accent-hover)] transition"
            >
              Take the 2-min quiz <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/25 bg-transparent text-white text-[14px] font-medium hover:bg-white/10 transition"
            >
              Or just ask the AI
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContinueLearningRail({ loggedIn }: { loggedIn: boolean }) {
  const rows = [
    { n: "01", tag: "VIDEO · 35 min", title: "Graph fundamentals", state: "done" as const },
    { n: "02", tag: "TUTORIAL · 1h 20m", title: "Schema for fraud graphs", state: "done" as const },
    { n: "03", tag: "COURSE · 4 lessons", title: "Pattern queries in GSQL", state: "active" as const },
    { n: "04", tag: "HANDS-ON · 3 hrs", title: "Ring & velocity detection", state: "todo" as const },
    { n: "05", tag: "TUTORIAL · 45 min", title: "Deploy + monitor", state: "todo" as const },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-10 pb-24">
      <div className="flex items-end justify-between gap-6 mb-8">
        <div>
          <Kicker className="mb-2">{loggedIn ? "/ PICK UP WHERE YOU LEFT OFF" : "/ A PATH LOOKS LIKE THIS"}</Kicker>
          <h2 className="text-[32px] font-medium text-[color:var(--ink)] tracking-[-0.024em] leading-[1.1]">
            Five steps, <span className="font-serif italic">one weekend.</span>
          </h2>
        </div>
        <Link
          href={loggedIn ? "/my-learning" : "/pathfinder"}
          className="hidden md:inline-flex items-center gap-1.5 text-[13.5px] text-[color:var(--fg-muted)] hover:text-[color:var(--ink)]"
        >
          {loggedIn ? "Open My Learning" : "Build yours"} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {rows.map((r) => {
          const done = r.state === "done";
          const active = r.state === "active";
          return (
            <div
              key={r.n}
              className="bg-[color:var(--bg-elev)] border rounded-xl p-5 relative"
              style={{
                borderColor: active ? "var(--accent)" : "var(--border)",
                background: active ? "var(--cream)" : undefined,
                opacity: r.state === "todo" ? 0.75 : 1,
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className="font-serif italic text-[30px] leading-none tracking-[-0.02em]"
                  style={{ color: done ? "var(--fg-subtle)" : "var(--accent)" }}
                >
                  {r.n}
                </div>
                {done ? (
                  <span className="w-[22px] h-[22px] rounded-full bg-[color:var(--success)] text-white flex items-center justify-center">
                    <svg viewBox="0 0 12 12" className="w-3 h-3 fill-none stroke-current" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="2,6 5,9 10,3" />
                    </svg>
                  </span>
                ) : active ? (
                  <span className="w-[22px] h-[22px] rounded-full bg-[color:var(--accent)] text-[color:var(--accent-fg)] flex items-center justify-center">
                    <Play className="w-[10px] h-[10px] fill-current" />
                  </span>
                ) : null}
              </div>
              <div className="font-mono text-[10px] tracking-kicker text-[color:var(--fg-subtle)] mb-1.5">
                {r.tag}
              </div>
              <div className="text-[13.5px] font-semibold text-[color:var(--ink)] leading-[1.3] tracking-[-0.005em]">
                {r.title}
              </div>
            </div>
          );
        })}
      </div>

      <div className="md:hidden mt-6 text-center">
        <Link
          href={loggedIn ? "/my-learning" : "/pathfinder"}
          className="inline-flex items-center gap-1.5 text-[13.5px] text-[color:var(--fg-muted)]"
        >
          {loggedIn ? "Open My Learning" : "Build yours"} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}

/** Split the last word to serif-italic (e.g., "Three things that work together." → "Three things that *work together.*") */
function splitLastItalic(s: string) {
  const m = s.match(/^(.*?)(\s[^\s]+\.?)$/);
  if (!m) return s;
  return (
    <>
      {m[1]} <span className="font-serif italic">{m[2].trim()}</span>
    </>
  );
}
