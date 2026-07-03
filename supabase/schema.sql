-- ============================================================================
-- Voyaz - Supabase schema for the `profiles` table
-- ----------------------------------------------------------------------------
-- Run this in Supabase → SQL Editor → New query → Run.
-- It is idempotent: safe to run on a fresh project or an existing one
-- (it only adds what is missing and never drops your data).
--
-- This fixes the common "username / onboarding does not save" bug, which is
-- caused by (a) missing columns the onboarding form writes to, or
-- (b) missing Row Level Security policies that let a user write their own row.
-- ============================================================================

-- 1) Table -------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2) Columns the app reads/writes (added only if missing) ---------------------
alter table public.profiles add column if not exists username text unique;
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists avatar_url text;
alter table public.profiles add column if not exists banner_url text;
alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists language text;
alter table public.profiles add column if not exists timezone text;
alter table public.profiles add column if not exists theme text;
alter table public.profiles add column if not exists distance_unit text;
alter table public.profiles add column if not exists temperature_unit text;
alter table public.profiles add column if not exists travel_style text;
alter table public.profiles add column if not exists pace_of_travel text;
alter table public.profiles add column if not exists preferred_currency text;
alter table public.profiles add column if not exists travel_companions text;
alter table public.profiles add column if not exists dietary_restrictions text;
alter table public.profiles add column if not exists accommodation_preference text;
alter table public.profiles add column if not exists accessibility_needs text;
alter table public.profiles add column if not exists email_notifications boolean default true;
alter table public.profiles add column if not exists promotional_emails boolean default false;
alter table public.profiles add column if not exists push_notifications boolean default true;
alter table public.profiles add column if not exists ai_training_consent boolean default false;
alter table public.profiles add column if not exists show_friends boolean default true;
alter table public.profiles add column if not exists show_followers boolean default true;
alter table public.profiles add column if not exists onboarding_done boolean default false;

-- 3) Row Level Security ------------------------------------------------------
alter table public.profiles enable row level security;

-- Anyone signed in can read profiles (needed for public profiles / social).
drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

-- A user can insert their own row (onboarding upsert).
drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- A user can update their own row (onboarding + settings).
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- 4) Auto-create a profile row when a new user signs up ----------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'first_name',
    new.raw_user_meta_data ->> 'last_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5) Avatars storage bucket (used by the onboarding avatar upload) -----------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "Avatar images are publicly accessible" on storage.objects;
create policy "Avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

drop policy if exists "Users can upload avatars" on storage.objects;
create policy "Users can upload avatars"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');
