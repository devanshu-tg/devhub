/**
 * Comprehensive TigerGraph Documentation Scraper
 * 
 * This script fetches all documentation pages from TigerGraph's official sitemaps
 * (versions 4.2, 4.1, and main) and inserts them into Supabase.
 * 
 * Run: node src/data/seedResources.js
 */

const axios = require('axios');
const cheerio = require('cheerio');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Configuration
const SITEMAP_INDEX_URL = 'https://docs.tigergraph.com/sitemap.xml';
const BATCH_SIZE = 10; // Process 10 pages in parallel
const BATCH_DELAY = 500; // 500ms delay between batches
const REQUEST_TIMEOUT = 15000; // 15 second timeout per request
const MAX_RETRIES = 2;

// TigerGraph docs placeholder thumbnail
const DOCS_PLACEHOLDER_THUMBNAIL = 'https://www.tigergraph.com/wp-content/uploads/2023/02/tigergraph-logo-orange.svg';

// Version filter - only include these versions
const ALLOWED_VERSIONS = ['/4.2/', '/4.1/', '/main/', '/current/'];

// Sitemap URLs to process
const SITEMAP_URLS = [
  'https://docs.tigergraph.com/sitemap-tigergraph-server.xml',
  'https://docs.tigergraph.com/sitemap-gsql-ref.xml',
  'https://docs.tigergraph.com/sitemap-gui.xml',
  'https://docs.tigergraph.com/sitemap-pytigergraph.xml',
  'https://docs.tigergraph.com/sitemap-insights.xml',
  'https://docs.tigergraph.com/sitemap-savanna.xml',
  'https://docs.tigergraph.com/sitemap-graph-ml.xml',
  'https://docs.tigergraph.com/sitemap-cloud.xml',
  'https://docs.tigergraph.com/sitemap-graphql.xml',
  'https://docs.tigergraph.com/sitemap-ml-workbench.xml',
  'https://docs.tigergraph.com/sitemap-home.xml'
];

/**
 * Infer skill level from URL path
 */
function inferSkillLevel(url) {
  const urlLower = url.toLowerCase();
  
  // Beginner keywords
  if (urlLower.includes('getting-started') || 
      urlLower.includes('intro') || 
      urlLower.includes('overview') ||
      urlLower.includes('tutorial') ||
      urlLower.includes('basics') ||
      urlLower.includes('quickstart') ||
      urlLower.includes('get-started')) {
    return 'beginner';
  }
  
  // Advanced keywords
  if (urlLower.includes('advanced') || 
      urlLower.includes('optimization') || 
      urlLower.includes('architecture') ||
      urlLower.includes('performance') ||
      urlLower.includes('scaling') ||
      urlLower.includes('cluster') ||
      urlLower.includes('ha-management')) {
    return 'advanced';
  }
  
  // Default to intermediate
  return 'intermediate';
}

/**
 * Infer use cases from URL section
 */
function inferUseCases(url) {
  const useCases = ['documentation'];
  
  if (url.includes('tigergraph-server')) {
    useCases.push('database');
  } else if (url.includes('gsql-ref')) {
    useCases.push('gsql');
  } else if (url.includes('/gui/')) {
    useCases.push('tools');
  } else if (url.includes('pytigergraph')) {
    useCases.push('python', 'api');
  } else if (url.includes('graph-ml')) {
    useCases.push('ai', 'gnn');
  } else if (url.includes('savanna')) {
    useCases.push('cloud');
  } else if (url.includes('insights')) {
    useCases.push('visualization');
  } else if (url.includes('graphql')) {
    useCases.push('api');
  } else if (url.includes('ml-workbench')) {
    useCases.push('ai', 'ml');
  } else if (url.includes('cloud')) {
    useCases.push('cloud');
  }
  
  return useCases;
}

/**
 * Get section name from URL for categorization
 */
function getSectionName(url) {
  if (url.includes('tigergraph-server')) return 'TigerGraph DB';
  if (url.includes('gsql-ref')) return 'GSQL Reference';
  if (url.includes('/gui/')) return 'GraphStudio & Admin';
  if (url.includes('pytigergraph')) return 'pyTigerGraph';
  if (url.includes('graph-ml')) return 'Graph ML';
  if (url.includes('savanna')) return 'Savanna';
  if (url.includes('insights')) return 'Insights';
  if (url.includes('graphql')) return 'GraphQL';
  if (url.includes('ml-workbench')) return 'ML Workbench';
  if (url.includes('cloud')) return 'Cloud';
  if (url.includes('home')) return 'Home';
  return 'General';
}

/**
 * Check if URL should be included based on version
 */
function shouldIncludeUrl(url) {
  // Include URLs that match allowed versions
  for (const version of ALLOWED_VERSIONS) {
    if (url.includes(version)) {
      return true;
    }
  }
  
  // Also include URLs without version numbers (like /home/, /cloud/main/)
  // Check if URL doesn't have any version pattern like /3.10/, /3.11/
  const versionPattern = /\/\d+\.\d+\//;
  if (!versionPattern.test(url)) {
    return true;
  }
  
  return false;
}

/**
 * Fetch and parse a sitemap XML file
 */
async function fetchSitemapUrls(sitemapUrl) {
  try {
    const response = await axios.get(sitemapUrl, { timeout: REQUEST_TIMEOUT });
    const $ = cheerio.load(response.data, { xmlMode: true });
    
    const urls = [];
    $('url loc').each((_, element) => {
      const url = $(element).text().trim();
      if (shouldIncludeUrl(url)) {
        urls.push(url);
      }
    });
    
    return urls;
  } catch (error) {
    console.error(`❌ Error fetching sitemap ${sitemapUrl}:`, error.message);
    return [];
  }
}

/**
 * Fetch page content and extract title/description
 */
async function fetchPageContent(url, retries = 0) {
  try {
    const response = await axios.get(url, {
      timeout: REQUEST_TIMEOUT,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Extract title - try multiple selectors
    let title = $('article h1').first().text().trim() ||
                $('h1').first().text().trim() ||
                $('title').text().replace(' :: TigerGraph Documentation', '').trim() ||
                'TigerGraph Documentation';
    
    // Clean up title
    title = title.replace(/\s+/g, ' ').trim();
    if (title.length > 200) {
      title = title.substring(0, 197) + '...';
    }
    
    // Extract description - try multiple selectors
    let description = $('meta[name="description"]').attr('content') ||
                      $('article p').first().text().trim() ||
                      $('main p').first().text().trim() ||
                      '';
    
    // Clean up description
    description = description.replace(/\s+/g, ' ').trim();
    if (description.length > 500) {
      description = description.substring(0, 497) + '...';
    }
    
    // If no description, generate one from title
    if (!description || description.length < 20) {
      const section = getSectionName(url);
      description = `${section} documentation: ${title}`;
    }
    
    return { title, description };
  } catch (error) {
    if (retries < MAX_RETRIES) {
      await sleep(1000);
      return fetchPageContent(url, retries + 1);
    }
    console.error(`   ⚠️  Failed to fetch ${url}: ${error.message}`);
    return null;
  }
}

/**
 * Sleep utility
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Process a batch of URLs
 */
async function processBatch(urls, startIndex, totalUrls) {
  const results = await Promise.all(
    urls.map(async (url) => {
      const content = await fetchPageContent(url);
      if (!content) return null;
      
      return {
        title: content.title,
        description: content.description,
        type: 'docs',
        skill_level: inferSkillLevel(url),
        use_cases: inferUseCases(url),
        thumbnail: DOCS_PLACEHOLDER_THUMBNAIL,
        url: url,
        duration: null,
        created_at: new Date().toISOString()
      };
    })
  );
  
  return results.filter(Boolean);
}

/**
 * Insert resources into Supabase with deduplication
 */
async function insertResources(resources) {
  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const resource of resources) {
    try {
      // Check if URL already exists
      const { data: existing } = await supabase
        .from('resources')
        .select('id')
        .eq('url', resource.url)
        .single();
      
      if (existing) {
        skipped++;
        continue;
      }
      
      // Insert new resource
      const { error } = await supabase
        .from('resources')
        .insert([resource]);
      
      if (error) {
        console.error(`   ❌ Error inserting "${resource.title}":`, error.message);
        errors++;
      } else {
        inserted++;
      }
    } catch (err) {
      errors++;
    }
  }
  
  return { inserted, skipped, errors };
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting TigerGraph Documentation Scraper...\n');
  console.log('📋 Configuration:');
  console.log(`   - Versions: 4.2, 4.1, main, current`);
  console.log(`   - Batch size: ${BATCH_SIZE}`);
  console.log(`   - Batch delay: ${BATCH_DELAY}ms\n`);
  
  // Step 1: Collect all URLs from sitemaps
  console.log('📥 Fetching URLs from sitemaps...\n');
  
  let allUrls = [];
  for (const sitemapUrl of SITEMAP_URLS) {
    const sitemapName = sitemapUrl.split('/').pop();
    const urls = await fetchSitemapUrls(sitemapUrl);
    console.log(`   ${sitemapName}: ${urls.length} URLs`);
    allUrls = allUrls.concat(urls);
  }
  
  // Remove duplicates
  allUrls = [...new Set(allUrls)];
  console.log(`\n📊 Total unique URLs to process: ${allUrls.length}\n`);
  
  // Step 2: Process URLs in batches
  console.log('📄 Processing documentation pages...\n');
  
  let totalInserted = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  for (let i = 0; i < allUrls.length; i += BATCH_SIZE) {
    const batch = allUrls.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(allUrls.length / BATCH_SIZE);
    
    process.stdout.write(`\r   Processing batch ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + BATCH_SIZE, allUrls.length)}/${allUrls.length})...`);
    
    // Fetch page content for batch
    const resources = await processBatch(batch, i, allUrls.length);
    
    // Insert into database
    const { inserted, skipped, errors } = await insertResources(resources);
    totalInserted += inserted;
    totalSkipped += skipped;
    totalErrors += errors;
    
    // Delay between batches
    if (i + BATCH_SIZE < allUrls.length) {
      await sleep(BATCH_DELAY);
    }
  }
  
  console.log('\n');
  
  // Step 3: Summary
  console.log('='.repeat(50));
  console.log('📊 FINAL SUMMARY');
  console.log('='.repeat(50));
  console.log(`   ✅ Inserted: ${totalInserted}`);
  console.log(`   ⏭️  Skipped:  ${totalSkipped}`);
  console.log(`   ❌ Errors:   ${totalErrors}`);
  console.log('='.repeat(50));
  
  // Verify total count
  const { count } = await supabase
    .from('resources')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📈 Total resources in database: ${count}`);
  
  // Count by type
  const { data: typeCounts } = await supabase
    .from('resources')
    .select('type');
  
  const typeBreakdown = typeCounts.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1;
    return acc;
  }, {});
  
  console.log('\n📊 Resources by type:');
  Object.entries(typeBreakdown).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });
  
  console.log('\n✅ Documentation scraping complete!');
}

// Run the script
main().catch(console.error);
