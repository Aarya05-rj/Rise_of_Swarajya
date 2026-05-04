create table if not exists public.user_activities (
  id bigserial primary key,
  user_id uuid not null references auth.users(id),
  activity_name text not null,
  activity_type text,
  details jsonb,
  timestamp timestamptz not null default now()
);
