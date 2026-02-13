"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Compass, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  Target,
  Sparkles,
  BookOpen,
  Code,
  Zap,
  Loader2,
  RotateCcw
} from "lucide-react";
import clsx from "clsx";
import { generateLearningPath, saveLearningPath, type LearningPath } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/ui/AuthModal";
import toast from "react-hot-toast";

interface QuizQuestion {
  id: string;
  question: string;
  options: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
}

const quizQuestions: QuizQuestion[] = [
  {
    id: "experience",
    question: "What's your experience with graph databases?",
    options: [
      { value: "none", label: "Complete Beginner", description: "New to graphs and databases" },
      { value: "some", label: "Some Experience", description: "Familiar with SQL, new to graphs" },
      { value: "intermediate", label: "Intermediate", description: "Used graph DBs before" },
      { value: "advanced", label: "Advanced", description: "Production graph experience" },
    ],
  },
  {
    id: "goal",
    question: "What's your primary goal?",
    options: [
      { value: "learn", label: "Learn Fundamentals", description: "Understand graph concepts" },
      { value: "build", label: "Build a Project", description: "Create something specific" },
      { value: "migrate", label: "Migrate from SQL", description: "Move existing data to graphs" },
      { value: "optimize", label: "Optimize & Scale", description: "Improve existing graph apps" },
    ],
  },
  {
    id: "usecase",
    question: "What use case interests you most?",
    options: [
      { value: "fraud", label: "Fraud Detection", description: "Real-time fraud analysis" },
      { value: "recommendations", label: "Recommendations", description: "Personalized suggestions" },
      { value: "graphrag", label: "GraphRAG / AI", description: "Knowledge graphs for LLMs" },
      { value: "general", label: "General Analytics", description: "Exploratory graph analysis" },
    ],
  },
  {
    id: "time",
    question: "How much time can you dedicate weekly?",
    options: [
      { value: "1hr", label: "1 Hour", description: "Quick learning sessions" },
      { value: "3hr", label: "3-5 Hours", description: "Regular study time" },
      { value: "10hr", label: "10+ Hours", description: "Intensive learning" },
      { value: "fulltime", label: "Full-time", description: "Deep dive immersion" },
    ],
  },
];

export default function PathfinderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<"quiz" | "loading" | "result">("quiz");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleNext = async () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Generate learning path
      setStep("loading");
      try {
        const path = await generateLearningPath({
          experience: answers.experience,
          goal: answers.goal,
          usecase: answers.usecase,
          time: answers.time,
        });
        setLearningPath(path);
        setStep("result");
      } catch (error) {
        console.error("Failed to generate path:", error);
        setStep("result");
      }
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleRestart = () => {
    setStep("quiz");
    setCurrentQuestion(0);
    setAnswers({});
    setLearningPath(null);
  };

  const handleAddToMyLearning = async () => {
    if (!learningPath || !user) return;
    setIsSaving(true);
    try {
      const result = await saveLearningPath({
        ...learningPath,
        experience: answers.experience,
        goal: answers.goal,
        useCase: answers.usecase,
      });
      if (result?.pathId) {
        toast.success("Path added to My Learning!");
        router.push("/my-learning");
      } else {
        toast.error("Failed to save path. Please try again.");
      }
    } catch (error) {
      console.error("Failed to save path:", error);
      toast.error("Failed to save path. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const currentQ = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  // Loading state
  if (step === "loading") {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6">
          <Loader2 className="w-10 h-10 text-themed animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-themed mb-2">Creating Your Path</h2>
        <p className="text-themed-muted">Analyzing your goals and experience...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {step === "quiz" ? (
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm">
              <Compass className="w-4 h-4" />
              Learner Pathfinder
            </div>
            <h1 className="text-3xl font-bold text-themed">
              Let&apos;s find your perfect learning path
            </h1>
            <p className="text-themed-muted">
              Answer a few questions to get a personalized TigerGraph curriculum
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-themed-muted">Question {currentQuestion + 1} of {quizQuestions.length}</span>
              <span className="text-tiger-orange">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-themed-tertiary rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-tiger-orange to-amber-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="p-8 rounded-2xl bg-themed-secondary border border-themed">
            <h2 className="text-xl font-semibold text-themed mb-6">{currentQ.question}</h2>
            
            <div className="space-y-3">
              {currentQ.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(currentQ.id, option.value)}
                  className={clsx(
                    "w-full p-4 rounded-xl border text-left transition-all",
                    answers[currentQ.id] === option.value
                      ? "bg-tiger-orange/10 border-tiger-orange"
                      : "bg-themed-tertiary/50 border-themed hover:border-tiger-orange/30"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={clsx(
                        "font-medium",
                        answers[currentQ.id] === option.value ? "text-tiger-orange" : "text-themed"
                      )}>
                        {option.label}
                      </p>
                      {option.description && (
                        <p className="text-sm text-themed-muted mt-1">{option.description}</p>
                      )}
                    </div>
                    {answers[currentQ.id] === option.value && (
                      <CheckCircle2 className="w-5 h-5 text-tiger-orange" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg transition-all",
                currentQuestion === 0
                  ? "text-themed-muted cursor-not-allowed"
                  : "text-themed-secondary hover:text-themed"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!answers[currentQ.id]}
              className={clsx(
                "flex items-center gap-2 px-6 py-2 rounded-xl font-medium transition-all",
                answers[currentQ.id]
                  ? "bg-tiger-orange text-themed hover:bg-tiger-orange-dark"
                  : "bg-themed-tertiary text-themed-muted cursor-not-allowed"
              )}
            >
              {currentQuestion === quizQuestions.length - 1 ? "See My Path" : "Next"}
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              <Sparkles className="w-4 h-4" />
              Your Personalized Path
            </div>
            <h1 className="text-3xl font-bold text-themed">
              {learningPath?.title || "TigerGraph Learning Path"}
            </h1>
            <p className="text-themed-muted">{learningPath?.description}</p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <span className="flex items-center gap-2 text-themed-secondary">
                <Clock className="w-4 h-4 text-tiger-orange" />
                {learningPath?.duration || "3-4 weeks"}
              </span>
              <span className="flex items-center gap-2 text-themed-secondary">
                <Target className="w-4 h-4 text-tiger-orange" />
                {learningPath?.milestones?.length || 0} milestones
              </span>
            </div>
          </div>

          {/* Learning Path Timeline */}
          {learningPath?.milestones && learningPath.milestones.length > 0 ? (
            <div className="space-y-6">
              {learningPath.milestones.map((milestone, idx) => (
                <div 
                  key={idx}
                  className="relative pl-8 pb-6 border-l-2 border-themed last:border-transparent last:pb-0"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-0 w-4 h-4 -translate-x-[9px] rounded-full bg-tiger-orange border-4 border-themed" />
                  
                  {/* Milestone card */}
                  <div className="p-6 rounded-2xl bg-themed-secondary border border-themed">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-xs text-tiger-orange font-semibold uppercase tracking-wider">
                          Week {milestone.week}
                        </span>
                        <h3 className="text-lg font-semibold text-themed mt-1">{milestone.title}</h3>
                        <p className="text-sm text-themed-muted">{milestone.description}</p>
                      </div>
                    </div>

                    {/* Resources */}
                    <div className="space-y-2">
                      {milestone.resources.map((resource, rIdx) => (
                        <a
                          key={rIdx}
                          href={resource.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-themed-tertiary/50 hover:bg-themed-tertiary transition-all cursor-pointer group block"
                        >
                          <div className="w-8 h-8 rounded-lg bg-themed-tertiary flex items-center justify-center">
                            {(resource.type === "video" || resource.type === "course") && <Zap className="w-4 h-4 text-amber-400" />}
                            {(resource.type === "article" || resource.type === "blog") && <BookOpen className="w-4 h-4 text-blue-400" />}
                            {(resource.type === "tutorial" || resource.type === "code") && <Code className="w-4 h-4 text-emerald-400" />}
                            {resource.type === "docs" && <BookOpen className="w-4 h-4 text-purple-400" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-themed group-hover:text-tiger-orange transition-colors">
                              {resource.title}
                            </p>
                            <p className="text-xs text-themed-muted">{resource.type} • {resource.duration}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-themed-muted group-hover:text-tiger-orange transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-themed-muted">No milestones available. Try retaking the quiz.</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <button
              onClick={handleRestart}
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-themed-tertiary text-themed font-medium hover:bg-themed-tertiary transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Quiz
            </button>
            {user ? (
              <button
                onClick={handleAddToMyLearning}
                disabled={isSaving}
                className="px-6 py-3 rounded-xl bg-tiger-orange text-themed font-medium hover:bg-tiger-orange-dark transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Sparkles className="w-5 h-5" />
                )}
                {isSaving ? "Adding..." : "Add to My Learning"}
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-3 rounded-xl bg-tiger-orange text-themed font-medium hover:bg-tiger-orange-dark transition-all flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Sign in to Add to My Learning
              </button>
            )}
          </div>

          {/* Auth Modal for guests */}
          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            defaultTab="login"
          />
        </div>
      )}
    </div>
  );
}
