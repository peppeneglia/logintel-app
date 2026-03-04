-- ============================================================
-- Logintel — Database Schema
-- Eseguire su Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES
-- ────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  email       text not null,
  company     text,
  role        text,
  fleet_size  integer not null default 0,
  plan        text not null default 'free'
              check (plan in ('free', 'starter', 'pro', 'enterprise')),
  credits_used    integer not null default 0,
  credits_total   integer not null default 50,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email, company)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'company', '')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.update_updated_at();


-- ────────────────────────────────────────────────────────────
-- 2. USER SETTINGS
-- ────────────────────────────────────────────────────────────
create table if not exists public.user_settings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null unique references public.profiles(id) on delete cascade,
  language    text not null default 'it',
  timezone    text not null default 'Europe/Rome',
  date_format text not null default 'dd/MM/yyyy',
  unit_system text not null default 'metric',
  currency    text not null default 'EUR',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "Users can view own settings"
  on public.user_settings for select
  using (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id);

create policy "Users can insert own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

create trigger user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.update_updated_at();

-- Auto-create default settings on profile creation
create or replace function public.handle_new_profile()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.user_settings (user_id)
  values (new.id);
  return new;
end;
$$;

create or replace trigger on_profile_created
  after insert on public.profiles
  for each row execute function public.handle_new_profile();


-- ────────────────────────────────────────────────────────────
-- 3. CONVERSATIONS
-- ────────────────────────────────────────────────────────────
create table if not exists public.conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null default 'Nuova conversazione',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.conversations enable row level security;

create policy "Users can view own conversations"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "Users can insert own conversations"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own conversations"
  on public.conversations for update
  using (auth.uid() = user_id);

create policy "Users can delete own conversations"
  on public.conversations for delete
  using (auth.uid() = user_id);

create trigger conversations_updated_at
  before update on public.conversations
  for each row execute function public.update_updated_at();


-- ────────────────────────────────────────────────────────────
-- 4. MESSAGES
-- ────────────────────────────────────────────────────────────
create table if not exists public.messages (
  id                uuid primary key default gen_random_uuid(),
  conversation_id   uuid not null references public.conversations(id) on delete cascade,
  role              text not null check (role in ('user', 'assistant')),
  content           text not null,
  prediction_json   jsonb,
  created_at        timestamptz not null default now()
);

create index idx_messages_conversation on public.messages(conversation_id, created_at);

alter table public.messages enable row level security;

create policy "Users can view messages of own conversations"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );

create policy "Users can insert messages into own conversations"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id and c.user_id = auth.uid()
    )
  );


-- ────────────────────────────────────────────────────────────
-- 5. PREDICTIONS
-- ────────────────────────────────────────────────────────────
create table if not exists public.predictions (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  origin          text not null,
  destination     text not null,
  departure_time  timestamptz not null,
  result_json     jsonb not null default '{}',
  credits_used    integer not null default 1,
  feedback_delay  integer,
  feedback_given  boolean not null default false,
  created_at      timestamptz not null default now()
);

create index idx_predictions_user on public.predictions(user_id, created_at desc);

alter table public.predictions enable row level security;

create policy "Users can view own predictions"
  on public.predictions for select
  using (auth.uid() = user_id);

create policy "Users can insert own predictions"
  on public.predictions for insert
  with check (auth.uid() = user_id);

create policy "Users can update own predictions"
  on public.predictions for update
  using (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 6. NOTIFICATIONS
-- ────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null check (type in ('maintenance', 'compliance', 'delivery', 'system', 'weather')),
  title       text not null,
  description text not null default '',
  priority    text not null default 'low' check (priority in ('low', 'medium', 'high')),
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index idx_notifications_user on public.notifications(user_id, read, created_at desc);

alter table public.notifications enable row level security;

create policy "Users can view own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Users can update own notifications"
  on public.notifications for update
  using (auth.uid() = user_id);

create policy "Users can delete own notifications"
  on public.notifications for delete
  using (auth.uid() = user_id);
