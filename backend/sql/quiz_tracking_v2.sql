-- ============================================================
-- QUIZ TRACKING SYSTEM V2 - STABILIZATION SCRIPT
-- Run this in your Supabase SQL Editor to ensure all tables 
-- and columns are correctly configured for persistence.
-- ============================================================

-- 1. Ensure public.users exists and has correct columns
CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  total_xp integer NOT NULL DEFAULT 0,
  rank text DEFAULT 'Soldier',
  progress integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Ensure user_streaks exists and has correct columns
CREATE TABLE IF NOT EXISTS public.user_streaks (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_active_date date,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Migration for user_streaks if columns are named differently
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_streaks' AND column_name = 'streak_count') THEN
    ALTER TABLE public.user_streaks RENAME COLUMN streak_count TO current_streak;
  END IF;
END $$;

-- 3. Ensure quiz_progress exists (modern schema)
CREATE TABLE IF NOT EXISTS public.quiz_progress (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level integer NOT NULL,
  quiz integer NOT NULL,
  score integer NOT NULL DEFAULT 0,
  best_score integer NOT NULL DEFAULT 0,
  stars integer NOT NULL DEFAULT 0,
  completed boolean NOT NULL DEFAULT false,
  attempts integer NOT NULL DEFAULT 0,
  unlocked boolean NOT NULL DEFAULT false,
  last_played timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, level, quiz)
);

-- 4. Ensure quiz_attempts exists
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level_id integer NOT NULL,
  quiz_id text NOT NULL,
  score integer NOT NULL,
  correct_answers integer NOT NULL,
  total_questions integer NOT NULL,
  stars integer NOT NULL,
  time_taken integer DEFAULT 0,
  answers jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON public.quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_progress_user_id ON public.quiz_progress(user_id);

-- Enable RLS (Service role will bypass this, but good for safety)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Policies (Simplified - allow users to see/update their own data)
DO $$
BEGIN
  -- Users
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own profile') THEN
    CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
  END IF;
  
  -- Streaks
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own streak') THEN
    CREATE POLICY "Users can view own streak" ON public.user_streaks FOR SELECT USING (auth.uid() = user_id);
  END IF;

  -- Attempts
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own attempts') THEN
    CREATE POLICY "Users can view own attempts" ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;
