"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Command,
  FileText,
  Play,
  Search,
  type LucideIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  addBookmark,
  getBookmarkIds,
  getResources,
  removeBookmark,
  type Resource,
} from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { PillFilter } from "@/components/ui/Pills";
import { SectionHeader } from "@/components/ui/SectionHeader";
import ResourceModal from "@/components/ui/ResourceModal";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

type TypeFilter = "all" | "video" | "tutorial" | "docs" | "blog";
type LevelFilter = "all" | "beginner" | "intermediate" | "advanced";

const TYPE_FILTERS: { label: string; value: TypeFilter }[] = [
  { label: "Everything", value: "all" },
  { label: "Videos", value: "video" },
  { label: "Tutorials", value: "tutorial" },
  { label: "Docs", value: "docs" },
  { label: "Blog posts", value: "blog" },
];

const LEVEL_FILTERS: { label: string; value: LevelFilter }[] = [
  { label: "All", value: "all" },
  { label: "Beginner", value: "beginner" },
  { label: "Intermediate", value: "intermediate" },
  { label: "Advanced", value: "advanced" },
];

const TYPE_LABEL: Record<string, string> = {
  video: "VIDEO",
  tutorial: "TUTORIAL",
  docs: "DOCS",
  blog: "BLOG",
};

const TYPE_TONE: Record<string, "orange" | "warm"> = {
  video: "orange",
  tutorial: "warm",
  docs: "warm",
  blog: "orange",
};

export default function ResourcesPage() {
  const { user } = useAuth();

  const [all, setAll] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<TypeFilter>("all");
  const [level, setLevel] = useState<LevelFilter>("all");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Resource | null>(null);

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (level !== "all") params.skillLevel = level;
      if (type !== "all") params.type = type;
      if (search) params.search = search;
      const result = await getResources(params);
      setAll(result.data);
      setVisible(PAGE_SIZE);
    } finally {
      setLoading(false);
    }
  }, [type, level, search]);

  useEffect(() => {
    const handle = setTimeout(fetchResources, 250);
    return () => clearTimeout(handle);
  }, [fetchResources]);

  useEffect(() => {
    (async () => {
      if (!user) {
        setBookmarkedIds(new Set());
        return;
      }
      const ids = await getBookmarkIds();
      setBookmarkedIds(new Set(ids));
    })();
  }, [user]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: all.length };
    for (const r of all) c[r.type] = (c[r.type] ?? 0) + 1;
    return c;
  }, [all]);

  async function toggleBookmark(resourceId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) {
      toast.error("Sign in to bookmark");
      return;
    }
    const isBookmarked = bookmarkedIds.has(resourceId);
    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      isBookmarked ? next.delete(resourceId) : next.add(resourceId);
      return next;
    });
    const ok = isBookmarked ? await removeBookmark(resourceId) : await addBookmark(resourceId);
    if (!ok) {
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        isBookmarked ? next.add(resourceId) : next.delete(resourceId);
        return next;
      });
      toast.error("Couldn't save bookmark");
    }
  }

  const shown = all.slice(0, visible);

  return (
    <div className="max-w-[1200px] mx-auto w-full">
      <section className="pt-16 pb-8 px-10">
        <SectionHeader
          kicker="/ RESOURCES"
          title="Everything you need,"
          italic="in one wall."
          sub="Videos, courses, hands-on tutorials, docs, and blog posts. One place for every phase of learning."
          size="lg"
          right={
            <div className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-full bg-[color:var(--bg-elev)] border border-[color:var(--border)] min-w-[280px]">
              <Search className="w-4 h-4 text-[color:var(--fg-subtle)]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search resources…"
                className="flex-1 bg-transparent text-[13px] outline-none text-[color:var(--fg)] placeholder:text-[color:var(--fg-subtle)]"
              />
              <div className="flex items-center gap-1 text-[color:var(--fg-subtle)]">
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[color:var(--bg-hover)] rounded border border-[color:var(--border)]">
                  <Command className="w-3 h-3 inline" />
                </kbd>
                <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[color:var(--bg-hover)] rounded border border-[color:var(--border)]">
                  K
                </kbd>
              </div>
            </div>
          }
        />
      </section>

      {/* Filters */}
      <section className="px-10 pb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {TYPE_FILTERS.map((f) => (
              <PillFilter
                key={f.value}
                active={type === f.value}
                onClick={() => setType(f.value)}
                count={f.value === "all" ? counts.all : counts[f.value] ?? 0}
              >
                {f.label}
              </PillFilter>
            ))}
          </div>
          <div className="flex gap-1">
            {LEVEL_FILTERS.map((f) => (
              <PillFilter
                key={f.value}
                active={level === f.value}
                onClick={() => setLevel(f.value)}
                size="sm"
              >
                {f.label}
              </PillFilter>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="px-10 pb-16">
        {loading ? (
          <GridSkeleton />
        ) : shown.length === 0 ? (
          <div className="py-16 text-center">
            <div className="font-mono text-[12px] tracking-kicker text-[color:var(--fg-subtle)] mb-2">NOTHING FOUND</div>
            <div className="text-[18px] text-[color:var(--ink)]">
              No resources match your filters. Try <span className="font-serif italic">broadening</span> them.
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {shown.map((r) => (
                <ResourceCard
                  key={r.id}
                  resource={r}
                  bookmarked={bookmarkedIds.has(r.id)}
                  onBookmark={(e) => toggleBookmark(r.id, e)}
                  onOpen={() => setSelected(r)}
                />
              ))}
            </div>

            {visible < all.length ? (
              <div className="mt-10 text-center">
                <button
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-[color:var(--border-strong)] bg-[color:var(--bg-elev)] text-[color:var(--fg)] text-[13px] font-medium hover:bg-[color:var(--bg-hover)]"
                >
                  Load more <span className="font-mono text-[11px] text-[color:var(--fg-subtle)]">+{Math.min(PAGE_SIZE, all.length - visible)}</span>
                </button>
              </div>
            ) : null}
          </>
        )}
      </section>

      {selected ? (
        <ResourceModal
          resource={selected}
          isOpen={!!selected}
          onClose={() => setSelected(null)}
          isBookmarked={bookmarkedIds.has(selected.id)}
          onToggleBookmark={() => {
            const fakeEvent = { stopPropagation: () => {} } as React.MouseEvent;
            toggleBookmark(selected.id, fakeEvent);
          }}
        />
      ) : null}
    </div>
  );
}

type CardProps = {
  resource: Resource;
  bookmarked: boolean;
  onBookmark: (e: React.MouseEvent) => void;
  onOpen: () => void;
};

function ResourceCard({ resource, bookmarked, onBookmark, onOpen }: CardProps) {
  const typeLabel = TYPE_LABEL[resource.type] ?? resource.type.toUpperCase();
  const tone = TYPE_TONE[resource.type] ?? "warm";
  const TypeIcon: LucideIcon = resource.type === "video" ? Play : FileText;

  return (
    <article
      onClick={onOpen}
      className="group cursor-pointer bg-[color:var(--bg-elev)] border border-[color:var(--border)] rounded-lg overflow-hidden hover:border-[color:var(--border-strong)] transition-all"
    >
      {/* Thumb */}
      <div className="relative h-[160px] overflow-hidden">
        {resource.thumbnail && !resource.thumbnail.includes("tigergraph.com/wp-content") ? (
          <img
            src={resource.thumbnail}
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
            onError={(e) => ((e.currentTarget.style.display = "none"))}
          />
        ) : (
          <ImagePlaceholder tone={tone} height="100%" label="" />
        )}
        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[color:var(--paper)]/90 border border-[color:var(--border)] font-mono text-[10px] font-semibold tracking-[0.14em] text-[color:var(--ink)]">
          <TypeIcon className="w-3 h-3" />
          {typeLabel}
        </span>
        <button
          onClick={onBookmark}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
          className={cn(
            "absolute top-3 right-3 w-8 h-8 rounded-full border flex items-center justify-center transition",
            bookmarked
              ? "bg-[color:var(--accent)] border-[color:var(--accent)] text-[color:var(--accent-fg)]"
              : "bg-[color:var(--paper)]/90 border-[color:var(--border)] text-[color:var(--fg-muted)] hover:text-[color:var(--accent)]",
          )}
        >
          <Bookmark className={cn("w-4 h-4", bookmarked && "fill-current")} />
        </button>
      </div>

      {/* Body */}
      <div className="p-5">
        <h3 className="text-[16.5px] font-semibold text-[color:var(--ink)] leading-[1.3] tracking-[-0.012em] mb-2 line-clamp-2">
          {resource.title}
        </h3>
        {resource.description ? (
          <p className="text-[13px] text-[color:var(--fg-muted)] leading-[1.55] mb-4 line-clamp-2">
            {resource.description}
          </p>
        ) : null}
        <div className="flex items-center gap-2 font-mono text-[11px] text-[color:var(--fg-subtle)] tracking-[0.05em]">
          {resource.duration ? <span>{resource.duration}</span> : null}
          {resource.duration ? <span>·</span> : null}
          <span className="text-[color:var(--accent)] font-semibold">{resource.skillLevel.toUpperCase()}</span>
        </div>
      </div>
    </article>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-[color:var(--bg-elev)] border border-[color:var(--border)] rounded-lg overflow-hidden animate-pulse"
        >
          <div className="h-[160px] bg-[color:var(--bg-hover)]" />
          <div className="p-5 space-y-3">
            <div className="h-4 w-2/3 bg-[color:var(--bg-hover)] rounded" />
            <div className="h-3 w-full bg-[color:var(--bg-hover)] rounded" />
            <div className="h-3 w-1/3 bg-[color:var(--bg-hover)] rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
