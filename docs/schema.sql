CREATE TABLE incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('POS Issue', 'Delivery Delay', 'Inventory', 'Kitchen Equipment', 'Customer Complaint', 'Other')),
  store_location TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved', 'Closed')),
  reported_by TEXT,
  ai_summary TEXT,
  occurred_at TIMESTAMPTZ NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_incidents_category ON incidents(category);
CREATE INDEX idx_incidents_severity ON incidents(severity);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON incidents FOR ALL USING (true);

-- Users Table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- SHA256 hashed password
  role TEXT NOT NULL CHECK (role IN ('Staff', 'Manager')),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON users FOR ALL USING (true);

-- Seed default user accounts (passwords: manager123 / staff123)
INSERT INTO users (email, password, role, name) VALUES
  ('manager@incidentiq.com', '866485796cfa8d7c0cf7111640205b83076433547577511d81f8030ae99ecea5', 'Manager', 'Alice Manager'),
  ('staff@incidentiq.com', '10176e7b7b24d317acfcf8d2064cfd2f24e154f7b5a96603077d5ef813d6a6b6', 'Staff', 'Bob Staff');

-- Storage Bucket configuration for Incident attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('incident-attachments', 'incident-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Public access policies for uploading and reading attachments
CREATE POLICY "Allow public upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'incident-attachments');
CREATE POLICY "Allow public read" ON storage.objects FOR SELECT USING (bucket_id = 'incident-attachments');

-- Notifications Table
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'warning', 'success', 'error')),
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON notifications FOR ALL USING (true);



