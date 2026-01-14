"use client";

import { useState, useEffect } from "react";
import { 
  Bookmark,
  Play, 
  FileText, 
  Code, 
  BookOpen,
  ExternalLink,
  Clock,
  Loader2,
  Trash2,
  BookmarkX
} from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { getBookmarks, removeBookmark, type BookmarkedResource } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import Link from "next/link";

const typeIcons: Record<string, typeof FileText> = {
  video: Play,
  tutorial: BookOpen,
  docs: FileText,
  blog: Code,
  course: BookOpen,
  code: Code,
};

const levelColors: Record<string, string> = {
  beginner: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  advanced: "bg-rose-500/20 text-rose-400 border-rose-500/30",
};

export default function BookmarksPage() {
  const { user, loading: authLoading } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  // Fetch bookmarks on mount
  useEffect(() => {
    const fetchUserBookmarks = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const result = await getBookmarks();
        setBookmarks(result.data);
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
        toast.error("Failed to load bookmarks");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchUserBookmarks();
    }
  }, [user, authLoading]);

  // Handle removing a bookmark
  const handleRemoveBookmark = async (resourceId: string) => {
    setRemovingId(resourceId);
    
    try {
      const success = await removeBookmark(resourceId);
      
      if (success) {
        setBookmarks(prev => prev.filter(b => b.id !== resourceId));
        toast.success("Bookmark removed");
      } else {
        throw new Error("Failed to remove bookmark");
      }
    } catch (error) {
      toast.error("Failed to remove bookmark");
    } finally {
      setRemovingId(null);
    }
  };

  // Not logged in
  if (!authLoading && !user) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-themed-tertiary flex items-center justify-center mb-6">
            <Bookmark className="w-10 h-10 text-themed-muted" />
          </div>
          <h2 className="text-2xl font-bold text-themed mb-2">Sign in to view bookmarks</h2>
          <p className="text-themed-muted mb-6 max-w-md">
            Create an account or sign in to save and organize your favorite TigerGraph resources.
          </p>
          <Link
            href="/resources"
            className="px-6 py-3 bg-tiger-orange text-white rounded-xl font-medium hover:bg-tiger-orange-dark transition-colors"
          >
            Browse Resources
          </Link>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || authLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-themed mb-2">My Bookmarks</h1>
          <p className="text-themed-muted">Your saved resources for quick access.</p>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-tiger-orange animate-spin" />
        </div>
      </div>
    );
  }

  // Empty state
  if (bookmarks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-themed mb-2">My Bookmarks</h1>
          <p className="text-themed-muted">Your saved resources for quick access.</p>
        </div>
        
        <div className="flex flex-col items-center justify-center py-16 text-center border border-themed rounded-2xl bg-themed-secondary/30">
          <div className="w-16 h-16 rounded-full bg-themed-tertiary flex items-center justify-center mb-4">
            <BookmarkX className="w-8 h-8 text-themed-muted" />
          </div>
          <h3 className="text-xl font-semibold text-themed mb-2">No bookmarks yet</h3>
          <p className="text-themed-muted mb-6 max-w-md">
            Start exploring resources and bookmark your favorites for easy access later.
          </p>
          <Link
            href="/resources"
            className="px-6 py-3 bg-tiger-orange text-white rounded-xl font-medium hover:bg-tiger-orange-dark transition-colors"
          >
            Browse Resources
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-tiger-orange/20 flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-tiger-orange" />
          </div>
          <h1 className="text-3xl font-bold text-themed">My Bookmarks</h1>
        </div>
        <p className="text-themed-muted">
          {bookmarks.length} saved resource{bookmarks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Bookmarks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bookmarks.map((bookmark) => {
          const TypeIcon = typeIcons[bookmark.type] || FileText;
          const isRemoving = removingId === bookmark.id;
          
          return (
            <div
              key={bookmark.bookmarkId || bookmark.id}
              className={clsx(
                "group relative rounded-2xl overflow-hidden transition-all duration-300",
                "bg-themed-secondary border border-themed",
                "hover:border-tiger-orange/50 hover:shadow-lg hover:shadow-tiger-orange/5",
                isRemoving && "opacity-50"
              )}
            >
              {/* Thumbnail */}
              <div className="relative h-40 bg-themed-tertiary overflow-hidden">
                <img
                  src={bookmark.thumbnail}
                  alt={bookmark.title}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                
                {/* Overlay badges */}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={clsx(
                    "px-2 py-1 text-xs font-medium rounded-full border",
                    levelColors[bookmark.skillLevel] || levelColors.intermediate
                  )}>
                    {bookmark.skillLevel}
                  </span>
                </div>
                
                {/* Duration */}
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs">
                  <Clock className="w-3 h-3" />
                  {bookmark.duration}
                </div>
                
                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemoveBookmark(bookmark.id);
                  }}
                  disabled={isRemoving}
                  className={clsx(
                    "absolute bottom-3 right-3 p-2 rounded-lg transition-all",
                    "bg-black/60 backdrop-blur-sm text-white",
                    "opacity-0 group-hover:opacity-100",
                    "hover:bg-red-500 hover:text-white",
                    isRemoving && "cursor-not-allowed"
                  )}
                  title="Remove bookmark"
                >
                  {isRemoving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TypeIcon className="w-4 h-4 text-tiger-orange" />
                  <span className="text-xs text-themed-muted capitalize">{bookmark.type}</span>
                </div>
                
                <h3 className="font-semibold text-themed mb-2 line-clamp-2 group-hover:text-tiger-orange transition-colors">
                  {bookmark.title}
                </h3>
                
                <p className="text-sm text-themed-muted line-clamp-2 mb-4">
                  {bookmark.description}
                </p>

                {/* Action button */}
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-tiger-orange/10 text-tiger-orange rounded-lg font-medium text-sm hover:bg-tiger-orange hover:text-white transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Resource
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
