-- Safe migration for quiz history.
-- Run this if Supabase says: relation "public.quiz_levels" does not exist.

create table if not exists public.quiz_levels (
  id integer primary key check (id between 1 and 10),
  title text not null,
  subtitle text,
  sort_order integer not null unique,
  created_at timestamptz not null default now()
);

insert into public.quiz_levels (id, title, subtitle, sort_order) values
  (1, 'Rise of Shivaji', 'Origins, oath, courage', 1),
  (2, 'Forts of Swarajya', 'Citadels and strategy', 2),
  (3, 'Battles & Conquests', 'Speed, surprise, victory', 3),
  (4, 'Ashtapradhan Mandal', 'Council of statecraft', 4),
  (5, 'Naval Supremacy', 'Guardians of the coast', 5),
  (6, 'Culture & Dharma', 'Values of governance', 6),
  (7, 'Sambhaji''s Legacy', 'Defiance and sacrifice', 7),
  (8, 'Maratha Confederacy', 'Power beyond forts', 8),
  (9, 'The Peshwa Era', 'Expansion and administration', 9),
  (10, 'Glory of Swarajya', 'The enduring flame', 10)
on conflict (id) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  sort_order = excluded.sort_order;

create table if not exists public.quizzes (
  id text primary key,
  level_id integer not null references public.quiz_levels(id) on delete cascade,
  quiz_number integer not null check (quiz_number between 1 and 9),
  title text not null,
  total_questions integer not null default 10,
  passing_score integer not null default 70,
  created_at timestamptz not null default now(),
  unique (level_id, quiz_number)
);

insert into public.quizzes (id, level_id, quiz_number, title)
select
  level_id || '-' || quiz_number,
  level_id,
  quiz_number,
  'Quiz ' || quiz_number
from generate_series(1, 10) as level_id
cross join generate_series(1, 9) as quiz_number
on conflict (id) do update set
  level_id = excluded.level_id,
  quiz_number = excluded.quiz_number,
  title = excluded.title;

create table if not exists public.quiz_attempts (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  level_id integer not null references public.quiz_levels(id) on delete cascade,
  quiz_id text not null references public.quizzes(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  correct_answers integer not null check (correct_answers >= 0),
  total_questions integer not null check (total_questions > 0),
  stars integer not null check (stars between 0 and 3),
  time_taken integer not null default 0 check (time_taken >= 0),
  answers jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.user_streaks (
  user_id uuid primary key references auth.users(id) on delete cascade,
  streak_count integer not null default 0,
  last_activity_date date,
  longest_streak integer not null default 0,
  updated_at timestamptz not null default now()
);

create index if not exists idx_quiz_attempts_user_created
  on public.quiz_attempts (user_id, created_at desc);

create index if not exists idx_quiz_attempts_user_quiz_created
  on public.quiz_attempts (user_id, quiz_id, created_at desc);

create index if not exists idx_quiz_attempts_user_level_created
  on public.quiz_attempts (user_id, level_id, created_at desc);
