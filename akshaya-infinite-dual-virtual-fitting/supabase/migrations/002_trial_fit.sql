-- Akshaya Infinite AI Trial Fit catalogue.
-- Customer photographs are deliberately NOT stored by this migration.
create table if not exists public.trial_fit_garments (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 100),
  category text not null check (category in ('Ladies','Boys','Girls')),
  model_gender text not null check (model_gender in ('Female','Male','Unisex')),
  fit_type text,
  description text,
  image_url text not null,
  storage_path text not null,
  is_published boolean not null default false,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

alter table public.trial_fit_garments enable row level security;

drop policy if exists "public can view published trial fit garments" on public.trial_fit_garments;
create policy "public can view published trial fit garments"
on public.trial_fit_garments for select to anon, authenticated
using (is_published = true);

drop policy if exists "owner can manage trial fit garments" on public.trial_fit_garments;
create policy "owner can manage trial fit garments"
on public.trial_fit_garments for all to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));

-- Public product images are catalog assets only. Customer photos must never be
-- uploaded to this bucket. Only owners may upload or delete catalogue images.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('trial-fit-catalog','trial-fit-catalog',true,8388608,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 8388608, allowed_mime_types = array['image/jpeg','image/png','image/webp'];

drop policy if exists "public read trial fit catalogue images" on storage.objects;
create policy "public read trial fit catalogue images"
on storage.objects for select to anon, authenticated
using (bucket_id = 'trial-fit-catalog');

drop policy if exists "owner upload trial fit catalogue images" on storage.objects;
create policy "owner upload trial fit catalogue images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'trial-fit-catalog'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
);

drop policy if exists "owner delete trial fit catalogue images" on storage.objects;
create policy "owner delete trial fit catalogue images"
on storage.objects for delete to authenticated
using (
  bucket_id = 'trial-fit-catalog'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner')
);
