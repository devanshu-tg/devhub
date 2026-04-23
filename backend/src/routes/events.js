const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const { authenticate, optionalAuth } = require('../middleware/auth');
const staticEvents = require('../data/staticEvents');

function toCamel(row) {
  if (!row) return row;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    italicAccent: row.italic_accent,
    type: row.type,
    status: row.status,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    location: row.location,
    description: row.description,
    coverImage: row.cover_image,
    coverTone: row.cover_tone,
    stats: row.stats || {},
    featured: row.featured,
    createdAt: row.created_at,
    rsvpCount: row.rsvp_count,
  };
}

function photoToCamel(row) {
  return {
    id: row.id,
    url: row.url,
    caption: row.caption,
    tone: row.tone,
    span: row.span,
    sortOrder: row.sort_order,
  };
}

function projectToCamel(row) {
  return {
    id: row.id,
    place: row.place,
    name: row.name,
    team: row.team,
    description: row.description,
    tags: row.tags || [],
    prize: row.prize,
    imageUrl: row.image_url,
    repoUrl: row.repo_url,
    sortOrder: row.sort_order,
  };
}

function sponsorToCamel(row) {
  return {
    id: row.id,
    name: row.name,
    url: row.url,
    sortOrder: row.sort_order,
  };
}

/**
 * GET /api/events?status=upcoming|past
 * List events with RSVP counts.
 */
router.get('/', async (req, res) => {
  const status = req.query.status;
  if (supabase) {
    try {
      let query = supabase.from('events').select('*').order('starts_at', { ascending: status === 'past' ? false : true });
      if (status === 'upcoming' || status === 'past') {
        query = query.eq('status', status);
      }
      const { data, error } = await query;
      if (error) throw error;

      if (data && data.length > 0) {
        const ids = data.map(e => e.id);
        let rsvpMap = {};
        if (ids.length) {
          const { data: rsvps, error: rsvpError } = await supabase
            .from('event_rsvps')
            .select('event_id');
          if (!rsvpError && Array.isArray(rsvps)) {
            rsvpMap = rsvps.reduce((acc, r) => {
              acc[r.event_id] = (acc[r.event_id] || 0) + 1;
              return acc;
            }, {});
          }
        }
        return res.json({ data: data.map(e => toCamel({ ...e, rsvp_count: rsvpMap[e.id] || 0 })) });
      }
    } catch (error) {
      console.warn('[events] Supabase unavailable, falling back to static data:', error.message);
    }
  }
  // Static fallback — shape already matches toCamel output.
  res.json({ data: staticEvents.listEvents(status) });
});

/**
 * GET /api/events/featured
 * Returns the single featured upcoming event (for the dark hero card).
 */
router.get('/featured', async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('featured', true)
        .eq('status', 'upcoming')
        .order('starts_at', { ascending: true })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      if (data) return res.json({ data: toCamel(data) });
    } catch (error) {
      console.warn('[events/featured] Supabase unavailable, falling back to static:', error.message);
    }
  }
  res.json({ data: staticEvents.getFeatured() });
});

/**
 * GET /api/events/:slug
 * Full event detail including photos, projects, sponsors.
 */
router.get('/:slug', optionalAuth, async (req, res) => {
  if (supabase) {
    try {
      const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('slug', req.params.slug)
        .maybeSingle();

      if (error) throw error;
      if (event) {
        const [photosRes, projectsRes, sponsorsRes, rsvpCountRes] = await Promise.all([
          supabase.from('event_photos').select('*').eq('event_id', event.id).order('sort_order', { ascending: true }),
          supabase.from('hackathon_projects').select('*').eq('event_id', event.id).order('sort_order', { ascending: true }),
          supabase.from('event_sponsors').select('*').eq('event_id', event.id).order('sort_order', { ascending: true }),
          supabase.from('event_rsvps').select('id', { count: 'exact', head: true }).eq('event_id', event.id),
        ]);

        let userRsvped = false;
        if (req.user?.id) {
          const { data: mine } = await supabase
            .from('event_rsvps')
            .select('id')
            .eq('event_id', event.id)
            .eq('user_id', req.user.id)
            .maybeSingle();
          userRsvped = !!mine;
        }

        return res.json({
          event: toCamel({ ...event, rsvp_count: rsvpCountRes.count || 0 }),
          photos: (photosRes.data || []).map(photoToCamel),
          projects: (projectsRes.data || []).map(projectToCamel),
          sponsors: (sponsorsRes.data || []).map(sponsorToCamel),
          userRsvped,
        });
      }
    } catch (error) {
      console.warn(`[events/${req.params.slug}] Supabase unavailable, falling back to static:`, error.message);
    }
  }
  // Static fallback
  const detail = staticEvents.getEventDetail(req.params.slug);
  if (!detail) return res.status(404).json({ error: 'Not found' });
  res.json({ ...detail, userRsvped: false });
});

/**
 * POST /api/events/:id/rsvp
 * Authenticated: add an RSVP (idempotent).
 */
router.post('/:id/rsvp', authenticate, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Database not available' });
  try {
    const { error } = await supabase
      .from('event_rsvps')
      .upsert({ event_id: req.params.id, user_id: req.user.id }, { onConflict: 'user_id,event_id' });
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

/**
 * DELETE /api/events/:id/rsvp
 * Authenticated: remove your RSVP.
 */
router.delete('/:id/rsvp', authenticate, async (req, res) => {
  if (!supabase) return res.status(503).json({ error: 'Database not available' });
  try {
    const { error } = await supabase
      .from('event_rsvps')
      .delete()
      .eq('event_id', req.params.id)
      .eq('user_id', req.user.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('RSVP delete error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
