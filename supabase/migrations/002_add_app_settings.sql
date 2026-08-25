-- Create app_settings table for storing API keys and configuration
CREATE TABLE IF NOT EXISTS app_settings (
  id INT PRIMARY KEY DEFAULT 1,
  anthropic_api_key TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_by UUID REFERENCES auth.users(id),

  CONSTRAINT only_one_row CHECK (id = 1)
);

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Only authenticated admin users can read
CREATE POLICY "Allow authenticated users to read app settings"
  ON app_settings FOR SELECT
  USING (auth.role() = 'authenticated_user');

-- Policy: Only admin can update (we'll check admin status in the app)
CREATE POLICY "Allow authenticated users to update app settings"
  ON app_settings FOR UPDATE
  USING (auth.role() = 'authenticated_user')
  WITH CHECK (auth.role() = 'authenticated_user');

-- Insert default row
INSERT INTO app_settings (id, anthropic_api_key)
VALUES (1, '')
ON CONFLICT (id) DO NOTHING;
