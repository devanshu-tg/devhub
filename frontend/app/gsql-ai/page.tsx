"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Code,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Zap,
  Send,
  RotateCcw,
  ChevronDown,
  Database,
  Play,
  Unlink,
  Download,
  Terminal,
  X,
  ArrowRight,
  Layers,
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/ui/AuthModal";
import TigerGraphConnectModal from "@/components/TigerGraphConnectModal";
import {
  generateGSQL,
  type GSQLGenerationRequest,
  getTigerGraphStatus,
  getTigerGraphSchema,
  getTigerGraphStats,
  disconnectTigerGraph,
  runInterpretedGSQL,
  installTigerGraphQuery,
  installAndRunQuery,
  type TigerGraphConnection,
  type TigerGraphSchema,
} from "@/lib/api";
import toast from "react-hot-toast";
import clsx from "clsx";

interface QueryResult {
  status: "idle" | "loading" | "success" | "error";
  action?: "interpreted" | "install" | "install-run";
  data?: unknown;
  error?: string;
  queryName?: string;
  elapsed?: number;
}

interface GSQLMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  type?: "query" | "data" | "answer";
  code?: string;
  data?: unknown;
  mcpTool?: string;
}

function parseQueryParams(
  code: string
): Array<{ name: string; type: string }> {
  const match = code.match(
    /CREATE\s+(?:OR\s+REPLACE\s+)?(?:DISTRIBUTED\s+)?QUERY\s+\w+\s*\(([^)]*)\)/i
  );
  if (!match || !match[1].trim()) return [];

  return match[1].split(",").map((param) => {
    const trimmed = param.trim();
    const parts = trimmed.split(/\s+/);
    const name = parts[parts.length - 1];
    const type = parts.slice(0, parts.length - 1).join(" ") || "STRING";
    return { name, type };
  });
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-themed-tertiary text-tiger-orange text-xs font-mono">$1</code>');
}

export default function GSQLAIPage() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [messages, setMessages] = useState<GSQLMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [schema, setSchema] = useState("");
  const [context, setContext] = useState("");
  const [showSchema, setShowSchema] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [tgConnection, setTgConnection] =
    useState<TigerGraphConnection | null>(null);
  const [tgSchema, setTgSchema] = useState<TigerGraphSchema | null>(null);
  const [tgStats, setTgStats] = useState<{
    vertexCount: number;
    edgeCount: number;
  } | null>(null);
  const [tgContextError, setTgContextError] = useState<string | null>(null);
  const [loadingTGContext, setLoadingTGContext] = useState(false);

  const [queryResults, setQueryResults] = useState<
    Record<string, QueryResult>
  >({});
  const [queryParams, setQueryParams] = useState<
    Record<string, Record<string, string>>
  >({});

  const suggestions = useMemo(() => {
    if (!tgSchema) {
      return [
        "Find all vertices of a given type",
        "Count edges grouped by type",
        "Get the top 10 most connected nodes",
      ];
    }
    const vTypes = tgSchema.VertexTypes?.map((v: any) => v.Name) || [];
    const eTypes = tgSchema.EdgeTypes?.map((e: any) => e.Name) || [];
    const chips: string[] = [];
    if (vTypes.length >= 2 && eTypes.length >= 1) {
      chips.push(`Find ${vTypes[0]}s connected by ${eTypes[0]}`);
      chips.push(`Top 5 ${vTypes[0]}s with most ${eTypes[eTypes.length - 1]} edges`);
      chips.push(`List all ${vTypes[1]}s with attributes`);
      if (eTypes.length >= 2) {
        chips.push(`${vTypes[0]}s who ${eTypes[0].toLowerCase()} someone that ${eTypes[1].toLowerCase()} a ${vTypes[1]}`);
      }
    } else {
      vTypes.forEach((v: string) => chips.push(`List all ${v} vertices`));
      eTypes.forEach((e: string) => chips.push(`Count ${e} edges`));
    }
    return chips.slice(0, 4);
  }, [tgSchema]);

  useEffect(() => {
    if (user) checkTGConnection();
  }, [user]);

  const normalizeCount = (value: number | Record<string, number> | undefined) => {
    if (typeof value === "number") return value;
    if (!value || typeof value !== "object") return 0;
    return Object.values(value).reduce((sum, n) => sum + (typeof n === "number" ? n : 0), 0);
  };

  const loadTGContext = async (): Promise<string | null> => {
    if (loadingTGContext) return tgContextError;
    setLoadingTGContext(true);
    setTgContextError(null);
    try {
      const [schemaResp, statsResp] = await Promise.allSettled([
        getTigerGraphSchema(),
        getTigerGraphStats(),
      ]);

      const schemaData = schemaResp.status === "fulfilled" ? schemaResp.value : null;
      const statsData = statsResp.status === "fulfilled" ? statsResp.value : null;

      if (schemaData?.schema) {
        setTgSchema(schemaData.schema);
      } else {
        setTgSchema(null);
      }

      if (statsData?.statistics) {
        setTgStats({
          vertexCount: normalizeCount(statsData.statistics.vertexCount),
          edgeCount: normalizeCount(statsData.statistics.edgeCount),
        });
      } else {
        setTgStats(null);
      }

      // Only treat schema failure as a real error.
      // Stats are optional context — a quiet degradation, not a blocker.
      if (schemaData?.error) {
        const message = `Schema: ${schemaData.error}`;
        setTgContextError(message);
        toast.error(`Connected, but failed to load graph schema. ${message}`);
        return message;
      }

      return null;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load TigerGraph context";
      setTgContextError(message);
      setTgSchema(null);
      setTgStats(null);
      toast.error(message);
      return message;
    } finally {
      setLoadingTGContext(false);
    }
  };

  const checkTGConnection = async () => {
    try {
      const status = await getTigerGraphStatus();
      if (status.connected && status.connection) {
        setTgConnection(status.connection);
        await loadTGContext();
      } else {
        setTgConnection(null);
        setTgSchema(null);
        setTgStats(null);
        setTgContextError(null);
      }
    } catch (error) {
      console.error("Failed to check TG connection:", error);
    }
  };

  const handleTGConnect = async (connection: TigerGraphConnection | null) => {
    if (!connection) {
      setTgConnection(null);
      setTgSchema(null);
      setTgStats(null);
      setTgContextError(null);
      return;
    }
    setTgConnection(connection);
    const contextError = await loadTGContext();
    if (!contextError) {
      toast.success("Connected to TigerGraph!");
    }
  };

  const handleTGDisconnect = async () => {
    await disconnectTigerGraph();
    setTgConnection(null);
    setTgSchema(null);
    setTgStats(null);
    setTgContextError(null);
    toast.success("Disconnected from TigerGraph");
  };

  // ==================== Query Actions ====================

  const setResult = (messageId: string, result: QueryResult) => {
    setQueryResults((prev) => ({ ...prev, [messageId]: result }));
  };

  const handleRunInterpreted = async (code: string, messageId: string) => {
    if (!tgConnection) {
      toast.error("Connect to TigerGraph first");
      return;
    }
    setResult(messageId, { status: "loading", action: "interpreted" });
    try {
      const res = await runInterpretedGSQL(code);
      if (res.error) {
        setResult(messageId, {
          status: "error",
          action: "interpreted",
          error: res.error,
        });
        toast.error("Interpreted query failed");
      } else {
        setResult(messageId, {
          status: "success",
          action: "interpreted",
          data: res.result,
        });
        toast.success("Query ran successfully!");
      }
    } catch (error: any) {
      setResult(messageId, {
        status: "error",
        action: "interpreted",
        error: error.message,
      });
      toast.error(error.message || "Failed to run query");
    }
  };

  const handleInstall = async (code: string, messageId: string) => {
    if (!tgConnection) {
      toast.error("Connect to TigerGraph first");
      return;
    }
    setResult(messageId, { status: "loading", action: "install" });
    try {
      const res = await installTigerGraphQuery(code);
      if (!res.success) {
        setResult(messageId, {
          status: "error",
          action: "install",
          error: res.error,
        });
        toast.error(`Install failed: ${res.error}`);
      } else {
        setResult(messageId, {
          status: "success",
          action: "install",
          queryName: res.queryName,
          data: res.result,
        });
        toast.success(`Query "${res.queryName}" installed!`);
      }
    } catch (error: any) {
      setResult(messageId, {
        status: "error",
        action: "install",
        error: error.message,
      });
      toast.error(error.message || "Failed to install query");
    }
  };

  const handleInstallAndRun = async (code: string, messageId: string) => {
    if (!tgConnection) {
      toast.error("Connect to TigerGraph first");
      return;
    }
    setResult(messageId, { status: "loading", action: "install-run" });
    try {
      const paramDefs = parseQueryParams(code);
      const rawParams = queryParams[messageId] || {};
      const params: Record<string, unknown> = {};
      for (const p of paramDefs) {
        if (rawParams[p.name] !== undefined && rawParams[p.name] !== "") {
          params[p.name] = rawParams[p.name];
        }
      }

      const res = await installAndRunQuery(code, params);
      if (!res.success) {
        setResult(messageId, {
          status: "error",
          action: "install-run",
          error: res.error,
        });
        toast.error(`Install+Run failed: ${res.error}`);
      } else if (res.runError) {
        setResult(messageId, {
          status: "error",
          action: "install-run",
          error: res.runError,
          queryName: res.queryName,
          data: res.installResult,
        });
        toast.error(`Installed but run failed: ${res.runError}`);
      } else {
        setResult(messageId, {
          status: "success",
          action: "install-run",
          data: res.runResult,
          queryName: res.queryName,
          elapsed: res.elapsed,
        });
        toast.success(
          `Query "${res.queryName}" installed and ran in ${res.elapsed}ms!`
        );
      }
    } catch (error: any) {
      setResult(messageId, {
        status: "error",
        action: "install-run",
        error: error.message,
      });
      toast.error(error.message || "Failed to install and run");
    }
  };

  // ==================== Message Handling ====================

  useEffect(() => {
    const savedSchema = localStorage.getItem("gsql-ai-schema");
    if (savedSchema) setSchema(savedSchema);
  }, []);

  useEffect(() => {
    if (schema) localStorage.setItem("gsql-ai-schema", schema);
  }, [schema]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const userMessage: GSQLMessage = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const schemaForPrompt = tgSchema
        ? JSON.stringify(tgSchema, null, 2)
        : schema.trim() || undefined;

      const request: GSQLGenerationRequest = {
        prompt: textToSend,
        ...(schemaForPrompt && { schema: schemaForPrompt }),
        ...(context.trim() && { context: context.trim() }),
        history,
      };

      const response = await generateGSQL(request);

      const assistantMessage: GSQLMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        type: response.type || "query",
        content:
          response.content ||
          response.explanation ||
          "Here's your GSQL query.",
        code: response.type === "query" ? response.code : undefined,
        data: response.type === "data" ? response.data : undefined,
        mcpTool: response.mcpTool,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Generation error:", error);
      const errorMessage: GSQLMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          error.message ||
          error.details ||
          "Something went wrong generating the query. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error(error.message || "Failed to generate GSQL");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([]);
    setQueryResults({});
    setQueryParams({});
  };

  const handleCopy = async (code: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(messageId);
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  };

  // ==================== Render Helpers ====================

  const renderParamInputs = (code: string, messageId: string) => {
    const params = parseQueryParams(code);
    if (params.length === 0) return null;
    const values = queryParams[messageId] || {};

    return (
      <div className="mt-3 p-3 rounded-xl bg-themed-tertiary/50 border border-themed">
        <p className="text-xs font-medium text-themed-secondary mb-2 flex items-center gap-1.5">
          <Terminal className="w-3 h-3" />
          Parameters
        </p>
        <div className="grid grid-cols-2 gap-2">
          {params.map((p) => (
            <div key={p.name}>
              <label className="text-[11px] text-themed-muted block mb-1">
                {p.name}
                <span className="opacity-50 ml-1">{p.type}</span>
              </label>
              <input
                type="text"
                value={values[p.name] || ""}
                onChange={(e) =>
                  setQueryParams((prev) => ({
                    ...prev,
                    [messageId]: {
                      ...prev[messageId],
                      [p.name]: e.target.value,
                    },
                  }))
                }
                placeholder={p.type}
                className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-themed-primary border border-themed text-themed placeholder:text-themed-muted/40 focus:border-tiger-orange focus:outline-none transition-colors"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderResultPanel = (messageId: string) => {
    const qr = queryResults[messageId];
    if (!qr || qr.status === "idle") return null;

    const actionLabels: Record<string, string> = {
      interpreted: "Interpreted Query",
      install: "Install Query",
      "install-run": "Install & Run",
    };

    return (
      <div className="mt-3 rounded-xl border border-themed overflow-hidden">
        <div
          className={clsx(
            "flex items-center justify-between px-3 py-2 text-xs font-medium",
            qr.status === "loading" &&
              "bg-blue-500/10 text-blue-400",
            qr.status === "success" &&
              "bg-green-500/10 text-green-400",
            qr.status === "error" &&
              "bg-red-500/10 text-red-400"
          )}
        >
          <div className="flex items-center gap-2">
            {qr.status === "loading" && (
              <Loader2 className="w-3 h-3 animate-spin" />
            )}
            {qr.status === "success" && <Check className="w-3 h-3" />}
            {qr.status === "error" && <AlertCircle className="w-3 h-3" />}
            <span>
              {actionLabels[qr.action || ""] || "Result"}
              {qr.queryName && ` — ${qr.queryName}`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {qr.elapsed && (
              <span className="text-themed-muted">{qr.elapsed}ms</span>
            )}
            <button
              onClick={() =>
                setQueryResults((prev) => ({
                  ...prev,
                  [messageId]: { status: "idle" },
                }))
              }
              className="p-0.5 rounded hover:bg-themed-tertiary transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
        <div className="px-3 py-2 max-h-64 overflow-y-auto bg-themed-tertiary/30">
          {qr.status === "loading" && (
            <p className="text-xs text-themed-muted">Running...</p>
          )}
          {qr.status === "error" && (
            <pre className="text-xs text-red-400 whitespace-pre-wrap font-mono">
              {qr.error}
            </pre>
          )}
          {qr.status === "success" && qr.data != null && (
            <pre className="text-xs text-themed whitespace-pre-wrap font-mono">
              {typeof qr.data === "string"
                ? qr.data
                : JSON.stringify(qr.data, null, 2)}
            </pre>
          )}
          {qr.status === "success" && qr.data == null && (
            <p className="text-xs text-green-400">
              Completed successfully.
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderCodeBlock = (code: string, messageId: string) => {
    const qr = queryResults[messageId];
    const isRunning = qr?.status === "loading";

    return (
      <div className="mt-3">
        <div className="rounded-xl border border-themed overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 bg-themed-tertiary/50 border-b border-themed">
            <span className="text-[11px] text-themed-muted font-mono tracking-wide uppercase">
              gsql
            </span>
            <div className="flex items-center gap-1.5">
              {tgConnection && (
                <>
                  <button
                    onClick={() => handleRunInterpreted(code, messageId)}
                    disabled={isRunning}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-all disabled:opacity-40"
                  >
                    {isRunning && qr?.action === "interpreted" ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Play className="w-3 h-3" />
                    )}
                    Run
                  </button>
                  <button
                    onClick={() => handleInstall(code, messageId)}
                    disabled={isRunning}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-all disabled:opacity-40"
                  >
                    {isRunning && qr?.action === "install" ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Download className="w-3 h-3" />
                    )}
                    Install
                  </button>
                  <button
                    onClick={() => handleInstallAndRun(code, messageId)}
                    disabled={isRunning}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium bg-green-500/10 hover:bg-green-500/20 text-green-400 transition-all disabled:opacity-40"
                  >
                    {isRunning && qr?.action === "install-run" ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Zap className="w-3 h-3" />
                    )}
                    Install & Run
                  </button>
                </>
              )}
              <button
                onClick={() => handleCopy(code, messageId)}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium text-themed-muted hover:text-themed transition-colors"
              >
                {copiedCodeId === messageId ? (
                  <Check className="w-3 h-3 text-green-500" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
          <pre className="p-4 overflow-x-auto bg-themed-primary">
            <code className="text-sm text-themed font-mono whitespace-pre leading-relaxed">
              {code}
            </code>
          </pre>
        </div>

        {tgConnection && renderParamInputs(code, messageId)}
        {renderResultPanel(messageId)}
      </div>
    );
  };

  const renderDataBlock = (data: unknown) => {
    if (data == null) return null;
    return (
      <details className="mt-2 group">
        <summary className="text-[11px] text-themed-muted cursor-pointer hover:text-themed-secondary transition-colors select-none">
          Raw data
        </summary>
        <pre className="mt-1 p-3 rounded-lg bg-themed-tertiary/40 border border-themed text-xs text-themed font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
          {typeof data === "string" ? data : JSON.stringify(data, null, 2)}
        </pre>
      </details>
    );
  };

  const renderMessage = (message: GSQLMessage, index: number) => {
    const isUser = message.role === "user";

    return (
      <div
        key={message.id}
        className={clsx(
          "animate-fade-in",
          isUser ? "flex justify-end" : ""
        )}
      >
        {isUser ? (
          <div className="max-w-[80%]">
            <div className="inline-block px-4 py-2.5 rounded-2xl rounded-tr-sm bg-tiger-orange text-white text-sm leading-relaxed">
              {message.content}
            </div>
          </div>
        ) : (
          <div className="max-w-[90%]">
            <div className="border-l-2 border-tiger-orange/30 pl-4">
              {/* Data response indicator */}
              {message.type === "data" && (
                <div className="flex items-center gap-1.5 mb-2">
                  <Database className="w-3.5 h-3.5 text-tiger-orange" />
                  <span className="text-[11px] font-medium text-tiger-orange tracking-wide uppercase">
                    Queried your graph
                  </span>
                </div>
              )}

              <div
                className="text-sm text-themed leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdown(message.content),
                }}
              />

              {/* Collapsible raw data for data responses */}
              {message.type === "data" && message.data && renderDataBlock(message.data)}

              {/* Code block for query responses */}
              {message.code && renderCodeBlock(message.code, message.id)}
            </div>
          </div>
        )}
      </div>
    );
  };

  const hasMessages = messages.length > 0;

  // ==================== Render ====================

  return (
    <div
      className="flex flex-col -m-6 h-[calc(100vh-4rem)]"
      style={{
        background: `
          radial-gradient(ellipse 90% 60% at 85% 0%, rgba(247,148,29,0.15) 0%, transparent 50%),
          radial-gradient(ellipse 55% 50% at 0% 40%, rgba(247,148,29,0.10) 0%, transparent 50%),
          radial-gradient(ellipse 70% 50% at 20% 100%, rgba(255,171,74,0.13) 0%, transparent 50%),
          radial-gradient(ellipse 45% 40% at 95% 60%, rgba(247,148,29,0.08) 0%, transparent 50%),
          var(--surface-primary)
        `,
      }}
    >

      {/* Header */}
      <div className="flex-shrink-0 border-b border-themed/50 px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tiger-orange to-tiger-orange-light flex items-center justify-center">
              <Code className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-themed">GSQL AI</h1>
            {tgConnection && (
              <div className="hidden sm:flex items-center gap-2 ml-3 pl-3 border-l border-themed">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-xs text-themed-secondary">
                  {tgConnection.graph_name || "TigerGraph"}
                </span>
                {tgStats && (tgStats.vertexCount > 0 || tgStats.edgeCount > 0) && (
                  <span className="text-xs text-themed-secondary font-medium tabular-nums">
                    {tgStats.vertexCount.toLocaleString()} nodes &middot; {tgStats.edgeCount.toLocaleString()} edges
                  </span>
                )}
                <button
                  onClick={handleTGDisconnect}
                  className="text-themed-muted hover:text-red-400 transition-colors ml-1"
                  title="Disconnect"
                >
                  <Unlink className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                if (!user) {
                  setShowAuthModal(true);
                  toast.error("Please sign in to connect TigerGraph.");
                  return;
                }
                setShowConnectModal(true);
              }}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                tgConnection
                  ? "border-green-500/30 text-green-400 hover:bg-green-500/10"
                  : "border-themed text-themed-secondary hover:bg-themed-tertiary"
              )}
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {tgConnection ? "Connected" : "Connect"}
              </span>
            </button>
            <button
              onClick={() => setShowSchema(!showSchema)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                showSchema
                  ? "border-tiger-orange/30 text-tiger-orange bg-tiger-orange/5"
                  : "border-themed text-themed-secondary hover:bg-themed-tertiary"
              )}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Schema</span>
            </button>
            {hasMessages && (
              <button
                onClick={handleReset}
                className="p-1.5 rounded-lg border border-themed text-themed-muted hover:text-themed-secondary hover:bg-themed-tertiary transition-all"
                title="New conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {tgConnection && tgContextError && (
        <div className="flex-shrink-0 border-b border-yellow-500/20 bg-yellow-500/5 px-6 py-2">
          <div className="max-w-4xl mx-auto flex items-start gap-2 text-xs text-yellow-400">
            <AlertCircle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span>
              {tgContextError}. You can still chat and generate queries.
            </span>
          </div>
        </div>
      )}

      {/* Schema Drawer */}
      {showSchema && (
        <div className="flex-shrink-0 border-b border-themed/50 animate-fade-in">
          <div className="max-w-4xl mx-auto px-6 py-4">
            {tgSchema ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-green-400 flex items-center gap-1.5 font-medium">
                    <Check className="w-3 h-3" />
                    Loaded from TigerGraph
                  </p>
                  <span className="text-[11px] text-themed-muted">
                    {tgSchema.GraphName}
                  </span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {tgSchema.VertexTypes?.map((v: any) => (
                    <div
                      key={v.Name}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-themed-secondary border border-themed"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-themed">
                          {v.Name}
                        </span>
                        <span className="text-[11px] text-themed-muted ml-1.5">
                          PK: {v.PrimaryId?.AttributeName || "id"}
                        </span>
                        {v.Attributes?.length > 0 && (
                          <p className="text-[11px] text-themed-muted mt-0.5 truncate">
                            {v.Attributes.map(
                              (a: any) => a.AttributeName
                            ).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  {tgSchema.EdgeTypes?.map((e: any) => (
                    <div
                      key={e.Name}
                      className="flex items-start gap-2 p-2.5 rounded-lg bg-themed-secondary border border-themed"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-medium text-themed">
                          {e.Name}
                        </span>
                        <span className="text-[11px] text-themed-muted ml-1.5">
                          {e.FromVertexTypeName} → {e.ToVertexTypeName}
                        </span>
                        {e.Attributes?.length > 0 && (
                          <p className="text-[11px] text-themed-muted mt-0.5 truncate">
                            {e.Attributes.map(
                              (a: any) => a.AttributeName
                            ).join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-themed-muted font-medium">
                  Manual schema (optional)
                </p>
                <textarea
                  value={schema}
                  onChange={(e) => setSchema(e.target.value)}
                  placeholder="Vertex types: Person, Product&#10;Edge types: PURCHASED, SIMILAR_TO"
                  className="w-full h-24 px-3 py-2 rounded-lg bg-themed-secondary border border-themed text-themed text-xs font-mono placeholder:text-themed-muted/40 focus:border-tiger-orange focus:outline-none focus:ring-1 focus:ring-tiger-orange/20 transition-all resize-none"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {hasMessages ? (
            <div className="space-y-6">
              {messages.map((m, i) => renderMessage(m, i))}

              {isLoading && (
                <div className="animate-fade-in">
                  <div className="border-l-2 border-tiger-orange/30 pl-4">
                    <div className="flex items-center gap-2 text-sm text-themed-muted">
                      <Loader2 className="w-4 h-4 animate-spin text-tiger-orange" />
                      Thinking...
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-tiger-orange/10 to-tiger-orange/5 border border-tiger-orange/10 flex items-center justify-center mb-6">
                <Code className="w-7 h-7 text-tiger-orange/60" />
              </div>
              <h2 className="text-xl font-semibold text-themed mb-1">
                What do you want to query?
              </h2>
              <p className="text-sm text-themed-muted mb-8 text-center max-w-md">
                {tgConnection
                  ? `Connected to ${tgConnection.graph_name || "TigerGraph"} — describe what you need in plain English.`
                  : "Connect your TigerGraph instance or describe a query manually."}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(s)}
                    disabled={isLoading}
                    className="group flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs text-themed-secondary bg-themed-secondary border border-themed hover:border-tiger-orange/40 hover:text-tiger-orange transition-all disabled:opacity-50"
                  >
                    {s}
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Bar */}
      <div className="flex-shrink-0 border-t border-themed/50">
        <div className="max-w-4xl mx-auto px-6 py-3">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                autoResize(e.target);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={
                tgConnection
                  ? "Ask about your graph..."
                  : "Describe the GSQL query you need..."
              }
              className="flex-1 px-4 py-2.5 rounded-xl bg-themed-secondary border border-themed text-sm text-themed placeholder:text-themed-muted/50 focus:border-tiger-orange focus:ring-1 focus:ring-tiger-orange/20 transition-all resize-none leading-relaxed"
              disabled={isLoading}
              rows={1}
              style={{ maxHeight: 160 }}
            />
            <button
              onClick={() => handleSend()}
              disabled={isLoading || !input.trim()}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-tiger-orange text-white flex items-center justify-center hover:bg-tiger-orange-dark transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="login"
      />

      <TigerGraphConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onConnect={handleTGConnect}
        currentConnection={tgConnection}
        isAuthenticated={!!user}
        onRequireAuth={() => setShowAuthModal(true)}
      />
    </div>
  );
}
