/**
 * YouTube Data API Service
 * Fetches videos from TigerGraph's YouTube channel
 */

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
const TIGERGRAPH_CHANNEL_HANDLE = '@TigerGraph';

/**
 * Convert ISO 8601 duration (PT1H30M15S) to readable format (1h 30m)
 */
function parseDuration(isoDuration) {
  if (!isoDuration) return null;
  
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  
  const hours = match[1] ? parseInt(match[1]) : 0;
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const seconds = match[3] ? parseInt(match[3]) : 0;
  
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (parts.length === 0 && seconds > 0) parts.push(`${seconds}s`);
  
  return parts.join(' ') || '< 1m';
}

/**
 * Determine skill level based on video title/description
 */
function inferSkillLevel(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  if (text.includes('advanced') || text.includes('deep dive') || text.includes('optimization') || text.includes('architecture')) {
    return 'advanced';
  }
  if (text.includes('intermediate') || text.includes('hands-on') || text.includes('workshop')) {
    return 'intermediate';
  }
  // Default to beginner for intro, getting started, basics, etc.
  return 'beginner';
}

/**
 * Infer use cases from video title/description
 */
function inferUseCases(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const useCases = [];
  
  if (text.includes('fraud') || text.includes('anti-money')) {
    useCases.push('fraud');
  }
  if (text.includes('recommend') || text.includes('personalization')) {
    useCases.push('recommendations');
  }
  if (text.includes('rag') || text.includes('retrieval') || text.includes('llm') || text.includes('ai')) {
    useCases.push('graphrag');
  }
  if (text.includes('gnn') || text.includes('neural') || text.includes('machine learning') || text.includes('ml')) {
    useCases.push('gnn');
  }
  
  // Default to general if no specific use case found
  return useCases.length > 0 ? useCases : ['general'];
}

/**
 * Get channel ID from handle (e.g., @TigerGraph)
 */
async function getChannelId(apiKey, handle) {
  const url = `${YOUTUBE_API_BASE}/channels?part=contentDetails&forHandle=${handle.replace('@', '')}&key=${apiKey}`;
  
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get channel ID: ${error}`);
  }
  
  const data = await response.json();
  if (!data.items || data.items.length === 0) {
    throw new Error(`Channel not found: ${handle}`);
  }
  
  return {
    channelId: data.items[0].id,
    uploadsPlaylistId: data.items[0].contentDetails.relatedPlaylists.uploads
  };
}

/**
 * Get videos from a playlist (paginated)
 */
async function getPlaylistVideos(apiKey, playlistId, maxResults = 50) {
  const videos = [];
  let nextPageToken = null;
  
  do {
    let url = `${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=${Math.min(maxResults, 50)}&key=${apiKey}`;
    if (nextPageToken) {
      url += `&pageToken=${nextPageToken}`;
    }
    
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get playlist videos: ${error}`);
    }
    
    const data = await response.json();
    
    for (const item of data.items || []) {
      videos.push({
        videoId: item.contentDetails.videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.maxres?.url || 
                   item.snippet.thumbnails?.high?.url || 
                   item.snippet.thumbnails?.medium?.url ||
                   item.snippet.thumbnails?.default?.url,
        publishedAt: item.snippet.publishedAt,
      });
    }
    
    nextPageToken = data.nextPageToken;
    
    // Respect maxResults limit
    if (videos.length >= maxResults) {
      break;
    }
  } while (nextPageToken);
  
  return videos.slice(0, maxResults);
}

/**
 * Get video details (duration, view count, etc.)
 */
async function getVideoDetails(apiKey, videoIds) {
  const details = {};
  
  // YouTube API allows max 50 IDs per request
  const chunks = [];
  for (let i = 0; i < videoIds.length; i += 50) {
    chunks.push(videoIds.slice(i, i + 50));
  }
  
  for (const chunk of chunks) {
    const url = `${YOUTUBE_API_BASE}/videos?part=contentDetails,statistics&id=${chunk.join(',')}&key=${apiKey}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get video details: ${error}`);
    }
    
    const data = await response.json();
    
    for (const item of data.items || []) {
      details[item.id] = {
        duration: item.contentDetails?.duration,
        viewCount: item.statistics?.viewCount,
      };
    }
  }
  
  return details;
}

/**
 * Fetch all videos from TigerGraph YouTube channel
 * @param {string} apiKey - YouTube Data API key
 * @param {number} maxVideos - Maximum number of videos to fetch (default: 100)
 * @returns {Array} Array of video objects ready for database insertion
 */
async function fetchTigerGraphVideos(apiKey, maxVideos = 100) {
  if (!apiKey) {
    throw new Error('YouTube API key is required');
  }
  
  console.log('🔍 Looking up TigerGraph channel...');
  const { uploadsPlaylistId } = await getChannelId(apiKey, TIGERGRAPH_CHANNEL_HANDLE);
  
  console.log(`📋 Fetching videos from uploads playlist: ${uploadsPlaylistId}`);
  const videos = await getPlaylistVideos(apiKey, uploadsPlaylistId, maxVideos);
  
  console.log(`📊 Getting details for ${videos.length} videos...`);
  const videoIds = videos.map(v => v.videoId);
  const details = await getVideoDetails(apiKey, videoIds);
  
  // Transform to our resource schema
  const resources = videos.map(video => {
    const videoDetails = details[video.videoId] || {};
    
    return {
      youtube_video_id: video.videoId,
      title: video.title,
      description: video.description?.substring(0, 500) || '', // Truncate long descriptions
      type: 'video',
      skill_level: inferSkillLevel(video.title, video.description || ''),
      use_cases: inferUseCases(video.title, video.description || ''),
      thumbnail: video.thumbnail,
      url: `https://www.youtube.com/watch?v=${video.videoId}`,
      duration: parseDuration(videoDetails.duration),
      created_at: video.publishedAt,
    };
  });
  
  console.log(`✅ Prepared ${resources.length} resources for database`);
  return resources;
}

module.exports = {
  fetchTigerGraphVideos,
  parseDuration,
  inferSkillLevel,
  inferUseCases,
};
