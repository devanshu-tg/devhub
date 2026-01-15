/**
 * Scheduler Service - Automated YouTube Sync
 * Runs daily at 3 AM to fetch new TigerGraph videos
 */

const cron = require('node-cron');
const { fetchTigerGraphVideos } = require('./youtube');
const { supabase } = require('../config/supabase');

/**
 * Sync YouTube videos to database
 */
async function syncYouTubeVideos() {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    console.log('⚠️  YouTube API key not configured. Skipping scheduled sync.');
    return;
  }
  
  if (!supabase) {
    console.log('⚠️  Database not configured. Skipping scheduled sync.');
    return;
  }
  
  try {
    console.log('🔄 [Scheduler] Starting automatic YouTube sync...');
    const startTime = Date.now();
    
    // Fetch videos from YouTube
    const maxVideos = 500; // Fetch all videos
    const videos = await fetchTigerGraphVideos(apiKey, maxVideos);
    
    console.log(`📦 [Scheduler] Upserting ${videos.length} videos to database...`);
    
    // Upsert videos (insert new, update existing based on youtube_video_id)
    let inserted = 0;
    let updated = 0;
    let errors = 0;
    
    for (const video of videos) {
      try {
        // Check if video already exists
        const { data: existing } = await supabase
          .from('resources')
          .select('id')
          .eq('youtube_video_id', video.youtube_video_id)
          .single();
        
        if (existing) {
          // Update existing
          const { error } = await supabase
            .from('resources')
            .update({
              title: video.title,
              description: video.description,
              thumbnail: video.thumbnail,
              duration: video.duration,
              skill_level: video.skill_level,
              use_cases: video.use_cases,
            })
            .eq('youtube_video_id', video.youtube_video_id);
          
          if (error) throw error;
          updated++;
        } else {
          // Insert new
          const { error } = await supabase
            .from('resources')
            .insert([video]);
          
          if (error) throw error;
          inserted++;
        }
      } catch (err) {
        console.error(`Failed to upsert video ${video.youtube_video_id}:`, err.message);
        errors++;
      }
    }
    
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`✅ [Scheduler] Sync complete in ${duration}s: ${inserted} new, ${updated} updated, ${errors} errors`);
  } catch (error) {
    console.error('❌ [Scheduler] YouTube sync failed:', error.message);
  }
}

/**
 * Initialize scheduler
 */
function startScheduler() {
  console.log('⏰ YouTube sync scheduler initialized');
  
  // Schedule sync every day at 3:00 AM
  // Cron format: second minute hour day month weekday
  cron.schedule('0 3 * * *', () => {
    console.log('⏰ [Scheduler] Triggered daily sync at 3:00 AM');
    syncYouTubeVideos();
  }, {
    timezone: "Asia/Kolkata" // Adjust to your timezone
  });
  
  console.log('📅 Next sync scheduled for 3:00 AM daily');
}

/**
 * Run sync immediately (for testing)
 */
async function runSyncNow() {
  console.log('🚀 [Manual] Running YouTube sync now...');
  await syncYouTubeVideos();
}

module.exports = {
  startScheduler,
  runSyncNow,
  syncYouTubeVideos,
};
