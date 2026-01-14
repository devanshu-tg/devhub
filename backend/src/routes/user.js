const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// ==================== PROFILE ====================

/**
 * GET /api/user/profile
 * Get the current user's profile
 */
router.get('/profile', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }

    res.json(data);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/user/profile
 * Update the current user's profile
 */
router.patch('/profile', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { display_name, avatar_url } = req.body;

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ display_name, avatar_url })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({ error: 'Failed to update profile' });
    }

    res.json(data);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== BOOKMARKS ====================

/**
 * GET /api/user/bookmarks
 * Get all bookmarks for the current user
 */
router.get('/bookmarks', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { data, error } = await supabase
      .from('user_bookmarks')
      .select(`
        id,
        created_at,
        resource:resources (
          id,
          title,
          description,
          type,
          skill_level,
          use_cases,
          thumbnail,
          url,
          duration
        )
      `)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bookmarks:', error);
      return res.status(500).json({ error: 'Failed to fetch bookmarks' });
    }

    // Transform to include resource data at top level with correct field names
    const bookmarks = data.map(b => ({
      // Resource fields (converted to camelCase)
      id: b.resource.id,
      title: b.resource.title,
      description: b.resource.description,
      type: b.resource.type,
      skillLevel: b.resource.skill_level,
      useCases: b.resource.use_cases,
      thumbnail: b.resource.thumbnail,
      url: b.resource.url,
      duration: b.resource.duration,
      // Bookmark-specific fields
      bookmarkId: b.id,
      bookmarkedAt: b.created_at,
    }));

    res.json({ data: bookmarks, total: bookmarks.length });
  } catch (error) {
    console.error('Bookmarks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/user/bookmarks/ids
 * Get just the resource IDs that are bookmarked (for quick lookup)
 */
router.get('/bookmarks/ids', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { data, error } = await supabase
      .from('user_bookmarks')
      .select('resource_id')
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Error fetching bookmark IDs:', error);
      return res.status(500).json({ error: 'Failed to fetch bookmark IDs' });
    }

    const ids = data.map(b => b.resource_id);
    res.json({ ids });
  } catch (error) {
    console.error('Bookmark IDs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/user/bookmarks/:resourceId
 * Add a bookmark for a resource
 */
router.post('/bookmarks/:resourceId', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { resourceId } = req.params;

    // Check if resource exists
    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .select('id')
      .eq('id', resourceId)
      .single();

    if (resourceError || !resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Add bookmark
    const { data, error } = await supabase
      .from('user_bookmarks')
      .insert({
        user_id: req.user.id,
        resource_id: resourceId
      })
      .select()
      .single();

    if (error) {
      // Check if it's a duplicate
      if (error.code === '23505') {
        return res.status(409).json({ error: 'Resource already bookmarked' });
      }
      console.error('Error adding bookmark:', JSON.stringify(error, null, 2));
      console.error('User ID:', req.user.id);
      console.error('Resource ID:', resourceId);
      return res.status(500).json({ error: 'Failed to add bookmark', details: error.message });
    }

    res.status(201).json(data);
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/user/bookmarks/:resourceId
 * Remove a bookmark for a resource
 */
router.delete('/bookmarks/:resourceId', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { resourceId } = req.params;

    const { error } = await supabase
      .from('user_bookmarks')
      .delete()
      .eq('user_id', req.user.id)
      .eq('resource_id', resourceId);

    if (error) {
      console.error('Error removing bookmark:', error);
      return res.status(500).json({ error: 'Failed to remove bookmark' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== PROGRESS ====================

/**
 * GET /api/user/progress
 * Get all progress for the current user
 */
router.get('/progress', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { data, error } = await supabase
      .from('user_progress')
      .select(`
        id,
        completed,
        completed_at,
        created_at,
        resource:resources (
          id,
          title,
          description,
          type,
          skill_level,
          duration
        )
      `)
      .eq('user_id', req.user.id)
      .order('completed_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error fetching progress:', error);
      return res.status(500).json({ error: 'Failed to fetch progress' });
    }

    // Calculate stats
    const completed = data.filter(p => p.completed).length;
    const inProgress = data.filter(p => !p.completed).length;

    res.json({ 
      data,
      stats: {
        completed,
        inProgress,
        total: data.length
      }
    });
  } catch (error) {
    console.error('Progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/user/progress/ids
 * Get just the resource IDs with their completion status
 */
router.get('/progress/ids', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { data, error } = await supabase
      .from('user_progress')
      .select('resource_id, completed')
      .eq('user_id', req.user.id);

    if (error) {
      console.error('Error fetching progress IDs:', error);
      return res.status(500).json({ error: 'Failed to fetch progress IDs' });
    }

    const progressMap = {};
    data.forEach(p => {
      progressMap[p.resource_id] = p.completed;
    });

    res.json({ progress: progressMap });
  } catch (error) {
    console.error('Progress IDs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /api/user/progress/:resourceId
 * Mark a resource as started or completed
 */
router.post('/progress/:resourceId', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { resourceId } = req.params;
    const { completed = false } = req.body;

    // Check if resource exists
    const { data: resource, error: resourceError } = await supabase
      .from('resources')
      .select('id')
      .eq('id', resourceId)
      .single();

    if (resourceError || !resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Upsert progress
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: req.user.id,
        resource_id: resourceId,
        completed,
        completed_at: completed ? new Date().toISOString() : null
      }, {
        onConflict: 'user_id,resource_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating progress:', error);
      return res.status(500).json({ error: 'Failed to update progress' });
    }

    res.json(data);
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE /api/user/progress/:resourceId
 * Remove progress for a resource
 */
router.delete('/progress/:resourceId', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(503).json({ error: 'Database not available' });
    }

    const { resourceId } = req.params;

    const { error } = await supabase
      .from('user_progress')
      .delete()
      .eq('user_id', req.user.id)
      .eq('resource_id', resourceId);

    if (error) {
      console.error('Error removing progress:', error);
      return res.status(500).json({ error: 'Failed to remove progress' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Remove progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
