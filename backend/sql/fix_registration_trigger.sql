-- ============================================================
-- FIX: "Database error saving new user" (AuthApiError 500)
-- Run this entire script in your Supabase SQL Editor.
-- ============================================================

-- STEP 1: Ensure public.users table exists with the correct schema
-- (this is the table the trigger will populate)
CREATE TABLE IF NOT EXISTS public.users (
  id        uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email     text,
  full_name text,
  total_xp  integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- STEP 2: Enable RLS on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow users to read/update their own row
DROP POLICY IF EXISTS "Users can view own profile"  ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- STEP 3: Reconcile user_streaks column names.
-- quiz_app_schema.sql uses "streak_count"; user_streaks_setup.sql uses "current_streak".
-- We standardise on "current_streak" (rename if the old column exists).
DO $$
BEGIN
  -- Rename streak_count → current_streak if present
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'user_streaks'
      AND column_name  = 'streak_count'
  ) THEN
    ALTER TABLE public.user_streaks RENAME COLUMN streak_count TO current_streak;
  END IF;

  -- Add current_streak if neither column exists yet
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'user_streaks'
      AND column_name  = 'current_streak'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN current_streak integer NOT NULL DEFAULT 0;
  END IF;

  -- Add longest_streak if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name   = 'user_streaks'
      AND column_name  = 'longest_streak'
  ) THEN
    ALTER TABLE public.user_streaks ADD COLUMN longest_streak integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- STEP 4: Drop any existing (possibly broken) trigger + function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- STEP 5: Create the clean trigger function
-- This safely initialises both public.users and public.user_streaks
-- for every new sign-up without touching quiz_progress or other tables.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into public.users (profile row)
  INSERT INTO public.users (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  )
  ON CONFLICT (id) DO NOTHING;

  -- Insert starter streak row
  INSERT INTO public.user_streaks (user_id, current_streak, longest_streak, last_active_date)
  VALUES (NEW.id, 0, 0, NULL)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- STEP 6: Attach the trigger to auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 7: Verify — should return the function name
SELECT routine_name
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name   = 'handle_new_user';
