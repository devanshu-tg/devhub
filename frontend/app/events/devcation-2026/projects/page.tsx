"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Github,
  FileText,
  Globe,
  Video,
  Search,
  Users,
  Trophy,
  MapPin,
} from "lucide-react";
import { GraphMotif } from "@/components/ui/GraphMotif";
import { Kicker } from "@/components/ui/SectionHeader";
import { DEVCATION_PROJECTS, type DevcationProject } from "@/lib/devcationProjects";

const PROJECTS_PER_PAGE = 24;

export default function DevcationProjectsPage() {
  return (
    <div className="w-full">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[color:var(--ink)] text-[color:var(--paper)]">
        <GraphMotif density={0.85} opacity={0.4} seed={29} color="var(--tg-orange)" />
        <div className="relative max-w-[1160px] mx-auto px-10 pt-10 pb-12">
          <Link
            href="/events/devcation-2026"
            className="inline-flex items-center gap-2 font-mono text-[12px] tracking-[0.15em] text-white/60 hover:text-white mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> BACK TO DEVCATION
          </Link>

          <div className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.15em] text-[color:var(--accent)] mb-4 px-2.5 py-1 border border-[color:var(--accent)] rounded-full font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-[color:var(--accent)]" />
            DEVCATION '26 · TIGERGRAPH TRACK
          </div>
          <h1 className="text-[48px] md:text-[56px] font-medium leading-[1.04] tracking-[-0.035em] max-w-[820px]">
            All projects from the{" "}
            <span className="font-serif italic">TigerGraph Track.</span>
          </h1>
          <p className="text-[16px] text-white/70 leading-[1.55] mt-4 max-w-[680px]">
            Every team that submitted to the TigerGraph Track at Devcation Delhi 2026 — what they
            built, who led, and how they integrated TigerGraph. {DEVCATION_PROJECTS.length}{" "}
            submissions in total.
          </p>

          <div className="flex flex-wrap gap-x-7 gap-y-3 mt-6 font-mono text-[12.5px] text-white/65">
            <span className="inline-flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-[color:var(--accent)]" />
              {DEVCATION_PROJECTS.length} teams
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-[color:var(--accent)]" /> IIT Delhi · April 12, 2026
            </span>
            <span className="inline-flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5 text-[color:var(--accent)]" /> ₹36,000 track purse
            </span>
          </div>
        </div>
      </section>

      {/* Projects */}
      <ProjectsList />
    </div>
  );
}

function ProjectsList() {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return DEVCATION_PROJECTS;
    return DEVCATION_PROJECTS.filter((p) => {
      return (
        p.team.toLowerCase().includes(q) ||
        p.leader.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const visible = showAll ? filtered : filtered.slice(0, PROJECTS_PER_PAGE);
  const hiddenCount = filtered.length - visible.length;

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="max-w-[1160px] mx-auto px-10 py-14">
      <div className="flex items-end justify-between gap-6 mb-6">
        <div>
          <Kicker className="mb-3">/ SUBMISSIONS</Kicker>
          <h2 className="text-[28px] font-medium tracking-[-0.028em] text-[color:var(--ink)] leading-[1.15]">
            What teams <span className="font-serif italic">shipped.</span>
          </h2>
        </div>
        <div className="font-mono text-[11px] tracking-[0.14em] text-[color:var(--fg-subtle)] pb-1 whitespace-nowrap">
          {filtered.length} of {DEVCATION_PROJECTS.length}
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[color:var(--fg-subtle)] pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowAll(false);
          }}
          placeholder="Search by team, leader, or what they built…"
          className="w-full pl-11 pr-4 py-3 rounded-lg border border-[color:var(--border)] bg-[color:var(--paper)] text-[14px] text-[color:var(--ink)] placeholder:text-[color:var(--fg-subtle)] focus:outline-none focus:border-[color:var(--accent)] focus:ring-1 focus:ring-[color:var(--accent)] transition"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="py-12 text-center text-[13.5px] text-[color:var(--fg-muted)] border border-dashed border-[color:var(--border)] rounded-lg">
          No projects match &ldquo;{query}&rdquo;.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visible.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                expanded={expandedIds.has(p.id)}
                onToggle={() => toggleExpand(p.id)}
              />
            ))}
          </div>

          {hiddenCount > 0 ? (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setShowAll(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[color:var(--border-strong)] bg-[color:var(--bg-elev)] text-[color:var(--ink)] text-[13px] font-semibold hover:bg-[color:var(--bg-hover)]"
              >
                Show all {filtered.length} projects
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}

function ProjectCard({
  project,
  expanded,
  onToggle,
}: {
  project: DevcationProject;
  expanded: boolean;
  onToggle: () => void;
}) {
  const desc = project.description;
  const isLong = desc.length > 280 || desc.split("\n").length > 4;
  const links = [
    project.githubUrl
      ? { href: project.githubUrl, label: "GitHub", Icon: Github }
      : null,
    project.pptUrl
      ? { href: project.pptUrl, label: "Slides", Icon: FileText }
      : null,
    project.deployedUrl
      ? { href: project.deployedUrl, label: "Live", Icon: Globe }
      : null,
    project.demoUrl
      ? { href: project.demoUrl, label: "Demo", Icon: Video }
      : null,
  ].filter((x): x is { href: string; label: string; Icon: typeof Github } => x !== null);

  return (
    <article className="p-6 bg-[color:var(--paper)] border border-[color:var(--border)] rounded-lg hover:border-[color:var(--border-strong)] transition flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[18px] font-semibold text-[color:var(--ink)] tracking-[-0.014em] leading-[1.25] truncate">
            {project.team}
          </div>
          <div className="font-mono text-[12px] text-[color:var(--fg-subtle)] mt-1 truncate">
            by {project.leader}
          </div>
        </div>
        {project.githubUrl ? (
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`${project.team} on GitHub`}
            className="shrink-0 w-9 h-9 rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elev)] flex items-center justify-center text-[color:var(--ink)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--accent)] transition"
          >
            <Github className="w-4 h-4" />
          </a>
        ) : null}
      </div>

      <div>
        <p
          className={
            "text-[13px] text-[color:var(--fg-muted)] leading-[1.6] whitespace-pre-line " +
            (expanded || !isLong ? "" : "line-clamp-4")
          }
        >
          {desc}
        </p>
        {isLong ? (
          <button
            onClick={onToggle}
            className="mt-2 text-[12px] font-semibold text-[color:var(--accent)] hover:underline underline-offset-4"
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        ) : null}
      </div>

      {links.length > 0 ? (
        <div className="mt-auto pt-2 flex flex-wrap gap-2">
          {links.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elev)] text-[12px] font-medium text-[color:var(--ink)] hover:border-[color:var(--border-strong)] hover:text-[color:var(--accent)] transition"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </a>
          ))}
        </div>
      ) : null}
    </article>
  );
}
