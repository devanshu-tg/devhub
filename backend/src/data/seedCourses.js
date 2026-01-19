/**
 * One-time script to scrape TigerGraph University courses from Teachable
 * and insert them into the Supabase resources table.
 * 
 * Run: node src/data/seedCourses.js
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

const TEACHABLE_URL = 'https://tigergraph-university.teachable.com/l/products';
const BASE_URL = 'https://tigergraph-university.teachable.com';

/**
 * Infer skill level from course title
 */
function inferSkillLevel(title) {
  const lowerTitle = title.toLowerCase();
  
  // Advanced indicators
  if (lowerTitle.includes('advanced') || 
      lowerTitle.includes('machine learning') ||
      lowerTitle.includes('data science') ||
      lowerTitle.includes('algorithms')) {
    return 'advanced';
  }
  
  // Intermediate indicators
  if (lowerTitle.includes('certification') ||
      lowerTitle.includes('administration') ||
      lowerTitle.includes('analytics')) {
    return 'intermediate';
  }
  
  // Default to beginner for intro, fundamentals, basics
  return 'beginner';
}

/**
 * Infer use cases from course title
 */
function inferUseCases(title) {
  const lowerTitle = title.toLowerCase();
  const useCases = ['learning'];
  
  if (lowerTitle.includes('certification')) {
    useCases.push('certification');
  }
  if (lowerTitle.includes('machine learning') || lowerTitle.includes('ml')) {
    useCases.push('gnn');
  }
  
  return useCases;
}

/**
 * Scrape courses from TigerGraph University
 */
async function scrapeCourses() {
  console.log('🔍 Fetching TigerGraph University courses...');
  
  try {
    const response = await axios.get(TEACHABLE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const courses = [];
    
    // Find all course cards - they are links with product info
    $('a[href^="/p/"]').each((index, element) => {
      const $card = $(element);
      const href = $card.attr('href');
      
      // Skip if not a product link
      if (!href || !href.startsWith('/p/')) return;
      
      // Extract title from h2
      const title = $card.find('h2').first().text().trim();
      if (!title) return;
      
      // Extract description from paragraph (skip the "Course•By TigerGraph" text)
      let description = '';
      $card.find('p').each((i, p) => {
        const text = $(p).text().trim();
        if (text && !text.includes('Course•By') && !text.includes('By TigerGraph')) {
          description = text;
          return false; // break
        }
      });
      
      // Extract thumbnail
      const thumbnail = $card.find('img').first().attr('src') || null;
      
      // Build full URL
      const url = `${BASE_URL}${href}`;
      
      // Check for duplicates in our array
      if (courses.some(c => c.url === url)) return;
      
      courses.push({
        title,
        description: description || `Learn ${title} with TigerGraph University's free online course.`,
        type: 'tutorial',
        skill_level: inferSkillLevel(title),
        use_cases: inferUseCases(title),
        thumbnail,
        url,
        duration: null,
        created_at: new Date().toISOString()
      });
    });
    
    console.log(`📚 Found ${courses.length} courses`);
    return courses;
    
  } catch (error) {
    console.error('❌ Error scraping courses:', error.message);
    throw error;
  }
}

/**
 * Insert courses into Supabase
 */
async function insertCourses(courses) {
  console.log(`📦 Inserting ${courses.length} courses into database...`);
  
  let inserted = 0;
  let skipped = 0;
  let errors = 0;
  
  for (const course of courses) {
    try {
      // Check if course already exists by URL
      const { data: existing } = await supabase
        .from('resources')
        .select('id')
        .eq('url', course.url)
        .single();
      
      if (existing) {
        console.log(`⏭️  Skipping (exists): ${course.title}`);
        skipped++;
        continue;
      }
      
      // Insert new course
      const { error } = await supabase
        .from('resources')
        .insert([course]);
      
      if (error) {
        console.error(`❌ Error inserting "${course.title}":`, error.message);
        errors++;
      } else {
        console.log(`✅ Inserted: ${course.title}`);
        inserted++;
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (err) {
      console.error(`❌ Error processing "${course.title}":`, err.message);
      errors++;
    }
  }
  
  return { inserted, skipped, errors };
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting TigerGraph University course scraper...\n');
  
  try {
    // Scrape courses
    const courses = await scrapeCourses();
    
    if (courses.length === 0) {
      console.log('⚠️  No courses found. The page structure may have changed.');
      process.exit(1);
    }
    
    // Show what we found
    console.log('\n📋 Courses to insert:');
    courses.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.title} (${c.skill_level})`);
    });
    console.log('');
    
    // Insert into database
    const results = await insertCourses(courses);
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`   ✅ Inserted: ${results.inserted}`);
    console.log(`   ⏭️  Skipped:  ${results.skipped}`);
    console.log(`   ❌ Errors:   ${results.errors}`);
    console.log('='.repeat(50));
    
    // Verify total count
    const { count } = await supabase
      .from('resources')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n📈 Total resources in database: ${count}`);
    
  } catch (error) {
    console.error('❌ Script failed:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
