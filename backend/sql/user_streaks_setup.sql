-- Safe migration to create the user_streaks table
-- You can run this in your Supabase SQL Editor

-- Drop the old table if it exists to ensure schema is correct
DROP TABLE IF EXISTS public.user_streaks;

-- Create the user_streaks table
CREATE TABLE public.user_streaks (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    current_streak INTEGER NOT NULL DEFAULT 0,
    longest_streak INTEGER NOT NULL DEFAULT 0,
    last_active_date DATE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

-- Create Policy: Users can view their own streak
CREATE POLICY "Users can view their own streak"
ON public.user_streaks
FOR SELECT
USING (auth.uid() = user_id);

-- Create Policy: Users can insert their own streak
CREATE POLICY "Users can insert their own streak"
ON public.user_streaks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create Policy: Users can update their own streak
CREATE POLICY "Users can update their own streak"
ON public.user_streaks
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
