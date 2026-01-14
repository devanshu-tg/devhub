"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Grid3X3, 
  List, 
  Play, 
  FileText, 
  Code, 
  BookOpen,
  ExternalLink,
  Clock,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Bookmark
} from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { getResources, getBookmarkIds, addBookmark, removeBookmark, type Resource } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import ResourceModal from "@/components/ui/ResourceModal";

const ITEMS_PER_PAGE = 9;

const filters = {
  skillLevel: ["All", "Beginner", "Intermediate", "Advanced"],
  type: ["All", "Video", "Tutorial", "Docs", "Blog"],
  useCase: ["All", "Fraud", "Recommendations", "GraphRAG", "GNN"],
};

const typeIcons: Record<string, typeof FileText> = {
  video: Play,
  tutorial: BookOpen,
  docs: FileText,
  blog: Code,
};

export default function ResourcesPage() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeFilters, setActiveFilters] = useState({
    skillLevel: "All",
    type: "All",
    useCase: "All",
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  
  // Modal
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (activeFilters.skillLevel !== "All") params.skillLevel = activeFilters.skillLevel;
      if (activeFilters.type !== "All") params.type = activeFilters.type;
      if (activeFilters.useCase !== "All") params.useCase = activeFilters.useCase;
      if (searchQuery) params.search = searchQuery;
      
      const result = await getResources(params);
      setResources(result.data);
      setCurrentPage(1); // Reset to first page on new search/filter
    } catch (error) {
      console.error('Failed to fetch resources:', error);
    } finally {
      setLoading(false);
    }
  }, [activeFilters, searchQuery]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchResources();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchResources]);

  // Fetch bookmarks when user is authenticated
  useEffect(() => {
    const fetchBookmarks = async () => {
      if (user) {
        try {
          const ids = await getBookmarkIds();
          setBookmarkedIds(new Set(ids));
        } catch (error) {
          console.error('Failed to fetch bookmarks:', error);
        }
      } else {
        setBookmarkedIds(new Set());
      }
    };
    fetchBookmarks();
  }, [user]);

  // Toggle bookmark
  const handleBookmarkToggle = async (resourceId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/40d92828-9f17-455f-a0e1-01c5e52c9c7a',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'resources/page.tsx:handleBookmarkToggle',message:'Bookmark button clicked',data:{resourceId,hasUser:!!user},timestamp:Date.now(),sessionId:'debug-session',hypothesisId:'I'})}).catch(()=>{});
    // #endregion
    
    if (!user) {
      toast.error("Sign in to bookmark resources");
      return;
    }

    const isCurrentlyBookmarked = bookmarkedIds.has(resourceId);
    
    // Optimistic update
    setBookmarkedIds(prev => {
      const newSet = new Set(prev);
      if (isCurrentlyBookmarked) {
        newSet.delete(resourceId);
      } else {
        newSet.add(resourceId);
      }
      return newSet;
    });

    try {
      // Make API call
      const success = isCurrentlyBookmarked 
        ? await removeBookmark(resourceId)
        : await addBookmark(resourceId);

      if (success) {
        toast.success(isCurrentlyBookmarked ? "Bookmark removed" : "Bookmark added!");
      } else {
        throw new Error("API call failed");
      }
    } catch (error) {
      // Revert on failure
      setBookmarkedIds(prev => {
        const newSet = new Set(prev);
        if (isCurrentlyBookmarked) {
          newSet.add(resourceId);
        } else {
          newSet.delete(resourceId);
        }
        return newSet;
      });
      toast.error("Failed to save bookmark. Please try again.");
    }
  };

  // Pagination calculations
  const totalPages = Math.ceil(resources.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedResources = resources.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handleResourceClick = (resource: Resource, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedResource(null);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-themed">Resource Wall</h1>
        <p className="text-themed-muted">
          Discover tutorials, videos, documentation, and more to accelerate your TigerGraph journey.
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-themed-muted" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-themed-secondary border border-themed text-themed placeholder-dark-400 focus:border-tiger-orange focus:ring-2 focus:ring-tiger-orange/20 transition-all"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex gap-3">
          <select
            value={activeFilters.skillLevel}
            onChange={(e) => setActiveFilters({ ...activeFilters, skillLevel: e.target.value })}
            className="px-4 py-3 rounded-xl bg-themed-secondary border border-themed text-themed text-sm cursor-pointer hover:border-tiger-orange/30 transition-all"
          >
            {filters.skillLevel.map((level) => (
              <option key={level} value={level}>{level === "All" ? "All Levels" : level}</option>
            ))}
          </select>

          <select
            value={activeFilters.type}
            onChange={(e) => setActiveFilters({ ...activeFilters, type: e.target.value })}
            className="px-4 py-3 rounded-xl bg-themed-secondary border border-themed text-themed text-sm cursor-pointer hover:border-tiger-orange/30 transition-all"
          >
            {filters.type.map((type) => (
              <option key={type} value={type}>{type === "All" ? "All Types" : type}</option>
            ))}
          </select>

          {/* View Toggle */}
          <div className="flex rounded-xl bg-themed-secondary border border-themed p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={clsx(
                "p-2 rounded-lg transition-all",
                viewMode === "grid" ? "bg-tiger-orange/20 text-themed" : "text-themed-muted hover:text-themed"
              )}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={clsx(
                "p-2 rounded-lg transition-all",
                viewMode === "list" ? "bg-tiger-orange/20 text-themed" : "text-themed-muted hover:text-themed"
              )}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-themed-muted">
          {loading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading...
            </span>
          ) : (
            <>
              Showing <span className="text-themed font-medium">{paginatedResources.length}</span> of{" "}
              <span className="text-themed font-medium">{resources.length}</span> resources
            </>
          )}
        </p>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-tiger-orange" />
        </div>
      ) : (
        <>
          {/* Resource Grid/List */}
          <div className={clsx(
            viewMode === "grid" 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
              : "space-y-4"
          )}>
            {paginatedResources.map((resource, index) => {
              const TypeIcon = typeIcons[resource.type] || FileText;
              
              const isBookmarked = bookmarkedIds.has(resource.id);
              
              return viewMode === "grid" ? (
                // Grid Card
                <div
                  key={resource.id}
                  className="group rounded-2xl bg-themed-secondary border border-themed overflow-hidden hover:border-tiger-orange/30 transition-all card-hover text-left cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={(e) => handleResourceClick(resource, e)}
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-themed-tertiary overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10"></div>
                    {/* Bookmark Button */}
                    {user && (
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => handleBookmarkToggle(resource.id, e)}
                        className={clsx(
                          "absolute top-3 right-3 z-30 p-2 rounded-lg transition-all",
                          isBookmarked 
                            ? "bg-tiger-orange text-white" 
                            : "bg-black/40 text-white/80 hover:bg-black/60 hover:text-white"
                        )}
                        title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                      >
                        <Bookmark className={clsx("w-4 h-4", isBookmarked && "fill-current")} />
                      </button>
                    )}
                    <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
                      <span className={clsx(
                        "badge",
                        resource.skillLevel === "beginner" && "badge-beginner",
                        resource.skillLevel === "intermediate" && "badge-intermediate",
                        resource.skillLevel === "advanced" && "badge-advanced"
                      )}>
                        {resource.skillLevel}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1 text-xs text-themed/80">
                      <Clock className="w-3 h-3" />
                      {resource.duration}
                    </div>
                    {resource.type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 rounded-full bg-tiger-orange/90 flex items-center justify-center">
                          <Play className="w-8 h-8 text-themed ml-1" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-2 text-xs text-themed-muted">
                      <TypeIcon className="w-4 h-4" />
                      <span className="capitalize">{resource.type}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-themed group-hover:text-tiger-orange transition-colors line-clamp-2">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-themed-muted line-clamp-2">
                      {resource.description}
                    </p>
                  </div>
                </div>
              ) : (
                // List Item
                <div
                  key={resource.id}
                  onClick={(e) => handleResourceClick(resource, e)}
                  className="group flex gap-4 p-4 rounded-xl bg-themed-secondary border border-themed hover:border-tiger-orange/30 transition-all w-full text-left cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-themed-tertiary flex items-center justify-center flex-shrink-0">
                    <TypeIcon className="w-6 h-6 text-tiger-orange" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-themed group-hover:text-tiger-orange transition-colors truncate">
                        {resource.title}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-themed-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </div>
                    <p className="text-sm text-themed-muted line-clamp-1">{resource.description}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {/* Bookmark Button */}
                    {user && (
                      <button
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => handleBookmarkToggle(resource.id, e)}
                        className={clsx(
                          "p-2 rounded-lg transition-all",
                          isBookmarked 
                            ? "bg-tiger-orange text-white" 
                            : "text-themed-muted hover:text-tiger-orange hover:bg-tiger-orange/10"
                        )}
                        title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
                      >
                        <Bookmark className={clsx("w-4 h-4", isBookmarked && "fill-current")} />
                      </button>
                    )}
                    <span className={clsx(
                      "badge",
                      resource.skillLevel === "beginner" && "badge-beginner",
                      resource.skillLevel === "intermediate" && "badge-intermediate",
                      resource.skillLevel === "advanced" && "badge-advanced"
                    )}>
                      {resource.skillLevel}
                    </span>
                    <span className="text-xs text-themed-muted">{resource.duration}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className={clsx(
                  "p-2 rounded-lg transition-all",
                  currentPage === 1
                    ? "text-themed-muted cursor-not-allowed"
                    : "text-themed-secondary hover:text-themed hover:bg-themed-tertiary"
                )}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={clsx(
                    "w-10 h-10 rounded-lg font-medium transition-all",
                    currentPage === page
                      ? "bg-tiger-orange text-themed"
                      : "text-themed-secondary hover:text-themed hover:bg-themed-tertiary"
                  )}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className={clsx(
                  "p-2 rounded-lg transition-all",
                  currentPage === totalPages
                    ? "text-themed-muted cursor-not-allowed"
                    : "text-themed-secondary hover:text-themed hover:bg-themed-tertiary"
                )}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}

          {/* Empty State */}
          {resources.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-themed-secondary flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-themed-muted" />
              </div>
              <h3 className="text-lg font-semibold text-themed mb-2">No resources found</h3>
              <p className="text-themed-muted">Try adjusting your search or filters</p>
            </div>
          )}
        </>
      )}

      {/* Resource Modal */}
      <ResourceModal
        resource={selectedResource}
        isOpen={isModalOpen}
        onClose={closeModal}
        isBookmarked={selectedResource ? bookmarkedIds.has(selectedResource.id) : false}
        onToggleBookmark={user ? handleBookmarkToggle : undefined}
      />
    </div>
  );
}
