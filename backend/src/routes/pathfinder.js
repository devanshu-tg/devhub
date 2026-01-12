const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Learning path templates
const learningPaths = {
  // Beginner paths
  "none-learn-general": {
    title: "Graph Database Fundamentals",
    duration: "2 weeks",
    description: "A gentle introduction to graph databases and TigerGraph for complete beginners.",
    milestones: [
      {
        week: 1,
        title: "Understanding Graphs",
        description: "Learn what graphs are and why they matter",
        resources: [
          { title: "What is a Graph Database?", type: "video", duration: "20 min" },
          { title: "Nodes, Edges, and Properties", type: "article", duration: "15 min" },
          { title: "TigerGraph Cloud Setup", type: "tutorial", duration: "30 min" },
        ],
      },
      {
        week: 2,
        title: "First Steps with GSQL",
        description: "Write your first graph queries",
        resources: [
          { title: "GSQL Syntax Basics", type: "video", duration: "30 min" },
          { title: "Simple Pattern Matching", type: "tutorial", duration: "45 min" },
          { title: "Query Practice Exercises", type: "tutorial", duration: "1 hr" },
        ],
      },
    ],
  },
  "some-build-fraud": {
    title: "SQL Developer → Fraud Detection Engineer",
    duration: "4 weeks",
    description: "Transition from SQL to graph-based fraud detection with TigerGraph.",
    milestones: [
      {
        week: 1,
        title: "Graph Thinking for SQL Devs",
        description: "Translate your SQL knowledge to graph concepts",
        resources: [
          { title: "SQL to GSQL Migration Guide", type: "article", duration: "30 min" },
          { title: "Data Modeling: Tables vs Graphs", type: "video", duration: "45 min" },
          { title: "Schema Design Workshop", type: "tutorial", duration: "1 hr" },
        ],
      },
      {
        week: 2,
        title: "GSQL for Pattern Detection",
        description: "Learn to find patterns in connected data",
        resources: [
          { title: "Multi-hop Queries", type: "video", duration: "40 min" },
          { title: "Accumulators Deep Dive", type: "article", duration: "25 min" },
          { title: "Finding Cycles in Graphs", type: "tutorial", duration: "1 hr" },
        ],
      },
      {
        week: 3,
        title: "Fraud Detection Patterns",
        description: "Common fraud patterns and how to detect them",
        resources: [
          { title: "Fraud Ring Detection", type: "video", duration: "1 hr" },
          { title: "Real-time Scoring", type: "article", duration: "30 min" },
          { title: "Build a Fraud Alert System", type: "tutorial", duration: "2 hr" },
        ],
      },
      {
        week: 4,
        title: "Production Deployment",
        description: "Deploy and scale your fraud detection system",
        resources: [
          { title: "TigerGraph in Production", type: "video", duration: "45 min" },
          { title: "Performance Tuning", type: "article", duration: "30 min" },
          { title: "Monitoring & Alerting Setup", type: "tutorial", duration: "1 hr" },
        ],
      },
    ],
  },
  "intermediate-build-graphrag": {
    title: "GraphRAG Practitioner Path",
    duration: "3 weeks",
    description: "Build knowledge graphs for Retrieval-Augmented Generation with LLMs.",
    milestones: [
      {
        week: 1,
        title: "Knowledge Graph Fundamentals",
        description: "Design knowledge graphs for AI applications",
        resources: [
          { title: "Knowledge Graph Architecture", type: "video", duration: "45 min" },
          { title: "Entity & Relationship Extraction", type: "article", duration: "30 min" },
          { title: "Build Your First KG", type: "tutorial", duration: "1.5 hr" },
        ],
      },
      {
        week: 2,
        title: "RAG Pipeline Design",
        description: "Connect your graph to LLMs",
        resources: [
          { title: "GraphRAG vs Vector RAG", type: "video", duration: "30 min" },
          { title: "Query Strategies for RAG", type: "article", duration: "25 min" },
          { title: "LangChain + TigerGraph", type: "tutorial", duration: "2 hr" },
        ],
      },
      {
        week: 3,
        title: "Advanced GraphRAG",
        description: "Optimize and scale your GraphRAG system",
        resources: [
          { title: "Hybrid Search Techniques", type: "video", duration: "40 min" },
          { title: "Evaluation & Metrics", type: "article", duration: "30 min" },
          { title: "Production GraphRAG App", type: "tutorial", duration: "2 hr" },
        ],
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
        resources: [
          { title: "Graph Database Intro", type: "video", duration: "30 min" },
          { title: "User-Item Graph Modeling", type: "article", duration: "20 min" },
          { title: "Setup TigerGraph Cloud", type: "tutorial", duration: "30 min" },
        ],
      },
      {
        week: 2,
        title: "Collaborative Filtering",
        description: "Build your first recommendation query",
        resources: [
          { title: "Collaborative Filtering Explained", type: "video", duration: "45 min" },
          { title: "GSQL for Recommendations", type: "tutorial", duration: "1 hr" },
          { title: "Similarity Algorithms", type: "article", duration: "30 min" },
        ],
      },
      {
        week: 3,
        title: "Production Recommendations",
        description: "Scale and deploy your system",
        resources: [
          { title: "Real-time vs Batch", type: "video", duration: "30 min" },
          { title: "Build Complete Rec System", type: "tutorial", duration: "2 hr" },
          { title: "A/B Testing Recommendations", type: "article", duration: "25 min" },
        ],
      },
    ],
  },
  "default": {
    title: "TigerGraph Explorer Path",
    duration: "3 weeks",
    description: "A balanced introduction to TigerGraph for developers of all backgrounds.",
    milestones: [
      {
        week: 1,
        title: "Getting Started",
        description: "Set up your environment and learn the basics",
        resources: [
          { title: "TigerGraph Overview", type: "video", duration: "30 min" },
          { title: "Installation Guide", type: "docs", duration: "20 min" },
          { title: "Hello World Graph", type: "tutorial", duration: "45 min" },
        ],
      },
      {
        week: 2,
        title: "Core Concepts",
        description: "Master the fundamentals of GSQL",
        resources: [
          { title: "GSQL Pattern Matching", type: "video", duration: "1 hr" },
          { title: "Data Loading", type: "tutorial", duration: "45 min" },
          { title: "Query Optimization", type: "article", duration: "30 min" },
        ],
      },
      {
        week: 3,
        title: "Build Something Real",
        description: "Apply your skills to a real project",
        resources: [
          { title: "Choose Your Use Case", type: "article", duration: "15 min" },
          { title: "End-to-End Project", type: "tutorial", duration: "3 hr" },
          { title: "Next Steps & Resources", type: "article", duration: "10 min" },
        ],
      },
    ],
  },
};

// Generate path key from answers
function getPathKey(answers) {
  const { experience, goal, usecase } = answers;
  
  // Try specific combinations
  const specificKey = `${experience}-${goal}-${usecase}`;
  if (learningPaths[specificKey]) return specificKey;
  
  // Try partial matches
  const partialKeys = [
    `${experience}-${goal}-general`,
    `${experience}-learn-${usecase}`,
    `some-${goal}-${usecase}`,
  ];
  
  for (const key of partialKeys) {
    if (learningPaths[key]) return key;
  }
  
  return 'default';
}

// POST /api/pathfinder/generate - Generate learning path based on quiz answers
router.post('/generate', async (req, res) => {
  const { experience, goal, usecase, time } = req.body;
  
  // Find matching path
  const pathKey = getPathKey({ experience, goal, usecase });
  const path = { ...learningPaths[pathKey] };
  
  // Adjust based on time available
  if (time === '1hr') {
    // Condensed version - keep first 2 milestones with fewer resources
    path.milestones = path.milestones.slice(0, 2).map(m => ({
      ...m,
      resources: m.resources.slice(0, 2),
    }));
    path.duration = '2 weeks (condensed)';
  } else if (time === 'fulltime') {
    // Add extra resources hint
    path.description += ' With full-time dedication, you can complete this faster and go deeper.';
  }
  
  // Try to save to Supabase if configured
  if (supabase) {
    try {
      await supabase.from('learning_paths').insert([{
        title: path.title,
        description: path.description,
        duration: path.duration,
        experience_level: experience,
        goal: goal,
        use_case: usecase,
        milestones: path.milestones,
      }]);
    } catch (error) {
      console.error('Failed to save learning path:', error);
      // Continue anyway - saving is optional
    }
  }
  
  res.json(path);
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
