import { ArrowRight, Library, MessageSquare, Compass, Sparkles, TrendingUp, Users, Zap } from "lucide-react";
import Link from "next/link";

const features = [
  {
    name: "Resource Wall",
    description: "Searchable hub with all TigerGraph content - docs, videos, tutorials, and more.",
    icon: Library,
    href: "/resources",
    color: "from-blue-500 to-cyan-500",
  },
  {
    name: "AI Chat",
    description: "GraphRAG-powered assistant to guide your learning journey.",
    icon: MessageSquare,
    href: "/chat",
    color: "from-tiger-orange to-amber-500",
  },
  {
    name: "Pathfinder",
    description: "Personalized learning paths based on your goals and experience.",
    icon: Compass,
    href: "/pathfinder",
    color: "from-purple-500 to-pink-500",
  },
];

const stats = [
  { label: "Resources", value: "500+", icon: Library },
  { label: "Learning Paths", value: "12", icon: TrendingUp },
  { label: "Active Learners", value: "2.5k", icon: Users },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 lg:space-y-12 animate-fade-in px-2 sm:px-0">
      {/* Hero Section */}
      <section className="relative py-8 lg:py-12">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] lg:w-[600px] h-[300px] lg:h-[400px] bg-tiger-orange/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="text-center space-y-4 lg:space-y-6">
          <div className="inline-flex items-center gap-2 px-3 lg:px-4 py-2 rounded-full bg-themed-tertiary/50 border border-themed text-xs lg:text-sm">
            <Sparkles className="w-4 h-4 text-tiger-orange" />
            <span className="text-themed-secondary">AI-Powered Developer Portal</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            <span className="text-themed">Master </span>
            <span className="gradient-text">TigerGraph</span>
            <br />
            <span className="text-themed">Faster Than Ever</span>
          </h1>
          
          <p className="text-base lg:text-lg text-themed-secondary max-w-2xl mx-auto leading-relaxed px-4">
            Your unified hub for learning graph databases. Discover resources, 
            get AI-powered guidance, and follow personalized learning paths.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 lg:gap-4 pt-4">
            <Link
              href="/resources"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-tiger-orange text-white font-semibold hover:bg-tiger-orange-dark transition-all shadow-lg shadow-tiger-orange/25 hover:shadow-tiger-orange/40"
            >
              Explore Resources
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/chat"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-themed-tertiary text-themed font-semibold hover:bg-themed-secondary transition-all border border-themed"
            >
              <MessageSquare className="w-4 h-4" />
              Ask AI
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-3 lg:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 lg:p-6 rounded-xl lg:rounded-2xl bg-themed-secondary/50 border border-themed text-center card-hover"
          >
            <stat.icon className="w-5 lg:w-6 h-5 lg:h-6 text-tiger-orange mx-auto mb-2 lg:mb-3" />
            <p className="text-xl lg:text-3xl font-bold text-themed">{stat.value}</p>
            <p className="text-xs lg:text-sm text-themed-muted">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Feature Cards */}
      <section className="space-y-4 lg:space-y-6">
        <h2 className="text-xl lg:text-2xl font-bold text-themed">Get Started</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {features.map((feature, index) => (
            <Link
              key={feature.name}
              href={feature.href}
              className="group p-5 lg:p-6 rounded-xl lg:rounded-2xl bg-themed-secondary border border-themed hover:border-tiger-orange/30 transition-all card-hover"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`w-10 lg:w-12 h-10 lg:h-12 rounded-lg lg:rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-3 lg:mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-5 lg:w-6 h-5 lg:h-6 text-white" />
              </div>
              <h3 className="text-base lg:text-lg font-semibold text-themed mb-1 lg:mb-2 group-hover:text-tiger-orange transition-colors">
                {feature.name}
              </h3>
              <p className="text-xs lg:text-sm text-themed-muted leading-relaxed">
                {feature.description}
              </p>
              <div className="mt-3 lg:mt-4 flex items-center gap-1 text-xs lg:text-sm text-tiger-orange opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Explore</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Start Guide */}
      <section className="p-5 lg:p-8 rounded-xl lg:rounded-2xl bg-gradient-to-br from-themed-secondary to-themed-tertiary border border-themed">
        <div className="flex flex-col sm:flex-row items-start gap-4 lg:gap-6">
          <div className="p-3 lg:p-4 rounded-lg lg:rounded-xl bg-tiger-orange/10 border border-tiger-orange/20">
            <Zap className="w-6 lg:w-8 h-6 lg:h-8 text-tiger-orange" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg lg:text-xl font-semibold text-themed mb-2">New to TigerGraph?</h3>
            <p className="text-sm lg:text-base text-themed-secondary mb-4">
              Take our quick assessment to get a personalized learning path tailored to your 
              experience level and goals.
            </p>
            <Link
              href="/pathfinder"
              className="inline-flex items-center gap-2 text-tiger-orange hover:text-tiger-orange-light font-medium text-sm lg:text-base"
            >
              Start Pathfinder Quiz
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
