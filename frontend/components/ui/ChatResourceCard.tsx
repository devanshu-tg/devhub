"use client";

import { 
  Play, 
  FileText, 
  BookOpen, 
  Code, 
  ExternalLink, 
  Clock, 
  Bookmark,
  BookmarkCheck
} from "lucide-react";
import clsx from "clsx";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/components/AuthProvider";
import { addBookmark, removeBookmark, type ChatResource } from "@/lib/api";

interface ChatResourceCardProps {
  resource: ChatResource;
  isBookmarked?: boolean;
  onBookmarkChange?: (resourceId: string, bookmarked: boolean) => void;
  compact?: boolean;
}

const typeIcons: Record<string, typeof FileText> = {
  video: Play,
  tutorial: BookOpen,
  docs: FileText,
  blog: Code,
};

const typeColors: Record<string, string> = {
  video: "bg-red-500/20 text-red-400 border-red-500/30",
  tutorial: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  docs: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  blog: "bg-purple-500/20 text-purple-400 border-purple-500/30",
};

const skillColors: Record<string, string> = {
  beginner: "bg-green-500/20 text-green-400",
  intermediate: "bg-yellow-500/20 text-yellow-400",
  advanced: "bg-red-500/20 text-red-400",
};

export default function ChatResourceCard({ 
  resource, 
  isBookmarked = false,
  onBookmarkChange,
  compact = false 
}: ChatResourceCardProps) {
  const { user } = useAuth();
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    setBookmarked(isBookmarked);
  }, [isBookmarked]);
  
  const Icon = typeIcons[resource.type] || FileText;
  
  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error("Please sign in to bookmark resources");
      return;
    }
    
    setBookmarkLoading(true);
    
    try {
      if (bookmarked) {
        const success = await removeBookmark(resource.id);
        if (success) {
          setBookmarked(false);
          onBookmarkChange?.(resource.id, false);
          toast.success("Removed from bookmarks");
        }
      } else {
        const success = await addBookmark(resource.id);
        if (success) {
          setBookmarked(true);
          onBookmarkChange?.(resource.id, true);
          toast.success("Added to bookmarks");
        }
      }
    } catch {
      toast.error("Failed to update bookmark");
    } finally {
      setBookmarkLoading(false);
    }
  };
  
  const handleClick = () => {
    window.open(resource.url, '_blank', 'noopener,noreferrer');
  };
  
  if (compact) {
    return (
      <div className="flex items-center gap-3 p-3 rounded-xl bg-themed-tertiary border border-themed hover:border-tiger-orange transition-all w-full group relative">
        <button
          onClick={handleClick}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
        >
          <div className={clsx(
            "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border",
            typeColors[resource.type]
          )}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-themed truncate group-hover:text-tiger-orange transition-colors">
              {resource.title}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-themed-muted capitalize">{resource.type}</span>
              <span className="text-themed-muted">•</span>
              <span className={clsx("text-xs px-1.5 py-0.5 rounded capitalize", skillColors[resource.skillLevel])}>
                {resource.skillLevel}
              </span>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-themed-muted group-hover:text-tiger-orange transition-colors flex-shrink-0" />
        </button>
        <button
          onClick={handleBookmark}
          disabled={bookmarkLoading}
          className={clsx(
            "p-1.5 rounded-lg transition-all flex-shrink-0",
            bookmarked 
              ? "bg-tiger-orange text-white" 
              : "bg-themed-secondary text-themed-muted hover:bg-tiger-orange hover:text-white border border-themed"
          )}
          title={bookmarked ? "Remove from bookmarks" : "Add to bookmarks"}
        >
          {bookmarked ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>
      </div>
    );
  }
  
  return (
    <div className="rounded-xl bg-themed-tertiary border border-themed overflow-hidden hover:border-tiger-orange/50 transition-all group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-themed-secondary overflow-hidden">
        {resource.thumbnail ? (
          <img
            src={resource.thumbnail}
            alt={resource.title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        ) : (
          <div className={clsx(
            "absolute inset-0 flex items-center justify-center",
            resource.type === 'video' ? "bg-gradient-to-br from-red-600/20 to-red-800/20" :
            resource.type === 'docs' ? "bg-gradient-to-br from-blue-600/20 to-blue-800/20" :
            resource.type === 'tutorial' ? "bg-gradient-to-br from-orange-600/20 to-orange-800/20" :
            "bg-gradient-to-br from-purple-600/20 to-purple-800/20"
          )}>
            <Icon className="w-12 h-12 text-themed-muted" />
          </div>
        )}
        
        {/* Type Badge */}
        <div className={clsx(
          "absolute top-2 left-2 px-2 py-1 rounded-md text-xs font-medium border backdrop-blur-sm",
          typeColors[resource.type]
        )}>
          {resource.type.toUpperCase()}
        </div>
        
        {/* Duration Badge */}
        {resource.duration && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-md bg-black/70 text-white text-xs flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {resource.duration}
          </div>
        )}
        
        {/* Bookmark Button */}
        <button
          onClick={handleBookmark}
          disabled={bookmarkLoading}
          className={clsx(
            "absolute top-2 right-2 p-1.5 rounded-lg transition-all",
            bookmarked 
              ? "bg-tiger-orange text-white" 
              : "bg-black/50 text-white hover:bg-tiger-orange"
          )}
        >
          {bookmarked ? (
            <BookmarkCheck className="w-4 h-4" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
        </button>
      </div>
      
      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={clsx(
            "text-xs px-2 py-0.5 rounded-full capitalize",
            skillColors[resource.skillLevel]
          )}>
            {resource.skillLevel}
          </span>
        </div>
        
        <h3 className="font-semibold text-themed text-sm line-clamp-2 mb-2 group-hover:text-tiger-orange transition-colors">
          {resource.title}
        </h3>
        
        {resource.description && (
          <p className="text-xs text-themed-muted line-clamp-2 mb-3">
            {resource.description}
          </p>
        )}
        
        <button
          onClick={handleClick}
          className="w-full py-2 px-3 rounded-lg bg-tiger-orange/10 text-tiger-orange text-sm font-medium hover:bg-tiger-orange hover:text-white transition-all flex items-center justify-center gap-2"
        >
          Open Resource
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
