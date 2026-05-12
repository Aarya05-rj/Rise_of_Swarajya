-- ============================================================
-- FINAL STABILIZATION SCRIPT
-- Run this in Supabase SQL Editor to finalize tables
-- ============================================================

-- 1. Ensure users table has all necessary columns
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS total_xp integer DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS rank text DEFAULT 'Soldier';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS progress integer DEFAULT 0;

-- 2. Ensure profiles table (if used) also has them
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS total_score integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rank text DEFAULT 'Beginner';

-- 3. Storage policies for avatars (re-verify)
-- Ensure 'avatars' bucket is public
UPDATE storage.buckets SET public = true WHERE id = 'avatars';

-- 4. Quiz Progress - Ensure it tracks all 10 levels
-- (Already handled by the unique constraint and logic)

-- 5. RLS Policies for users
CREATE POLICY IF NOT EXISTS "Users can update own avatar" 
ON public.users FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 6. Trigger for profile creation on signup (if not already there)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.user_streaks (user_id, current_streak, longest_streak)
  VALUES (new.id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
