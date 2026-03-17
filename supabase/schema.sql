-- ============================================================
-- Logintel — Database Schema (canonical)
-- Run in Supabase SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. PROFILES
-- ────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                    uuid primary key references auth.users(id) on delete cascade,
  first_name            text,
  last_name             text,
  email                 text not null,
  company               text,
  role                  text,
  fleet_size            integer not null default 0,
  plan                  text not null default 'free'
                        check (plan in ('free', 'pro', 'team', 'enterprise')),
  credits_remaining     integer not null default 500,
  credits_daily_limit   integer not null default 500,
  credits_reset_at      timestamptz not null default now(),
  extra_credits         integer not null default 0,
  extra_credits_expire_at timestamptz,
  avatar_url            text,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
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
  insert into public.profiles (id, first_name, last_name, email, company)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
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
-- 2. CREDIT TRANSACTIONS
-- ────────────────────────────────────────────────────────────
create table if not exists public.credit_transactions (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users not null,
  amount        integer not null,
  action_type   text not null,
  balance_after integer not null,
  created_at    timestamptz not null default now()
);

create index if not exists idx_credit_transactions_user
  on public.credit_transactions(user_id, created_at desc);

alter table public.credit_transactions enable row level security;

create policy "user_owns_transactions"
  on public.credit_transactions for all
  using (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 3. USER SETTINGS
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
-- 4. CONVERSATIONS
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
-- 5. MESSAGES
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
-- 6. PREDICTIONS
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
-- 7. NOTIFICATIONS
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


-- ────────────────────────────────────────────────────────────
-- 8. FLEET INTELLIGENCE
-- ────────────────────────────────────────────────────────────
create table if not exists public.fleet_vehicles (
  id                          uuid default gen_random_uuid() primary key,
  user_id                     uuid references auth.users not null,
  plate                       text not null,
  brand                       text not null,
  model                       text not null,
  year                        int not null,
  euro_class                  text not null,
  total_km                    int not null default 0,
  monthly_km                  int not null default 0,
  fuel_consumption_per_100km  numeric(5,2) not null default 0,
  status                      text not null default 'ok' check (status in ('ok', 'warning', 'alert')),
  driver                      text,
  notes                       text,
  created_at                  timestamptz default now()
);

alter table public.fleet_vehicles enable row level security;
create policy "user_owns_fleet_vehicles" on public.fleet_vehicles
  for all using (auth.uid() = user_id);


create table if not exists public.maintenance_alerts (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users not null,
  vehicle_id    uuid references public.fleet_vehicles on delete cascade not null,
  type          text not null,
  description   text,
  urgency       text not null default 'low' check (urgency in ('low', 'medium', 'high', 'critical')),
  km_threshold  int,
  due_date      date,
  resolved      bool not null default false,
  created_at    timestamptz default now()
);

alter table public.maintenance_alerts enable row level security;
create policy "user_owns_maintenance_alerts" on public.maintenance_alerts
  for all using (auth.uid() = user_id);


create table if not exists public.vehicle_allocations (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users not null,
  vehicle_id  uuid references public.fleet_vehicles on delete cascade not null,
  driver      text not null,
  route       text not null,
  start_date  timestamptz not null,
  end_date    timestamptz,
  status      text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  created_at  timestamptz default now()
);

alter table public.vehicle_allocations enable row level security;
create policy "user_owns_vehicle_allocations" on public.vehicle_allocations
  for all using (auth.uid() = user_id);


create table if not exists public.operational_costs (
  id                uuid default gen_random_uuid() primary key,
  user_id           uuid references auth.users not null,
  vehicle_id        uuid references public.fleet_vehicles on delete cascade not null,
  month             int not null check (month between 1 and 12),
  year              int not null,
  fuel_cost         numeric(10,2) not null default 0,
  maintenance_cost  numeric(10,2) not null default 0,
  toll_cost         numeric(10,2) not null default 0,
  driver_cost       numeric(10,2) not null default 0,
  total_km          int not null default 0,
  created_at        timestamptz default now()
);

alter table public.operational_costs enable row level security;
create policy "user_owns_operational_costs" on public.operational_costs
  for all using (auth.uid() = user_id);


create table if not exists public.document_expiries (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users not null,
  vehicle_id      uuid references public.fleet_vehicles on delete cascade not null,
  document_type   text not null,
  document_number text,
  expiry_date     date not null,
  status          text not null default 'valid' check (status in ('valid', 'expiring', 'expired')),
  created_at      timestamptz default now()
);

alter table public.document_expiries enable row level security;
create policy "user_owns_document_expiries" on public.document_expiries
  for all using (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 9. DELIVERY INTELLIGENCE
-- ────────────────────────────────────────────────────────────
create table if not exists public.deliveries (
  id                      uuid default gen_random_uuid() primary key,
  user_id                 uuid references auth.users not null,
  customer                text not null,
  origin                  text not null,
  destination             text not null,
  departure_date          timestamptz not null,
  scheduled_delivery_date timestamptz not null,
  actual_delivery_date    timestamptz,
  weight_kg               numeric(10,2),
  status                  text not null default 'pending' check (status in ('pending', 'in_transit', 'delivered', 'cancelled')),
  driver                  text,
  vehicle_id              uuid references public.fleet_vehicles on delete set null,
  created_at              timestamptz default now()
);

alter table public.deliveries enable row level security;
create policy "user_owns_deliveries" on public.deliveries
  for all using (auth.uid() = user_id);


create table if not exists public.delivery_windows (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users not null,
  delivery_id   uuid references public.deliveries on delete cascade not null,
  window_start  timestamptz not null,
  window_end    timestamptz not null,
  met           bool not null default false,
  notes         text,
  created_at    timestamptz default now()
);

alter table public.delivery_windows enable row level security;
create policy "user_owns_delivery_windows" on public.delivery_windows
  for all using (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 10. COMPLIANCE INTELLIGENCE
-- ────────────────────────────────────────────────────────────
create table if not exists public.driving_hours (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references auth.users not null,
  driver              text not null,
  date                date not null,
  driving_minutes     int not null default 0,
  break_minutes       int not null default 0,
  start_time          time not null,
  end_time            time not null,
  rest_minutes_after  int not null default 0,
  created_at          timestamptz default now()
);

alter table public.driving_hours enable row level security;
create policy "user_owns_driving_hours" on public.driving_hours
  for all using (auth.uid() = user_id);


create table if not exists public.compliance_documents (
  id              uuid default gen_random_uuid() primary key,
  user_id         uuid references auth.users not null,
  driver          text not null,
  type            text not null check (type in ('license', 'CQC', 'ADR', 'tachograph')),
  document_number text,
  expiry_date     date not null,
  status          text not null default 'valid' check (status in ('valid', 'expiring', 'expired')),
  created_at      timestamptz default now()
);

alter table public.compliance_documents enable row level security;
create policy "user_owns_compliance_documents" on public.compliance_documents
  for all using (auth.uid() = user_id);


create table if not exists public.adr_shipments (
  id                uuid default gen_random_uuid() primary key,
  user_id           uuid references auth.users not null,
  delivery_id       uuid references public.deliveries on delete set null,
  adr_class         text not null,
  cargo_description text not null,
  weight_kg         numeric(10,2) not null,
  driver            text not null,
  date              date not null,
  compliant         bool not null default true,
  created_at        timestamptz default now()
);

alter table public.adr_shipments enable row level security;
create policy "user_owns_adr_shipments" on public.adr_shipments
  for all using (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 11. FINANCE INTELLIGENCE
-- ────────────────────────────────────────────────────────────
create table if not exists public.route_margins (
  id            uuid default gen_random_uuid() primary key,
  user_id       uuid references auth.users not null,
  route         text not null,
  customer      text not null,
  date          date not null,
  km            int not null,
  driving_hours numeric(5,2) not null default 0,
  revenue       numeric(10,2) not null default 0,
  fuel_cost     numeric(10,2) not null default 0,
  driver_cost   numeric(10,2) not null default 0,
  fixed_cost    numeric(10,2) not null default 0,
  tolls         numeric(10,2) not null default 0,
  vehicle_id    uuid references public.fleet_vehicles on delete set null,
  created_at    timestamptz default now()
);

alter table public.route_margins enable row level security;
create policy "user_owns_route_margins" on public.route_margins
  for all using (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- 12. CARBON INTELLIGENCE
-- ────────────────────────────────────────────────────────────
create table if not exists public.emissions_records (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references auth.users not null,
  vehicle_id  uuid references public.fleet_vehicles on delete set null,
  route       text not null,
  km          int not null,
  euro_class  text not null,
  co2_kg      numeric(10,2) not null default 0,
  date        date not null,
  created_at  timestamptz default now()
);

alter table public.emissions_records enable row level security;
create policy "user_owns_emissions_records" on public.emissions_records
  for all using (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- MIGRATION HELPER (for existing databases)
-- Run once to add new credit columns to existing profiles table.
-- ────────────────────────────────────────────────────────────
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits_remaining integer DEFAULT 500;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits_daily_limit integer DEFAULT 500;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits_reset_at timestamptz DEFAULT now();
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS extra_credits integer DEFAULT 0;
-- ALTER TABLE profiles ADD COLUMN IF NOT EXISTS extra_credits_expire_at timestamptz;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS credits_used;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS credits_total;
