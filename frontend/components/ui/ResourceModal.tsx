"use client";

import { useEffect, useCallback } from "react";
import { X, ExternalLink, Clock, Play, FileText, BookOpen, Code, Bookmark } from "lucide-react";
import clsx from "clsx";
import type { Resource } from "@/lib/api";

interface ResourceModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked?: boolean;
  onToggleBookmark?: (resourceId: string, e: React.MouseEvent) => void;
}

const typeIcons: Record<string, typeof FileText> = {
  video: Play,
  tutorial: BookOpen,
  docs: FileText,
  blog: Code,
};

// Extract YouTube video ID from URL
function getYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export default function ResourceModal({ resource, isOpen, onClose, isBookmarked, onToggleBookmark }: ResourceModalProps) {
  // Handle ESC key
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !resource) return null;

  const TypeIcon = typeIcons[resource.type] || FileText;
  const youtubeId = resource.type === "video" ? getYouTubeId(resource.url) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-4xl max-h-[90vh] m-4 bg-themed-secondary rounded-2xl border border-themed overflow-hidden animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-lg bg-themed-tertiary/80 text-themed-secondary hover:text-themed hover:bg-themed-tertiary transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="overflow-y-auto max-h-[90vh]">
          {/* Video Embed or Thumbnail */}
          {resource.type === "video" && youtubeId ? (
            <div className="relative aspect-video bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1`}
                title={resource.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          ) : (
            <div className="relative aspect-video bg-themed-tertiary flex items-center justify-center">
              <div className="text-center">
                <TypeIcon className="w-16 h-16 text-themed-muted mx-auto mb-4" />
                <p className="text-themed-muted">Preview not available</p>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="p-6 space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    "badge",
                    resource.skillLevel === "beginner" && "badge-beginner",
                    resource.skillLevel === "intermediate" && "badge-intermediate",
                    resource.skillLevel === "advanced" && "badge-advanced"
                  )}>
                    {resource.skillLevel}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-themed-muted">
                    <TypeIcon className="w-3 h-3" />
                    {resource.type}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-themed-muted">
                    <Clock className="w-3 h-3" />
                    {resource.duration}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-themed">{resource.title}</h2>
              </div>
            </div>

            {/* Description */}
            <p className="text-themed-secondary leading-relaxed">{resource.description}</p>

            {/* Use Cases */}
            {resource.useCases && resource.useCases.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {resource.useCases.map((useCase) => (
                  <span
                    key={useCase}
                    className="px-3 py-1 rounded-full bg-themed-tertiary text-themed-secondary text-xs"
                  >
                    {useCase}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex items-center gap-3">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-tiger-orange text-white font-semibold hover:bg-tiger-orange-dark transition-all"
              >
                Open Resource
                <ExternalLink className="w-4 h-4" />
              </a>
              {onToggleBookmark && (
                <button
                  onClick={(e) => onToggleBookmark(resource.id, e)}
                  className={clsx(
                    "inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                    isBookmarked 
                      ? "bg-tiger-orange/20 text-tiger-orange border border-tiger-orange" 
                      : "bg-themed-tertiary text-themed-secondary hover:text-themed border border-themed hover:border-tiger-orange/50"
                  )}
                >
                  <Bookmark className={clsx("w-4 h-4", isBookmarked && "fill-current")} />
                  {isBookmarked ? "Bookmarked" : "Bookmark"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

