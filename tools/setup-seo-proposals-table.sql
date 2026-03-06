-- SEO Proposals table for audit workflow
CREATE TABLE IF NOT EXISTS seo_proposals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('technical', 'content', 'performance', 'accessibility', 'structured-data')),
  page TEXT NOT NULL,
  issue TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
  impact TEXT NOT NULL CHECK (impact IN ('high', 'medium', 'low')),
  technical_change TEXT NOT NULL,
  visual_change_required BOOLEAN DEFAULT false,
  visual_options JSONB DEFAULT '[]'::jsonb,
  expected_seo_impact TEXT NOT NULL,
  eta_days INTEGER DEFAULT 1,
  risk TEXT DEFAULT 'low' CHECK (risk IN ('low', 'medium', 'high')),
  rollback_plan TEXT DEFAULT '',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'awaiting_approval', 'approved', 'rejected', 'implemented')),
  phase TEXT DEFAULT '30' CHECK (phase IN ('30', '60', '90')),
  admin_notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE seo_proposals ENABLE ROW LEVEL SECURITY;

-- Policy: allow all for authenticated users (admin panel)
CREATE POLICY "seo_proposals_all_authenticated" ON seo_proposals
  FOR ALL USING (auth.role() = 'authenticated');

-- Policy: allow read for anon (for potential public dashboard)
CREATE POLICY "seo_proposals_read_anon" ON seo_proposals
  FOR SELECT USING (true);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_seo_proposals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_seo_proposals_updated_at
  BEFORE UPDATE ON seo_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_seo_proposals_updated_at();

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

SELECT 'seo_proposals table created successfully' AS result;
