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
      { title: "Getting Started with TigerGraph", type: "tutorial", duration: "30 min", url: "https://docs.tigergraph.com/getting-started", description: "Installation and first steps" },
      { title: "Graph Database Fundamentals", type: "docs", duration: "15 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/intro/", description: "Core graph concepts" },
    ],
    intermediate: [
      { title: "TigerGraph Architecture", type: "docs", duration: "20 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/intro/", description: "System architecture overview" },
      { title: "GraphStudio Guide", type: "docs", duration: "25 min", url: "https://docs.tigergraph.com/gui/4.2/intro/", description: "Visual development environment" },
      { title: "Best Practices", type: "blog", duration: "15 min", url: "https://www.tigergraph.com/blog", description: "Production best practices" },
    ],
    advanced: [
      { title: "Performance Tuning", type: "docs", duration: "45 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/", description: "Optimization guide" },
      { title: "Cluster Management", type: "docs", duration: "1 hour", url: "https://docs.tigergraph.com/tigergraph-server/4.2/", description: "Scaling and HA" },
    ],
  },
  gsql: {
    beginner: [
      { title: "GSQL Language Reference", type: "docs", duration: "20 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/intro/", description: "GSQL overview" },
      { title: "SELECT Statement Basics", type: "docs", duration: "25 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/querying/select-statement/", description: "Query fundamentals" },
      { title: "Pattern Matching Tutorial", type: "tutorial", duration: "45 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/querying/tutorials/pattern-matching/", description: "Path patterns in GSQL" },
    ],
    intermediate: [
      { title: "FROM Clause - Multi-hop", type: "docs", duration: "30 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/querying/select-statement/from-clause-v2", description: "Multi-hop path patterns" },
      { title: "ACCUM and POST-ACCUM", type: "docs", duration: "25 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/querying/", description: "Accumulation in queries" },
      { title: "GSQL Syntax Versions", type: "docs", duration: "15 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/querying/syntax-versions", description: "V1, V2, V3 differences" },
    ],
    advanced: [
      { title: "Advanced Pattern Matching", type: "docs", duration: "1 hour", url: "https://docs.tigergraph.com/gsql-ref/4.2/querying/", description: "Complex patterns" },
      { title: "Graph Algorithms", type: "docs", duration: "45 min", url: "https://docs.tigergraph.com/graph-ml/3.10/intro/", description: "Built-in algorithms" },
    ],
  },
  fraud: {
    beginner: [
      { title: "Graph Analytics for Fraud", type: "docs", duration: "20 min", url: "https://docs.tigergraph.com/", description: "Introduction to graph fraud detection" },
      { title: "Connected Data Patterns", type: "tutorial", duration: "40 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/querying/", description: "Finding patterns in graphs" },
    ],
    intermediate: [
      { title: "Fraud Detection Use Case", type: "tutorial", duration: "1 hour", url: "https://github.com/tigergraph/ecosys", description: "Real-time fraud patterns" },
      { title: "Graph Algorithms for AML", type: "docs", duration: "45 min", url: "https://docs.tigergraph.com/graph-ml/3.10/intro/", description: "Anti-money laundering" },
    ],
    advanced: [
      { title: "Production Fraud Systems", type: "docs", duration: "1 hour", url: "https://docs.tigergraph.com/", description: "Scaling fraud detection" },
    ],
  },
  graphrag: {
    intermediate: [
      { title: "GraphRAG Overview", type: "blog", duration: "15 min", url: "https://www.tigergraph.com/blog", description: "Knowledge graphs for LLMs" },
      { title: "RAG with TigerGraph", type: "tutorial", duration: "1 hour", url: "https://github.com/tigergraph/ecosys", description: "Building RAG pipelines" },
    ],
    advanced: [
      { title: "GraphRAG Architecture", type: "docs", duration: "45 min", url: "https://docs.tigergraph.com/", description: "Design patterns for GraphRAG" },
    ],
  },
  recommendations: {
    beginner: [
      { title: "Recommendation Systems Intro", type: "docs", duration: "20 min", url: "https://docs.tigergraph.com/", description: "Graph-based recommendations" },
    ],
    intermediate: [
      { title: "Collaborative Filtering", type: "tutorial", duration: "1 hour", url: "https://github.com/tigergraph/ecosys", description: "User-item graphs" },
      { title: "Personalization Patterns", type: "docs", duration: "30 min", url: "https://docs.tigergraph.com/graph-ml/3.10/intro/", description: "Recommendation algorithms" },
    ],
  },
  schema: {
    beginner: [
      { title: "Schema Design Basics", type: "docs", duration: "25 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/schema/", description: "Vertex and edge types" },
    ],
    intermediate: [
      { title: "Data Modeling for Graphs", type: "docs", duration: "35 min", url: "https://docs.tigergraph.com/gsql-ref/4.2/schema/", description: "Graph schema design" },
    ],
  },
  cloud: {
    beginner: [
      { title: "TigerGraph Cloud", type: "docs", duration: "15 min", url: "https://docs.tigergraph.com/cloud", description: "Cloud deployment" },
    ],
    intermediate: [
      { title: "Production Deployment", type: "docs", duration: "30 min", url: "https://docs.tigergraph.com/tigergraph-server/4.2/", description: "Deploy and scale" },
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
  "some-build-fraud": {
    title: "SQL Developer → Fraud Detection Engineer",
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

    // Mark any existing active path as paused
    await supabase
      .from('user_learning_paths')
      .update({ status: 'paused', updated_at: new Date().toISOString() })
      .eq('user_id', req.user.id)
      .eq('status', 'active');

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

// GET /api/pathfinder/my-path - Get user's active learning path
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
