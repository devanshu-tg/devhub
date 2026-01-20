const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticate, optionalAuth } = require('../middleware/auth');

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

    // Fetch real resources for each milestone
    const milestonesWithResources = await Promise.all(
      pathTemplate.milestones.map(async (milestone) => {
        const resources = await fetchResourcesForMilestone(milestone);
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

    // Save to user_learning_paths if user is authenticated
    if (req.user && supabase) {
      try {
        const { data, error } = await supabase
          .from('user_learning_paths')
          .insert([{
            user_id: req.user.id,
            title: path.title,
            description: path.description,
            duration: path.duration,
            experience_level: experience,
            goal: goal,
            use_case: usecase,
            milestones: path.milestones,
            status: 'active',
          }])
          .select()
          .single();

        if (!error && data) {
          path.pathId = data.id;
        }
      } catch (error) {
        console.error('Failed to save learning path:', error);
        // Continue anyway - saving is optional
      }
    }
    
    res.json(path);
  } catch (error) {
    console.error('Generate path error:', error);
    res.status(500).json({ error: 'Failed to generate learning path' });
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
    const { data: resourceProgress, error: progressError } = await supabase
      .from('user_path_progress')
      .select('*')
      .eq('path_id', pathId)
      .eq('user_id', req.user.id);

    if (progressError) throw progressError;

    // Fetch milestone progress
    const { data: milestoneProgress, error: milestoneError } = await supabase
      .from('user_milestone_progress')
      .select('*')
      .eq('path_id', pathId)
      .eq('user_id', req.user.id);

    if (milestoneError) throw milestoneError;

    // Calculate overall progress
    const milestones = path.milestones || [];
    const totalResources = milestones.reduce((sum, m) => sum + (m.resources?.length || 0), 0);
    const completedResources = resourceProgress.filter(r => r.completed).length;
    const progressPercentage = totalResources > 0 ? Math.round((completedResources / totalResources) * 100) : 0;

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

    // Verify path belongs to user
    const { data: path, error: pathError } = await supabase
      .from('user_learning_paths')
      .select('*')
      .eq('id', pathId)
      .eq('user_id', req.user.id)
      .single();

    if (pathError) {
      return res.status(404).json({ error: 'Path not found' });
    }

    // Get resource ID from path
    const milestone = path.milestones[milestoneIndex];
    const resource = milestone?.resources[resourceIndex];

    // Upsert resource progress
    const { error: progressError } = await supabase
      .from('user_path_progress')
      .upsert({
        user_id: req.user.id,
        path_id: pathId,
        milestone_index: milestoneIndex,
        resource_index: resourceIndex,
        resource_id: resource?.id || null,
        completed: completed,
        completed_at: completed ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'path_id,milestone_index,resource_index',
      });

    if (progressError) throw progressError;

    // Check if milestone is complete
    const milestoneResources = milestone?.resources || [];
    const { data: milestoneResourceProgress } = await supabase
      .from('user_path_progress')
      .select('completed')
      .eq('path_id', pathId)
      .eq('user_id', req.user.id)
      .eq('milestone_index', milestoneIndex);

    const milestoneComplete = milestoneResources.length > 0 && 
      milestoneResourceProgress?.length === milestoneResources.length &&
      milestoneResourceProgress.every(r => r.completed);

    // Update milestone progress
    await supabase
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

    // Check if entire path is complete
    const { data: allMilestones } = await supabase
      .from('user_milestone_progress')
      .select('completed')
      .eq('path_id', pathId)
      .eq('user_id', req.user.id);

    const pathComplete = path.milestones.length > 0 &&
      allMilestones?.length === path.milestones.length &&
      allMilestones.every(m => m.completed);

    if (pathComplete && path.status !== 'completed') {
      await supabase
        .from('user_learning_paths')
        .update({ status: 'completed', updated_at: new Date().toISOString() })
        .eq('id', pathId);
    }

    res.json({ success: true, milestoneComplete, pathComplete });
  } catch (error) {
    console.error('Update progress error:', error);
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
