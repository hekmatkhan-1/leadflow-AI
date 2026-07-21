-- ============================================================
-- LeadFlow AI — Initial Schema Migration
-- ============================================================
-- Multi-tenant architecture: every table has business_id,
-- RLS enforces strict per-business isolation.
-- ============================================================

-- -----------------------------------------------------------
-- 1. Trigger function: auto-update updated_at on every UPDATE
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------
-- 2. businesses
-- -----------------------------------------------------------
CREATE TABLE businesses (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text        NOT NULL,
  email        text        NOT NULL UNIQUE,
  settings     jsonb       NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE businesses IS 'Each row is a registered business/tenant.';
COMMENT ON COLUMN businesses.settings IS 'Stores: chatbot_greeting, qualification_questions, brand_color, business_hours, contact_info, welcome_message';

CREATE TRIGGER trg_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "businesses_select_own" ON businesses
  FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "businesses_insert_own" ON businesses
  FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "businesses_update_own" ON businesses
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "businesses_delete_own" ON businesses
  FOR DELETE
  USING (id = auth.uid());

-- -----------------------------------------------------------
-- 3. leads
-- -----------------------------------------------------------
CREATE TABLE leads (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id  uuid        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  full_name    text,
  email        text,
  phone        text,
  company      text,
  industry     text,
  budget       text,
  timeline     text,
  requirements text,
  lead_score   integer     NOT NULL DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  status       text        NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'closed')),
  source       text        NOT NULL DEFAULT 'chatbot',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE leads IS 'Qualified leads captured by the chatbot.';
COMMENT ON COLUMN leads.budget IS 'e.g. <$1K, $1K-$5K, $5K-$20K, $20K+';
COMMENT ON COLUMN leads.timeline IS 'e.g. immediately, 1-3 months, 3-6 months, 6+ months';

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_leads_business_id  ON leads(business_id);
CREATE INDEX idx_leads_lead_score   ON leads(lead_score);
CREATE INDEX idx_leads_status       ON leads(status);
CREATE INDEX idx_leads_created_at   ON leads(created_at);

-- RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_select_own" ON leads
  FOR SELECT
  USING (business_id = auth.uid());

CREATE POLICY "leads_insert_own" ON leads
  FOR INSERT
  WITH CHECK (business_id = auth.uid());

CREATE POLICY "leads_update_own" ON leads
  FOR UPDATE
  USING (business_id = auth.uid())
  WITH CHECK (business_id = auth.uid());

CREATE POLICY "leads_delete_own" ON leads
  FOR DELETE
  USING (business_id = auth.uid());

-- -----------------------------------------------------------
-- 4. conversations
-- -----------------------------------------------------------
CREATE TABLE conversations (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id      uuid        REFERENCES leads(id) ON DELETE SET NULL,
  business_id  uuid        NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  visitor_id   text        NOT NULL,
  messages     jsonb       NOT NULL DEFAULT '[]',
  status       text        NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'transferred')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE conversations IS 'Chatbot conversation sessions.';
COMMENT ON COLUMN conversations.messages IS 'Array of {role, content, timestamp} objects';
COMMENT ON COLUMN conversations.lead_id IS 'Set once a lead is captured from the conversation';

CREATE TRIGGER trg_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_conversations_business_id ON conversations(business_id);
CREATE INDEX idx_conversations_lead_id     ON conversations(lead_id);

-- RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select_own" ON conversations
  FOR SELECT
  USING (business_id = auth.uid());

CREATE POLICY "conversations_insert_own" ON conversations
  FOR INSERT
  WITH CHECK (business_id = auth.uid());

CREATE POLICY "conversations_update_own" ON conversations
  FOR UPDATE
  USING (business_id = auth.uid())
  WITH CHECK (business_id = auth.uid());

CREATE POLICY "conversations_delete_own" ON conversations
  FOR DELETE
  USING (business_id = auth.uid());
