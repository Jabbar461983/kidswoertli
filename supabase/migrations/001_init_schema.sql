-- Create custom users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create learning_media table
CREATE TABLE IF NOT EXISTS public.learning_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  language VARCHAR(2) NOT NULL CHECK (language IN ('fr', 'en')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create cards table
CREATE TABLE IF NOT EXISTS public.cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medium_id UUID NOT NULL REFERENCES public.learning_media (id) ON DELETE CASCADE,
  page INTEGER NOT NULL,
  chapter TEXT,
  german TEXT NOT NULL,
  foreign TEXT NOT NULL,
  language VARCHAR(2) NOT NULL CHECK (language IN ('fr', 'en')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create learning_sessions table
CREATE TABLE IF NOT EXISTS public.learning_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users (id) ON DELETE CASCADE,
  medium_id UUID NOT NULL REFERENCES public.learning_media (id) ON DELETE CASCADE,
  language VARCHAR(2) NOT NULL CHECK (language IN ('fr', 'en')),
  selected_pages INTEGER[] NOT NULL DEFAULT '{}',
  selected_chapters TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create card_results table
CREATE TABLE IF NOT EXISTS public.card_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.learning_sessions (id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.cards (id) ON DELETE CASCADE,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create error_rounds table
CREATE TABLE IF NOT EXISTS public.error_rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.learning_sessions (id) ON DELETE CASCADE,
  round_number INTEGER NOT NULL,
  cards JSONB NOT NULL,
  correct_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_learning_media_user_id ON public.learning_media (user_id);
CREATE INDEX idx_cards_medium_id ON public.cards (medium_id);
CREATE INDEX idx_cards_page ON public.cards (page);
CREATE INDEX idx_learning_sessions_user_id ON public.learning_sessions (user_id);
CREATE INDEX idx_learning_sessions_medium_id ON public.learning_sessions (medium_id);
CREATE INDEX idx_card_results_session_id ON public.card_results (session_id);
CREATE INDEX idx_card_results_card_id ON public.card_results (card_id);
CREATE INDEX idx_error_rounds_session_id ON public.error_rounds (session_id);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_rounds ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view their own media" ON public.learning_media
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own media" ON public.learning_media
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own media" ON public.learning_media
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own media" ON public.learning_media
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "Users can view cards from their media" ON public.cards
  FOR SELECT USING (medium_id IN (
    SELECT id FROM public.learning_media WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert cards into their media" ON public.cards
  FOR INSERT WITH CHECK (medium_id IN (
    SELECT id FROM public.learning_media WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update cards in their media" ON public.cards
  FOR UPDATE USING (medium_id IN (
    SELECT id FROM public.learning_media WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete cards in their media" ON public.cards
  FOR DELETE USING (medium_id IN (
    SELECT id FROM public.learning_media WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view their sessions" ON public.learning_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create sessions" ON public.learning_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view results from their sessions" ON public.card_results
  FOR SELECT USING (session_id IN (
    SELECT id FROM public.learning_sessions WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert results to their sessions" ON public.card_results
  FOR INSERT WITH CHECK (session_id IN (
    SELECT id FROM public.learning_sessions WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can view error rounds from their sessions" ON public.error_rounds
  FOR SELECT USING (session_id IN (
    SELECT id FROM public.learning_sessions WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can create error rounds" ON public.error_rounds
  FOR INSERT WITH CHECK (session_id IN (
    SELECT id FROM public.learning_sessions WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete error rounds" ON public.error_rounds
  FOR DELETE USING (session_id IN (
    SELECT id FROM public.learning_sessions WHERE user_id = auth.uid()
  ));
