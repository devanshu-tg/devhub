"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Sparkles, 
  Code, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle,
  Lightbulb,
  FileText,
  Zap,
  Send,
  User,
  RotateCcw,
  Settings,
  BookOpen,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/ui/AuthModal";
import { generateGSQL, type GSQLGenerationRequest, type RAGContext } from "@/lib/api";
import toast from "react-hot-toast";
import clsx from "clsx";

interface GSQLMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  code?: string;
  explanation?: string;
  features?: string[];
  ragContext?: RAGContext;
}

const welcomeMessage = `Hey there! 👋 I'm your **GSQL AI Assistant**!

I can help you generate production-ready GSQL queries using comprehensive knowledge from TigerGraph's official documentation.

**What I can do:**
• Generate GSQL queries from natural language
• Use your schema information for accurate code
• Provide explanations and best practices
• Leverage RAG (Retrieval-Augmented Generation) for up-to-date syntax

**Get started by:**
1. Optionally set your graph schema (click the schema button)
2. Describe what query you want to build
3. I'll generate the code with explanations!

**Try asking:**
• "Create a query to find all friends of friends"
• "Generate a PageRank algorithm"
• "Find the shortest path between two vertices"`;

  const examplePrompts = [
    {
      title: "Find Friends of Friends",
      prompt: "Create a query to find all friends of friends for a given person, excluding direct friends",
      icon: Zap
    },
    {
      title: "PageRank Algorithm",
      prompt: "Generate a PageRank query with configurable damping factor and convergence threshold",
      icon: Lightbulb
    },
    {
      title: "Shortest Path",
      prompt: "Find the shortest path between two vertices in a graph",
      icon: FileText
    },
    {
      title: "Recommendation Query",
      prompt: "Create a collaborative filtering query to recommend items based on user preferences",
      icon: Sparkles
    }
  ];

export default function GSQLAIPage() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [messages, setMessages] = useState<GSQLMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: welcomeMessage
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [schema, setSchema] = useState("");
  const [context, setContext] = useState("");
  const [showSchemaEditor, setShowSchemaEditor] = useState(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load schema from localStorage on mount
  useEffect(() => {
    const savedSchema = localStorage.getItem('gsql-ai-schema');
    if (savedSchema) {
      setSchema(savedSchema);
    }
  }, []);

  // Save schema to localStorage when it changes
  useEffect(() => {
    if (schema) {
      localStorage.setItem('gsql-ai-schema', schema);
    }
  }, [schema]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    const userMessage: GSQLMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build history from previous messages (excluding welcome)
      const history = messages
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }));

      const request: GSQLGenerationRequest = {
        prompt: textToSend,
        ...(schema.trim() && { schema: schema.trim() }),
        ...(context.trim() && { context: context.trim() }),
        history
      };

      const response = await generateGSQL(request);
      
      const assistantMessage: GSQLMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.explanation || 'GSQL query generated successfully.',
        code: response.code,
        explanation: response.explanation,
        features: response.features,
        ragContext: response.ragContext
      };

      setMessages((prev) => [...prev, assistantMessage]);
      toast.success("GSQL generated successfully!");
    } catch (error: any) {
      console.error("Generation error:", error);
      const errorMessage: GSQLMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: error.message || error.details || "I'm having trouble generating the query right now. Please try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      toast.error(error.message || "Failed to generate GSQL");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([{
      id: 'welcome',
      role: 'assistant',
      content: welcomeMessage
    }]);
    toast.success("Conversation reset");
  };

  const handleCopy = async (code: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(messageId);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopiedCodeId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setInput(examplePrompt);
  };

  const renderCodeBlock = (code: string, messageId: string) => {
    return (
      <div className="relative mt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-themed-muted font-mono">GSQL</span>
          <button
            onClick={() => handleCopy(code, messageId)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-themed-tertiary hover:bg-themed border border-themed text-themed-secondary transition-all"
          >
            {copiedCodeId === messageId ? (
              <>
                <Check className="w-3 h-3 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
        <pre className="p-4 rounded-lg bg-themed-tertiary border border-themed overflow-x-auto">
          <code className="text-sm text-themed font-mono whitespace-pre">{code}</code>
        </pre>
      </div>
    );
  };

  const renderRAGContext = (ragContext: RAGContext) => {
    return (
      <div className="mt-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-semibold text-themed">
            Using RAG: {ragContext.chunksRetrieved} knowledge sections
          </span>
          <span className="text-xs text-themed-muted">
            ({ragContext.confidence}% relevance)
          </span>
        </div>
        <details className="text-xs">
          <summary className="cursor-pointer text-themed-secondary hover:text-themed">
            View relevant sections ({ragContext.relevantSections.length})
          </summary>
          <ul className="mt-2 space-y-1 pl-4">
            {ragContext.relevantSections.map((section, idx) => (
              <li key={idx} className="text-themed-muted">
                • {section.replace('GSQL_', '').replace(/_/g, ' ')}
              </li>
            ))}
          </ul>
        </details>
      </div>
    );
  };

  const renderMessage = (message: GSQLMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <div
        key={message.id}
        className={clsx(
          "flex gap-4 mb-6",
          isUser ? "flex-row-reverse" : ""
        )}
      >
        {/* Avatar */}
        <div
          className={clsx(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            isUser
              ? "bg-themed-tertiary"
              : "bg-gradient-to-br from-tiger-orange to-amber-500"
          )}
        >
          {isUser ? (
            <User className="w-5 h-5 text-themed-secondary" />
          ) : (
            <Code className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div
          className={clsx(
            "max-w-[85%] space-y-2",
            isUser ? "text-right" : ""
          )}
        >
          {/* Text Content */}
          <div
            className={clsx(
              "inline-block p-4 rounded-2xl text-sm leading-relaxed",
              isUser
                ? "bg-tiger-orange text-white rounded-tr-none"
                : "bg-themed-secondary text-themed rounded-tl-none border border-themed"
            )}
          >
            <div 
              className="whitespace-pre-wrap prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: message.content
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/•/g, '<span class="text-tiger-orange">•</span>')
                  .replace(/👋/g, '<span class="inline-block animate-wave">👋</span>')
              }}
            />
          </div>

          {/* Code Block */}
          {message.code && renderCodeBlock(message.code, message.id)}

          {/* Features */}
          {message.features && message.features.length > 0 && (
            <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-xs font-semibold text-themed mb-2">Key Features:</p>
              <ul className="space-y-1">
                {message.features.map((feature, idx) => (
                  <li key={idx} className="text-xs text-themed-secondary flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* RAG Context */}
          {message.ragContext && renderRAGContext(message.ragContext)}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-themed-primary">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tiger-orange to-tiger-orange-light flex items-center justify-center">
              <Code className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-themed">GSQL AI Pro</h1>
              <p className="text-themed-secondary mt-1">
                Generate production-ready GSQL queries with AI + RAG
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSchemaEditor(!showSchemaEditor)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-themed-secondary hover:bg-themed-tertiary border border-themed text-themed-secondary transition-all"
            >
              <Settings className="w-4 h-4" />
              Schema
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-lg bg-themed-secondary hover:bg-themed-tertiary border border-themed text-themed-secondary transition-all"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-themed-secondary rounded-xl border border-themed p-6 h-[calc(100vh-16rem)] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map(renderMessage)}
                {isLoading && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tiger-orange to-amber-500 flex items-center justify-center flex-shrink-0">
                      <Code className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-themed-tertiary text-themed rounded-2xl rounded-tl-none border border-themed p-4">
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-tiger-orange" />
                        <span className="text-sm">Generating GSQL query...</span>
                      </div>
                    </div>
            </div>
                )}
                <div ref={messagesEndRef} />
            </div>

              {/* Input Area */}
              <div className="flex gap-2">
              <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="Describe the GSQL query you want to build..."
                  className="flex-1 px-4 py-3 rounded-lg bg-themed-tertiary border border-themed text-themed placeholder:text-themed-muted focus:border-tiger-orange focus:ring-2 focus:ring-tiger-orange/20 transition-all resize-none"
                disabled={isLoading}
                  rows={2}
              />
            <button
                  onClick={() => handleSend()}
                  disabled={isLoading || !input.trim()}
                  className="px-6 py-3 rounded-lg bg-tiger-orange text-white font-semibold hover:bg-tiger-orange-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                      <Send className="w-5 h-5" />
                      Send
                </>
              )}
            </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Schema Editor */}
            {showSchemaEditor && (
              <div className="bg-themed-secondary rounded-xl border border-themed p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-themed flex items-center gap-2">
                    <Settings className="w-5 h-5 text-tiger-orange" />
                    Schema
                  </h3>
                  <button
                    onClick={() => setShowSchemaEditor(false)}
                    className="text-themed-muted hover:text-themed"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>
                <textarea
                  value={schema}
                  onChange={(e) => setSchema(e.target.value)}
                  placeholder="E.g., Vertex types: Person, Product. Edge types: PURCHASED, SIMILAR_TO..."
                  className="w-full h-32 px-4 py-3 rounded-lg bg-themed-tertiary border border-themed text-themed placeholder:text-themed-muted focus:border-tiger-orange focus:ring-2 focus:ring-tiger-orange/20 transition-all resize-none font-mono text-sm"
                />
                <p className="text-xs text-themed-muted mt-2">
                  Schema persists across conversations
                </p>
              </div>
            )}

            {/* Example Prompts */}
            <div className="bg-themed-secondary rounded-xl border border-themed p-6">
              <h3 className="text-lg font-semibold text-themed mb-4 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-tiger-orange" />
                Example Prompts
              </h3>
              <div className="space-y-3">
                {examplePrompts.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleExampleClick(example.prompt)}
                    disabled={isLoading}
                    className="w-full text-left p-4 rounded-lg bg-themed-tertiary hover:bg-themed border border-themed hover:border-tiger-orange/50 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <example.icon className="w-5 h-5 text-tiger-orange mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-themed group-hover:text-tiger-orange transition-colors">
                          {example.title}
                        </p>
                        <p className="text-xs text-themed-muted mt-1 line-clamp-2">
                          {example.prompt}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-tiger-orange/10 to-transparent rounded-xl border border-tiger-orange/20 p-6">
              <h3 className="text-sm font-semibold text-themed mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-tiger-orange" />
                Tips for Best Results
              </h3>
              <ul className="space-y-2 text-xs text-themed-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-tiger-orange mt-1">•</span>
                  <span>Be specific about what you want to query</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-tiger-orange mt-1">•</span>
                  <span>Set your schema for better accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-tiger-orange mt-1">•</span>
                  <span>Ask follow-up questions to refine</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-tiger-orange mt-1">•</span>
                  <span>RAG provides up-to-date GSQL syntax</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab="login"
      />
    </div>
  );
}
