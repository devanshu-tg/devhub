"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Compass,
  Loader2,
  MessageCircleMore,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import {
  sendChatMessage,
  type ChatMessage as APIChatMessage,
  type ChatResource,
  type QuickReply,
} from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/ui/AuthModal";
import { Avatar } from "@/components/ui/Avatar";
import { Kicker } from "@/components/ui/SectionHeader";
import { cn } from "@/lib/utils";

type ChatMode = "learning" | "qa";

interface ConversationContext {
  state: string;
  topic: string | null;
  skillLevel: string | null;
  goal: string | null;
  background: string | null;
  shownResourceIds?: string[];
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  resources?: ChatResource[];
  quickReplies?: QuickReply[];
  intent?: string;
  context?: ConversationContext;
}

const WELCOME_LEARNING = `Welcome. Pick a topic and I'll walk you through it — concept, example, quick check. We'll build mental models, not just dump links.`;
const WELCOME_QA = `Ask anything — GSQL syntax, schema design, a tricky query timing out, architecture tradeoffs. I'll answer directly and cite sources from the wall.`;

const LEARNING_SUGGESTIONS: string[] = [
  "I want to learn GSQL",
  "Teach me fraud detection basics",
  "Explain GraphRAG to me",
  "Walk me through schema design",
];
const QA_SUGGESTIONS: string[] = [
  "How do I version a query?",
  "Explain accumulators simply",
  "Best schema for a social network",
  "Why does my 2-hop timeout?",
];

const INITIAL_LEARNING_REPLIES: QuickReply[] = [
  { text: "GSQL query language", action: "topic_gsql" },
  { text: "Fraud detection", action: "topic_fraud" },
  { text: "GraphRAG & AI", action: "topic_graphrag" },
  { text: "Recommendations", action: "topic_recommendations" },
  { text: "Schema design", action: "topic_schema" },
  { text: "Something else", action: "topic_other" },
];

const ACTION_MESSAGES: Record<string, string> = {
  topic_gsql: "I want to learn GSQL",
  topic_fraud: "I'm interested in fraud detection",
  topic_graphrag: "Tell me about GraphRAG",
  topic_recommendations: "I want to build a recommendation engine",
  topic_schema: "I want to learn schema design",
  topic_cloud: "I want to learn about TigerGraph Cloud",
  topic_other: "I'm interested in something else",
  skill_beginner: "I'm a complete beginner",
  skill_knows_sql: "I know SQL but new to graphs",
  skill_intermediate: "I have some graph experience",
  skill_advanced: "I'm an advanced user",
  goal_basics: "I want to learn the basics",
  goal_project: "I want to build a project",
  goal_queries: "I want to write queries",
  goal_examples: "Show me examples",
  goal_concepts: "Help me understand the concepts",
  goal_technical: "I want a technical deep dive",
  more_resources: "Show me more resources",
  explain_concept: "Can you explain a concept?",
  new_topic: "I want to explore a different topic",
  done: "Thanks, I'm done for now!",
  show_resources: "Show me resources for this",
  explain_more: "Can you explain more?",
  explain_simple: "Explain it in simple terms",
  show_examples: "Show me practical examples",
  has_project: "I'm working on a specific project",
  has_problem: "I'm trying to solve a problem",
  exploring: "I'm just exploring what's possible",
  retry: "Let's try that again",
  reset: "Let's start over",
};

export default function ChatPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<ChatMode>("learning");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [context, setContext] = useState<ConversationContext>({
    state: "idle",
    topic: null,
    skillLevel: null,
    goal: null,
    background: null,
    shownResourceIds: [],
  });
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: "assistant", content: WELCOME_LEARNING, quickReplies: INITIAL_LEARNING_REPLIES },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [bookmarkedIds] = useState<Set<string>>(new Set());

  const scrollRef = useRef<HTMLDivElement>(null);

  const userName = useMemo(() => {
    const anyUser = user as { user_metadata?: { display_name?: string }; email?: string } | null;
    return anyUser?.user_metadata?.display_name ?? anyUser?.email?.split("@")[0] ?? "You";
  }, [user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  function handleModeChange(next: ChatMode) {
    if (next === mode) return;
    setMode(next);
    setContext({ state: "idle", topic: null, skillLevel: null, goal: null, background: null, shownResourceIds: [] });
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: next === "learning" ? WELCOME_LEARNING : WELCOME_QA,
        quickReplies: next === "learning" ? INITIAL_LEARNING_REPLIES : [],
      },
    ]);
  }

  function handleReset() {
    setContext({ state: "idle", topic: null, skillLevel: null, goal: null, background: null, shownResourceIds: [] });
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: mode === "learning" ? WELCOME_LEARNING : WELCOME_QA,
        quickReplies: mode === "learning" ? INITIAL_LEARNING_REPLIES : [],
      },
    ]);
  }

  async function handleSend(textArg?: string) {
    const text = (textArg ?? input).trim();
    if (!text || sending) return;
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const history: APIChatMessage[] = messages
        .filter((m) => !m.id.startsWith("welcome"))
        .map((m) => ({ role: m.role, content: m.content }));
      const response = await sendChatMessage(text, history, context, mode);
      if (response.context) setContext(response.context as ConversationContext);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.response,
          resources: response.resources,
          quickReplies: response.quickReplies,
          intent: response.intent,
          context: response.context as ConversationContext,
        },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "I'm having trouble connecting. Give it another try in a moment.",
          quickReplies: [
            { text: "Try again", action: "retry" },
            { text: "Start over", action: "reset" },
          ],
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleQuickReply(reply: QuickReply) {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (reply.action === "reset") {
      handleReset();
      return;
    }
    handleSend(ACTION_MESSAGES[reply.action] ?? reply.text);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const contextLabel = useMemo(() => {
    if (mode !== "learning") return "Q&A · new thread · no history saved";
    const parts: string[] = [];
    if (context.topic) parts.push(context.topic);
    if (context.skillLevel) parts.push(context.skillLevel);
    return parts.length ? `LESSON · ${parts.join(" · ")}` : "LESSON · new thread";
  }, [mode, context]);

  const staticSuggestions = mode === "learning" ? LEARNING_SUGGESTIONS : QA_SUGGESTIONS;
  const isEmpty = messages.length === 1;
  const placeholder = mode === "learning"
    ? "Answer the question, or ask me to explain it differently…"
    : "Ask anything about TigerGraph, GSQL, graph algorithms…";

  return (
    <div className="max-w-[1040px] mx-auto w-full">
      {/* Header */}
      <section className="px-10 pt-14 pb-6">
        <div className="flex items-start justify-between gap-6 mb-7">
          <div>
            <Kicker className="mb-2">/ AI CHAT</Kicker>
            <h1 className="text-[40px] md:text-[44px] font-medium text-[color:var(--ink)] tracking-[-0.032em] leading-[1.08]">
              Your AI guide to <span className="font-serif italic">mastering</span> graphs.
            </h1>
            <p className="mt-3 text-[14.5px] text-[color:var(--fg-muted)] leading-[1.55] max-w-[560px]">
              Two modes.{" "}
              <strong className="text-[color:var(--ink)] font-semibold">Learning</strong> walks you through concepts and quizzes you.{" "}
              <strong className="text-[color:var(--ink)] font-semibold">Q&amp;A</strong> answers anything you ask, with code and links back to resources.
            </p>
          </div>
          {user ? (
            <div className="flex-shrink-0 flex items-center gap-2 text-[12.5px] text-[color:var(--fg-muted)]">
              <Avatar name={userName} size={30} />
              <span className="font-mono">{userName}</span>
            </div>
          ) : null}
        </div>

        {/* Mode switcher pill */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="inline-flex items-center p-1 bg-[color:var(--cream)] border border-[color:var(--border)] rounded-full gap-1">
            <ModePill active={mode === "learning"} onClick={() => handleModeChange("learning")} icon={<Compass className="w-[13px] h-[13px]" />}>
              Learning
            </ModePill>
            <ModePill active={mode === "qa"} onClick={() => handleModeChange("qa")} icon={<Sparkles className="w-[13px] h-[13px]" />}>
              Q&amp;A
            </ModePill>
          </div>
          <span className="font-mono text-[12px] text-[color:var(--fg-subtle)]">
            {mode === "learning" ? "Guided · quizzes · remembers progress" : "Ask anything · cites sources · no memory"}
          </span>
        </div>
      </section>

      {/* Conversation */}
      <section className="px-10 pb-5">
        <div className="bg-[color:var(--bg-elev)] border border-[color:var(--border)] rounded-[14px] overflow-hidden">
          {/* Status bar */}
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-[color:var(--border)] text-[12.5px] text-[color:var(--fg-muted)]">
            <span className="w-2 h-2 rounded-full bg-[color:var(--success)]" />
            <span className="font-mono tracking-[0.08em]">{contextLabel}</span>
            <button
              onClick={handleReset}
              className="ml-auto inline-flex items-center gap-1.5 text-[11.5px] font-mono tracking-[0.05em] text-[color:var(--fg-subtle)] hover:text-[color:var(--ink)] transition"
              title="Reset conversation"
            >
              <RotateCcw className="w-3 h-3" /> NEW THREAD
            </button>
          </div>

          {/* Messages */}
          <div className="px-7 pt-7 pb-2 flex flex-col gap-6 max-h-[62vh] overflow-y-auto">
            {messages.map((m) => (
              <MessageRow
                key={m.id}
                message={m}
                userName={userName}
                onQuickReply={handleQuickReply}
                bookmarkedIds={bookmarkedIds}
              />
            ))}
            {sending ? (
              <div className="flex gap-3.5">
                <AssistantAvatar />
                <div className="flex items-center gap-2 text-[13px] text-[color:var(--fg-muted)] py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[color:var(--accent)]" />
                  Thinking…
                </div>
              </div>
            ) : null}
            <div ref={scrollRef} />
          </div>

          {/* Composer */}
          <div className="px-5 pt-4 pb-5 border-t border-[color:var(--border)]">
            {isEmpty ? (
              <div className="flex flex-wrap gap-2 mb-3">
                {staticSuggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSend(s)}
                    className="px-3 py-1.5 text-[12px] bg-transparent border border-dashed border-[color:var(--border-strong)] rounded-full text-[color:var(--fg-muted)] hover:text-[color:var(--ink)] hover:border-[color:var(--fg-subtle)] transition"
                  >
                    {s}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="flex items-end gap-2 px-4 py-3 bg-[color:var(--paper)] border border-[color:var(--border-strong)] rounded-[12px]">
              <MessageCircleMore className="w-[15px] h-[15px] text-[color:var(--fg-subtle)] mt-1 flex-shrink-0" />
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder={placeholder}
                className="flex-1 resize-none bg-transparent outline-none text-[14px] text-[color:var(--fg)] placeholder:text-[color:var(--fg-subtle)] leading-[1.5] max-h-[140px]"
                style={{ minHeight: 22 }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending}
                aria-label="Send"
                className="w-9 h-9 rounded-full bg-[color:var(--accent)] text-[color:var(--accent-fg)] flex items-center justify-center hover:bg-[color:var(--accent-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition flex-shrink-0"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Mode comparison strip */}
      <section className="px-10 pt-2 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ComparisonCard
            active={mode === "learning"}
            icon={<Compass className="w-[18px] h-[18px]" />}
            title="Learning mode"
            body="Remembers where you are in a path. Quizzes you. Sends you to the next lesson when you're ready."
          />
          <ComparisonCard
            active={mode === "qa"}
            icon={<Sparkles className="w-[18px] h-[18px]" />}
            title="Q&A mode"
            body="No memory between threads. Cites docs and forum posts. Great for quick stuck-on-a-bug moments."
          />
        </div>
      </section>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab="login" />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */

function ModePill({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13.5px] font-medium transition",
        active ? "bg-[color:var(--ink)] text-[color:var(--paper)]" : "bg-transparent text-[color:var(--fg-muted)] hover:text-[color:var(--ink)]",
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function AssistantAvatar() {
  return (
    <div className="w-9 h-9 rounded-full bg-[color:var(--ink)] text-[color:var(--accent)] flex items-center justify-center flex-shrink-0">
      <Sparkles className="w-4 h-4" />
    </div>
  );
}

function MessageRow({
  message,
  userName,
  onQuickReply,
  bookmarkedIds,
}: {
  message: Message;
  userName: string;
  onQuickReply: (r: QuickReply) => void;
  bookmarkedIds: Set<string>;
}) {
  const isUser = message.role === "user";

  if (isUser) {
    return (
      <div className="flex gap-3.5 flex-row-reverse">
        <Avatar name={userName} size={36} />
        <div className="max-w-[72%] px-4 py-3 bg-[color:var(--cream)] border border-[color:var(--border)] rounded-[14px] text-[14px] text-[color:var(--fg)] leading-[1.55] whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3.5">
      <AssistantAvatar />
      <div className="flex-1 min-w-0 text-[14px] text-[color:var(--fg)] leading-[1.6]">
        <AssistantContent content={message.content} />

        {message.resources && message.resources.length > 0 ? (
          <div className="mt-4 space-y-2.5">
            <div className="font-mono text-[10.5px] tracking-kicker text-[color:var(--fg-subtle)] inline-flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" /> RECOMMENDED READING
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {message.resources.slice(0, 4).map((r) => (
                <ChatResource key={r.id} resource={r} bookmarked={bookmarkedIds.has(r.id)} />
              ))}
            </div>
            {message.resources.length > 4 ? (
              <div className="font-mono text-[11px] text-[color:var(--fg-subtle)]">
                + {message.resources.length - 4} more in your feed
              </div>
            ) : null}
          </div>
        ) : null}

        {message.quickReplies && message.quickReplies.length > 0 ? (
          <div className="mt-3.5 flex flex-wrap gap-2">
            {message.quickReplies.map((r, i) => (
              <button
                key={i}
                onClick={() => onQuickReply(r)}
                className="px-3.5 py-1.5 text-[12.5px] rounded-full bg-[color:var(--cream)] border border-[color:var(--border)] text-[color:var(--ink)] hover:border-[color:var(--accent)] hover:text-[color:var(--accent)] transition font-medium"
              >
                {r.text}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** Simple markdown-ish content renderer: supports ```code```, **bold**, *italic*, `inline`. */
function AssistantContent({ content }: { content: string }) {
  const blocks = useMemo(() => splitCodeBlocks(content), [content]);
  return (
    <div className="space-y-3">
      {blocks.map((b, i) =>
        b.type === "code" ? (
          <CodeBlock key={i} lang={b.lang} code={b.code} />
        ) : (
          <div key={i} className="whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: renderInline(b.text) }} />
        ),
      )}
    </div>
  );
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  const highlighted = highlightGsql(code);
  return (
    <pre className="bg-[color:var(--ink)] text-[color:var(--paper)] rounded-[10px] px-4 py-3.5 font-mono text-[12.5px] leading-[1.65] overflow-x-auto">
      <div className="text-white/50 text-[10.5px] tracking-[0.1em] mb-2">{lang ? `${lang.toUpperCase()} · snippet` : "CODE"}</div>
      <code dangerouslySetInnerHTML={{ __html: highlighted }} />
    </pre>
  );
}

function splitCodeBlocks(content: string): Array<{ type: "text"; text: string } | { type: "code"; lang: string; code: string }> {
  const parts: Array<{ type: "text"; text: string } | { type: "code"; lang: string; code: string }> = [];
  const re = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(content)) !== null) {
    if (m.index > last) parts.push({ type: "text", text: content.slice(last, m.index) });
    parts.push({ type: "code", lang: m[1] ?? "", code: m[2] ?? "" });
    last = re.lastIndex;
  }
  if (last < content.length) parts.push({ type: "text", text: content.slice(last) });
  if (parts.length === 0) parts.push({ type: "text", text: content });
  return parts;
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderInline(text: string) {
  return escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-[color:var(--ink)]">$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')
    .replace(
      /`([^`]+)`/g,
      '<code class="font-mono text-[12.5px] bg-[color:var(--cream)] px-1.5 py-0.5 rounded border border-[color:var(--border)]">$1</code>',
    );
}

const GSQL_KEYWORDS = [
  "SELECT", "FROM", "WHERE", "ACCUM", "POST-ACCUM", "HAVING", "LIMIT", "ORDER", "BY",
  "CREATE", "QUERY", "VERTEX", "EDGE", "SCHEMA", "INTERPRET",
  "INSERT", "UPDATE", "DELETE", "INTO", "VALUES",
  "IF", "THEN", "ELSE", "FOREACH", "DO", "END", "RETURN",
];

function highlightGsql(code: string) {
  let s = escapeHtml(code);
  for (const kw of GSQL_KEYWORDS) {
    s = s.replace(
      new RegExp(`\\b${kw}\\b`, "g"),
      `<span style="color: var(--accent); font-weight: 600;">${kw}</span>`,
    );
  }
  return s;
}

function ChatResource({ resource, bookmarked }: { resource: ChatResource; bookmarked: boolean }) {
  const typeLabel = resource.type.toUpperCase();
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noreferrer"
      className="block bg-[color:var(--cream)] border border-[color:var(--border)] rounded-[10px] p-3.5 hover:border-[color:var(--accent)] transition group"
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[10px] tracking-kicker font-semibold text-[color:var(--accent)]">{typeLabel}</span>
        {resource.duration ? (
          <span className="font-mono text-[10px] text-[color:var(--fg-subtle)] tracking-[0.05em]">{resource.duration}</span>
        ) : null}
      </div>
      <div className="text-[13px] font-semibold text-[color:var(--ink)] leading-[1.35] tracking-[-0.005em] group-hover:text-[color:var(--accent)] transition-colors line-clamp-2">
        {resource.title}
      </div>
      {bookmarked ? (
        <div className="font-mono text-[10px] text-[color:var(--fg-subtle)] mt-1.5">SAVED</div>
      ) : null}
    </a>
  );
}

function ComparisonCard({
  active,
  icon,
  title,
  body,
}: {
  active: boolean;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div
      className={cn(
        "p-5 rounded-xl border flex gap-4",
        active
          ? "bg-[color:var(--cream)] border-[color:var(--accent)]"
          : "bg-[color:var(--bg-elev)] border-[color:var(--border)]",
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          active
            ? "bg-[color:var(--accent)] text-[color:var(--accent-fg)]"
            : "bg-[color:var(--cream)] text-[color:var(--fg-muted)]",
        )}
      >
        {icon}
      </div>
      <div>
        <div className="text-[14.5px] font-semibold text-[color:var(--ink)] tracking-[-0.005em]">{title}</div>
        <div className="mt-1 text-[13px] text-[color:var(--fg-muted)] leading-[1.55]">{body}</div>
      </div>
    </div>
  );
}
