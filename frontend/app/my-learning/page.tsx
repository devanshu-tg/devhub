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
} from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import {
  getMyLearningPath,
  getPathProgress,
  updatePathProgress,
  type PathProgress,
  type UserLearningPath,
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

export default function MyLearningPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<UserLearningPath | null>(null);
  const [progress, setProgress] = useState<PathProgress | null>(null);
  const [selectedResource, setSelectedResource] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPath();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchPath = async () => {
    setLoading(true);
    try {
      const { path: userPath } = await getMyLearningPath();
      setPath(userPath);

      if (userPath) {
        const pathProgress = await getPathProgress(userPath.id);
        setProgress(pathProgress);
      }
    } catch (error) {
      console.error('Failed to fetch path:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleResource = async (
    milestoneIndex: number,
    resourceIndex: number,
    currentlyCompleted: boolean
  ) => {
    if (!path) return;

    const newCompleted = !currentlyCompleted;

    // Optimistic update
    if (progress) {
      const updatedResourceProgress = [...progress.resourceProgress];
      const existingIndex = updatedResourceProgress.findIndex(
        (r) => r.milestoneIndex === milestoneIndex && r.resourceIndex === resourceIndex
      );

      if (existingIndex >= 0) {
        updatedResourceProgress[existingIndex].completed = newCompleted;
      } else {
        updatedResourceProgress.push({
          id: `temp-${Date.now()}`,
          milestoneIndex,
          resourceIndex,
          completed: newCompleted,
          completedAt: newCompleted ? new Date().toISOString() : null,
        });
      }

      const completed = updatedResourceProgress.filter((r) => r.completed).length;
      const total = progress.stats.totalResources;
      const percentage = Math.round((completed / total) * 100);

      setProgress({
        ...progress,
        resourceProgress: updatedResourceProgress,
        stats: {
          ...progress.stats,
          completedResources: completed,
          progressPercentage: percentage,
        },
      });
    }

    try {
      const result = await updatePathProgress(
        path.id,
        milestoneIndex,
        resourceIndex,
        newCompleted
      );

      if (result.success) {
        if (result.pathComplete) {
          toast.success('🎉 Congratulations! You completed your learning path!');
        } else if (result.milestoneComplete) {
          toast.success('✅ Milestone completed!');
        }
        // Refetch to get accurate progress
        fetchPath();
      }
    } catch (error) {
      console.error('Failed to update progress:', error);
      toast.error('Failed to update progress');
      // Revert optimistic update
      fetchPath();
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
    if (!path || !progress) return 0;
    const milestone = path.milestones[milestoneIndex];
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

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="w-20 h-20 rounded-2xl bg-themed-tertiary flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-10 h-10 text-themed-muted" />
        </div>
        <h1 className="text-2xl font-bold text-themed mb-4">Sign in to track your learning</h1>
        <p className="text-themed-muted mb-6">
          Create a personalized learning path and track your progress through TigerGraph resources.
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-tiger-orange animate-spin" />
      </div>
    );
  }

  if (!path) {
    return (
      <div className="max-w-4xl mx-auto text-center py-20">
        <div className="w-20 h-20 rounded-2xl bg-themed-tertiary flex items-center justify-center mx-auto mb-6">
          <GraduationCap className="w-10 h-10 text-themed-muted" />
        </div>
        <h1 className="text-2xl font-bold text-themed mb-4">No active learning path</h1>
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
    );
  }

  const overallProgress = progress?.stats.progressPercentage || 0;
  const isPathComplete = path.status === 'completed';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-themed">{path.title}</h1>
            <p className="text-themed-muted">{path.description}</p>
          </div>
          <Link
            href="/pathfinder"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-themed-tertiary text-themed-secondary hover:text-themed transition-all"
            title="Retake quiz"
          >
            <RotateCcw className="w-4 h-4" />
            Retake Quiz
          </Link>
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
                {path.duration}
              </span>
              <span className="flex items-center gap-2 text-themed-secondary">
                <Target className="w-4 h-4 text-tiger-orange" />
                {progress?.stats.completedResources || 0}/{progress?.stats.totalResources || 0} resources
              </span>
            </div>
          </div>
          <div className="h-3 bg-themed-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-tiger-orange to-amber-500 transition-all duration-500"
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
        {path.milestones.map((milestone, milestoneIdx) => {
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
              <div className={clsx(
                "p-6 rounded-2xl bg-themed-secondary border border-themed transition-all",
                isLocked && "opacity-60"
              )}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-tiger-orange font-semibold uppercase tracking-wider">
                        Week {milestone.week}
                      </span>
                      {milestoneComplete && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                      {isLocked && (
                        <Lock className="w-4 h-4 text-themed-muted" />
                      )}
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
                          className={clsx(
                            "flex-shrink-0 transition-all",
                            isLocked && "cursor-not-allowed"
                          )}
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
                              isCompleted ? "text-themed-muted line-through" : "text-themed group-hover:text-tiger-orange"
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
