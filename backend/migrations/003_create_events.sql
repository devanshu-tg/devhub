-- Migration: Create events tables
-- Purpose: Power the /events feature (upcoming + past + hackathon detail + gallery)
-- Run this in Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  italic_accent TEXT,
  type TEXT NOT NULL CHECK (type IN ('webinar','meetup','hackathon','study','qa','blog')),
  status TEXT NOT NULL CHECK (status IN ('upcoming','past')),
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  location TEXT,
  description TEXT,
  cover_image TEXT,
  cover_tone TEXT DEFAULT 'orange',
  stats JSONB DEFAULT '{}'::jsonb,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_starts_at ON events(starts_at);
CREATE INDEX IF NOT EXISTS idx_events_featured ON events(featured);

CREATE TABLE IF NOT EXISTS event_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  url TEXT,
  caption TEXT,
  tone TEXT DEFAULT 'warm',
  span TEXT DEFAULT 'default' CHECK (span IN ('hero','wide','default')),
  sort_order INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_event_photos_event ON event_photos(event_id, sort_order);

CREATE TABLE IF NOT EXISTS hackathon_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  place TEXT,
  name TEXT NOT NULL,
  team TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  prize TEXT,
  image_url TEXT,
  repo_url TEXT,
  sort_order INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_hackathon_projects_event ON hackathon_projects(event_id, sort_order);

CREATE TABLE IF NOT EXISTS event_sponsors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  url TEXT,
  sort_order INT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_event_sponsors_event ON event_sponsors(event_id, sort_order);

CREATE TABLE IF NOT EXISTS event_rsvps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON event_rsvps(event_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_user ON event_rsvps(user_id);

-- RLS: public read on events + children, authenticated users manage their own RSVPs.
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE hackathon_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "events public read" ON events;
CREATE POLICY "events public read" ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "event_photos public read" ON event_photos;
CREATE POLICY "event_photos public read" ON event_photos FOR SELECT USING (true);

DROP POLICY IF EXISTS "hackathon_projects public read" ON hackathon_projects;
CREATE POLICY "hackathon_projects public read" ON hackathon_projects FOR SELECT USING (true);

DROP POLICY IF EXISTS "event_sponsors public read" ON event_sponsors;
CREATE POLICY "event_sponsors public read" ON event_sponsors FOR SELECT USING (true);

DROP POLICY IF EXISTS "event_rsvps owner access" ON event_rsvps;
CREATE POLICY "event_rsvps owner access" ON event_rsvps
  FOR ALL USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
