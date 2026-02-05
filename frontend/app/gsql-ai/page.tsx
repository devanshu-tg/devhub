"use client";

import { useState } from "react";
import { 
  Sparkles, 
  Code, 
  Copy, 
  Check, 
  Loader2, 
  AlertCircle,
  Lightbulb,
  FileText,
  Zap
} from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import AuthModal from "@/components/ui/AuthModal";
import { generateGSQL, type GSQLGenerationRequest } from "@/lib/api";
import toast from "react-hot-toast";

export default function GSQLAIPage() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [schema, setSchema] = useState("");
  const [context, setContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    code: string;
    explanation: string;
    features: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

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

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const request: GSQLGenerationRequest = {
        prompt: prompt.trim(),
        ...(schema.trim() && { schema: schema.trim() }),
        ...(context.trim() && { context: context.trim() })
      };

      const response = await generateGSQL(request);
      setResult({
        code: response.code,
        explanation: response.explanation,
        features: response.features
      });
      toast.success("GSQL generated successfully!");
    } catch (error: any) {
      console.error("Generation error:", error);
      const errorMessage = error.message || error.details || "Failed to generate GSQL. Please try again.";
      toast.error(errorMessage);
      
      // Log full error for debugging
      if (process.env.NODE_ENV === 'development') {
        console.error("Full error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(result.code);
      setCopied(true);
      toast.success("Code copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  return (
    <div className="min-h-screen bg-themed-primary">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-tiger-orange to-tiger-orange-light flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-themed">GSQL AI Pro</h1>
              <p className="text-themed-secondary mt-1">
                Generate production-ready GSQL queries with AI
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Prompt Input */}
            <div className="bg-themed-secondary rounded-xl border border-themed p-6">
              <label className="block text-sm font-semibold text-themed mb-3">
                What do you want to build?
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., Create a query to find all users who have purchased items similar to what user X bought..."
                className="w-full h-32 px-4 py-3 rounded-lg bg-themed-tertiary border border-themed text-themed placeholder:text-themed-muted focus:border-tiger-orange focus:ring-2 focus:ring-tiger-orange/20 transition-all resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Schema Input (Optional) */}
            <div className="bg-themed-secondary rounded-xl border border-themed p-6">
              <label className="block text-sm font-semibold text-themed mb-3">
                Schema Information <span className="text-themed-muted font-normal">(Optional)</span>
              </label>
              <textarea
                value={schema}
                onChange={(e) => setSchema(e.target.value)}
                placeholder="E.g., Vertex types: Person, Product. Edge types: PURCHASED, SIMILAR_TO..."
                className="w-full h-24 px-4 py-3 rounded-lg bg-themed-tertiary border border-themed text-themed placeholder:text-themed-muted focus:border-tiger-orange focus:ring-2 focus:ring-tiger-orange/20 transition-all resize-none font-mono text-sm"
                disabled={isLoading}
              />
            </div>

            {/* Context Input (Optional) */}
            <div className="bg-themed-secondary rounded-xl border border-themed p-6">
              <label className="block text-sm font-semibold text-themed mb-3">
                Additional Context <span className="text-themed-muted font-normal">(Optional)</span>
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder="E.g., Need to optimize for performance, should handle large datasets..."
                className="w-full h-20 px-4 py-3 rounded-lg bg-themed-tertiary border border-themed text-themed placeholder:text-themed-muted focus:border-tiger-orange focus:ring-2 focus:ring-tiger-orange/20 transition-all resize-none"
                disabled={isLoading}
              />
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGenerate}
              disabled={isLoading || !prompt.trim()}
              className="w-full py-4 rounded-xl bg-tiger-orange text-white font-semibold hover:bg-tiger-orange-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating GSQL...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Generate GSQL
                </>
              )}
            </button>

            {/* Result Section */}
            {result && (
              <div className="bg-themed-secondary rounded-xl border border-themed p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-themed flex items-center gap-2">
                    <Code className="w-5 h-5 text-tiger-orange" />
                    Generated GSQL
                  </h3>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-themed-tertiary hover:bg-themed border border-themed text-themed-secondary hover:text-themed transition-all"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                <div className="relative">
                  <pre className="p-4 rounded-lg bg-themed-tertiary border border-themed overflow-x-auto">
                    <code className="text-sm text-themed font-mono">{result.code}</code>
                  </pre>
                </div>

                {result.explanation && (
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-sm text-themed-secondary">
                      <strong className="text-themed">Explanation:</strong> {result.explanation}
                    </p>
                  </div>
                )}

                {result.features && result.features.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-themed mb-2">Key Features:</p>
                    <ul className="space-y-1">
                      {result.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-themed-secondary flex items-start gap-2">
                          <span className="text-tiger-orange mt-1">•</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Examples Sidebar */}
          <div className="space-y-6">
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
                  <span>Include your graph schema for better accuracy</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-tiger-orange mt-1">•</span>
                  <span>Mention performance requirements if needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-tiger-orange mt-1">•</span>
                  <span>Describe the expected output format</span>
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
