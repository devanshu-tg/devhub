-- Migration: Create user_tigergraph_connections table
-- Purpose: Store encrypted TigerGraph connection credentials for GSQL AI Pro MCP integration
-- Run this in Supabase SQL Editor if the table doesn't exist

-- Create table for storing user TigerGraph connections
CREATE TABLE IF NOT EXISTS user_tigergraph_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default',
  host TEXT NOT NULL,
  restpp_port INTEGER DEFAULT 443,
  gsql_port INTEGER DEFAULT 443,
  secret_encrypted TEXT NOT NULL,
  graph_name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Enable Row Level Security
ALTER TABLE user_tigergraph_connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DROP POLICY IF EXISTS "Users can view own connections" ON user_tigergraph_connections;
DROP POLICY IF EXISTS "Users can insert own connections" ON user_tigergraph_connections;
DROP POLICY IF EXISTS "Users can update own connections" ON user_tigergraph_connections;
DROP POLICY IF EXISTS "Users can delete own connections" ON user_tigergraph_connections;

-- RLS policies: Users can only manage their own connections
CREATE POLICY "Users can view own connections" ON user_tigergraph_connections
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own connections" ON user_tigergraph_connections
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own connections" ON user_tigergraph_connections
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own connections" ON user_tigergraph_connections
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_tigergraph_connections_user_id ON user_tigergraph_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tigergraph_connections_active ON user_tigergraph_connections(user_id, is_active) WHERE is_active = true;
