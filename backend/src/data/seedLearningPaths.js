/**
 * Seed learning_paths table with Pathfinder path templates.
 * Run once after initial Supabase setup. Safe to re-run (skips if paths exist).
 *
 * Run: node src/data/seedLearningPaths.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const PATH_TEMPLATES = [
  {
    title: 'Graph Database Fundamentals',
    description: 'A gentle introduction to graph databases and TigerGraph for complete beginners.',
    duration: '2 weeks',
    experience_level: 'none',
    goal: 'learn',
    use_case: 'general',
    milestones: [
      { week: 1, title: 'Understanding Graphs', description: 'Learn what graphs are and why they matter', topics: ['general'], skillLevel: 'beginner', resourceCount: 3 },
      { week: 2, title: 'First Steps with GSQL', description: 'Write your first graph queries', topics: ['gsql'], skillLevel: 'beginner', resourceCount: 3 },
    ],
  },
  {
    title: 'SQL Developer → Fraud Detection Engineer',
    description: 'Transition from SQL to graph-based fraud detection with TigerGraph.',
    duration: '4 weeks',
    experience_level: 'some',
    goal: 'build',
    use_case: 'fraud',
    milestones: [
      { week: 1, title: 'Graph Thinking for SQL Devs', description: 'Translate your SQL knowledge to graph concepts', topics: ['schema', 'general'], skillLevel: 'beginner', resourceCount: 3 },
      { week: 2, title: 'GSQL for Pattern Detection', description: 'Learn to find patterns in connected data', topics: ['gsql'], skillLevel: 'intermediate', resourceCount: 3 },
      { week: 3, title: 'Fraud Detection Patterns', description: 'Common fraud patterns and how to detect them', topics: ['fraud'], skillLevel: 'intermediate', resourceCount: 3 },
      { week: 4, title: 'Production Deployment', description: 'Deploy and scale your fraud detection system', topics: ['cloud'], skillLevel: 'intermediate', resourceCount: 3 },
    ],
  },
  {
    title: 'GraphRAG Practitioner Path',
    description: 'Build knowledge graphs for Retrieval-Augmented Generation with LLMs.',
    duration: '3 weeks',
    experience_level: 'intermediate',
    goal: 'build',
    use_case: 'graphrag',
    milestones: [
      { week: 1, title: 'Knowledge Graph Fundamentals', description: 'Design knowledge graphs for AI applications', topics: ['graphrag', 'schema'], skillLevel: 'intermediate', resourceCount: 3 },
      { week: 2, title: 'RAG Pipeline Design', description: 'Connect your graph to LLMs', topics: ['graphrag'], skillLevel: 'intermediate', resourceCount: 3 },
      { week: 3, title: 'Advanced GraphRAG', description: 'Optimize and scale your GraphRAG system', topics: ['graphrag', 'cloud'], skillLevel: 'advanced', resourceCount: 3 },
    ],
  },
  {
    title: 'Recommendation Systems Fundamentals',
    description: 'Learn to build personalized recommendation engines with graph databases.',
    duration: '3 weeks',
    experience_level: 'none',
    goal: 'learn',
    use_case: 'recommendations',
    milestones: [
      { week: 1, title: 'Graph Basics for Recommendations', description: 'Understanding user-item graphs', topics: ['general', 'schema'], skillLevel: 'beginner', resourceCount: 3 },
      { week: 2, title: 'Collaborative Filtering', description: 'Build your first recommendation query', topics: ['recommendations', 'gsql'], skillLevel: 'intermediate', resourceCount: 3 },
      { week: 3, title: 'Production Recommendations', description: 'Scale and deploy your system', topics: ['recommendations', 'cloud'], skillLevel: 'intermediate', resourceCount: 3 },
    ],
  },
  {
    title: 'TigerGraph Explorer Path',
    description: 'A balanced introduction to TigerGraph for developers of all backgrounds.',
    duration: '3 weeks',
    experience_level: 'none',
    goal: 'learn',
    use_case: 'general',
    milestones: [
      { week: 1, title: 'Getting Started', description: 'Set up your environment and learn the basics', topics: ['general'], skillLevel: 'beginner', resourceCount: 3 },
      { week: 2, title: 'Core Concepts', description: 'Master the fundamentals of GSQL', topics: ['gsql'], skillLevel: 'beginner', resourceCount: 3 },
      { week: 3, title: 'Build Something Real', description: 'Apply your skills to a real project', topics: ['general'], skillLevel: 'intermediate', resourceCount: 3 },
    ],
  },
];

async function main() {
  console.log('🚀 Seeding learning_paths for Pathfinder...\n');

  const { data: existing } = await supabase.from('learning_paths').select('id').limit(1);
  if (existing && existing.length > 0) {
    console.log('⏭️  learning_paths already has data. Skipping seed.');
    process.exit(0);
  }

  const { data, error } = await supabase.from('learning_paths').insert(PATH_TEMPLATES).select();

  if (error) {
    console.error('❌ Error seeding learning_paths:', error.message);
    process.exit(1);
  }

  console.log(`✅ Inserted ${data.length} path templates`);
  data.forEach((p, i) => console.log(`   ${i + 1}. ${p.title}`));
  console.log('\n✅ Pathfinder learning paths seed complete!');
}

main().catch(console.error);
