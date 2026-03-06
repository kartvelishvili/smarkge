-- =====================================================
-- Supabase SQL: Create page_content table
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Create the page_content table
CREATE TABLE IF NOT EXISTS page_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_key TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE page_content ENABLE ROW LEVEL SECURITY;

-- Public read access (anyone can view page content)
CREATE POLICY "Public read access" ON page_content
  FOR SELECT USING (true);

-- Authenticated users can insert
CREATE POLICY "Auth insert" ON page_content
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Authenticated users can update
CREATE POLICY "Auth update" ON page_content
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Authenticated users can delete
CREATE POLICY "Auth delete" ON page_content
  FOR DELETE USING (auth.role() = 'authenticated');

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE page_content;

-- Create index on page_key for fast lookups
CREATE INDEX IF NOT EXISTS idx_page_content_page_key ON page_content(page_key);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_page_content_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_page_content_timestamp
  BEFORE UPDATE ON page_content
  FOR EACH ROW
  EXECUTE FUNCTION update_page_content_timestamp();
