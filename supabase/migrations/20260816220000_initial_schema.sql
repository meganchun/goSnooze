-- goSnooze application data. Apply with `supabase db push` after linking a
-- project. This migration deliberately contains no provider or service-role
-- credentials.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  profile_picture_url text,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.alert_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  radius_km numeric(3, 1) not null default 0.5 check (radius_km between 0.1 and 5.0),
  buzz_enabled boolean not null default true,
  sound_enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.active_alarms (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stop_name text not null,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  radius_km numeric(3, 1) not null check (radius_km between 0.1 and 5.0),
  enabled boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.push_tokens (
  user_id uuid not null references auth.users(id) on delete cascade,
  token text not null,
  platform text not null check (platform in ('ios', 'android')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  primary key (user_id, token)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  insert into public.alert_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists alert_preferences_set_updated_at on public.alert_preferences;
create trigger alert_preferences_set_updated_at
  before update on public.alert_preferences
  for each row execute procedure public.set_updated_at();

drop trigger if exists active_alarms_set_updated_at on public.active_alarms;
create trigger active_alarms_set_updated_at
  before update on public.active_alarms
  for each row execute procedure public.set_updated_at();

drop trigger if exists push_tokens_set_updated_at on public.push_tokens;
create trigger push_tokens_set_updated_at
  before update on public.push_tokens
  for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.alert_preferences enable row level security;
alter table public.active_alarms enable row level security;
alter table public.push_tokens enable row level security;

grant select, insert, update, delete on public.profiles, public.alert_preferences,
  public.active_alarms, public.push_tokens to authenticated;

create policy "Users manage their own profile"
  on public.profiles for all to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
create policy "Users manage their own alert preferences"
  on public.alert_preferences for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users manage their own active alarm"
  on public.active_alarms for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Users manage their own push tokens"
  on public.push_tokens for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into storage.buckets (id, name, public)
values ('profile-images', 'profile-images', true)
on conflict (id) do nothing;

create policy "Users upload their own profile image"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Users update their own profile image"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  ) with check (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Users delete their own profile image"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'profile-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
