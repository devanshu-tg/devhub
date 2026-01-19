const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { fetchTigerGraphVideos } = require('../services/youtube');
const { syncYouTubeVideos } = require('../services/scheduler');

// Mock data fallback when Supabase is not configured
const mockResources = [
  {
    id: "1",
    title: "Getting Started with TigerGraph",
    description: "A comprehensive introduction to TigerGraph, covering installation, basic concepts, and your first graph.",
    type: "tutorial",
    skill_level: "beginner",
    use_cases: ["general"],
    thumbnail: "https://i.ytimg.com/vi/JjQI5N-KQS4/maxresdefault.jpg",
    url: "https://docs.tigergraph.com/getting-started",
    duration: "30 min",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "GSQL 101 - Pattern Matching",
    description: "Learn the fundamentals of GSQL pattern matching to traverse and query your graph data effectively.",
    type: "video",
    skill_level: "beginner",
    use_cases: ["general"],
    thumbnail: "https://i.ytimg.com/vi/him2Uy3Nn7Y/maxresdefault.jpg",
    url: "https://youtube.com/watch?v=example",
    duration: "45 min",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Fraud Detection with Graph Analytics",
    description: "Build a real-time fraud detection system using TigerGraph's powerful graph algorithms.",
    type: "tutorial",
    skill_level: "intermediate",
    use_cases: ["fraud"],
    thumbnail: "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
    url: "https://docs.tigergraph.com/fraud-detection",
    duration: "2 hours",
    created_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "GraphRAG Implementation Guide",
    description: "Implement Retrieval-Augmented Generation using TigerGraph as your knowledge graph backend.",
    type: "blog",
    skill_level: "advanced",
    use_cases: ["graphrag"],
    thumbnail: "https://i.ytimg.com/vi/xyz123/maxresdefault.jpg",
    url: "https://tigergraph.com/blog/graphrag",
    duration: "1 hour",
    created_at: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Building Recommendation Engines",
    description: "Create personalized recommendation systems using collaborative filtering on graphs.",
    type: "video",
    skill_level: "intermediate",
    use_cases: ["recommendations"],
    thumbnail: "https://i.ytimg.com/vi/abc456/maxresdefault.jpg",
    url: "https://youtube.com/watch?v=recommendations",
    duration: "1.5 hours",
    created_at: new Date().toISOString(),
  },
  {
    id: "6",
    title: "TigerGraph Cloud Quickstart",
    description: "Get up and running with TigerGraph Cloud in minutes. No installation required.",
    type: "docs",
    skill_level: "beginner",
    use_cases: ["general"],
    thumbnail: "https://i.ytimg.com/vi/cloud123/maxresdefault.jpg",
    url: "https://docs.tigergraph.com/cloud",
    duration: "15 min",
    created_at: new Date().toISOString(),
  },
];

// Helper to convert snake_case to camelCase for API response
function toCamelCase(resource) {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    type: resource.type,
    skillLevel: resource.skill_level,
    useCases: resource.use_cases,
    thumbnail: resource.thumbnail,
    url: resource.url,
    duration: resource.duration,
    createdAt: resource.created_at,
  };
}

// GET /api/resources - List all resources with filters
router.get('/', async (req, res) => {
  const { skillLevel, type, useCase, search } = req.query;
  
  // Use Supabase if configured, otherwise use mock data
  if (supabase) {
    try {
      // First, get the total count with filters
      let countQuery = supabase.from('resources').select('*', { count: 'exact', head: true });
      
      if (skillLevel && skillLevel !== 'all') {
        countQuery = countQuery.eq('skill_level', skillLevel.toLowerCase());
      }
      
      if (type && type !== 'all') {
        countQuery = countQuery.eq('type', type.toLowerCase());
      }
      
      if (useCase && useCase !== 'all') {
        countQuery = countQuery.contains('use_cases', [useCase.toLowerCase()]);
      }
      
      if (search) {
        countQuery = countQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
      }
      
      const { count: totalCount, error: countError } = await countQuery;
      if (countError) throw countError;
      
      // Now fetch all data (paginate if needed to get all results)
      let allData = [];
      const pageSize = 1000;
      let page = 0;
      
      while (true) {
        let query = supabase.from('resources').select('*');
        
        if (skillLevel && skillLevel !== 'all') {
          query = query.eq('skill_level', skillLevel.toLowerCase());
        }
        
        if (type && type !== 'all') {
          query = query.eq('type', type.toLowerCase());
        }
        
        if (useCase && useCase !== 'all') {
          query = query.contains('use_cases', [useCase.toLowerCase()]);
        }
        
        if (search) {
          query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
        }
        
        // Order by type priority: video=1, tutorial=2, docs=3, blog=4, then alphabetically by title
        const { data, error } = await query
          .order('type', { ascending: true })
          .order('title', { ascending: true })
          .range(page * pageSize, (page + 1) * pageSize - 1);
        
        if (error) throw error;
        
        if (!data || data.length === 0) break;
        
        allData = allData.concat(data);
        
        if (data.length < pageSize) break;
        page++;
      }
      
      // Sort by type priority: video first, then tutorial, then docs, then blog
      const typePriority = { video: 1, tutorial: 2, docs: 3, blog: 4 };
      allData.sort((a, b) => {
        const priorityA = typePriority[a.type] || 5;
        const priorityB = typePriority[b.type] || 5;
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        // If same type, sort alphabetically by title
        return a.title.localeCompare(b.title);
      });
      
      res.json({
        data: allData.map(toCamelCase),
        total: totalCount,
      });
    } catch (error) {
      console.error('Supabase error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    // Fallback to mock data
    let filtered = [...mockResources];
    
    if (skillLevel && skillLevel !== 'all') {
      filtered = filtered.filter(r => r.skill_level.toLowerCase() === skillLevel.toLowerCase());
    }
    
    if (type && type !== 'all') {
      filtered = filtered.filter(r => r.type.toLowerCase() === type.toLowerCase());
    }
    
    if (useCase && useCase !== 'all') {
      filtered = filtered.filter(r => r.use_cases.includes(useCase.toLowerCase()));
    }
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(r => 
        r.title.toLowerCase().includes(searchLower) ||
        r.description.toLowerCase().includes(searchLower)
      );
    }
    
    res.json({
      data: filtered.map(toCamelCase),
      total: filtered.length,
    });
  }
});

// GET /api/resources/:id - Get single resource
router.get('/:id', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('id', req.params.id)
        .single();
      
      if (error || !data) {
        return res.status(404).json({ error: 'Resource not found' });
      }
      
      res.json(toCamelCase(data));
    } catch (error) {
      console.error('Supabase error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    const resource = mockResources.find(r => r.id === req.params.id);
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    res.json(toCamelCase(resource));
  }
});

// POST /api/resources - Create new resource
router.post('/', async (req, res) => {
  const { title, description, type, skillLevel, useCases, url, thumbnail, duration } = req.body;
  
  const newResource = {
    title,
    description,
    type,
    skill_level: skillLevel,
    use_cases: useCases || [],
    url,
    thumbnail,
    duration,
  };
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert([newResource])
        .select()
        .single();
      
      if (error) throw error;
      
      res.status(201).json(toCamelCase(data));
    } catch (error) {
      console.error('Supabase error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    const mockResource = {
      ...newResource,
      id: String(mockResources.length + 1),
      created_at: new Date().toISOString(),
    };
    mockResources.push(mockResource);
    res.status(201).json(toCamelCase(mockResource));
  }
});

// DELETE /api/resources/:id - Delete resource
router.delete('/:id', async (req, res) => {
  if (supabase) {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', req.params.id);
      
      if (error) throw error;
      
      res.json({ success: true });
    } catch (error) {
      console.error('Supabase error:', error);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.json({ success: true });
  }
});

// POST /api/resources/sync-youtube - Sync videos from TigerGraph YouTube channel
router.post('/sync-youtube', async (req, res) => {
  try {
    console.log('🚀 [Manual] Starting YouTube sync...');
    await syncYouTubeVideos();
    res.json({
      success: true,
      message: 'YouTube sync completed. Check server logs for details.'
    });
  } catch (error) {
    console.error('YouTube sync error:', error);
    res.status(500).json({ 
      error: 'YouTube sync failed', 
      details: error.message 
    });
  }
});

module.exports = router;
