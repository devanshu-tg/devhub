"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  Loader2,
  Lock,
  Play,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/AuthProvider";
import {
  deleteLearningPath,
  getAllLearningPaths,
  getBookmarks,
  getPathProgress,
  updatePathProgress,
  type BookmarkedResource,
  type PathProgress,
  type Resource,
  type UserLearningPath,
  type UserLearningPathSummary,
} from "@/lib/api";
import ResourceModal from "@/components/ui/ResourceModal";
import { GraphMotif } from "@/components/ui/GraphMotif";
import { Kicker } from "@/components/ui/SectionHeader";
import { PillFilter } from "@/components/ui/Pills";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<string, string> = {
  video: "VIDEO",
  tutorial: "TUTORIAL",
  course: "COURSE",
  docs: "DOCS",
  blog: "BLOG",
  "hands-on": "HANDS-ON",
};

type BookmarkTab = "all" | "beginner" | "intermediate" | "advanced";

export default function MyLearningPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paths, setPaths] = useState<UserLearningPathSummary[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkedResource[]>([]);
  const [featuredProgress, setFeaturedProgress] = useState<PathProgress | null>(null);

  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [pathDetail, setPathDetail] = useState<UserLearningPath | null>(null);
  const [progress, setProgress] = useState<PathProgress | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [bookmarkTab, setBookmarkTab] = useState<BookmarkTab>("all");

  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; title: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const displayName: string = useMemo(() => {
    const anyUser = user as { user_metadata?: { display_name?: string }; email?: string } | null;
    const meta = anyUser?.user_metadata?.display_name;
    if (meta) return meta.split(" ")[0];
    const email = anyUser?.email;
    if (email) return email.split("@")[0];
    return "friend";
  }, [user]);

  const featuredPath = useMemo(() => {
    if (paths.length === 0) return null;
    return (
      paths.find((p) => p.status === "active" && p.progressPercentage < 100) ??
      paths.find((p) => p.progressPercentage < 100) ??
      paths[0]
    );
  }, [paths]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const [pathsRes, bookmarksRes] = await Promise.all([
        getAllLearningPaths().catch(() => ({ paths: [] })),
        getBookmarks().catch(() => ({ data: [], total: 0 })),
      ]);
      setPaths(pathsRes.paths ?? []);
      setBookmarks(bookmarksRes.data ?? []);
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!featuredPath) {
      setFeaturedProgress(null);
      return;
    }
    (async () => {
      const p = await getPathProgress(featuredPath.id);
      setFeaturedProgress(p);
    })();
  }, [featuredPath]);

  async function handleSelectPath(pathId: string) {
    setSelectedPathId(pathId);
    setLoadingDetail(true);
    const pp = await getPathProgress(pathId);
    if (pp) {
      setPathDetail(pp.path);
      setProgress(pp);
    }
    setLoadingDetail(false);
  }

  async function handleBackToList() {
    setSelectedPathId(null);
    setPathDetail(null);
    setProgress(null);
    const { paths: refreshed } = await getAllLearningPaths();
    setPaths(refreshed ?? []);
  }

  async function handleDeleteConfirm() {
    if (!deleteConfirm) return;
    setDeleting(true);
    const result = await deleteLearningPath(deleteConfirm.id);
    setDeleting(false);
    if (result.success) {
      toast.success("Path deleted");
      setPaths((prev) => prev.filter((p) => p.id !== deleteConfirm.id));
      setDeleteConfirm(null);
    } else {
      toast.error("Couldn't delete");
    }
  }

  async function handleToggleResource(milestoneIdx: number, resourceIdx: number, currentlyDone: boolean) {
    if (!pathDetail || !progress) return;
    const newDone = !currentlyDone;

    const updatedRes = [...progress.resourceProgress];
    const i = updatedRes.findIndex((r) => r.milestoneIndex === milestoneIdx && r.resourceIndex === resourceIdx);
    if (i >= 0) {
      updatedRes[i] = { ...updatedRes[i], completed: newDone, completedAt: newDone ? new Date().toISOString() : null };
    } else {
      updatedRes.push({
        id: `tmp-${Date.now()}`,
        milestoneIndex: milestoneIdx,
        resourceIndex: resourceIdx,
        completed: newDone,
        completedAt: newDone ? new Date().toISOString() : null,
      });
    }

    const milestoneResources = pathDetail.milestones[milestoneIdx]?.resources ?? [];
    const milestoneDone = milestoneResources.every((_, idx) =>
      updatedRes.find((r) => r.milestoneIndex === milestoneIdx && r.resourceIndex === idx)?.completed,
    );

    const updatedMilestone = [...progress.milestoneProgress];
    const mi = updatedMilestone.findIndex((m) => m.milestoneIndex === milestoneIdx);
    if (mi >= 0) {
      updatedMilestone[mi] = { ...updatedMilestone[mi], completed: milestoneDone, completedAt: milestoneDone ? new Date().toISOString() : null };
    } else {
      updatedMilestone.push({
        id: `tmpm-${Date.now()}`,
        milestoneIndex: milestoneIdx,
        completed: milestoneDone,
        completedAt: milestoneDone ? new Date().toISOString() : null,
      });
    }

    const completed = updatedRes.filter((r) => r.completed).length;
    const total = progress.stats.totalResources;
    setProgress({
      ...progress,
      resourceProgress: updatedRes,
      milestoneProgress: updatedMilestone,
      stats: { ...progress.stats, completedResources: completed, progressPercentage: Math.round((completed / total) * 100) },
    });

    const r = await updatePathProgress(pathDetail.id, milestoneIdx, resourceIdx, newDone);
    if (r.success) {
      if (r.pathComplete) {
        toast.success("Path complete — great work!");
        const refreshed = await getPathProgress(pathDetail.id);
        if (refreshed) setProgress(refreshed);
      } else if (r.milestoneComplete) {
        toast.success("Milestone complete — next week unlocked");
      }
    } else {
      const refreshed = await getPathProgress(pathDetail.id);
      if (refreshed) setProgress(refreshed);
      toast.error("Couldn't save progress");
    }
  }

  // ───────── Signed-out state ─────────
  if (!user) {
    return (
      <div className="max-w-[1160px] mx-auto w-full px-10 pt-20 pb-24 text-center">
        <Kicker className="mb-3">/ MY LEARNING</Kicker>
        <h1 className="text-[46px] font-medium text-[color:var(--ink)] tracking-[-0.032em] leading-[1.05]">
          Sign in to track your <span className="font-serif italic">learning.</span>
        </h1>
        <p className="mt-4 text-[15px] text-[color:var(--fg-muted)] max-w-[540px] mx-auto leading-[1.55]">
          Build a personalized path, save resources for later, and pick up right where you left off.
        </p>
        <Link
          href="/pathfinder"
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[color:var(--accent)] text-[color:var(--accent-fg)] text-[13px] font-semibold hover:bg-[color:var(--accent-hover)]"
        >
          Take the quiz <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-[1160px] mx-auto w-full px-10 py-24 flex justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-[color:var(--accent)]" />
      </div>
    );
  }

  // ───────── Detail view ─────────
  if (selectedPathId) {
    return (
      <PathDetailView
        loading={loadingDetail}
        path={pathDetail}
        progress={progress}
        onBack={handleBackToList}
        onToggleResource={handleToggleResource}
        onOpenResource={(r) => setSelectedResource(r as Resource)}
        selectedResource={selectedResource}
        onCloseResource={() => setSelectedResource(null)}
      />
    );
  }

  // ───────── Stats ─────────
  const completedPaths = paths.filter((p) => p.status === "completed" || p.progressPercentage === 100).length;
  const inProgress = paths.filter((p) => p.status !== "completed" && p.progressPercentage > 0 && p.progressPercentage < 100).length;
  const lessonsDone = paths.reduce((acc, p) => acc + (p.completedResources ?? 0), 0);

  const stats: Array<[string, string]> = [
    [String(completedPaths), "paths done"],
    [String(inProgress), "in progress"],
    [String(bookmarks.length), "saved"],
    [String(lessonsDone), "lessons done"],
  ];

  // ───────── Empty state ─────────
  if (paths.length === 0 && bookmarks.length === 0) {
    return (
      <div className="w-full">
        <Banner name={displayName} stats={stats} />
        <section className="max-w-[1160px] mx-auto w-full px-10 py-24 text-center">
          <Kicker className="mb-3">/ GET STARTED</Kicker>
          <h2 className="text-[36px] font-medium text-[color:var(--ink)] tracking-[-0.028em] leading-[1.1]">
            No paths yet. Let's <span className="font-serif italic">build one.</span>
          </h2>
          <p className="mt-4 text-[14.5px] text-[color:var(--fg-muted)] max-w-[520px] mx-auto leading-[1.55]">
            Answer five quick questions and we'll compose a path from the resource wall that matches your pace.
          </p>
          <Link
            href="/pathfinder"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[color:var(--accent)] text-[color:var(--accent-fg)] text-[13px] font-semibold hover:bg-[color:var(--accent-hover)]"
          >
            Start the quiz <ArrowRight className="w-4 h-4" />
          </Link>
        </section>
      </div>
    );
  }

  // ───────── Main list view ─────────
  return (
    <div className="w-full">
      <Banner name={displayName} stats={stats} />

      {featuredPath ? (
        <section className="max-w-[1160px] mx-auto w-full px-10 pt-12 pb-8">
          <div className="flex items-end justify-between gap-6 mb-6">
            <div>
              <Kicker className="mb-2">YOUR ACTIVE PATH</Kicker>
              <h2 className="text-[30px] font-medium text-[color:var(--ink)] tracking-[-0.024em] leading-[1.1]">
                {splitItalic(featuredPath.title)}
              </h2>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => handleSelectPath(featuredPath.id)}
                className="px-4 py-2.5 rounded-full border border-[color:var(--border-strong)] bg-[color:var(--bg-elev)] text-[color:var(--fg)] text-[13px] font-medium hover:bg-[color:var(--bg-hover)]"
              >
                Open path
              </button>
              <Link
                href="/pathfinder"
                className="px-4 py-2.5 rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elev)] text-[color:var(--fg-muted)] text-[13px] font-medium hover:bg-[color:var(--bg-hover)]"
              >
                Start another
              </Link>
            </div>
          </div>

          <ActivePathCard summary={featuredPath} progress={featuredProgress} onOpen={() => handleSelectPath(featuredPath.id)} />
        </section>
      ) : null}

      {paths.length > 1 ? (
        <section className="max-w-[1160px] mx-auto w-full px-10 pt-6 pb-8">
          <div className="flex items-end justify-between mb-5">
            <h3 className="text-[22px] font-medium text-[color:var(--ink)] tracking-[-0.02em]">
              Other <span className="font-serif italic">paths</span>
            </h3>
            <Link href="/pathfinder" className="inline-flex items-center gap-1.5 text-[13px] text-[color:var(--fg-muted)] hover:text-[color:var(--ink)]">
              <Plus className="w-3.5 h-3.5" /> New path
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paths
              .filter((p) => p.id !== featuredPath?.id)
              .map((p) => (
                <PathSummaryCard
                  key={p.id}
                  path={p}
                  onOpen={() => handleSelectPath(p.id)}
                  onDelete={() => setDeleteConfirm({ id: p.id, title: p.title })}
                />
              ))}
          </div>
        </section>
      ) : null}

      {bookmarks.length > 0 ? (
        <SavedSection
          bookmarks={bookmarks}
          tab={bookmarkTab}
          onTabChange={setBookmarkTab}
          onOpen={(r) => setSelectedResource(r)}
        />
      ) : null}

      {selectedResource ? (
        <ResourceModal
          resource={selectedResource}
          isOpen={!!selectedResource}
          onClose={() => setSelectedResource(null)}
          isBookmarked={bookmarks.some((b) => b.id === selectedResource.id)}
          onToggleBookmark={undefined}
        />
      ) : null}

      {deleteConfirm ? (
        <DeleteConfirmModal
          title={deleteConfirm.title}
          deleting={deleting}
          onCancel={() => setDeleteConfirm(null)}
          onConfirm={handleDeleteConfirm}
        />
      ) : null}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

function Banner({ name, stats }: { name: string; stats: Array<[string, string]> }) {
  return (
    <section className="relative overflow-hidden border-b border-[color:var(--border)]">
      <GraphMotif density={0.7} opacity={0.4} seed={41} />
      <div className="relative max-w-[1160px] mx-auto px-10 pt-14 pb-10">
        <Kicker className="mb-3">/ MY LEARNING</Kicker>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <h1 className="text-[48px] md:text-[52px] font-medium tracking-[-0.036em] leading-[1.02] text-[color:var(--ink)]">
            Welcome back, <span className="font-serif italic">{name}.</span>
          </h1>
          <div className="flex gap-8 md:gap-10">
            {stats.map(([value, label]) => (
              <div key={label}>
                <div className="font-serif italic text-[32px] leading-none tracking-[-0.02em] text-[color:var(--ink)]">
                  {value}
                </div>
                <div className="font-mono text-[11px] tracking-kicker text-[color:var(--fg-subtle)] mt-1.5">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function ActivePathCard({
  summary,
  progress,
  onOpen,
}: {
  summary: UserLearningPathSummary;
  progress: PathProgress | null;
  onOpen: () => void;
}) {
  const pct = summary.progressPercentage ?? 0;
  const done = summary.completedResources ?? 0;
  const total = summary.totalResources ?? 0;

  const milestones = progress?.path.milestones ?? [];
  const shown = milestones.slice(0, 5);

  const milestoneState = (idx: number): "done" | "active" | "todo" => {
    if (!progress) {
      const perMilestone = milestones.length > 0 ? Math.floor(pct / milestones.length) : 0;
      if (idx < Math.floor(pct / 100 * milestones.length)) return "done";
      if (idx === Math.floor(pct / 100 * milestones.length) && perMilestone < 100) return "active";
      return "todo";
    }
    const mp = progress.milestoneProgress.find((m) => m.milestoneIndex === idx);
    if (mp?.completed) return "done";
    const prev = idx === 0 || progress.milestoneProgress.find((m) => m.milestoneIndex === idx - 1)?.completed;
    const anyProg = progress.resourceProgress.some((r) => r.milestoneIndex === idx && r.completed);
    if (prev || anyProg) return "active";
    return "todo";
  };

  const milestoneProgressPct = (idx: number): number => {
    if (!progress) return 0;
    const m = milestones[idx];
    if (!m || m.resources.length === 0) return 0;
    const d = progress.resourceProgress.filter((r) => r.milestoneIndex === idx && r.completed).length;
    return Math.round((d / m.resources.length) * 100);
  };

  return (
    <div className="bg-[color:var(--bg-elev)] border border-[color:var(--border)] rounded-[14px] p-7">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 h-[6px] bg-[color:var(--cream)] rounded-full overflow-hidden">
          <div className="h-full bg-[color:var(--accent)] transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="font-mono text-[12px] text-[color:var(--fg-muted)]">
          {done} of {total} resources · {pct}%
        </span>
      </div>

      {shown.length === 0 ? (
        <div className="text-center py-10">
          <div className="font-mono text-[11px] tracking-kicker text-[color:var(--fg-subtle)]">LOADING PATH…</div>
        </div>
      ) : (
        <div
          className="grid gap-3"
          style={{ gridTemplateColumns: `repeat(${Math.max(1, Math.min(shown.length, 5))}, minmax(0, 1fr))` }}
        >
          {shown.map((m, idx) => {
            const state = milestoneState(idx);
            const done = state === "done";
            const active = state === "active";
            const pctStep = milestoneProgressPct(idx);
            const firstType = m.resources[0]?.type;

            return (
              <button
                key={idx}
                onClick={onOpen}
                className={cn(
                  "text-left rounded-xl border p-4 transition relative",
                  active
                    ? "bg-[color:var(--cream)] border-[color:var(--accent)]"
                    : "bg-[color:var(--paper)] border-[color:var(--border)] hover:border-[color:var(--border-strong)]",
                  state === "todo" && "opacity-70",
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className={cn(
                      "font-serif italic text-[28px] leading-none tracking-[-0.02em]",
                      done ? "text-[color:var(--fg-subtle)]" : "text-[color:var(--accent)]",
                    )}
                  >
                    {String(idx + 1).padStart(2, "0")}
                  </div>
                  {done ? (
                    <span className="w-[22px] h-[22px] rounded-full bg-[color:var(--success)] text-white flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </span>
                  ) : active ? (
                    <span className="w-[22px] h-[22px] rounded-full bg-[color:var(--accent)] text-[color:var(--accent-fg)] flex items-center justify-center">
                      <Play className="w-[10px] h-[10px] fill-current" />
                    </span>
                  ) : null}
                </div>
                {firstType ? (
                  <div className="font-mono text-[10px] tracking-kicker text-[color:var(--fg-subtle)] mb-1.5">
                    {TYPE_LABEL[firstType] ?? firstType.toUpperCase()}
                  </div>
                ) : null}
                <div className="text-[13.5px] font-semibold text-[color:var(--ink)] leading-[1.3] tracking-[-0.005em] mb-2 line-clamp-2">
                  {m.title}
                </div>
                <div className="font-mono text-[11px] text-[color:var(--fg-subtle)]">
                  {m.resources.length} resource{m.resources.length === 1 ? "" : "s"}
                </div>
                {active && pctStep > 0 ? (
                  <div className="mt-3 pt-3 border-t border-dashed border-[color:var(--border-strong)]">
                    <div className="font-mono text-[10.5px] tracking-kicker text-[color:var(--accent)] font-semibold mb-1">
                      IN PROGRESS · {pctStep}%
                    </div>
                    <div className="h-[3px] bg-[color:var(--paper)] rounded-full overflow-hidden">
                      <div className="h-full bg-[color:var(--accent)]" style={{ width: `${pctStep}%` }} />
                    </div>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PathSummaryCard({
  path,
  onOpen,
  onDelete,
}: {
  path: UserLearningPathSummary;
  onOpen: () => void;
  onDelete: () => void;
}) {
  const pct = path.progressPercentage ?? 0;
  const isDone = path.status === "completed" || pct === 100;
  return (
    <article
      onClick={onOpen}
      className="group cursor-pointer bg-[color:var(--bg-elev)] border border-[color:var(--border)] rounded-xl p-5 hover:border-[color:var(--border-strong)] relative"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete path"
        className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center text-[color:var(--fg-subtle)] hover:text-red-500 hover:bg-[color:var(--bg-hover)] opacity-0 group-hover:opacity-100 transition"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>

      <div className="font-mono text-[10.5px] tracking-kicker text-[color:var(--accent)] mb-2">
        {isDone ? "COMPLETED" : path.status === "active" ? "ACTIVE" : "PAUSED"}
      </div>
      <h4 className="text-[16px] font-semibold text-[color:var(--ink)] tracking-[-0.012em] leading-[1.3] mb-1.5 pr-6 line-clamp-2">
        {path.title}
      </h4>
      <p className="text-[12.5px] text-[color:var(--fg-muted)] leading-[1.5] line-clamp-2 mb-4">
        {path.description}
      </p>

      <div className="h-[3px] bg-[color:var(--cream)] rounded-full overflow-hidden mb-2">
        <div
          className={cn("h-full", isDone ? "bg-[color:var(--success)]" : "bg-[color:var(--accent)]")}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between font-mono text-[10.5px] tracking-[0.05em] text-[color:var(--fg-subtle)]">
        <span>{pct}%</span>
        <span>
          {path.completedResources}/{path.totalResources} RESOURCES
        </span>
      </div>
    </article>
  );
}

function SavedSection({
  bookmarks,
  tab,
  onTabChange,
  onOpen,
}: {
  bookmarks: BookmarkedResource[];
  tab: BookmarkTab;
  onTabChange: (t: BookmarkTab) => void;
  onOpen: (r: Resource) => void;
}) {
  const TABS: Array<{ value: BookmarkTab; label: string }> = [
    { value: "all", label: "All" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];
  const filtered = tab === "all" ? bookmarks : bookmarks.filter((r) => r.skillLevel === tab);

  return (
    <section className="max-w-[1160px] mx-auto w-full px-10 pt-6 pb-20">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <h2 className="text-[24px] font-medium text-[color:var(--ink)] tracking-[-0.022em]">
          Saved <span className="font-serif italic">for later.</span>
        </h2>
        <div className="flex gap-1.5">
          {TABS.map((t) => (
            <PillFilter key={t.value} active={tab === t.value} onClick={() => onTabChange(t.value)} size="sm">
              {t.label}
            </PillFilter>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-14 text-center">
          <div className="font-mono text-[11px] tracking-kicker text-[color:var(--fg-subtle)]">NOTHING HERE YET</div>
          <div className="mt-2 text-[14px] text-[color:var(--fg-muted)]">
            Bookmark resources from <Link href="/resources" className="text-[color:var(--accent)] hover:underline">the wall</Link> and they'll appear here.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((b) => (
            <SavedCard key={b.id} resource={b} onOpen={() => onOpen(b)} />
          ))}
        </div>
      )}
    </section>
  );
}

function SavedCard({ resource, onOpen }: { resource: BookmarkedResource; onOpen: () => void }) {
  const typeLabel = TYPE_LABEL[resource.type] ?? resource.type.toUpperCase();
  const tone: "orange" | "warm" = resource.type === "video" || resource.type === "blog" ? "orange" : "warm";
  const showThumb = resource.thumbnail && !resource.thumbnail.includes("tigergraph.com/wp-content");

  return (
    <article
      onClick={onOpen}
      className="group cursor-pointer bg-[color:var(--bg-elev)] border border-[color:var(--border)] rounded-xl overflow-hidden hover:border-[color:var(--border-strong)] transition"
    >
      <div className="relative h-[120px] overflow-hidden">
        {showThumb ? (
          <img
            src={resource.thumbnail}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        ) : (
          <ImagePlaceholder tone={tone} height="100%" label="" />
        )}
        <span className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded-full bg-[color:var(--paper)]/90 border border-[color:var(--border)] font-mono text-[10px] font-semibold tracking-[0.14em] text-[color:var(--ink)]">
          {typeLabel}
        </span>
      </div>

      <div className="p-4">
        <h4 className="text-[14.5px] font-semibold text-[color:var(--ink)] leading-[1.3] tracking-[-0.01em] mb-2 line-clamp-2">
          {resource.title}
        </h4>
        <div className="flex items-center gap-2 font-mono text-[11px] text-[color:var(--fg-subtle)] tracking-[0.05em]">
          {resource.duration ? <span>{resource.duration}</span> : null}
          {resource.duration ? <span>·</span> : null}
          <span className="text-[color:var(--accent)] font-semibold">{resource.skillLevel.toUpperCase()}</span>
        </div>
      </div>
    </article>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* Detail View                                                                  */

function PathDetailView({
  loading,
  path,
  progress,
  onBack,
  onToggleResource,
  onOpenResource,
  selectedResource,
  onCloseResource,
}: {
  loading: boolean;
  path: UserLearningPath | null;
  progress: PathProgress | null;
  onBack: () => void;
  onToggleResource: (m: number, r: number, done: boolean) => void;
  onOpenResource: (r: unknown) => void;
  selectedResource: Resource | null;
  onCloseResource: () => void;
}) {
  if (loading || !path || !progress) {
    return (
      <div className="max-w-[1160px] mx-auto px-10 py-24 flex justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-[color:var(--accent)]" />
      </div>
    );
  }
  const pct = progress.stats.progressPercentage;
  const isDone = path.status === "completed" || pct === 100;

  const isCompleted = (mi: number, ri: number) =>
    progress.resourceProgress.find((r) => r.milestoneIndex === mi && r.resourceIndex === ri)?.completed ?? false;

  const isMilestoneDone = (mi: number) =>
    progress.milestoneProgress.find((m) => m.milestoneIndex === mi)?.completed ?? false;

  const milestonePct = (mi: number) => {
    const m = path.milestones[mi];
    if (!m || m.resources.length === 0) return 0;
    const d = progress.resourceProgress.filter((r) => r.milestoneIndex === mi && r.completed).length;
    return Math.round((d / m.resources.length) * 100);
  };

  return (
    <div className="max-w-[1160px] mx-auto w-full px-10 pt-8 pb-20">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-[13px] text-[color:var(--fg-muted)] hover:text-[color:var(--ink)] mb-8"
      >
        <ArrowLeft className="w-4 h-4" /> Back to all paths
      </button>

      <Kicker className="mb-2">/ YOUR PATH</Kicker>
      <h1 className="text-[42px] font-medium text-[color:var(--ink)] tracking-[-0.032em] leading-[1.05]">
        {splitItalic(path.title)}
      </h1>
      <p className="mt-3 text-[15px] text-[color:var(--fg-muted)] leading-[1.55] max-w-[640px]">{path.description}</p>

      <div className="mt-8 bg-[color:var(--bg-elev)] border border-[color:var(--border)] rounded-[14px] p-6">
        <div className="flex items-center gap-4">
          <div className="font-serif italic text-[44px] leading-none text-[color:var(--ink)] tracking-[-0.02em]">
            {pct}%
          </div>
          <div className="flex-1">
            <div className="h-[6px] bg-[color:var(--cream)] rounded-full overflow-hidden">
              <div
                className={cn("h-full transition-all duration-500", isDone ? "bg-[color:var(--success)]" : "bg-[color:var(--accent)]")}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="mt-2 font-mono text-[11.5px] tracking-[0.05em] text-[color:var(--fg-subtle)] flex gap-3">
              <span>{progress.stats.completedResources} of {progress.stats.totalResources} resources</span>
              <span>·</span>
              <span>{path.duration.toUpperCase()}</span>
            </div>
          </div>
        </div>
        {isDone ? (
          <div className="mt-4 inline-flex items-center gap-2 font-mono text-[11.5px] tracking-kicker text-[color:var(--success)] font-semibold">
            <Check className="w-3.5 h-3.5" /> PATH COMPLETE
          </div>
        ) : null}
      </div>

      <div className="mt-10 space-y-4">
        {path.milestones.map((m, mi) => {
          const done = isMilestoneDone(mi);
          const prevDone = mi === 0 || isMilestoneDone(mi - 1);
          const locked = !prevDone && !done;
          const mpct = milestonePct(mi);

          return (
            <section
              key={mi}
              className={cn(
                "bg-[color:var(--bg-elev)] border rounded-[14px] p-6",
                done ? "border-[color:var(--success)]/40" : "border-[color:var(--border)]",
                locked && "opacity-60",
              )}
            >
              <div className="flex items-start justify-between gap-6 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-mono text-[11px] tracking-kicker text-[color:var(--accent)]">WEEK {m.week}</span>
                    {done ? <Check className="w-4 h-4 text-[color:var(--success)]" /> : null}
                    {locked ? <Lock className="w-3.5 h-3.5 text-[color:var(--fg-subtle)]" /> : null}
                  </div>
                  <h3 className="text-[19px] font-medium text-[color:var(--ink)] tracking-[-0.012em] leading-[1.25]">
                    {m.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] text-[color:var(--fg-muted)] leading-[1.55]">{m.description}</p>
                </div>
                {!locked ? (
                  <div className="text-right">
                    <div className="font-serif italic text-[26px] leading-none text-[color:var(--accent)]">{mpct}%</div>
                    <div className="font-mono text-[10.5px] tracking-kicker text-[color:var(--fg-subtle)] mt-1">COMPLETE</div>
                  </div>
                ) : null}
              </div>

              {!locked ? (
                <div className="h-[3px] bg-[color:var(--cream)] rounded-full overflow-hidden mb-4">
                  <div className="h-full bg-[color:var(--accent)] transition-all duration-500" style={{ width: `${mpct}%` }} />
                </div>
              ) : null}

              <div className="space-y-2">
                {m.resources.map((r, ri) => {
                  const rdone = isCompleted(mi, ri);
                  return (
                    <div
                      key={ri}
                      onClick={() => !locked && r.url && onOpenResource(r)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-md border border-transparent transition group",
                        locked
                          ? "bg-[color:var(--bg-hover)]/50 cursor-not-allowed"
                          : "bg-[color:var(--cream)] hover:border-[color:var(--border-strong)] cursor-pointer",
                      )}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!locked) onToggleResource(mi, ri, rdone);
                        }}
                        className={cn(
                          "flex-shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition",
                          rdone
                            ? "bg-[color:var(--success)] border-[color:var(--success)] text-white"
                            : "border-[color:var(--border-strong)] text-transparent hover:border-[color:var(--accent)]",
                          locked && "cursor-not-allowed",
                        )}
                        disabled={locked}
                        aria-label={rdone ? "Mark incomplete" : "Mark complete"}
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <span className="font-mono text-[10.5px] tracking-kicker text-[color:var(--accent)] w-20 flex-shrink-0">
                        {(TYPE_LABEL[r.type] ?? r.type).toUpperCase()}
                      </span>
                      <span
                        className={cn(
                          "flex-1 text-[13.5px] font-medium leading-[1.35] transition-colors",
                          rdone ? "text-[color:var(--fg-subtle)] line-through" : "text-[color:var(--ink)] group-hover:text-[color:var(--accent)]",
                        )}
                      >
                        {r.title}
                      </span>
                      {r.duration ? (
                        <span className="font-mono text-[11px] text-[color:var(--fg-subtle)] flex-shrink-0">{r.duration}</span>
                      ) : null}
                      {!locked && r.url ? (
                        <ExternalLink className="w-3.5 h-3.5 text-[color:var(--fg-subtle)] opacity-0 group-hover:opacity-100 transition" />
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {locked ? (
                <div className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-kicker text-[color:var(--fg-subtle)]">
                  <Lock className="w-3 h-3" /> COMPLETE PREVIOUS WEEK TO UNLOCK
                </div>
              ) : null}
            </section>
          );
        })}
      </div>

      {selectedResource ? (
        <ResourceModal
          resource={selectedResource}
          isOpen={!!selectedResource}
          onClose={onCloseResource}
          isBookmarked={false}
          onToggleBookmark={undefined}
        />
      ) : null}
    </div>
  );
}

function DeleteConfirmModal({
  title,
  deleting,
  onCancel,
  onConfirm,
}: {
  title: string;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-[color:var(--bg-elev)] border border-[color:var(--border)] rounded-[14px] max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="font-mono text-[11px] tracking-kicker text-[color:var(--accent)]">DELETE PATH</div>
          <button onClick={onCancel} className="p-1.5 rounded-full hover:bg-[color:var(--bg-hover)]">
            <X className="w-4 h-4 text-[color:var(--fg-muted)]" />
          </button>
        </div>
        <h3 className="text-[20px] font-medium text-[color:var(--ink)] tracking-[-0.02em] mb-3">
          Delete <span className="font-serif italic">"{title}"?</span>
        </h3>
        <p className="text-[13.5px] text-[color:var(--fg-muted)] leading-[1.55] mb-6">
          This removes all your progress for this path. It can't be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 rounded-full border border-[color:var(--border)] bg-[color:var(--bg-elev)] text-[color:var(--fg)] text-[13px] font-medium hover:bg-[color:var(--bg-hover)] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500 text-white text-[13px] font-semibold hover:bg-red-600 disabled:opacity-50"
          >
            {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/** Take a title string and render the last word as serif-italic, for editorial accent. */
function splitItalic(title: string) {
  const trimmed = title.trim();
  if (!trimmed) return title;
  const words = trimmed.split(/\s+/);
  if (words.length < 2) return trimmed;
  const last = words.pop() as string;
  return (
    <>
      {words.join(" ")} <span className="font-serif italic">{last}</span>
    </>
  );
}
