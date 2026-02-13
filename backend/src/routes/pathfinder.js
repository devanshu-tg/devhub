const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticate, optionalAuth } = require('../middleware/auth');

// Fallback resources when Supabase is empty or not connected
// Curated TigerGraph docs and resources so Pathfinder always shows useful content
const FALLBACK_RESOURCES = {
  general: {
    beginner: [
      { title: "TigerGraph Introduction", type: "docs", duration: "10 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/intro/", description: "Overview of GSQL and TigerGraph" },
      { title: "Getting Started with TigerGraph", type: "tutorial", duration: "30 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/getting-started/", description: "Installation and first steps" },
      { title: "Graph Database Fundamentals", type: "docs", duration: "15 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/intro/", description: "Core graph concepts" },
      { title: "TigerGraph Cloud Quick Start", type: "tutorial", duration: "20 min", url: "https://docs.tigergraph.com/cloud/start/overview", description: "Start with TigerGraph Cloud" },
    ],
    intermediate: [
      { title: "TigerGraph Architecture", type: "docs", duration: "20 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/intro/", description: "System architecture overview" },
      { title: "GraphStudio Guide", type: "docs", duration: "25 min", url: "https://docs.tigergraph.com/gui/4.2/graphstudio/overview", description: "Visual development environment" },
      { title: "Data Loading Overview", type: "docs", duration: "30 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/ddl-and-loading/", description: "Loading data into TigerGraph" },
      { title: "Best Practices Guide", type: "blog", duration: "15 min", url: "https://www.tigergraph.com/blog/", description: "Production best practices" },
    ],
    advanced: [
      { title: "Performance Tuning Guide", type: "docs", duration: "45 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/system-management/memory-management", description: "Optimization techniques" },
      { title: "Cluster Management", type: "docs", duration: "1 hour", url: "https://docs.tigergraph.com/tigergraph-server/4.2/cluster-and-ha-management/", description: "Scaling and high availability" },
      { title: "Security Configuration", type: "docs", duration: "30 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/security/", description: "Enterprise security setup" },
    ],
  },
  gsql: {
    beginner: [
      { title: "GSQL Language Reference", type: "docs", duration: "20 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/intro/", description: "GSQL overview and basics" },
      { title: "SELECT Statement Basics", type: "docs", duration: "25 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/querying/select-statement/", description: "Query fundamentals" },
      { title: "Pattern Matching Tutorial", type: "tutorial", duration: "45 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/tutorials/pattern-matching/", description: "Path patterns in GSQL" },
      { title: "Writing Your First Query", type: "tutorial", duration: "30 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/querying/query-operations", description: "Create and run queries" },
    ],
    intermediate: [
      { title: "FROM Clause - Multi-hop Patterns", type: "docs", duration: "30 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/querying/select-statement/from-clause", description: "Multi-hop path patterns" },
      { title: "ACCUM and POST-ACCUM", type: "docs", duration: "25 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/querying/accumulators", description: "Accumulation in queries" },
      { title: "Control Flow Statements", type: "docs", duration: "20 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/querying/control-flow-statements", description: "IF, WHILE, FOREACH in GSQL" },
      { title: "Query Parameters", type: "docs", duration: "15 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/querying/query-operations", description: "Parameterized queries" },
    ],
    advanced: [
      { title: "Advanced Pattern Matching", type: "docs", duration: "1 hour", url: "https://docs.tigergraph.com/gsql-ref/4.2/querying/select-statement/", description: "Complex traversal patterns" },
      { title: "Graph Algorithms Library", type: "docs", duration: "45 min", url: "https://docs.tigergraph.com/graph-ml/current/intro/", description: "Built-in graph algorithms" },
      { title: "Query Optimization", type: "docs", duration: "40 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/querying/query-optimizer", description: "Writing efficient queries" },
    ],
  },
  fraud: {
    beginner: [
      { title: "Graph Analytics for Fraud Detection", type: "docs", duration: "20 min", url: "https://docs.tigergraph.com/graph-ml/current/intro/", description: "Introduction to graph fraud detection" },
      { title: "Connected Data Patterns", type: "tutorial", duration: "40 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/tutorials/pattern-matching/", description: "Finding patterns in connected data" },
      { title: "Fraud Detection Concepts", type: "blog", duration: "15 min", url: "https://www.tigergraph.com/blog/", description: "Why graphs excel at fraud detection" },
    ],
    intermediate: [
      { title: "Fraud Detection Starter Kit", type: "tutorial", duration: "1 hour", url: "https://github.com/tigergraph/ecosys", description: "Real-time fraud detection patterns" },
      { title: "Graph Algorithms for AML", type: "docs", duration: "45 min", url: "https://docs.tigergraph.com/graph-ml/current/community-detection/", description: "Anti-money laundering techniques" },
      { title: "Community Detection", type: "docs", duration: "30 min", url: "https://docs.tigergraph.com/graph-ml/current/community-detection/", description: "Find fraud rings" },
    ],
    advanced: [
      { title: "Enterprise Fraud Systems", type: "docs", duration: "1 hour", url: "https://docs.tigergraph.com/tigergraph-server/4.2/", description: "Scaling fraud detection" },
      { title: "Real-time Streaming Analytics", type: "docs", duration: "45 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/data-loading/", description: "Stream processing for fraud" },
      { title: "ML Integration for Fraud", type: "docs", duration: "40 min", url: "https://docs.tigergraph.com/graph-ml/current/", description: "Combine ML with graph analytics" },
    ],
  },
  graphrag: {
    beginner: [
      { title: "Introduction to Knowledge Graphs", type: "docs", duration: "20 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/intro/", description: "What are knowledge graphs" },
      { title: "Graph Basics for AI", type: "tutorial", duration: "30 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/getting-started/", description: "Graphs as AI foundations" },
      { title: "GraphRAG Concepts", type: "blog", duration: "15 min", url: "https://www.tigergraph.com/blog/", description: "Introduction to GraphRAG" },
    ],
    intermediate: [
      { title: "GraphRAG Overview", type: "blog", duration: "15 min", url: "https://www.tigergraph.com/blog/", description: "Knowledge graphs for LLMs" },
      { title: "Building RAG Pipelines", type: "tutorial", duration: "1 hour", url: "https://github.com/tigergraph/ecosys", description: "Connect graphs to LLMs" },
      { title: "Vector Search with Graphs", type: "docs", duration: "30 min", url: "https://docs.tigergraph.com/graph-ml/current/", description: "Hybrid vector-graph search" },
    ],
    advanced: [
      { title: "GraphRAG Architecture Patterns", type: "docs", duration: "45 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/", description: "Enterprise GraphRAG design" },
      { title: "Scaling Knowledge Graphs", type: "docs", duration: "40 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/cluster-and-ha-management/", description: "Production-scale GraphRAG" },
      { title: "Advanced Reasoning with Graphs", type: "docs", duration: "35 min", url: "https://docs.tigergraph.com/graph-ml/current/", description: "Multi-hop reasoning for AI" },
    ],
  },
  recommendations: {
    beginner: [
      { title: "Recommendation Systems Intro", type: "docs", duration: "20 min", url: "https://docs.tigergraph.com/graph-ml/current/intro/", description: "Graph-based recommendations" },
      { title: "User-Item Graph Modeling", type: "tutorial", duration: "30 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/schema/", description: "Model recommendation data" },
      { title: "Simple Recommendation Query", type: "tutorial", duration: "25 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/tutorials/", description: "Your first recommendation" },
    ],
    intermediate: [
      { title: "Collaborative Filtering with Graphs", type: "tutorial", duration: "1 hour", url: "https://github.com/tigergraph/ecosys", description: "User-item collaborative filtering" },
      { title: "Personalization Algorithms", type: "docs", duration: "30 min", url: "https://docs.tigergraph.com/graph-ml/current/", description: "Graph-based personalization" },
      { title: "Content-based Recommendations", type: "docs", duration: "35 min", url: "https://docs.tigergraph.com/graph-ml/current/", description: "Feature-based recommendations" },
    ],
    advanced: [
      { title: "Real-time Recommendation Engine", type: "docs", duration: "45 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/", description: "Sub-second recommendations" },
      { title: "Hybrid Recommendation Systems", type: "docs", duration: "40 min", url: "https://docs.tigergraph.com/graph-ml/current/", description: "Combine multiple approaches" },
      { title: "A/B Testing Recommendations", type: "blog", duration: "20 min", url: "https://www.tigergraph.com/blog/", description: "Experiment with recommendations" },
    ],
  },
  schema: {
    beginner: [
      { title: "Schema Design Basics", type: "docs", duration: "25 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/ddl-and-loading/defining-a-graph-schema", description: "Vertex and edge types" },
      { title: "Vertex Types Tutorial", type: "tutorial", duration: "20 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/ddl-and-loading/", description: "Creating vertex types" },
      { title: "Edge Types Tutorial", type: "tutorial", duration: "20 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/ddl-and-loading/", description: "Creating edge types" },
    ],
    intermediate: [
      { title: "Data Modeling for Graphs", type: "docs", duration: "35 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/ddl-and-loading/defining-a-graph-schema", description: "Graph schema design patterns" },
      { title: "Schema Change Operations", type: "docs", duration: "25 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/ddl-and-loading/modifying-a-graph-schema", description: "Evolving your schema" },
      { title: "Multi-graph Architecture", type: "docs", duration: "30 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/ddl-and-loading/", description: "Managing multiple graphs" },
    ],
    advanced: [
      { title: "Schema Optimization", type: "docs", duration: "40 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/", description: "Performance-oriented schema design" },
      { title: "Data Partitioning Strategies", type: "docs", duration: "35 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/cluster-and-ha-management/", description: "Distributed schema design" },
      { title: "Schema Migration Best Practices", type: "docs", duration: "30 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/ddl-and-loading/", description: "Safe schema changes" },
    ],
  },
  cloud: {
    beginner: [
      { title: "TigerGraph Cloud Overview", type: "docs", duration: "15 min", url: "https://docs.tigergraph.com/cloud/start/overview", description: "Cloud deployment basics" },
      { title: "Creating Your First Cluster", type: "tutorial", duration: "20 min", url: "https://docs.tigergraph.com/cloud/start/", description: "Launch TigerGraph Cloud" },
      { title: "Cloud Console Guide", type: "docs", duration: "25 min", url: "https://docs.tigergraph.com/cloud/", description: "Navigate the cloud console" },
    ],
    intermediate: [
      { title: "Production Deployment", type: "docs", duration: "30 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/installation/", description: "Deploy TigerGraph" },
      { title: "Backup and Restore", type: "docs", duration: "25 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/backup-and-restore/", description: "Data protection strategies" },
      { title: "Monitoring and Alerts", type: "docs", duration: "30 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/system-management/", description: "Operational monitoring" },
    ],
    advanced: [
      { title: "High Availability Setup", type: "docs", duration: "45 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/cluster-and-ha-management/ha-cluster", description: "HA configuration" },
      { title: "Disaster Recovery", type: "docs", duration: "40 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/backup-and-restore/", description: "DR planning and setup" },
      { title: "Multi-region Deployment", type: "docs", duration: "50 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/cluster-and-ha-management/", description: "Global deployments" },
    ],
  },
};

function getFallbackResources(milestone) {
  const topics = milestone.topics || ['general'];
  const skillLevel = milestone.skillLevel || 'beginner';
  const count = milestone.resourceCount || 3;

  const collected = [];
  const seen = new Set();

  for (const topic of topics) {
    const topicResources = FALLBACK_RESOURCES[topic] || FALLBACK_RESOURCES.general;
    const levelResources = topicResources[skillLevel] || topicResources.beginner || topicResources.intermediate || [];
    for (const r of levelResources) {
      const key = r.url + r.title;
      if (!seen.has(key)) {
        seen.add(key);
        collected.push({
          id: `fallback-${collected.length}`,
          title: r.title,
          description: r.description,
          type: r.type,
          duration: r.duration,
          url: r.url,
          thumbnail: "https://www.tigergraph.com/wp-content/uploads/2023/02/tigergraph-logo-orange.svg",
          skillLevel: skillLevel,
        });
        if (collected.length >= count) break;
      }
    }
    if (collected.length >= count) break;
  }

  return collected.slice(0, count);
}

// Topic keywords for matching resources
const TOPIC_KEYWORDS = {
  gsql: ['gsql', 'query', 'language', 'syntax'],
  fraud: ['fraud', 'detection', 'aml', 'security'],
  graphrag: ['graphrag', 'rag', 'llm', 'ai', 'knowledge graph'],
  recommendations: ['recommendation', 'collaborative filtering', 'personalization'],
  general: ['tigergraph', 'graph', 'database', 'getting started'],
  schema: ['schema', 'model', 'design', 'data modeling'],
  cloud: ['cloud', 'deployment', 'production'],
};

// Learning path templates with topic tags for resource matching
const learningPaths = {
  // ============================================
  // BEGINNER PATHS (experience: none)
  // ============================================
  "none-learn-general": {
    title: "Graph Database Fundamentals",
    duration: "2 weeks",
    description: "A gentle introduction to graph databases and TigerGraph for complete beginners.",
    milestones: [
      {
        week: 1,
        title: "Understanding Graphs",
        description: "Learn what graphs are and why they matter",
        topics: ['general'],
        skillLevel: 'beginner',
        resourceCount: 3,
      },
      {
        week: 2,
        title: "First Steps with GSQL",
        description: "Write your first graph queries",
        topics: ['gsql'],
        skillLevel: 'beginner',
        resourceCount: 3,
      },
    ],
  },
  "none-learn-fraud": {
    title: "Fraud Detection for Beginners",
    duration: "3 weeks",
    description: "Learn graph databases through the lens of fraud detection - no prior experience needed.",
    milestones: [
      {
        week: 1,
        title: "Graph Fundamentals",
        description: "Understand how graphs reveal hidden connections",
        topics: ['general'],
        skillLevel: 'beginner',
        resourceCount: 3,
      },
      {
        week: 2,
        title: "Your First Fraud Queries",
        description: "Learn GSQL basics with fraud detection examples",
        topics: ['gsql', 'fraud'],
        skillLevel: 'beginner',
        resourceCount: 3,
      },
      {
        week: 3,
        title: "Pattern Detection Basics",
        description: "Identify suspicious patterns in connected data",
        topics: ['fraud'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
    ],
  },
  "none-learn-graphrag": {
    title: "GraphRAG for Beginners",
    duration: "3 weeks",
    description: "Learn how to combine graph databases with AI - perfect for beginners interested in LLMs.",
    milestones: [
      {
        week: 1,
        title: "Graph Database Basics",
        description: "Foundation concepts for knowledge graphs",
        topics: ['general', 'schema'],
        skillLevel: 'beginner',
        resourceCount: 3,
      },
      {
        week: 2,
        title: "Introduction to Knowledge Graphs",
        description: "How graphs power AI applications",
        topics: ['graphrag'],
        skillLevel: 'beginner',
        resourceCount: 3,
      },
      {
        week: 3,
        title: "Your First GraphRAG Pipeline",
        description: "Connect graphs to language models",
        topics: ['graphrag'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
    ],
  },
  "none-learn-recommendations": {
    title: "Recommendation Systems Fundamentals",
    duration: "3 weeks",
    description: "Learn to build personalized recommendation engines with graph databases.",
    milestones: [
      {
        week: 1,
        title: "Graph Basics for Recommendations",
        description: "Understanding user-item graphs",
        topics: ['general', 'schema'],
        skillLevel: 'beginner',
        resourceCount: 3,
      },
      {
        week: 2,
        title: "Collaborative Filtering",
        description: "Build your first recommendation query",
        topics: ['recommendations', 'gsql'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
      {
        week: 3,
        title: "Production Recommendations",
        description: "Scale and deploy your system",
        topics: ['recommendations', 'cloud'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
    ],
  },
  "none-build-general": {
    title: "Build Your First Graph App",
    duration: "3 weeks",
    description: "Go from zero to a working graph application - hands-on project-based learning.",
    milestones: [
      {
        week: 1,
        title: "Setup & Basics",
        description: "Install TigerGraph and learn core concepts",
        topics: ['general', 'cloud'],
        skillLevel: 'beginner',
        resourceCount: 3,
      },
      {
        week: 2,
        title: "Design Your Schema",
        description: "Model your data as a graph",
        topics: ['schema', 'gsql'],
        skillLevel: 'beginner',
        resourceCount: 3,
      },
      {
        week: 3,
        title: "Build & Query",
        description: "Create queries and build your application",
        topics: ['gsql'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
    ],
  },

  // ============================================
  // SOME EXPERIENCE PATHS (experience: some)
  // ============================================
  "some-build-fraud": {
    title: "SQL Developer to Fraud Detection Engineer",
    duration: "4 weeks",
    description: "Transition from SQL to graph-based fraud detection with TigerGraph.",
    milestones: [
      {
        week: 1,
        title: "Graph Thinking for SQL Devs",
        description: "Translate your SQL knowledge to graph concepts",
        topics: ['schema', 'general'],
        skillLevel: 'beginner',
        resourceCount: 3,
      },
      {
        week: 2,
        title: "GSQL for Pattern Detection",
        description: "Learn to find patterns in connected data",
        topics: ['gsql'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
      {
        week: 3,
        title: "Fraud Detection Patterns",
        description: "Common fraud patterns and how to detect them",
        topics: ['fraud'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
      {
        week: 4,
        title: "Production Deployment",
        description: "Deploy and scale your fraud detection system",
        topics: ['cloud'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
    ],
  },
  "some-migrate-general": {
    title: "SQL to Graph Migration Path",
    duration: "3 weeks",
    description: "Smoothly transition your SQL skills and data to TigerGraph.",
    milestones: [
      {
        week: 1,
        title: "SQL vs Graph Thinking",
        description: "Understand the paradigm shift from tables to graphs",
        topics: ['general', 'schema'],
        skillLevel: 'beginner',
        resourceCount: 3,
      },
      {
        week: 2,
        title: "GSQL for SQL Developers",
        description: "Learn GSQL with SQL comparisons",
        topics: ['gsql'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
      {
        week: 3,
        title: "Data Migration Strategies",
        description: "Move your data from SQL to TigerGraph",
        topics: ['schema', 'cloud'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
    ],
  },
  "some-build-graphrag": {
    title: "GraphRAG Developer Path",
    duration: "3 weeks",
    description: "Build AI-powered applications with knowledge graphs and LLMs.",
    milestones: [
      {
        week: 1,
        title: "Knowledge Graph Design",
        description: "Design graphs optimized for AI retrieval",
        topics: ['graphrag', 'schema'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
      {
        week: 2,
        title: "Building RAG Pipelines",
        description: "Connect TigerGraph to LLMs",
        topics: ['graphrag'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
      {
        week: 3,
        title: "Production GraphRAG",
        description: "Deploy and optimize your system",
        topics: ['graphrag', 'cloud'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
    ],
  },
  "some-learn-general": {
    title: "Deepen Your Graph Skills",
    duration: "3 weeks",
    description: "Take your existing graph knowledge to the next level.",
    milestones: [
      {
        week: 1,
        title: "Advanced GSQL Patterns",
        description: "Master complex query patterns",
        topics: ['gsql'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
      {
        week: 2,
        title: "Graph Algorithms",
        description: "Learn built-in algorithms for analytics",
        topics: ['gsql', 'general'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
      {
        week: 3,
        title: "Performance Optimization",
        description: "Make your queries faster",
        topics: ['general', 'cloud'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
    ],
  },

  // ============================================
  // INTERMEDIATE PATHS (experience: intermediate)
  // ============================================
  "intermediate-build-graphrag": {
    title: "GraphRAG Practitioner Path",
    duration: "3 weeks",
    description: "Build knowledge graphs for Retrieval-Augmented Generation with LLMs.",
    milestones: [
      {
        week: 1,
        title: "Knowledge Graph Fundamentals",
        description: "Design knowledge graphs for AI applications",
        topics: ['graphrag', 'schema'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
      {
        week: 2,
        title: "RAG Pipeline Design",
        description: "Connect your graph to LLMs",
        topics: ['graphrag'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
      {
        week: 3,
        title: "Advanced GraphRAG",
        description: "Optimize and scale your GraphRAG system",
        topics: ['graphrag', 'cloud'],
        skillLevel: 'advanced',
        resourceCount: 3,
      },
    ],
  },
  "intermediate-build-fraud": {
    title: "Advanced Fraud Detection Systems",
    duration: "3 weeks",
    description: "Build production-ready fraud detection with advanced graph patterns.",
    milestones: [
      {
        week: 1,
        title: "Complex Fraud Patterns",
        description: "Detect sophisticated fraud schemes",
        topics: ['fraud', 'gsql'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
      {
        week: 2,
        title: "Real-time Detection",
        description: "Build streaming fraud detection",
        topics: ['fraud'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
      {
        week: 3,
        title: "Scale & Monitor",
        description: "Production deployment and monitoring",
        topics: ['fraud', 'cloud'],
        skillLevel: 'advanced',
        resourceCount: 3,
      },
    ],
  },
  "intermediate-optimize-general": {
    title: "TigerGraph Performance Mastery",
    duration: "3 weeks",
    description: "Optimize your TigerGraph deployment for maximum performance.",
    milestones: [
      {
        week: 1,
        title: "Query Optimization",
        description: "Write faster, more efficient queries",
        topics: ['gsql'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
      {
        week: 2,
        title: "Schema & Index Tuning",
        description: "Optimize your data model",
        topics: ['schema'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
      {
        week: 3,
        title: "Infrastructure Scaling",
        description: "Scale TigerGraph for production workloads",
        topics: ['cloud'],
        skillLevel: 'advanced',
        resourceCount: 3,
      },
    ],
  },
  "intermediate-migrate-general": {
    title: "Enterprise Graph Migration",
    duration: "4 weeks",
    description: "Migrate enterprise systems from SQL to TigerGraph.",
    milestones: [
      {
        week: 1,
        title: "Migration Planning",
        description: "Assess and plan your migration strategy",
        topics: ['general', 'schema'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
      {
        week: 2,
        title: "Schema Transformation",
        description: "Convert relational schemas to graph models",
        topics: ['schema'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
      {
        week: 3,
        title: "Data Migration",
        description: "ETL processes for graph data",
        topics: ['schema', 'cloud'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
      {
        week: 4,
        title: "Production Cutover",
        description: "Go live with your graph database",
        topics: ['cloud'],
        skillLevel: 'advanced',
        resourceCount: 3,
      },
    ],
  },

  // ============================================
  // ADVANCED PATHS (experience: advanced)
  // ============================================
  "advanced-optimize-general": {
    title: "TigerGraph Architecture Expert",
    duration: "3 weeks",
    description: "Master advanced TigerGraph architecture, scaling, and optimization.",
    milestones: [
      {
        week: 1,
        title: "Advanced Query Patterns",
        description: "Complex GSQL patterns and optimizations",
        topics: ['gsql'],
        skillLevel: 'advanced',
        resourceCount: 3,
      },
      {
        week: 2,
        title: "Distributed Systems",
        description: "Cluster management and partitioning",
        topics: ['cloud'],
        skillLevel: 'advanced',
        resourceCount: 3,
      },
      {
        week: 3,
        title: "Enterprise Deployment",
        description: "HA, DR, and production operations",
        topics: ['cloud'],
        skillLevel: 'advanced',
        resourceCount: 3,
      },
    ],
  },
  "advanced-build-fraud": {
    title: "Enterprise Fraud Detection Platform",
    duration: "4 weeks",
    description: "Build enterprise-scale fraud detection with advanced ML integration.",
    milestones: [
      {
        week: 1,
        title: "Advanced Pattern Detection",
        description: "Complex multi-hop fraud patterns",
        topics: ['fraud', 'gsql'],
        skillLevel: 'advanced',
        resourceCount: 3,
      },
      {
        week: 2,
        title: "ML Integration",
        description: "Combine graph features with ML models",
        topics: ['fraud', 'graphrag'],
        skillLevel: 'advanced',
        resourceCount: 3,
      },
      {
        week: 3,
        title: "Real-time Streaming",
        description: "Sub-second fraud detection at scale",
        topics: ['fraud', 'cloud'],
        skillLevel: 'advanced',
        resourceCount: 3,
      },
      {
        week: 4,
        title: "Enterprise Operations",
        description: "Monitoring, alerting, and compliance",
        topics: ['cloud'],
        skillLevel: 'advanced',
        resourceCount: 3,
      },
    ],
  },
  "advanced-build-graphrag": {
    title: "Enterprise GraphRAG Architecture",
    duration: "3 weeks",
    description: "Design and build enterprise-scale GraphRAG systems.",
    milestones: [
      {
        week: 1,
        title: "Advanced Knowledge Graphs",
        description: "Complex ontologies and reasoning",
        topics: ['graphrag', 'schema'],
        skillLevel: 'advanced',
        resourceCount: 3,
      },
      {
        week: 2,
        title: "Multi-model RAG",
        description: "Integrate multiple LLMs with your graph",
        topics: ['graphrag'],
        skillLevel: 'advanced',
        resourceCount: 3,
      },
      {
        week: 3,
        title: "Enterprise Scale",
        description: "Scale GraphRAG for production workloads",
        topics: ['graphrag', 'cloud'],
        skillLevel: 'advanced',
        resourceCount: 3,
      },
    ],
  },
  "advanced-build-recommendations": {
    title: "Enterprise Recommendation Engine",
    duration: "3 weeks",
    description: "Build highly scalable, real-time recommendation systems.",
    milestones: [
      {
        week: 1,
        title: "Advanced Algorithms",
        description: "Sophisticated recommendation algorithms",
        topics: ['recommendations', 'gsql'],
        skillLevel: 'advanced',
        resourceCount: 3,
      },
      {
        week: 2,
        title: "Real-time Personalization",
        description: "Sub-second recommendation updates",
        topics: ['recommendations'],
        skillLevel: 'advanced',
        resourceCount: 3,
      },
      {
        week: 3,
        title: "Scale & A/B Testing",
        description: "Production deployment with experimentation",
        topics: ['recommendations', 'cloud'],
        skillLevel: 'advanced',
        resourceCount: 3,
      },
    ],
  },

  // ============================================
  // DEFAULT FALLBACK PATH
  // ============================================
  "default": {
    title: "TigerGraph Explorer Path",
    duration: "3 weeks",
    description: "A balanced introduction to TigerGraph for developers of all backgrounds.",
    milestones: [
      {
        week: 1,
        title: "Getting Started",
        description: "Set up your environment and learn the basics",
        topics: ['general'],
        skillLevel: 'beginner',
        resourceCount: 3,
      },
      {
        week: 2,
        title: "Core Concepts",
        description: "Master the fundamentals of GSQL",
        topics: ['gsql'],
        skillLevel: 'beginner',
        resourceCount: 3,
      },
      {
        week: 3,
        title: "Build Something Real",
        description: "Apply your skills to a real project",
        topics: ['general'],
        skillLevel: 'intermediate',
        resourceCount: 3,
      },
    ],
  },
};

// Fetch resources from database based on topics and skill level
async function fetchResourcesForMilestone(milestone) {
  if (!supabase) {
    return [];
  }

  try {
    // Build search query
    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .eq('skill_level', milestone.skillLevel);

    if (error) throw error;

    let resources = data || [];

    // Score and filter by topics
    if (milestone.topics && milestone.topics.length > 0) {
      resources = resources.map(r => {
        let score = 0;
        const titleLower = r.title.toLowerCase();
        const descLower = (r.description || '').toLowerCase();
        const useCases = r.use_cases || [];

        for (const topic of milestone.topics) {
          const keywords = TOPIC_KEYWORDS[topic] || [];
          for (const keyword of keywords) {
            if (titleLower.includes(keyword)) score += 15;
            if (descLower.includes(keyword)) score += 10;
            if (useCases.some(uc => uc.toLowerCase().includes(keyword))) score += 20;
          }
        }

        return { ...r, relevanceScore: score };
      });

      // Sort by relevance and filter out irrelevant resources
      resources = resources
        .filter(r => r.relevanceScore > 0)
        .sort((a, b) => b.relevanceScore - a.relevanceScore);
    }

    // Take requested number of resources
    return resources.slice(0, milestone.resourceCount).map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      type: r.type,
      duration: r.duration,
      url: r.url,
      thumbnail: r.thumbnail,
      skillLevel: r.skill_level,
    }));
  } catch (error) {
    console.error('Error fetching resources:', error);
    return [];
  }
}

// Generate path key from answers
// Scoring-based path matching for better personalization
function getPathKey(answers) {
  const { experience, goal, usecase } = answers;
  
  // Try exact match first
  const specificKey = `${experience}-${goal}-${usecase}`;
  if (learningPaths[specificKey]) return specificKey;
  
  // Experience level hierarchy for fallback matching
  const experienceLevels = ['none', 'some', 'intermediate', 'advanced'];
  const userExpIndex = experienceLevels.indexOf(experience);
  
  // Goal priority - some goals are more transferable
  const goalPriority = {
    'learn': ['learn', 'build'],
    'build': ['build', 'learn'],
    'migrate': ['migrate', 'build', 'learn'],
    'optimize': ['optimize', 'build', 'learn'],
  };
  
  // Use case fallback mapping
  const useCaseFallbacks = {
    'fraud': ['fraud', 'general'],
    'recommendations': ['recommendations', 'general'],
    'graphrag': ['graphrag', 'general'],
    'general': ['general'],
  };
  
  // Score each available path
  const pathScores = [];
  
  for (const pathKey of Object.keys(learningPaths)) {
    if (pathKey === 'default') continue;
    
    const parts = pathKey.split('-');
    if (parts.length < 3) continue;
    
    const pathExp = parts[0];
    const pathGoal = parts[1];
    const pathUseCase = parts.slice(2).join('-'); // Handle multi-word use cases
    
    let score = 0;
    
    // Experience matching (max 40 points)
    // Prefer matching or slightly easier paths (one level down)
    const pathExpIndex = experienceLevels.indexOf(pathExp);
    if (pathExp === experience) {
      score += 40; // Exact match
    } else if (userExpIndex > 0 && pathExpIndex === userExpIndex - 1) {
      score += 30; // One level easier (good for challenging users)
    } else if (userExpIndex < 3 && pathExpIndex === userExpIndex + 1) {
      score += 20; // One level harder (stretch goal)
    } else {
      score += Math.max(0, 15 - Math.abs(pathExpIndex - userExpIndex) * 5);
    }
    
    // Goal matching (max 30 points)
    const userGoalPriorities = goalPriority[goal] || [goal, 'learn'];
    const goalIndex = userGoalPriorities.indexOf(pathGoal);
    if (goalIndex === 0) {
      score += 30; // Primary match
    } else if (goalIndex === 1) {
      score += 20; // Secondary match
    } else if (goalIndex >= 2) {
      score += 10; // Tertiary match
    }
    
    // Use case matching (max 30 points)
    const userUseCaseFallbacks = useCaseFallbacks[usecase] || [usecase, 'general'];
    const useCaseIndex = userUseCaseFallbacks.indexOf(pathUseCase);
    if (useCaseIndex === 0) {
      score += 30; // Primary match
    } else if (useCaseIndex === 1) {
      score += 15; // Fallback to general
    }
    
    // Only consider paths with reasonable scores
    if (score >= 30) {
      pathScores.push({ key: pathKey, score });
    }
  }
  
  // Sort by score descending and return best match
  pathScores.sort((a, b) => b.score - a.score);
  
  if (pathScores.length > 0 && pathScores[0].score >= 50) {
    console.log(`[Pathfinder] Matched path "${pathScores[0].key}" with score ${pathScores[0].score} for user (${experience}, ${goal}, ${usecase})`);
    return pathScores[0].key;
  }
  
  // Legacy fallback for edge cases
  const partialKeys = [
    `${experience}-${goal}-general`,
    `${experience}-learn-${usecase}`,
    `${experience}-learn-general`,
    `some-${goal}-${usecase}`,
    `none-learn-${usecase}`,
  ];
  
  for (const key of partialKeys) {
    if (learningPaths[key]) {
      console.log(`[Pathfinder] Fallback matched path "${key}" for user (${experience}, ${goal}, ${usecase})`);
      return key;
    }
  }
  
  console.log(`[Pathfinder] Using default path for user (${experience}, ${goal}, ${usecase})`);
  return 'default';
}

// POST /api/pathfinder/generate - Generate learning path based on quiz answers
router.post('/generate', optionalAuth, async (req, res) => {
  try {
    const { experience, goal, usecase, time } = req.body;
    
    // Find matching path template
    const pathKey = getPathKey({ experience, goal, usecase });
    const pathTemplate = { ...learningPaths[pathKey] };
    
    // Adjust based on time available
    if (time === '1hr') {
      pathTemplate.milestones = pathTemplate.milestones.slice(0, 2);
      pathTemplate.duration = '2 weeks (condensed)';
    } else if (time === 'fulltime') {
      pathTemplate.description += ' With full-time dedication, you can complete this faster and go deeper.';
    }

    // Fetch real resources for each milestone (use fallback when DB returns empty)
    const milestonesWithResources = await Promise.all(
      pathTemplate.milestones.map(async (milestone) => {
        let resources = await fetchResourcesForMilestone(milestone);
        if (!resources || resources.length === 0) {
          resources = getFallbackResources(milestone);
        }
        return {
          week: milestone.week,
          title: milestone.title,
          description: milestone.description,
          resources: resources,
        };
      })
    );

    const path = {
      title: pathTemplate.title,
      description: pathTemplate.description,
      duration: pathTemplate.duration,
      milestones: milestonesWithResources,
    };

    res.json(path);
  } catch (error) {
    console.error('Generate path error:', error);
    res.status(500).json({ error: 'Failed to generate learning path' });
  }
});

// POST /api/pathfinder/save-path - Save learning path to user's My Learning (authenticated)
router.post('/save-path', authenticate, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { title, description, duration, experience_level, goal, use_case, milestones } = req.body;

    if (!title || !milestones || !Array.isArray(milestones)) {
      return res.status(400).json({ error: 'Missing required fields: title, milestones' });
    }

    // Note: No longer pausing existing paths - users can have multiple active paths

    const { data, error } = await supabase
      .from('user_learning_paths')
      .insert([{
        user_id: req.user.id,
        title,
        description: description || null,
        duration: duration || null,
        experience_level: experience_level || null,
        goal: goal || null,
        use_case: use_case || null,
        milestones,
        status: 'active',
      }])
      .select('id')
      .single();

    if (error) throw error;

    res.json({ pathId: data.id });
  } catch (error) {
    console.error('Save path error:', error);
    res.status(500).json({ error: 'Failed to save learning path' });
  }
});

// GET /api/pathfinder/my-path - Get user's active learning path (legacy - single path)
router.get('/my-path', authenticate, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { data, error } = await supabase
      .from('user_learning_paths')
      .select('*')
      .eq('user_id', req.user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No path found
        return res.json({ path: null });
      }
      throw error;
    }

    res.json({ path: data });
  } catch (error) {
    console.error('Get my path error:', error);
    res.status(500).json({ error: 'Failed to fetch learning path' });
  }
});

// GET /api/pathfinder/my-paths - Get ALL user learning paths with progress stats
router.get('/my-paths', authenticate, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    // Fetch all paths for user (active, paused, completed)
    const { data: paths, error: pathsError } = await supabase
      .from('user_learning_paths')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (pathsError) throw pathsError;

    if (!paths || paths.length === 0) {
      return res.json({ paths: [] });
    }

    // For each path, calculate progress percentage
    const pathsWithProgress = await Promise.all(paths.map(async (path) => {
      // Get resource progress for this path
      const { data: resourceProgress } = await supabase
        .from('user_path_progress')
        .select('completed')
        .eq('path_id', path.id)
        .eq('user_id', req.user.id);

      // Calculate total resources and completed
      const milestones = path.milestones || [];
      const totalResources = milestones.reduce((sum, m) => sum + (m.resources?.length || 0), 0);
      const completedResources = resourceProgress?.filter(r => r.completed).length || 0;
      const progressPercentage = totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0;

      return {
        id: path.id,
        title: path.title,
        description: path.description,
        duration: path.duration,
        status: path.status,
        experienceLevel: path.experience_level,
        goal: path.goal,
        useCase: path.use_case,
        milestoneCount: milestones.length,
        totalResources,
        completedResources,
        progressPercentage,
        createdAt: path.created_at,
        updatedAt: path.updated_at,
      };
    }));

    res.json({ paths: pathsWithProgress });
  } catch (error) {
    console.error('Get my paths error:', error);
    res.status(500).json({ error: 'Failed to fetch learning paths' });
  }
});

// DELETE /api/pathfinder/path/:pathId - Delete a learning path
router.delete('/path/:pathId', authenticate, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { pathId } = req.params;

    // Verify path belongs to user
    const { data: path, error: pathError } = await supabase
      .from('user_learning_paths')
      .select('id')
      .eq('id', pathId)
      .eq('user_id', req.user.id)
      .single();

    if (pathError || !path) {
      return res.status(404).json({ error: 'Path not found' });
    }

    // Delete related progress records first (foreign key constraint)
    await supabase
      .from('user_path_progress')
      .delete()
      .eq('path_id', pathId)
      .eq('user_id', req.user.id);

    await supabase
      .from('user_milestone_progress')
      .delete()
      .eq('path_id', pathId)
      .eq('user_id', req.user.id);

    // Delete the learning path
    const { error: deleteError } = await supabase
      .from('user_learning_paths')
      .delete()
      .eq('id', pathId)
      .eq('user_id', req.user.id);

    if (deleteError) throw deleteError;

    res.json({ success: true });
  } catch (error) {
    console.error('Delete path error:', error);
    res.status(500).json({ error: 'Failed to delete learning path' });
  }
});

// GET /api/pathfinder/progress/:pathId - Get progress for a specific path
router.get('/progress/:pathId', authenticate, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }
    

    const { pathId } = req.params;

    // Fetch path
    const { data: path, error: pathError } = await supabase
      .from('user_learning_paths')
      .select('*')
      .eq('id', pathId)
      .eq('user_id', req.user.id)
      .single();

    if (pathError) throw pathError;

    // Fetch resource progress
    const { data: resourceProgressRaw, error: progressError } = await supabase
      .from('user_path_progress')
      .select('*')
      .eq('path_id', pathId)
      .eq('user_id', req.user.id);

    if (progressError) throw progressError;

    // Fetch milestone progress
    const { data: milestoneProgressRaw, error: milestoneError } = await supabase
      .from('user_milestone_progress')
      .select('*')
      .eq('path_id', pathId)
      .eq('user_id', req.user.id);

    if (milestoneError) throw milestoneError;

    // Transform snake_case to camelCase for frontend
    const resourceProgress = (resourceProgressRaw || []).map(r => ({
      id: r.id,
      milestoneIndex: r.milestone_index,
      resourceIndex: r.resource_index,
      resourceId: r.resource_id,
      completed: r.completed,
      completedAt: r.completed_at,
    }));

    const milestoneProgress = (milestoneProgressRaw || []).map(m => ({
      id: m.id,
      milestoneIndex: m.milestone_index,
      completed: m.completed,
      completedAt: m.completed_at,
    }));

    // Calculate overall progress
    const milestones = path.milestones || [];
    const totalResources = milestones.reduce((sum, m) => sum + (m.resources?.length || 0), 0);
    const completedResources = resourceProgress.filter(r => r.completed).length;
    const progressPercentage = totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0;

    console.log('[Progress API] Path:', pathId);
    console.log('[Progress API] Resource progress:', resourceProgress.length, 'records');
    console.log('[Progress API] Milestone progress:', milestoneProgress.length, 'records');
    console.log('[Progress API] Stats:', { totalResources, completedResources, progressPercentage });

    res.json({
      path,
      resourceProgress,
      milestoneProgress,
      stats: {
        totalResources,
        completedResources,
        progressPercentage,
      },
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// POST /api/pathfinder/progress/:pathId - Mark resource as complete/incomplete
router.post('/progress/:pathId', authenticate, async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { pathId } = req.params;
    const { milestoneIndex, resourceIndex, completed } = req.body;

    console.log('[Progress Update] Request:', { pathId, milestoneIndex, resourceIndex, completed, userId: req.user.id });

    // Verify path belongs to user
    const { data: path, error: pathError } = await supabase
      .from('user_learning_paths')
      .select('*')
      .eq('id', pathId)
      .eq('user_id', req.user.id)
      .single();

    if (pathError) {
      console.error('[Progress Update] Path not found:', pathError);
      return res.status(404).json({ error: 'Path not found' });
    }

    // Get resource ID from path
    const milestone = path.milestones[milestoneIndex];
    const resource = milestone?.resources[resourceIndex];
    
    console.log('[Progress Update] Milestone:', milestone?.title, '| Resource:', resource?.title);
    
    // Only use resource_id if it's a valid UUID (not fallback IDs like "fallback-0")
    const isValidUUID = resource?.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(resource.id);
    const resourceId = isValidUUID ? resource.id : null;

    // Upsert resource progress
    const { data: upsertData, error: progressError } = await supabase
      .from('user_path_progress')
      .upsert({
        user_id: req.user.id,
        path_id: pathId,
        milestone_index: milestoneIndex,
        resource_index: resourceIndex,
        resource_id: resourceId,
        completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'path_id,milestone_index,resource_index',
      })
      .select();

    if (progressError) {
      console.error('[Progress Update] Upsert error:', progressError);
      throw progressError;
    }
    console.log('[Progress Update] Upsert success:', upsertData);

    // Check if milestone is complete
    const milestoneResources = milestone?.resources || [];
    const { data: milestoneResourceProgress } = await supabase
      .from('user_path_progress')
      .select('completed')
      .eq('path_id', pathId)
      .eq('user_id', req.user.id)
      .eq('milestone_index', milestoneIndex);

    console.log('[Progress Update] Milestone resources:', milestoneResources.length, '| Progress records:', milestoneResourceProgress?.length);
    console.log('[Progress Update] All completed?', milestoneResourceProgress?.map(r => r.completed));

    const milestoneComplete = milestoneResources.length > 0 && 
      milestoneResourceProgress?.length === milestoneResources.length &&
      milestoneResourceProgress.every(r => r.completed);

    console.log('[Progress Update] Milestone complete?', milestoneComplete);

    // Update milestone progress
    const { error: milestoneUpsertError } = await supabase
      .from('user_milestone_progress')
      .upsert({
        user_id: req.user.id,
        path_id: pathId,
        milestone_index: milestoneIndex,
        completed: milestoneComplete,
        completed_at: milestoneComplete ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'path_id,milestone_index',
      });

    if (milestoneUpsertError) {
      console.error('[Progress Update] Milestone upsert error:', milestoneUpsertError);
    }

    // Check if entire path is complete
    const { data: allMilestones } = await supabase
      .from('user_milestone_progress')
      .select('completed')
      .eq('path_id', pathId)
      .eq('user_id', req.user.id);

    const pathComplete = path.milestones.length > 0 &&
      allMilestones?.length === path.milestones.length &&
      allMilestones.every(m => m.completed);

    console.log('[Progress Update] Path complete?', pathComplete);

    if (pathComplete && path.status !== 'completed') {
      await supabase
        .from('user_learning_paths')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', pathId);
    }

    res.json({ success: true, milestoneComplete, pathComplete });
  } catch (error) {
    console.error('[Progress Update] Error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// GET /api/pathfinder/paths - List all available paths
router.get('/paths', (req, res) => {
  const paths = Object.entries(learningPaths)
    .filter(([key]) => key !== 'default')
    .map(([key, path]) => ({
      id: key,
      title: path.title,
      duration: path.duration,
      description: path.description,
      milestoneCount: path.milestones.length,
    }));
  
  res.json(paths);
});

// GET /api/pathfinder/quiz - Get quiz questions
router.get('/quiz', (req, res) => {
  const questions = [
    {
      id: "experience",
      question: "What's your experience with graph databases?",
      options: [
        { value: "none", label: "Complete Beginner" },
        { value: "some", label: "Some Experience" },
        { value: "intermediate", label: "Intermediate" },
        { value: "advanced", label: "Advanced" },
      ],
    },
    {
      id: "goal",
      question: "What's your primary goal?",
      options: [
        { value: "learn", label: "Learn Fundamentals" },
        { value: "build", label: "Build a Project" },
        { value: "migrate", label: "Migrate from SQL" },
        { value: "optimize", label: "Optimize & Scale" },
      ],
    },
    {
      id: "usecase",
      question: "What use case interests you most?",
      options: [
        { value: "fraud", label: "Fraud Detection" },
        { value: "recommendations", label: "Recommendations" },
        { value: "graphrag", label: "GraphRAG / AI" },
        { value: "general", label: "General Analytics" },
      ],
    },
    {
      id: "time",
      question: "How much time can you dedicate weekly?",
      options: [
        { value: "1hr", label: "1 Hour" },
        { value: "3hr", label: "3-5 Hours" },
        { value: "10hr", label: "10+ Hours" },
        { value: "fulltime", label: "Full-time" },
      ],
    },
  ];
  
  res.json(questions);
});

module.exports = router;
