"use client";

import { useState, useEffect } from "react";
import {
  GraduationCap,
  CheckCircle2,
  Circle,
  Lock,
  ExternalLink,
  Clock,
  Target,
  Trophy,
  RotateCcw,
  Play,
  FileText,
  Code,
  BookOpen,
  Loader2,
  ArrowLeft,
  Plus,
  Layers,
  Trash2,
  X,
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import {
  getAllLearningPaths,
  getPathProgress,
  updatePathProgress,
  deleteLearningPath,
  type PathProgress,
  type UserLearningPath,
  type UserLearningPathSummary,
} from "@/lib/api";
import toast from "react-hot-toast";
import ResourceModal from "@/components/ui/ResourceModal";
import type { Resource } from "@/lib/api";

const typeIcons: Record<string, typeof FileText> = {
  video: Play,
  tutorial: BookOpen,
  docs: FileText,
  blog: Code,
};

// Path Card Component for Grid View
function PathCard({
  path,
  onClick,
  onDelete,
}: {
  path: UserLearningPathSummary;
  onClick: () => void;
  onDelete: () => void;
}) {
  const isCompleted = path.status === "completed" || path.progressPercentage === 100;
  
  return (
    <div
      onClick={onClick}
      className="p-6 rounded-2xl bg-themed-secondary border border-themed hover:border-tiger-orange/50 transition-all cursor-pointer group relative"
    >
      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-3 right-3 p-2 rounded-lg bg-themed-tertiary/50 text-themed-muted hover:bg-red-500/20 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
        title="Delete path"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-2 mr-8">
          {isCompleted ? (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-500 text-xs font-medium flex items-center gap-1">
              <Trophy className="w-3 h-3" />
              Completed
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full bg-tiger-orange/20 text-tiger-orange text-xs font-medium">
              In Progress
            </span>
          )}
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="text-lg font-semibold text-themed mb-2 group-hover:text-tiger-orange transition-colors">
        {path.title}
      </h3>
      <p className="text-sm text-themed-muted mb-4 line-clamp-2">
        {path.description}
      </p>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-themed-muted">Progress</span>
          <span className="font-semibold text-tiger-orange">{path.progressPercentage}%</span>
        </div>
        <div className="h-2 bg-themed-tertiary rounded-full overflow-hidden">
          <div
            className={clsx(
              "h-full transition-all duration-500",
              isCompleted ? "bg-emerald-500" : "bg-gradient-to-r from-tiger-orange to-amber-500"
            )}
            style={{ width: `${path.progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-xs text-themed-muted">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {path.duration}
        </span>
        <span className="flex items-center gap-1">
          <Target className="w-3 h-3" />
          {path.completedResources}/{path.totalResources} resources
        </span>
        <span className="flex items-center gap-1">
          <Layers className="w-3 h-3" />
          {path.milestoneCount} weeks
        </span>
      </div>
    </div>
  );
}

export default function MyLearningPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [paths, setPaths] = useState<UserLearningPathSummary[]>([]);
  const [selectedPathId, setSelectedPathId] = useState<string | null>(null);
  const [pathDetail, setPathDetail] = useState<UserLearningPath | null>(null);
  const [progress, setProgress] = useState<PathProgress | null>(null);
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; pathId: string | null; pathTitle: string }>({
    show: false,
    pathId: null,
    pathTitle: "",
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPaths();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPaths = async () => {
    setLoading(true);
    try {
      const { paths: userPaths } = await getAllLearningPaths();
      setPaths(userPaths);
    } catch (error) {
      console.error("Failed to fetch paths:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (pathId: string, pathTitle: string) => {
    setDeleteConfirm({ show: true, pathId, pathTitle });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.pathId) return;
    
    setDeleting(true);
    try {
      const result = await deleteLearningPath(deleteConfirm.pathId);
      if (result.success) {
        toast.success("Learning path deleted");
        setPaths(paths.filter((p) => p.id !== deleteConfirm.pathId));
      } else {
        toast.error("Failed to delete path");
      }
    } catch (error) {
      console.error("Failed to delete path:", error);
      toast.error("Failed to delete path");
    } finally {
      setDeleting(false);
      setDeleteConfirm({ show: false, pathId: null, pathTitle: "" });
    }
  };

  const handleSelectPath = async (pathId: string) => {
    setSelectedPathId(pathId);
    setLoadingDetail(true);
    try {
      const pathProgress = await getPathProgress(pathId);
      if (pathProgress) {
        setPathDetail(pathProgress.path);
        setProgress(pathProgress);
      }
    } catch (error) {
      console.error("Failed to fetch path details:", error);
      toast.error("Failed to load path details");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleBackToList = () => {
    setSelectedPathId(null);
    setPathDetail(null);
    setProgress(null);
    // Refresh paths list to get updated progress
    fetchPaths();
  };

  const handleToggleResource = async (
    milestoneIndex: number,
    resourceIndex: number,
    currentlyCompleted: boolean
  ) => {
    if (!pathDetail || !progress) return;

    const newCompleted = !currentlyCompleted;

    // Optimistic update - update local state immediately
    const updatedResourceProgress = [...progress.resourceProgress];
    const existingIndex = updatedResourceProgress.findIndex(
      (r) => r.milestoneIndex === milestoneIndex && r.resourceIndex === resourceIndex
    );

    if (existingIndex >= 0) {
      updatedResourceProgress[existingIndex] = {
        ...updatedResourceProgress[existingIndex],
        completed: newCompleted,
        completedAt: newCompleted ? new Date().toISOString() : null,
      };
    } else {
      updatedResourceProgress.push({
        id: `temp-${Date.now()}`,
        milestoneIndex,
        resourceIndex,
        completed: newCompleted,
        completedAt: newCompleted ? new Date().toISOString() : null,
      });
    }

    // Check if milestone is now complete
    const milestoneResources = pathDetail.milestones[milestoneIndex]?.resources || [];
    const milestoneResourcesCompleted = milestoneResources.every((_, idx) => {
      const prog = updatedResourceProgress.find(
        (r) => r.milestoneIndex === milestoneIndex && r.resourceIndex === idx
      );
      return prog?.completed || false;
    });

    // Update milestone progress optimistically
    const updatedMilestoneProgress = [...progress.milestoneProgress];
    const milestoneExistingIndex = updatedMilestoneProgress.findIndex(
      (m) => m.milestoneIndex === milestoneIndex
    );

    if (milestoneExistingIndex >= 0) {
      updatedMilestoneProgress[milestoneExistingIndex] = {
        ...updatedMilestoneProgress[milestoneExistingIndex],
        completed: milestoneResourcesCompleted,
        completedAt: milestoneResourcesCompleted ? new Date().toISOString() : null,
      };
    } else {
      updatedMilestoneProgress.push({
        id: `temp-milestone-${Date.now()}`,
        milestoneIndex,
        completed: milestoneResourcesCompleted,
        completedAt: milestoneResourcesCompleted ? new Date().toISOString() : null,
      });
    }

    const completedCount = updatedResourceProgress.filter((r) => r.completed).length;
    const total = progress.stats.totalResources;
    const percentage = Math.round((completedCount / total) * 100);

    setProgress({
      ...progress,
      resourceProgress: updatedResourceProgress,
      milestoneProgress: updatedMilestoneProgress,
      stats: {
        ...progress.stats,
        completedResources: completedCount,
        progressPercentage: percentage,
      },
    });

    try {
      const result = await updatePathProgress(
        pathDetail.id,
        milestoneIndex,
        resourceIndex,
        newCompleted
      );

      if (result.success) {
        if (result.pathComplete) {
          toast.success("Congratulations! You completed your learning path!");
          const pathProgress = await getPathProgress(pathDetail.id);
          if (pathProgress) setProgress(pathProgress);
        } else if (result.milestoneComplete) {
          toast.success("Milestone completed! Next week unlocked!");
        }
      } else {
        toast.error("Failed to update progress");
        const pathProgress = await getPathProgress(pathDetail.id);
        if (pathProgress) setProgress(pathProgress);
      }
    } catch (error) {
      console.error("Failed to update progress:", error);
      toast.error("Failed to update progress");
      const pathProgress = await getPathProgress(pathDetail.id);
      if (pathProgress) setProgress(pathProgress);
    }
  };

  const isResourceCompleted = (milestoneIndex: number, resourceIndex: number): boolean => {
    if (!progress) return false;
    const resourceProgress = progress.resourceProgress.find(
      (r) => r.milestoneIndex === milestoneIndex && r.resourceIndex === resourceIndex
    );
    return resourceProgress?.completed || false;
  };

  const isMilestoneCompleted = (milestoneIndex: number): boolean => {
    if (!progress) return false;
    const milestoneProgress = progress.milestoneProgress.find(
      (m) => m.milestoneIndex === milestoneIndex
    );
    return milestoneProgress?.completed || false;
  };

  const getMilestoneProgress = (milestoneIndex: number): number => {
    if (!pathDetail || !progress) return 0;
    const milestone = pathDetail.milestones[milestoneIndex];
    if (!milestone || !milestone.resources.length) return 0;

    const completed = progress.resourceProgress.filter(
      (r) => r.milestoneIndex === milestoneIndex && r.completed
    ).length;

    return Math.round((completed / milestone.resources.length) * 100);
  };

  const handleResourceClick = (resource: any) => {
    if (resource.url) {
      setSelectedResource(resource);
      setIsModalOpen(true);
    }
  };

  // Not logged in
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="w-20 h-20 rounded-2xl bg-themed-tertiary flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-10 h-10 text-themed-muted" />
        </div>
        <h1 className="text-2xl font-bold text-themed mb-4">Sign in to track your learning</h1>
        <p className="text-themed-muted mb-6">
          Create personalized learning paths and track your progress through TigerGraph resources.
        </p>
        <Link
          href="/pathfinder"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-tiger-orange text-white font-medium hover:bg-tiger-orange-dark transition-all"
        >
          Take the Quiz
        </Link>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-tiger-orange animate-spin" />
      </div>
    );
  }

  // Detail View - Selected Path
  if (selectedPathId && pathDetail && progress) {
    const overallProgress = progress.stats.progressPercentage || 0;
    const isPathComplete = pathDetail.status === "completed" || overallProgress === 100;

    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
        {/* Back Button */}
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 text-themed-muted hover:text-tiger-orange transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Paths
        </button>

        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-themed">{pathDetail.title}</h1>
              <p className="text-themed-muted">{pathDetail.description}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="p-6 rounded-2xl bg-themed-secondary border border-themed">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-4">
                <span className="text-themed-secondary text-sm">Overall Progress</span>
                <span className="text-3xl font-bold text-tiger-orange">{overallProgress}%</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-2 text-themed-secondary">
                  <Clock className="w-4 h-4 text-tiger-orange" />
                  {pathDetail.duration}
                </span>
                <span className="flex items-center gap-2 text-themed-secondary">
                  <Target className="w-4 h-4 text-tiger-orange" />
                  {progress.stats.completedResources}/{progress.stats.totalResources} resources
                </span>
              </div>
            </div>
            <div className="h-3 bg-themed-tertiary rounded-full overflow-hidden">
              <div
                className={clsx(
                  "h-full transition-all duration-500",
                  isPathComplete
                    ? "bg-emerald-500"
                    : "bg-gradient-to-r from-tiger-orange to-amber-500"
                )}
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            {isPathComplete && (
              <div className="mt-4 flex items-center gap-2 text-emerald-500">
                <Trophy className="w-5 h-5" />
                <span className="font-medium">Path completed! Great job!</span>
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-6">
          {pathDetail.milestones.map((milestone, milestoneIdx) => {
            const milestoneComplete = isMilestoneCompleted(milestoneIdx);
            const milestoneProgress = getMilestoneProgress(milestoneIdx);
            const isPreviousComplete = milestoneIdx === 0 || isMilestoneCompleted(milestoneIdx - 1);
            const isLocked = !isPreviousComplete && !milestoneComplete;

            return (
              <div
                key={milestoneIdx}
                className={clsx(
                  "relative pl-8 pb-6 border-l-2 last:border-transparent last:pb-0",
                  milestoneComplete ? "border-emerald-500" : "border-themed"
                )}
              >
                {/* Timeline dot */}
                <div
                  className={clsx(
                    "absolute left-0 top-0 w-4 h-4 -translate-x-[9px] rounded-full border-4 border-themed",
                    milestoneComplete ? "bg-emerald-500" : isLocked ? "bg-themed-muted" : "bg-tiger-orange"
                  )}
                />

                {/* Milestone card */}
                <div
                  className={clsx(
                    "p-6 rounded-2xl bg-themed-secondary border border-themed transition-all",
                    isLocked && "opacity-60"
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs text-tiger-orange font-semibold uppercase tracking-wider">
                          Week {milestone.week}
                        </span>
                        {milestoneComplete && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {isLocked && <Lock className="w-4 h-4 text-themed-muted" />}
                      </div>
                      <h3 className="text-lg font-semibold text-themed">{milestone.title}</h3>
                      <p className="text-sm text-themed-muted">{milestone.description}</p>
                    </div>
                    {!isLocked && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-tiger-orange">{milestoneProgress}%</div>
                        <div className="text-xs text-themed-muted">complete</div>
                      </div>
                    )}
                  </div>

                  {/* Progress bar for milestone */}
                  {!isLocked && (
                    <div className="h-1.5 bg-themed-tertiary rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full bg-tiger-orange transition-all duration-500"
                        style={{ width: `${milestoneProgress}%` }}
                      />
                    </div>
                  )}

                  {/* Resources */}
                  <div className="space-y-2">
                    {milestone.resources.map((resource, resourceIdx) => {
                      const isCompleted = isResourceCompleted(milestoneIdx, resourceIdx);
                      const TypeIcon = typeIcons[resource.type] || FileText;

                      return (
                        <div
                          key={resourceIdx}
                          className={clsx(
                            "flex items-center gap-3 p-3 rounded-lg transition-all",
                            isLocked
                              ? "bg-themed-tertiary/30 cursor-not-allowed"
                              : "bg-themed-tertiary/50 hover:bg-themed-tertiary cursor-pointer group"
                          )}
                          onClick={() => !isLocked && handleResourceClick(resource)}
                        >
                          {/* Checkbox */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isLocked) {
                                handleToggleResource(milestoneIdx, resourceIdx, isCompleted);
                              }
                            }}
                            className={clsx("flex-shrink-0 transition-all", isLocked && "cursor-not-allowed")}
                            disabled={isLocked}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <Circle className="w-5 h-5 text-themed-muted group-hover:text-tiger-orange" />
                            )}
                          </button>

                          {/* Icon */}
                          <div className="w-8 h-8 rounded-lg bg-themed-tertiary flex items-center justify-center flex-shrink-0">
                            <TypeIcon className="w-4 h-4 text-tiger-orange" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p
                              className={clsx(
                                "text-sm font-medium transition-colors",
                                isCompleted
                                  ? "text-themed-muted line-through"
                                  : "text-themed group-hover:text-tiger-orange"
                              )}
                            >
                              {resource.title}
                            </p>
                            <p className="text-xs text-themed-muted">
                              {resource.type} • {resource.duration}
                            </p>
                          </div>

                          {/* External link icon */}
                          {!isLocked && resource.url && (
                            <ExternalLink className="w-4 h-4 text-themed-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {isLocked && (
                    <p className="text-xs text-themed-muted mt-3 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Complete previous milestone to unlock
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Resource Modal */}
        {selectedResource && (
          <ResourceModal
            resource={selectedResource as Resource}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedResource(null);
            }}
            isBookmarked={false}
            onToggleBookmark={undefined}
          />
        )}
      </div>
    );
  }

  // Loading detail
  if (loadingDetail) {
    return (
      <div className="max-w-6xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-tiger-orange animate-spin" />
      </div>
    );
  }

  // Grid View - All Paths
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-themed">My Learning</h1>
          <p className="text-themed-muted">
            {paths.length > 0
              ? `You have ${paths.length} learning path${paths.length > 1 ? "s" : ""}`
              : "Start your learning journey with a personalized path"}
          </p>
        </div>
        <Link
          href="/pathfinder"
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-tiger-orange text-white font-medium hover:bg-tiger-orange-dark transition-all"
        >
          <Plus className="w-4 h-4" />
          New Path
        </Link>
      </div>

      {/* No Paths */}
      {paths.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-2xl bg-themed-tertiary flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-10 h-10 text-themed-muted" />
          </div>
          <h2 className="text-xl font-bold text-themed mb-4">No learning paths yet</h2>
          <p className="text-themed-muted mb-6">
            Take the Pathfinder quiz to get a personalized learning path tailored to your goals.
          </p>
          <Link
            href="/pathfinder"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-tiger-orange text-white font-medium hover:bg-tiger-orange-dark transition-all"
          >
            <Target className="w-5 h-5" />
            Take the Quiz
          </Link>
        </div>
      )}

      {/* Paths Grid */}
      {paths.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paths.map((path) => (
            <PathCard
              key={path.id}
              path={path}
              onClick={() => handleSelectPath(path.id)}
              onDelete={() => handleDeleteClick(path.id, path.title)}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-themed-secondary border border-themed rounded-2xl p-6 max-w-md w-full mx-4 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-themed">Delete Learning Path</h3>
              <button
                onClick={() => setDeleteConfirm({ show: false, pathId: null, pathTitle: "" })}
                className="p-2 rounded-lg hover:bg-themed-tertiary transition-colors"
              >
                <X className="w-4 h-4 text-themed-muted" />
              </button>
            </div>
            <p className="text-themed-muted mb-6">
              Are you sure you want to delete <span className="text-themed font-medium">"{deleteConfirm.pathTitle}"</span>? 
              This will also delete all your progress. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm({ show: false, pathId: null, pathTitle: "" })}
                className="px-4 py-2 rounded-lg bg-themed-tertiary text-themed hover:bg-themed-tertiary/80 transition-colors"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {deleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
