-- KidsWoertli Database Schema
-- Complete initialization with RLS policies

-- 1. PROFILES TABLE (User & Admin)
CREATE TABLE IF NOT EXISTS profiles (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  vorname VARCHAR(50) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. FLASHCARDS TABLE (Vocabulary pairs)
CREATE TABLE IF NOT EXISTS flashcards (
  id BIGSERIAL PRIMARY KEY,
  profile_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  language_a VARCHAR(2) NOT NULL DEFAULT 'de',
  text_a TEXT NOT NULL,
  language_b VARCHAR(2) NOT NULL,
  text_b TEXT NOT NULL,
  source_image_url TEXT,
  confidence FLOAT DEFAULT 0.95,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. LEARNING_PROGRESS TABLE
CREATE TABLE IF NOT EXISTS learning_progress (
  id BIGSERIAL PRIMARY KEY,
  profile_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  flashcard_id BIGINT NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
  correct_count INT DEFAULT 0,
  incorrect_count INT DEFAULT 0,
  last_practiced TIMESTAMP,
  mastered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id, flashcard_id)
);

-- 4. APP_SETTINGS TABLE
CREATE TABLE IF NOT EXISTS app_settings (
  id BIGSERIAL PRIMARY KEY,
  profile_id BIGINT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  anthropic_api_key VARCHAR(255),
  language_pair VARCHAR(10) DEFAULT 'de-fr',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(profile_id)
);

-- 5. ROW LEVEL SECURITY (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can see all profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (TRUE);

-- Flashcards: Users can only access their own
CREATE POLICY "flashcards_select" ON flashcards FOR SELECT USING (profile_id = auth.uid()::bigint);
CREATE POLICY "flashcards_insert" ON flashcards FOR INSERT WITH CHECK (profile_id = auth.uid()::bigint);
CREATE POLICY "flashcards_update" ON flashcards FOR UPDATE USING (profile_id = auth.uid()::bigint);
CREATE POLICY "flashcards_delete" ON flashcards FOR DELETE USING (profile_id = auth.uid()::bigint);

-- Learning Progress: Users can only access their own
CREATE POLICY "progress_select" ON learning_progress FOR SELECT USING (profile_id = auth.uid()::bigint);
CREATE POLICY "progress_insert" ON learning_progress FOR INSERT WITH CHECK (profile_id = auth.uid()::bigint);
CREATE POLICY "progress_update" ON learning_progress FOR UPDATE USING (profile_id = auth.uid()::bigint);

-- App Settings: Users can only access their own
CREATE POLICY "settings_select" ON app_settings FOR SELECT USING (profile_id = auth.uid()::bigint);
CREATE POLICY "settings_insert" ON app_settings FOR INSERT WITH CHECK (profile_id = auth.uid()::bigint);
CREATE POLICY "settings_update" ON app_settings FOR UPDATE USING (profile_id = auth.uid()::bigint);

-- 6. INDEXES
CREATE INDEX idx_flashcards_profile ON flashcards(profile_id);
CREATE INDEX idx_flashcards_language ON flashcards(language_a, language_b);
CREATE INDEX idx_progress_profile ON learning_progress(profile_id);
CREATE INDEX idx_progress_mastered ON learning_progress(mastered);
CREATE INDEX idx_settings_profile ON app_settings(profile_id);
