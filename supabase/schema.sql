-- ============================================================
-- FitLife Database Schema – Full Version
-- Run this in the Supabase SQL Editor
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES
-- ============================================================
create table if not exists public.profiles (
  id              uuid references auth.users on delete cascade primary key,
  email           text,
  full_name       text,
  avatar_url      text,
  gender          text check (gender in ('male', 'female')),
  is_pregnant     boolean not null default false,
  pregnancy_week  integer,
  has_gestational_diabetes boolean not null default false,
  goals           text[] default '{}',
  activity_level  text check (activity_level in ('sedentary','light','moderate','active','very_active')),
  birth_year      integer,
  height_cm       integer,
  weight_kg       decimal(5,2),
  target_weight_kg decimal(5,2),
  medical_notes   text,
  setup_complete  boolean not null default false,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================
-- WORKOUT SESSIONS
-- ============================================================
create table if not exists public.workout_sessions (
  id               uuid default uuid_generate_v4() primary key,
  user_id          uuid not null references public.profiles(id) on delete cascade,
  workout_type     text not null,
  workout_name     text not null,
  duration_minutes integer,
  intensity        text,
  notes            text,
  completed_at     timestamptz not null default now()
);

-- ============================================================
-- FOOD LOGS
-- ============================================================
create table if not exists public.food_logs (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid not null references public.profiles(id) on delete cascade,
  meal_type     text check (meal_type in ('breakfast','lunch','dinner','snack')),
  food_name     text not null,
  exchange_type text,
  portions      decimal(4,2) not null default 1,
  calories      integer,
  protein_g     decimal(6,2),
  carbs_g       decimal(6,2),
  fat_g         decimal(6,2),
  date          date not null default current_date,
  logged_at     timestamptz not null default now()
);

-- ============================================================
-- WATER LOGS
-- ============================================================
create table if not exists public.water_logs (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  amount_ml  integer not null,
  date       date not null default current_date,
  logged_at  timestamptz not null default now()
);

-- ============================================================
-- STEP LOGS  (NEW)
-- ============================================================
create table if not exists public.step_logs (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  steps      integer not null default 0,
  date       date not null default current_date,
  source     text not null default 'manual',  -- 'manual' | 'apple_health' | 'google_fit'
  logged_at  timestamptz not null default now(),
  unique (user_id, date)
);

-- ============================================================
-- QUICK MEALS  (NEW)
-- ============================================================
create table if not exists public.quick_meals (
  id             uuid default uuid_generate_v4() primary key,
  user_id        uuid not null references public.profiles(id) on delete cascade,
  name           text not null,
  meal_type      text,
  total_calories integer not null default 0,
  description    text,
  items          jsonb not null default '[]',
  created_at     timestamptz not null default now()
);

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
create table if not exists public.chat_messages (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  role       text check (role in ('user','assistant')) not null,
  content    text not null,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles         enable row level security;
alter table public.workout_sessions  enable row level security;
alter table public.food_logs        enable row level security;
alter table public.water_logs       enable row level security;
alter table public.step_logs        enable row level security;
alter table public.quick_meals      enable row level security;
alter table public.chat_messages    enable row level security;

-- Profiles
create policy "view own profile"   on public.profiles for select using (auth.uid() = id);
create policy "update own profile" on public.profiles for update using (auth.uid() = id);
create policy "insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- All others: full ownership
create policy "own workout_sessions" on public.workout_sessions for all using (auth.uid() = user_id);
create policy "own food_logs"        on public.food_logs        for all using (auth.uid() = user_id);
create policy "own water_logs"       on public.water_logs       for all using (auth.uid() = user_id);
create policy "own step_logs"        on public.step_logs        for all using (auth.uid() = user_id);
create policy "own quick_meals"      on public.quick_meals      for all using (auth.uid() = user_id);
create policy "own chat_messages"    on public.chat_messages    for all using (auth.uid() = user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_food_logs_user_date      on public.food_logs (user_id, date);
create index if not exists idx_water_logs_user_date     on public.water_logs (user_id, date);
create index if not exists idx_step_logs_user_date      on public.step_logs (user_id, date);
create index if not exists idx_workout_sessions_user    on public.workout_sessions (user_id, completed_at);
create index if not exists idx_quick_meals_user         on public.quick_meals (user_id);
create index if not exists idx_chat_messages_user       on public.chat_messages (user_id, created_at);
