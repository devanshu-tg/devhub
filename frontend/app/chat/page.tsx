"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  User, 
  ExternalLink, 
  BookOpen, 
  Lightbulb,
  RefreshCw
} from "lucide-react";
import clsx from "clsx";
import { sendChatMessage, type ChatMessage as APIChatMessage } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Array<{
    title: string;
    url: string;
    type: string;
  }>;
}

const suggestedPrompts = [
  "What's the best way to get started with TigerGraph?",
  "Show me fraud detection tutorials",
  "How do I write my first GSQL query?",
  "Explain GraphRAG with TigerGraph",
];

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Welcome to DevHub AI! I'm here to help you navigate TigerGraph resources and answer your questions. What would you like to learn today?",
      citations: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      // Build history from previous messages (excluding welcome)
      const history: APIChatMessage[] = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({ role: m.role, content: m.content }));

      const response = await sendChatMessage(currentInput, history);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        citations: response.citations,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        citations: [],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-themed">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tiger-orange to-amber-500 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-themed" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-themed">AI Resource Chat</h1>
          <p className="text-themed-muted text-sm">Powered by Gemini + TigerGraph Knowledge Base</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={clsx(
              "flex gap-4",
              message.role === "user" ? "flex-row-reverse" : ""
            )}
          >
            {/* Avatar */}
            <div
              className={clsx(
                "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                message.role === "user"
                  ? "bg-themed-tertiary"
                  : "bg-gradient-to-br from-tiger-orange to-amber-500"
              )}
            >
              {message.role === "user" ? (
                <User className="w-5 h-5 text-themed-secondary" />
              ) : (
                <Sparkles className="w-5 h-5 text-themed" />
              )}
            </div>

            {/* Message Content */}
            <div
              className={clsx(
                "max-w-[80%] space-y-3",
                message.role === "user" ? "text-right" : ""
              )}
            >
              <div
                className={clsx(
                  "inline-block p-4 rounded-2xl text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-tiger-orange text-themed rounded-tr-none"
                    : "bg-themed-secondary text-themed rounded-tl-none border border-themed"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>

              {/* Citations */}
              {message.citations && message.citations.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-themed-muted flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    Related Resources
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {message.citations.map((citation, idx) => (
                      <a
                        key={idx}
                        href={citation.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-themed-tertiary border border-themed text-xs text-themed-secondary hover:border-tiger-orange hover:text-tiger-orange transition-all"
                      >
                        {citation.title}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tiger-orange to-amber-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-themed" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-themed-secondary border border-themed">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-tiger-orange animate-spin" />
                <span className="text-sm text-themed-muted">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {messages.length === 1 && (
        <div className="pb-4">
          <p className="text-xs text-themed-muted mb-3 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            Try asking
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => setInput(prompt)}
                className="px-4 py-2 rounded-xl bg-themed-secondary border border-themed text-sm text-themed-secondary hover:border-tiger-orange hover:text-themed transition-all"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="pt-4 border-t border-themed">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about TigerGraph resources, concepts, or learning paths..."
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-xl bg-themed-secondary border border-themed text-themed placeholder-dark-400 resize-none focus:border-tiger-orange focus:ring-2 focus:ring-tiger-orange/20 transition-all"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={clsx(
              "px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2",
              input.trim() && !isLoading
                ? "bg-tiger-orange text-themed hover:bg-tiger-orange-dark"
                : "bg-themed-tertiary text-themed-muted cursor-not-allowed"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-themed-muted mt-2 text-center">
          AI responses are generated based on TigerGraph documentation and resources
        </p>
      </div>
    </div>
  );
}
