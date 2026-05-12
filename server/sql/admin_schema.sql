create extension if not exists "pgcrypto";

create table if not exists public.admins (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null default 'admin',
  avatar_url text,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stories (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  category text not null default 'History',
  status text not null default 'draft' check (status in ('draft', 'published')),
  cover_image_url text,
  cover_image_path text,
  author_id uuid references public.admins(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  event_date date not null,
  category text not null default 'Event',
  location text,
  image_url text,
  image_path text,
  created_by uuid references public.admins(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  alt_text text,
  image_url text not null,
  image_path text not null,
  uploaded_by uuid references public.admins(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references public.admins(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists stories_status_idx on public.stories(status);
create index if not exists stories_category_idx on public.stories(category);
create index if not exists events_date_idx on public.events(event_date);
create index if not exists gallery_created_idx on public.gallery(created_at desc);
create index if not exists activity_logs_created_idx on public.activity_logs(created_at desc);

alter table public.admins enable row level security;
alter table public.stories enable row level security;
alter table public.events enable row level security;
alter table public.gallery enable row level security;
alter table public.activity_logs enable row level security;

create policy "Service role manages admins" on public.admins for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manages stories" on public.stories for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manages events" on public.events for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manages gallery" on public.gallery for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "Service role manages logs" on public.activity_logs for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('admin-media', 'admin-media', true, 5242880, array['image/jpeg','image/png','image/webp','image/gif'])
on conflict (id) do update set public = true;

create policy "Public can read admin media"
on storage.objects for select
using (bucket_id = 'admin-media');

create policy "Service role manages admin media"
on storage.objects for all
using (bucket_id = 'admin-media' and auth.role() = 'service_role')
with check (bucket_id = 'admin-media' and auth.role() = 'service_role');

-- Password for this seed is: Admin@12345
-- Replace this account immediately after first login.
insert into public.admins (name, email, password_hash, role)
values (
  'Swarajya Admin',
  'admin@riseofswarajya.com',
  '$2b$10$LThHVRNl127toZtteRL7Hu09J62mioBZ2tDfwFowCslvbeH1ihBYm',
  'super_admin'
)
on conflict (email) do nothing;
