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

-- ==================== USER TABLES ====================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User bookmarks table
CREATE TABLE IF NOT EXISTS user_bookmarks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- Enable RLS
ALTER TABLE user_bookmarks ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookmarks
CREATE POLICY "Users can view own bookmarks" ON user_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own bookmarks
CREATE POLICY "Users can insert own bookmarks" ON user_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can delete their own bookmarks
CREATE POLICY "Users can delete own bookmarks" ON user_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON user_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_resource_id ON user_bookmarks(resource_id);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  resource_id UUID REFERENCES resources(id) ON DELETE CASCADE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, resource_id)
);

-- Enable RLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete own progress" ON user_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);

-- ==================== PATHFINDER PROGRESS TRACKING ====================

-- User's saved learning paths
CREATE TABLE IF NOT EXISTS user_learning_paths (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration TEXT,
  experience_level TEXT,
  goal TEXT,
  use_case TEXT,
  milestones JSONB NOT NULL DEFAULT '[]',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_learning_paths ENABLE ROW LEVEL SECURITY;

-- Users can view their own paths
CREATE POLICY "Users can view own paths" ON user_learning_paths
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own paths
CREATE POLICY "Users can insert own paths" ON user_learning_paths
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own paths
CREATE POLICY "Users can update own paths" ON user_learning_paths
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own paths
CREATE POLICY "Users can delete own paths" ON user_learning_paths
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_learning_paths_user_id ON user_learning_paths(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_paths_status ON user_learning_paths(status);

-- Track progress on individual resources within a path
CREATE TABLE IF NOT EXISTS user_path_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  path_id UUID REFERENCES user_learning_paths(id) ON DELETE CASCADE NOT NULL,
  milestone_index INT NOT NULL,
  resource_index INT NOT NULL,
  resource_id UUID REFERENCES resources(id) ON DELETE SET NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(path_id, milestone_index, resource_index)
);

-- Enable RLS
ALTER TABLE user_path_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own progress
CREATE POLICY "Users can view own path progress" ON user_path_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own progress
CREATE POLICY "Users can insert own path progress" ON user_path_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own progress
CREATE POLICY "Users can update own path progress" ON user_path_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own progress
CREATE POLICY "Users can delete own path progress" ON user_path_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_path_progress_user_id ON user_path_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_path_progress_path_id ON user_path_progress(path_id);
CREATE INDEX IF NOT EXISTS idx_user_path_progress_completed ON user_path_progress(completed);

-- Track milestone completion status
CREATE TABLE IF NOT EXISTS user_milestone_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  path_id UUID REFERENCES user_learning_paths(id) ON DELETE CASCADE NOT NULL,
  milestone_index INT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(path_id, milestone_index)
);

-- Enable RLS
ALTER TABLE user_milestone_progress ENABLE ROW LEVEL SECURITY;

-- Users can view their own milestone progress
CREATE POLICY "Users can view own milestone progress" ON user_milestone_progress
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own milestone progress
CREATE POLICY "Users can insert own milestone progress" ON user_milestone_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own milestone progress
CREATE POLICY "Users can update own milestone progress" ON user_milestone_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own milestone progress
CREATE POLICY "Users can delete own milestone progress" ON user_milestone_progress
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_milestone_progress_user_id ON user_milestone_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_milestone_progress_path_id ON user_milestone_progress(path_id);

-- ==================== SEED DATA ====================

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

