/**
 * Blog scraper - pulls posts from https://www.tigergraph.com/blog/
 *
 * Uses the WordPress post-sitemap feed for discovery and parses each page
 * for title / description / OpenGraph image. Mirrors the shape used by
 * services/youtube.js so results can be upserted directly into the
 * `resources` table with type='blog'.
 */

const axios = require('axios');
const cheerio = require('cheerio');

const POST_SITEMAPS = [
  'https://www.tigergraph.com/post-sitemap.xml',
  'https://www.tigergraph.com/post-sitemap1.xml',
  'https://www.tigergraph.com/post-sitemap2.xml',
];
const BLOG_URL_PREFIX = 'https://www.tigergraph.com/blog/';
const REQUEST_TIMEOUT = 15000;
const MAX_RETRIES = 2;
const BATCH_SIZE = 8;
const BATCH_DELAY_MS = 400;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, retries = 0) {
  try {
    return await axios.get(url, { timeout: REQUEST_TIMEOUT, headers: { 'User-Agent': UA } });
  } catch (err) {
    if (retries < MAX_RETRIES) {
      await sleep(800);
      return fetchWithRetry(url, retries + 1);
    }
    throw err;
  }
}

async function getBlogUrls() {
  const urls = new Set();
  for (const sitemap of POST_SITEMAPS) {
    try {
      const res = await fetchWithRetry(sitemap);
      const $ = cheerio.load(res.data, { xmlMode: true });
      $('url > loc').each((_, el) => {
        const u = $(el).text().trim();
        if (u.startsWith(BLOG_URL_PREFIX) && u !== BLOG_URL_PREFIX) {
          urls.add(u.replace(/\/$/, ''));
        }
      });
    } catch (err) {
      console.warn(`[blogs] sitemap ${sitemap} unavailable: ${err.message}`);
    }
  }
  return Array.from(urls);
}

function clean(str, max) {
  const s = String(str ?? '').replace(/\s+/g, ' ').trim();
  if (max && s.length > max) return s.substring(0, max - 3) + '...';
  return s;
}

function inferSkillLevel(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  if (/(getting started|intro|basics|beginner|what is|primer)/.test(text)) return 'beginner';
  if (/(advanced|deep dive|architecture|internals|benchmark|performance)/.test(text)) return 'advanced';
  return 'intermediate';
}

function inferUseCases(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  const cases = [];
  if (/(graphrag|rag\b|llm|genai|generative ai|knowledge graph)/.test(text)) cases.push('graphrag');
  if (/(fraud|aml|anti-money|anomaly)/.test(text)) cases.push('fraud-detection');
  if (/(recommend|personali[sz])/.test(text)) cases.push('recommendations');
  if (/(supply chain|logistics)/.test(text)) cases.push('supply-chain');
  if (/(customer 360|c360|customer-360)/.test(text)) cases.push('customer-360');
  if (/(cyber|security|threat)/.test(text)) cases.push('cybersecurity');
  return cases;
}

async function parseBlogPage(url) {
  try {
    const res = await fetchWithRetry(url);
    const $ = cheerio.load(res.data);

    const title = clean(
      $('meta[property="og:title"]').attr('content') ||
        $('article h1').first().text() ||
        $('h1').first().text() ||
        $('title').text().replace(/\|\s*TigerGraph.*$/i, ''),
      200,
    );

    const description = clean(
      $('meta[property="og:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        $('article p').first().text() ||
        '',
      500,
    );

    const thumbnail = clean(
      $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        '',
    );

    const canonical = clean($('link[rel="canonical"]').attr('href') || url);

    if (!title) return null;

    return {
      title,
      description: description || title,
      type: 'blog',
      skill_level: inferSkillLevel(title, description),
      use_cases: inferUseCases(title, description),
      thumbnail: thumbnail || null,
      url: canonical || url,
      duration: null,
      created_at: new Date().toISOString(),
    };
  } catch (err) {
    console.warn(`[blogs] failed to parse ${url}: ${err.message}`);
    return null;
  }
}

/**
 * Fetch and parse all TigerGraph blog posts.
 * Returns an array of objects ready to upsert into the `resources` table.
 */
async function fetchTigerGraphBlogs({ limit } = {}) {
  const urls = await getBlogUrls();
  const targets = limit ? urls.slice(0, limit) : urls;
  console.log(`[blogs] discovered ${urls.length} blog URLs${limit ? ` (processing ${targets.length})` : ''}`);

  const out = [];
  for (let i = 0; i < targets.length; i += BATCH_SIZE) {
    const batch = targets.slice(i, i + BATCH_SIZE);
    const results = await Promise.all(batch.map(parseBlogPage));
    for (const r of results) if (r) out.push(r);
    if (i + BATCH_SIZE < targets.length) await sleep(BATCH_DELAY_MS);
  }
  return out;
}

module.exports = { fetchTigerGraphBlogs };
