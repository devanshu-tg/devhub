"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  Compass,
  Loader2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { generateLearningPath, saveLearningPath, type LearningPath } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/ui/AuthModal";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";

type Question = {
  id: keyof Answers;
  question: string;
  italic?: string;
  options: Array<{ value: string; label: string; description?: string }>;
};

type Answers = {
  experience?: string;
  goal?: string;
  usecase?: string;
  time?: string;
};

const QUESTIONS: Question[] = [
  {
    id: "experience",
    question: "What's your experience",
    italic: "with graph databases?",
    options: [
      { value: "none", label: "Complete beginner", description: "New to graphs and databases" },
      { value: "some", label: "Some experience", description: "Familiar with SQL, new to graphs" },
      { value: "intermediate", label: "Intermediate", description: "Used graph DBs before" },
      { value: "advanced", label: "Advanced", description: "Production graph experience" },
    ],
  },
  {
    id: "goal",
    question: "What's your primary",
    italic: "goal?",
    options: [
      { value: "learn", label: "Learn fundamentals", description: "Understand graph concepts" },
      { value: "build", label: "Build a project", description: "Create something specific" },
      { value: "migrate", label: "Migrate from SQL", description: "Move existing data to graphs" },
      { value: "optimize", label: "Optimize & scale", description: "Improve existing graph apps" },
    ],
  },
  {
    id: "usecase",
    question: "Which use case",
    italic: "pulls you in?",
    options: [
      { value: "fraud", label: "Fraud detection", description: "Real-time fraud analysis" },
      { value: "recommendations", label: "Recommendations", description: "Personalized suggestions" },
      { value: "graphrag", label: "GraphRAG / AI", description: "Knowledge graphs for LLMs" },
      { value: "general", label: "General analytics", description: "Exploratory graph analysis" },
    ],
  },
  {
    id: "time",
    question: "How much time can you",
    italic: "carve out weekly?",
    options: [
      { value: "1hr", label: "1 hour", description: "Quick learning sessions" },
      { value: "3hr", label: "3–5 hours", description: "Regular study time" },
      { value: "10hr", label: "10+ hours", description: "Intensive learning" },
      { value: "fulltime", label: "Full-time", description: "Deep dive immersion" },
    ],
  },
];

const LETTER = ["A", "B", "C", "D", "E"];

export default function PathfinderPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState<"quiz" | "loading" | "result">("quiz");
  const [questionIdx, setQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [saving, setSaving] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  const currentQ = QUESTIONS[questionIdx];
  const progress = ((questionIdx + 1) / QUESTIONS.length) * 100;
  const selectedValue = answers[currentQ.id];

  async function next() {
    if (questionIdx < QUESTIONS.length - 1) {
      setQuestionIdx((i) => i + 1);
      return;
    }
    setStep("loading");
    try {
      const path = await generateLearningPath({
        experience: answers.experience ?? "",
        goal: answers.goal ?? "",
        usecase: answers.usecase ?? "",
        time: answers.time ?? "",
      });
      setLearningPath(path);
    } catch {
      toast.error("Couldn't generate path");
    } finally {
      setStep("result");
    }
  }

  function back() {
    if (questionIdx > 0) setQuestionIdx((i) => i - 1);
  }

  function restart() {
    setStep("quiz");
    setQuestionIdx(0);
    setAnswers({});
    setLearningPath(null);
  }

  async function addToMyLearning() {
    if (!learningPath || !user) return;
    setSaving(true);
    const result = await saveLearningPath({
      ...learningPath,
      experience: answers.experience,
      goal: answers.goal,
      useCase: answers.usecase,
    });
    setSaving(false);
    if (result?.pathId) {
      toast.success("Added to My Learning");
      router.push("/my-learning");
    } else {
      toast.error("Couldn't save — try again");
    }
  }

  if (step === "loading") {
    return (
      <div className="max-w-[700px] mx-auto px-10 py-24 text-center">
        <div className="font-mono text-[12px] tracking-kicker text-[color:var(--accent)] mb-3">/ GENERATING</div>
        <h2 className="text-[36px] font-medium text-[color:var(--ink)] tracking-[-0.028em] mb-2">
          Composing your <span className="font-serif italic">path…</span>
        </h2>
        <p className="text-[14px] text-[color:var(--fg-muted)]">Matching resources to your goals and pace.</p>
        <Loader2 className="w-8 h-8 animate-spin text-[color:var(--accent)] mx-auto mt-6" />
      </div>
    );
  }

  if (step === "result") {
    return <ResultView
      path={learningPath}
      onRestart={restart}
      onSave={addToMyLearning}
      saving={saving}
      user={user}
      onAuthNeeded={() => setShowAuth(true)}
      showAuth={showAuth}
      onCloseAuth={() => setShowAuth(false)}
    />;
  }

  return (
    <div className="max-w-[1160px] mx-auto w-full px-10 pt-16 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] gap-12">
        {/* Left intro */}
        <div>
          <SectionHeader
            kicker="/ PATHFINDER"
            title="Tell us what you're up to. We'll"
            italic="build you a path."
            size="lg"
          />

          <ul className="mt-10 space-y-6">
            {[
              { icon: Compass, label: "Mapped to your level", body: "Paths track your experience so you're never lost." },
              { icon: BookOpen, label: "Real resources", body: "Videos, tutorials, and docs picked from the wall." },
              { icon: Check, label: "Auto-saved progress", body: "Return anytime — everything stays in sync." },
            ].map(({ icon: Icon, label, body }) => (
              <li key={label} className="flex gap-4">
                <div className="w-9 h-9 rounded-full border border-[color:var(--border)] flex items-center justify-center text-[color:var(--accent)] flex-shrink-0 mt-0.5">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[14.5px] font-semibold text-[color:var(--ink)]">{label}</div>
                  <div className="text-[13px] text-[color:var(--fg-muted)] leading-[1.5]">{body}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right quiz card */}
        <div>
          <div className="bg-[color:var(--bg-elev)] border border-[color:var(--border)] rounded-lg shadow-soft p-8">
            {/* Progress */}
            <div className="flex items-center justify-between mb-2">
              <div className="font-mono text-[11px] tracking-kicker text-[color:var(--fg-subtle)]">
                QUESTION {questionIdx + 1} OF {QUESTIONS.length}
              </div>
              <div className="font-mono text-[11px] text-[color:var(--fg-subtle)]">
                ~{Math.max(1, QUESTIONS.length - questionIdx - 1)} min left
              </div>
            </div>
            <div className="h-[3px] bg-[color:var(--cream)] rounded-full overflow-hidden mb-8">
              <div
                className="h-full bg-[color:var(--accent)] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Question */}
            <h2 className="text-[24px] font-medium text-[color:var(--ink)] tracking-[-0.02em] leading-[1.25] mb-6">
              {currentQ.question}
              {currentQ.italic ? (
                <>
                  {" "}
                  <span className="font-serif italic">{currentQ.italic}</span>
                </>
              ) : null}
            </h2>

            {/* Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, i) => {
                const isSelected = selectedValue === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setAnswers({ ...answers, [currentQ.id]: option.value })}
                    className={cn(
                      "w-full text-left px-4 py-3.5 rounded-md border flex items-center gap-4 transition-all",
                      isSelected
                        ? "bg-[color:var(--cream)] border-[color:var(--accent)]"
                        : "bg-[color:var(--paper)] border-[color:var(--border)] hover:border-[color:var(--border-strong)]",
                    )}
                  >
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full border flex items-center justify-center font-mono text-[11.5px] font-semibold flex-shrink-0",
                        isSelected
                          ? "bg-[color:var(--accent)] border-[color:var(--accent)] text-[color:var(--accent-fg)]"
                          : "border-[color:var(--border-strong)] text-[color:var(--fg-muted)]",
                      )}
                    >
                      {LETTER[i]}
                    </div>
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-[color:var(--ink)] tracking-[-0.005em]">
                        {option.label}
                      </div>
                      {option.description ? (
                        <div className="text-[12.5px] text-[color:var(--fg-muted)] mt-0.5">{option.description}</div>
                      ) : null}
                    </div>
                    {isSelected ? <Check className="w-4 h-4 text-[color:var(--accent)] flex-shrink-0" /> : null}
                  </button>
                );
              })}
            </div>

            {/* Nav */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={back}
                disabled={questionIdx === 0}
                className="px-4 py-2 rounded-full text-[13px] text-[color:var(--fg-muted)] hover:text-[color:var(--ink)] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ← Back
              </button>
              <button
                onClick={next}
                disabled={!selectedValue}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] text-[13px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
              >
                {questionIdx === QUESTIONS.length - 1 ? "See my path" : "Next"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} defaultTab="login" />
    </div>
  );
}

function ResultView({
  path,
  onRestart,
  onSave,
  saving,
  user,
  onAuthNeeded,
  showAuth,
  onCloseAuth,
}: {
  path: LearningPath | null;
  onRestart: () => void;
  onSave: () => void;
  saving: boolean;
  user: unknown;
  onAuthNeeded: () => void;
  showAuth: boolean;
  onCloseAuth: () => void;
}) {
  if (!path) {
    return (
      <div className="max-w-[700px] mx-auto px-10 py-24 text-center">
        <p className="text-[14px] text-[color:var(--fg-muted)]">No path generated. Try again.</p>
        <button onClick={onRestart} className="mt-4 px-5 py-2.5 rounded-full bg-[color:var(--ink)] text-[color:var(--paper)] text-[13px] font-medium">
          Retake
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1160px] mx-auto w-full px-10 pt-12 pb-16">
      <SectionHeader
        kicker="/ YOUR PATH"
        title={path.title}
        italic={path.duration}
        size="lg"
        sub={path.description}
        right={
          <div className="flex gap-2">
            <button
              onClick={onRestart}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-[color:var(--border-strong)] bg-[color:var(--bg-elev)] text-[color:var(--fg)] text-[13px] font-medium hover:bg-[color:var(--bg-hover)]"
            >
              <RotateCcw className="w-4 h-4" /> Retake
            </button>
            {user ? (
              <button
                onClick={onSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[color:var(--accent)] text-[color:var(--accent-fg)] text-[13px] font-semibold hover:bg-[color:var(--accent-hover)] disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Add to My Learning
              </button>
            ) : (
              <button
                onClick={onAuthNeeded}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[color:var(--accent)] text-[color:var(--accent-fg)] text-[13px] font-semibold hover:bg-[color:var(--accent-hover)]"
              >
                <Sparkles className="w-4 h-4" /> Sign in to save
              </button>
            )}
          </div>
        }
      />

      <section className="mt-10 bg-[color:var(--cream)] border border-[color:var(--border)] rounded-lg px-8 py-10">
        <div className="font-mono text-[11px] tracking-kicker text-[color:var(--accent)] mb-1">WHAT YOU'LL GET</div>
        <h3 className="text-[22px] font-medium text-[color:var(--ink)] tracking-[-0.02em] mb-6">
          Your weekly <span className="font-serif italic">milestones.</span>
        </h3>

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${Math.max(1, Math.min(path.milestones?.length ?? 0, 5))}, minmax(0, 1fr))` }}
        >
          {(path.milestones || []).map((m, i) => (
            <div key={i} className="bg-[color:var(--paper)] border border-[color:var(--border)] rounded-md p-5">
              <div className="font-serif italic text-[34px] text-[color:var(--accent)] leading-none mb-2 tracking-[-0.02em]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="font-mono text-[10.5px] tracking-kicker text-[color:var(--fg-subtle)] mb-1.5">
                WEEK {m.week}
              </div>
              <div className="text-[14px] font-semibold text-[color:var(--ink)] leading-[1.3] mb-1.5">
                {m.title}
              </div>
              <div className="text-[12px] text-[color:var(--fg-muted)] leading-[1.5]">
                {m.description}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Resource list per milestone */}
      <section className="mt-10 space-y-6">
        {(path.milestones || []).map((m, i) => (
          <div key={i} className="bg-[color:var(--bg-elev)] border border-[color:var(--border)] rounded-lg p-6">
            <div className="flex items-baseline justify-between mb-4">
              <div>
                <div className="font-mono text-[11px] tracking-kicker text-[color:var(--accent)]">WEEK {m.week}</div>
                <div className="text-[18px] font-medium text-[color:var(--ink)] tracking-[-0.012em] mt-1">{m.title}</div>
              </div>
              <div className="font-mono text-[11.5px] text-[color:var(--fg-subtle)]">{m.resources.length} resources</div>
            </div>
            <div className="space-y-2">
              {m.resources.map((r, j) => (
                <a
                  key={j}
                  href={r.url || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-4 p-3 rounded-md bg-[color:var(--cream)] hover:bg-[color:var(--bg-hover)] transition text-left group"
                >
                  <div className="font-mono text-[10.5px] tracking-kicker text-[color:var(--accent)] w-20 flex-shrink-0">
                    {r.type?.toUpperCase() ?? "RESOURCE"}
                  </div>
                  <div className="flex-1 text-[13.5px] font-medium text-[color:var(--ink)] group-hover:text-[color:var(--accent)] transition-colors">
                    {r.title}
                  </div>
                  <div className="font-mono text-[11px] text-[color:var(--fg-subtle)]">{r.duration}</div>
                  <ArrowRight className="w-4 h-4 text-[color:var(--fg-subtle)] group-hover:text-[color:var(--accent)]" />
                </a>
              ))}
            </div>
          </div>
        ))}
      </section>

      <AuthModal isOpen={showAuth} onClose={onCloseAuth} defaultTab="login" />
    </div>
  );
}
