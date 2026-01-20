"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Sparkles, 
  User, 
  Lightbulb,
  RefreshCw,
  BookOpen,
  Play,
  FileText,
  Code,
  Target,
  Zap,
  Shield,
  Brain,
  Database,
  RotateCcw,
  GraduationCap,
  MessageCircle
} from "lucide-react";
import clsx from "clsx";
import { 
  sendChatMessage, 
  type ChatMessage as APIChatMessage,
  type ChatResource,
  type QuickReply
} from "@/lib/api";
import ChatResourceCard from "@/components/ui/ChatResourceCard";
import { useAuth } from "@/components/AuthProvider";

// Conversation context type matching backend
interface ConversationContext {
  state: string;
  topic: string | null;
  skillLevel: string | null;
  goal: string | null;
  background: string | null;
  shownResourceIds?: string[]; // Track shown resources for "show more"
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

const initialWelcomeQuickReplies: QuickReply[] = [
  { text: "GSQL Query Language", action: "topic_gsql" },
  { text: "Fraud Detection", action: "topic_fraud" },
  { text: "GraphRAG & AI", action: "topic_graphrag" },
  { text: "Recommendation Engines", action: "topic_recommendations" },
  { text: "Schema Design", action: "topic_schema" },
  { text: "Something else", action: "topic_other" }
];

const topicCards = [
  { 
    id: "gsql", 
    title: "GSQL Query Language", 
    description: "Learn TigerGraph's powerful query language",
    icon: Code,
    color: "from-blue-500 to-blue-700"
  },
  { 
    id: "fraud", 
    title: "Fraud Detection", 
    description: "Build real-time fraud detection systems",
    icon: Shield,
    color: "from-red-500 to-red-700"
  },
  { 
    id: "graphrag", 
    title: "GraphRAG & AI", 
    description: "Combine graphs with LLMs",
    icon: Brain,
    color: "from-purple-500 to-purple-700"
  },
  { 
    id: "recommendations", 
    title: "Recommendations", 
    description: "Create personalized recommendations",
    icon: Zap,
    color: "from-orange-500 to-orange-700"
  },
  { 
    id: "schema", 
    title: "Schema Design", 
    description: "Model your data effectively",
    icon: Database,
    color: "from-green-500 to-green-700"
  },
  { 
    id: "cloud", 
    title: "TigerGraph Cloud", 
    description: "Deploy and manage in the cloud",
    icon: Target,
    color: "from-cyan-500 to-cyan-700"
  }
];

// Chat mode type
type ChatMode = 'learning' | 'qa';

// Welcome messages for each mode
const learningWelcomeMessage = `Hey there! 👋 Welcome to TigerGraph Learning Assistant!

I'm here to help you master graph databases. Instead of overwhelming you with resources, let me understand what you need first.

**What topic interests you today?**`;

const qaWelcomeMessage = `Hey there! 👋 I'm your TigerGraph expert!

Ask me anything about TigerGraph, GSQL, graph databases, or any related topic. I'll give you direct answers and explanations.

**What would you like to know?**`;

export default function ChatPage() {
  const { user } = useAuth();
  
  // Chat mode - learning (guided + resources) or qa (direct answers)
  const [chatMode, setChatMode] = useState<ChatMode>('learning');
  
  // Conversation context - tracks what we know about the user
  const [conversationContext, setConversationContext] = useState<ConversationContext>({
    state: 'idle',
    topic: null,
    skillLevel: null,
    goal: null,
    background: null,
    shownResourceIds: []
  });
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: learningWelcomeMessage,
      quickReplies: initialWelcomeQuickReplies,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [expandedResources, setExpandedResources] = useState<Set<string>>(new Set()); // Track which messages have expanded resources
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Handle mode change
  const handleModeChange = (newMode: ChatMode) => {
    if (newMode === chatMode) return;
    
    setChatMode(newMode);
    
    // Update the welcome message based on mode (keep chat history)
    // Add a system message indicating mode change if there are messages beyond welcome
    if (messages.length > 1) {
      const modeChangeMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: newMode === 'learning' 
          ? `Switched to **Learning Mode** 📚\n\nI'll now guide you through topics and recommend personalized resources. What would you like to learn?`
          : `Switched to **Q&A Mode** 💬\n\nI'll now answer your questions directly. What would you like to know about TigerGraph?`,
        quickReplies: newMode === 'learning' ? initialWelcomeQuickReplies : [],
      };
      setMessages(prev => [...prev, modeChangeMessage]);
    } else {
      // Update welcome message if it's the only message
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: newMode === 'learning' ? learningWelcomeMessage : qaWelcomeMessage,
        quickReplies: newMode === 'learning' ? initialWelcomeQuickReplies : [],
      }]);
    }
    
    // Reset context when switching to learning mode
    if (newMode === 'learning') {
      setConversationContext({
        state: 'idle',
        topic: null,
        skillLevel: null,
        goal: null,
        background: null,
        shownResourceIds: []
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build history from previous messages (excluding welcome)
      const history: APIChatMessage[] = messages
        .filter(m => m.id !== "welcome")
        .map(m => ({ role: m.role, content: m.content }));

      // Send current conversation context and mode to backend
      const response = await sendChatMessage(textToSend, history, conversationContext, chatMode);

      // Update conversation context from response
      if (response.context) {
        setConversationContext(response.context as ConversationContext);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.response,
        resources: response.resources,
        quickReplies: response.quickReplies,
        intent: response.intent,
        context: response.context as ConversationContext,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        quickReplies: [
          { text: "Try again", action: "retry" },
          { text: "Start over", action: "reset" }
        ],
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (reply: QuickReply) => {
    // Map actions to natural language queries
    const actionMessages: Record<string, string> = {
      // Topic selections
      topic_gsql: "I want to learn GSQL",
      topic_fraud: "I'm interested in fraud detection",
      topic_graphrag: "Tell me about GraphRAG",
      topic_recommendations: "I want to build a recommendation engine",
      topic_schema: "I want to learn schema design",
      topic_cloud: "I want to learn about TigerGraph Cloud",
      topic_other: "I'm interested in something else",
      
      // Skill level selections
      skill_beginner: "I'm a complete beginner",
      skill_knows_sql: "I know SQL but new to graphs",
      skill_intermediate: "I have some graph experience",
      skill_advanced: "I'm an advanced user",
      
      // Goal selections
      goal_basics: "I want to learn the basics",
      goal_project: "I want to build a project",
      goal_queries: "I want to write queries",
      goal_examples: "Show me examples",
      goal_concepts: "Help me understand the concepts",
      goal_technical: "I want a technical deep dive",
      
      // Follow-up actions
      more_resources: "Show me more resources",
      explain_concept: "Can you explain a concept?",
      new_topic: "I want to explore a different topic",
      done: "Thanks, I'm done for now!",
      show_resources: "Show me resources for this",
      explain_more: "Can you explain more?",
      explain_simple: "Explain it in simple terms",
      show_examples: "Show me practical examples",
      
      // Other actions
      has_project: "I'm working on a specific project",
      has_problem: "I'm trying to solve a problem",
      exploring: "I'm just exploring what's possible",
      retry: "Let's try that again",
      reset: "Let's start over",
      
      // Legacy actions (for compatibility)
      get_started: "I want to get started with TigerGraph",
      learn_gsql: "I want to learn GSQL",
      explore_use_cases: "What use cases can I build?",
      browse_all: "Show me all available resources",
    };
    
    // Handle reset action specially
    if (reply.action === "reset") {
      handleReset();
      return;
    }
    
    const messageText = actionMessages[reply.action] || reply.text;
    handleSend(messageText);
  };

  const handleTopicClick = (topicId: string) => {
    const topicMessages: Record<string, string> = {
      gsql: "I want to learn GSQL query language",
      fraud: "I'm interested in fraud detection with TigerGraph",
      graphrag: "Tell me about GraphRAG and how to use it",
      recommendations: "I want to build a recommendation engine",
      schema: "I want to learn about graph schema design",
      cloud: "Tell me about TigerGraph Cloud",
    };
    handleSend(topicMessages[topicId] || `I want to learn about ${topicId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleBookmarkChange = (resourceId: string, bookmarked: boolean) => {
    setBookmarkedIds(prev => {
      const newSet = new Set(prev);
      if (bookmarked) {
        newSet.add(resourceId);
      } else {
        newSet.delete(resourceId);
      }
      return newSet;
    });
  };

  const handleReset = () => {
    setConversationContext({
      state: 'idle',
      topic: null,
      skillLevel: null,
      goal: null,
      background: null,
      shownResourceIds: []
    });
    setMessages([
      {
        id: "welcome-" + Date.now(),
        role: "assistant",
        content: `Let's start fresh! 👋

**What topic would you like to explore?**`,
        quickReplies: initialWelcomeQuickReplies,
      },
    ]);
  };

  // Show context indicator when we have info about the user
  const renderContextIndicator = () => {
    if (!conversationContext.topic && !conversationContext.skillLevel) return null;
    
    const parts = [];
    if (conversationContext.topic) {
      const topicNames: Record<string, string> = {
        gsql: 'GSQL',
        fraud: 'Fraud Detection',
        graphrag: 'GraphRAG',
        recommendations: 'Recommendations',
        schema: 'Schema Design',
        cloud: 'TigerGraph Cloud',
        algorithms: 'Algorithms',
        python: 'pyTigerGraph',
        getting_started: 'Getting Started'
      };
      parts.push(topicNames[conversationContext.topic] || conversationContext.topic);
    }
    if (conversationContext.skillLevel) {
      parts.push(conversationContext.skillLevel);
    }
    
    return (
      <div className="flex items-center gap-2 text-xs text-themed-muted mb-2">
        <Target className="w-3 h-3" />
        <span>Learning: {parts.join(' • ')}</span>
        <button
          onClick={handleReset}
          className="ml-2 p-1 hover:bg-themed-tertiary rounded-md transition-colors"
          title="Start over"
        >
          <RotateCcw className="w-3 h-3" />
        </button>
      </div>
    );
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === "user";
    
    return (
      <div
        key={message.id}
        className={clsx(
          "flex gap-4",
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
            <Sparkles className="w-5 h-5 text-white" />
          )}
        </div>

        {/* Message Content */}
        <div
          className={clsx(
            "max-w-[85%] space-y-4",
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

          {/* Resource Cards - Only show when we have resources */}
          {message.resources && message.resources.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs text-themed-muted flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Your Personalized Resources ({message.resources.length})
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(expandedResources.has(message.id) 
                  ? message.resources 
                  : message.resources.slice(0, 4)
                ).map((resource) => (
                  <ChatResourceCard
                    key={resource.id}
                    resource={resource}
                    isBookmarked={bookmarkedIds.has(resource.id)}
                    onBookmarkChange={handleBookmarkChange}
                    compact={message.resources!.length > 2}
                  />
                ))}
              </div>
              {message.resources.length > 4 && (
                <button
                  onClick={() => {
                    setExpandedResources(prev => {
                      const newSet = new Set(prev);
                      if (newSet.has(message.id)) {
                        newSet.delete(message.id);
                      } else {
                        newSet.add(message.id);
                      }
                      return newSet;
                    });
                  }}
                  className="text-xs text-tiger-orange hover:underline"
                >
                  {expandedResources.has(message.id) 
                    ? "Show less" 
                    : `+ ${message.resources.length - 4} more resources`}
                </button>
              )}
            </div>
          )}

          {/* Quick Replies */}
          {message.quickReplies && message.quickReplies.length > 0 && !isUser && (
            <div className="flex flex-wrap gap-2 pt-2">
              {message.quickReplies.map((reply, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuickReply(reply)}
                  className="px-4 py-2 rounded-xl bg-themed-tertiary border border-themed text-sm text-themed-secondary hover:border-tiger-orange hover:text-tiger-orange transition-all"
                >
                  {reply.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 pb-6 border-b border-themed">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tiger-orange to-amber-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-themed">TigerGraph Learning Assistant</h1>
          <p className="text-themed-muted text-xs">
            Your AI guide to mastering graph databases
            {user && <span className="text-tiger-orange"> • {user.email?.split('@')[0]}</span>}
          </p>
        </div>
        
        {/* Mode Toggle - in header */}
        <div className="flex items-center gap-1 p-1 bg-themed-secondary rounded-full border border-themed">
          <button
            onClick={() => handleModeChange('learning')}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              chatMode === 'learning'
                ? "bg-tiger-orange text-white shadow-sm"
                : "text-themed-muted hover:text-themed"
            )}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            Learning
          </button>
          <button
            onClick={() => handleModeChange('qa')}
            className={clsx(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              chatMode === 'qa'
                ? "bg-tiger-orange text-white shadow-sm"
                : "text-themed-muted hover:text-themed"
            )}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Q&A
          </button>
        </div>
        
        {/* Reset button */}
        <button
          onClick={handleReset}
          className="p-2 rounded-lg bg-themed-tertiary border border-themed hover:border-tiger-orange transition-colors flex-shrink-0"
          title="Start new conversation"
        >
          <RotateCcw className="w-4 h-4 text-themed-muted" />
        </button>
      </div>

      {/* Context Indicator (only in learning mode) */}
      {chatMode === 'learning' && (
        <div className="pb-2">
          {renderContextIndicator()}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-6">
        {messages.map(renderMessage)}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-tiger-orange to-amber-500 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
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

      {/* Topic Cards (show only on welcome when no context) - compact version */}
      {messages.length === 1 && !conversationContext.topic && (
        <div className="pb-3">
          <p className="text-xs text-themed-muted mb-2 flex items-center gap-1">
            <Lightbulb className="w-3 h-3" />
            Quick start
          </p>
          <div className="flex flex-wrap gap-2">
            {topicCards.map((topic) => {
              const Icon = topic.icon;
              return (
                <button
                  key={topic.id}
                  onClick={() => handleTopicClick(topic.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-themed-secondary border border-themed hover:border-tiger-orange transition-all group"
                >
                  <div className={clsx(
                    "w-6 h-6 rounded flex items-center justify-center bg-gradient-to-br",
                    topic.color
                  )}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm text-themed group-hover:text-tiger-orange transition-colors">
                    {topic.title}
                  </span>
                </button>
              );
            })}
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
              placeholder="Ask about TigerGraph, GSQL, or any graph database topic..."
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-xl bg-themed-secondary border border-themed text-themed placeholder-themed-muted resize-none focus:border-tiger-orange focus:ring-2 focus:ring-tiger-orange/20 transition-all"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className={clsx(
              "px-4 py-3 rounded-xl font-medium transition-all flex items-center gap-2",
              input.trim() && !isLoading
                ? "bg-tiger-orange text-white hover:bg-tiger-orange-dark"
                : "bg-themed-tertiary text-themed-muted cursor-not-allowed"
            )}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-themed-muted mt-2 text-center">
          I'll ask a few questions to understand your needs, then recommend the best resources for you.
        </p>
      </div>
    </div>
  );
}
