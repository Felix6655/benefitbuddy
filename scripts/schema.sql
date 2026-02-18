-- =====================================================
-- BenefitBuddy Database Schema
-- For Supabase (PostgreSQL) or reference for MongoDB
-- =====================================================

-- =====================================================
-- LEADS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    first_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    phone_normalized TEXT,
    zip TEXT NOT NULL,
    consent BOOLEAN DEFAULT TRUE,
    source TEXT DEFAULT 'benefitbuddy',
    answers JSONB DEFAULT '{}',
    assigned_advisor_id UUID REFERENCES advisors(id),
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'assigned', 'contacted', 'closed', 'converted')),
    call_status TEXT CHECK (call_status IN ('queued', 'calling', 'answered', 'voicemail', 'failed', NULL)),
    sms_status TEXT CHECK (sms_status IN ('queued', 'sent', 'delivered', 'failed', NULL)),
    advisor_sms_status TEXT,
    advisor_sms_sid TEXT,
    advisor_sms_error TEXT,
    lead_sms_status TEXT,
    lead_sms_sid TEXT,
    lead_sms_error TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_advisor ON leads(assigned_advisor_id);
CREATE INDEX IF NOT EXISTS idx_leads_zip ON leads(zip);

-- =====================================================
-- ADVISORS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS advisors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    zip_prefixes TEXT[] DEFAULT '{}',
    active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_advisors_active ON advisors(active);
CREATE INDEX IF NOT EXISTS idx_advisors_default ON advisors(is_default);
CREATE INDEX IF NOT EXISTS idx_advisors_zip_prefixes ON advisors USING GIN(zip_prefixes);

-- =====================================================
-- SAMPLE DATA (Optional)
-- =====================================================

-- Insert a default advisor (replace with real values)
INSERT INTO advisors (name, phone, email, zip_prefixes, active, is_default)
VALUES 
    ('Default Advisor', '+15551234567', 'advisor@example.com', ARRAY['90', '91', '92'], true, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- USEFUL QUERIES
-- =====================================================

-- Find advisor by ZIP prefix
-- SELECT * FROM advisors 
-- WHERE active = true 
-- AND (zip_prefixes && ARRAY['90']) 
-- ORDER BY is_default DESC 
-- LIMIT 1;

-- Get leads summary
-- SELECT status, COUNT(*) as count 
-- FROM leads 
-- GROUP BY status;

-- Get leads by advisor
-- SELECT l.*, a.name as advisor_name 
-- FROM leads l 
-- LEFT JOIN advisors a ON l.assigned_advisor_id = a.id 
-- ORDER BY l.created_at DESC;
