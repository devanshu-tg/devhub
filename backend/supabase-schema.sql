-- TigerGraph DevHub Database Schema for Supabase
-- Run this in your Supabase SQL Editor to create the tables

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('video', 'tutorial', 'docs', 'blog')),
  skill_level TEXT NOT NULL CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
  use_cases TEXT[] DEFAULT '{}',
  thumbnail TEXT,
  url TEXT NOT NULL,
  duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_resources_skill_level ON resources(skill_level);
CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);
CREATE INDEX IF NOT EXISTS idx_resources_created_at ON resources(created_at DESC);

-- Enable Row Level Security (optional, for public read access)
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Policy to allow public read access
CREATE POLICY "Allow public read access" ON resources
  FOR SELECT USING (true);

-- Policy to allow authenticated insert/update/delete (optional)
CREATE POLICY "Allow authenticated modifications" ON resources
  FOR ALL USING (auth.role() = 'authenticated');

-- Learning paths table (for Pathfinder feature)
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  experience_level TEXT,
  goal TEXT,
  use_case TEXT,
  milestones JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat history table (optional, for saving conversations)
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  citations JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_session ON chat_history(session_id);

-- Seed data for resources
INSERT INTO resources (title, description, type, skill_level, use_cases, thumbnail, url, duration) VALUES
  ('Getting Started with TigerGraph', 'A comprehensive introduction to TigerGraph, covering installation, basic concepts, and your first graph.', 'tutorial', 'beginner', ARRAY['general'], 'https://i.ytimg.com/vi/JjQI5N-KQS4/maxresdefault.jpg', 'https://docs.tigergraph.com/getting-started', '30 min'),
  ('GSQL 101 - Pattern Matching', 'Learn the fundamentals of GSQL pattern matching to traverse and query your graph data effectively.', 'video', 'beginner', ARRAY['general'], 'https://i.ytimg.com/vi/him2Uy3Nn7Y/maxresdefault.jpg', 'https://www.youtube.com/watch?v=him2Uy3Nn7Y', '45 min'),
  ('Fraud Detection with Graph Analytics', 'Build a real-time fraud detection system using TigerGraph powerful graph algorithms.', 'tutorial', 'intermediate', ARRAY['fraud'], 'https://i.ytimg.com/vi/JjQI5N-KQS4/maxresdefault.jpg', 'https://docs.tigergraph.com/fraud-detection', '2 hours'),
  ('GraphRAG Implementation Guide', 'Implement Retrieval-Augmented Generation using TigerGraph as your knowledge graph backend.', 'blog', 'advanced', ARRAY['graphrag'], 'https://i.ytimg.com/vi/JjQI5N-KQS4/maxresdefault.jpg', 'https://www.tigergraph.com/blog/graphrag', '1 hour'),
  ('Building Recommendation Engines', 'Create personalized recommendation systems using collaborative filtering on graphs.', 'video', 'intermediate', ARRAY['recommendations'], 'https://i.ytimg.com/vi/JjQI5N-KQS4/maxresdefault.jpg', 'https://www.youtube.com/watch?v=recommendations', '1.5 hours'),
  ('TigerGraph Cloud Quickstart', 'Get up and running with TigerGraph Cloud in minutes. No installation required.', 'docs', 'beginner', ARRAY['general'], 'https://i.ytimg.com/vi/JjQI5N-KQS4/maxresdefault.jpg', 'https://docs.tigergraph.com/cloud', '15 min'),
  ('Graph Data Modeling Best Practices', 'Learn how to design efficient graph schemas for your use case.', 'tutorial', 'intermediate', ARRAY['general'], 'https://i.ytimg.com/vi/JjQI5N-KQS4/maxresdefault.jpg', 'https://docs.tigergraph.com/data-modeling', '1 hour'),
  ('Real-time Analytics with TigerGraph', 'Explore streaming data ingestion and real-time graph analytics.', 'video', 'advanced', ARRAY['general'], 'https://i.ytimg.com/vi/JjQI5N-KQS4/maxresdefault.jpg', 'https://www.youtube.com/watch?v=realtime', '1 hour')
ON CONFLICT DO NOTHING;

