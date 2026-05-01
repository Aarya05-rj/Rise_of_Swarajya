insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

alter table public.profiles
add column if not exists avatar_url text;

drop policy if exists "Avatar images are publicly readable" on storage.objects;
drop policy if exists "Users can upload their avatar" on storage.objects;
drop policy if exists "Users can update their avatar" on storage.objects;
drop policy if exists "Users can delete their avatar" on storage.objects;

create policy "Avatar images are publicly readable"
on storage.objects
for select
using (bucket_id = 'avatars');

create policy "Users can upload their avatar"
on storage.objects
for insert
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their avatar"
on storage.objects
for update
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their avatar"
on storage.objects
for delete
using (
  bucket_id = 'avatars'
  and auth.uid()::text = (storage.foldername(name))[1]
);

notify pgrst, 'reload schema';
