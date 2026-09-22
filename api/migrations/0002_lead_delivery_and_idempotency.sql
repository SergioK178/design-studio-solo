ALTER TABLE leads ADD COLUMN price_label TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN delivery_label TEXT NOT NULL DEFAULT '';
ALTER TABLE leads ADD COLUMN submission_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_submission_id ON leads(submission_id) WHERE submission_id IS NOT NULL;
