-- Migration: add longest_streak column to user_streaks
-- Safe to re-run — uses IF NOT EXISTS logic via DO block

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_streaks'
      AND column_name = 'longest_streak'
  ) THEN
    ALTER TABLE public.user_streaks
      ADD COLUMN longest_streak INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Backfill: set longest_streak = current_streak where it's higher
UPDATE public.user_streaks
SET longest_streak = current_streak
WHERE longest_streak < current_streak;
