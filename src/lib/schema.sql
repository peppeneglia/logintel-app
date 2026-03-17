-- ============================================================
-- Logintel — Supabase schema
-- All table/column names in English.
-- Run this in Supabase SQL Editor (Dashboard → SQL → New query).
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- PROFILES — migrate credits model
-- Run this ONCE on existing databases to add new columns.
-- ────────────────────────────────────────────────────────────

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits_remaining integer DEFAULT 500;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits_daily_limit integer DEFAULT 500;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS credits_reset_at timestamptz DEFAULT now();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS extra_credits integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS extra_credits_expire_at timestamptz;

-- Drop old columns if they exist (safe — only removes if present)
-- ALTER TABLE profiles DROP COLUMN IF EXISTS credits_used;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS credits_total;

-- ────────────────────────────────────────────────────────────
-- CREDIT TRANSACTIONS
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS credit_transactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  amount integer NOT NULL,
  action_type text NOT NULL,
  balance_after integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_transactions" ON credit_transactions
  FOR ALL USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────
-- FLEET INTELLIGENCE
-- ────────────────────────────────────────────────────────────

CREATE TABLE fleet_vehicles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  plate text NOT NULL,
  brand text NOT NULL,
  model text NOT NULL,
  year int NOT NULL,
  euro_class text NOT NULL,
  total_km int NOT NULL DEFAULT 0,
  monthly_km int NOT NULL DEFAULT 0,
  fuel_consumption_per_100km numeric(5,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'ok' CHECK (status IN ('ok', 'warning', 'alert')),
  driver text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE fleet_vehicles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_data" ON fleet_vehicles
  FOR ALL USING (auth.uid() = user_id);


CREATE TABLE maintenance_alerts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  vehicle_id uuid REFERENCES fleet_vehicles ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  description text,
  urgency text NOT NULL DEFAULT 'low' CHECK (urgency IN ('low', 'medium', 'high', 'critical')),
  km_threshold int,
  due_date date,
  resolved bool NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE maintenance_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_data" ON maintenance_alerts
  FOR ALL USING (auth.uid() = user_id);


CREATE TABLE vehicle_allocations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  vehicle_id uuid REFERENCES fleet_vehicles ON DELETE CASCADE NOT NULL,
  driver text NOT NULL,
  route text NOT NULL,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vehicle_allocations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_data" ON vehicle_allocations
  FOR ALL USING (auth.uid() = user_id);


CREATE TABLE operational_costs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  vehicle_id uuid REFERENCES fleet_vehicles ON DELETE CASCADE NOT NULL,
  month int NOT NULL CHECK (month BETWEEN 1 AND 12),
  year int NOT NULL,
  fuel_cost numeric(10,2) NOT NULL DEFAULT 0,
  maintenance_cost numeric(10,2) NOT NULL DEFAULT 0,
  toll_cost numeric(10,2) NOT NULL DEFAULT 0,
  driver_cost numeric(10,2) NOT NULL DEFAULT 0,
  total_km int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE operational_costs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_data" ON operational_costs
  FOR ALL USING (auth.uid() = user_id);


CREATE TABLE document_expiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  vehicle_id uuid REFERENCES fleet_vehicles ON DELETE CASCADE NOT NULL,
  document_type text NOT NULL,
  document_number text,
  expiry_date date NOT NULL,
  status text NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'expiring', 'expired')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE document_expiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_data" ON document_expiries
  FOR ALL USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- DELIVERY INTELLIGENCE
-- ────────────────────────────────────────────────────────────

CREATE TABLE deliveries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  customer text NOT NULL,
  origin text NOT NULL,
  destination text NOT NULL,
  departure_date timestamptz NOT NULL,
  scheduled_delivery_date timestamptz NOT NULL,
  actual_delivery_date timestamptz,
  weight_kg numeric(10,2),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_transit', 'delivered', 'cancelled')),
  driver text,
  vehicle_id uuid REFERENCES fleet_vehicles ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_data" ON deliveries
  FOR ALL USING (auth.uid() = user_id);


CREATE TABLE delivery_windows (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  delivery_id uuid REFERENCES deliveries ON DELETE CASCADE NOT NULL,
  window_start timestamptz NOT NULL,
  window_end timestamptz NOT NULL,
  met bool NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE delivery_windows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_data" ON delivery_windows
  FOR ALL USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- COMPLIANCE INTELLIGENCE
-- ────────────────────────────────────────────────────────────

CREATE TABLE driving_hours (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  driver text NOT NULL,
  date date NOT NULL,
  driving_minutes int NOT NULL DEFAULT 0,
  break_minutes int NOT NULL DEFAULT 0,
  start_time time NOT NULL,
  end_time time NOT NULL,
  rest_minutes_after int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE driving_hours ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_data" ON driving_hours
  FOR ALL USING (auth.uid() = user_id);


CREATE TABLE compliance_documents (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  driver text NOT NULL,
  type text NOT NULL CHECK (type IN ('license', 'CQC', 'ADR', 'tachograph')),
  document_number text,
  expiry_date date NOT NULL,
  status text NOT NULL DEFAULT 'valid' CHECK (status IN ('valid', 'expiring', 'expired')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE compliance_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_data" ON compliance_documents
  FOR ALL USING (auth.uid() = user_id);


CREATE TABLE adr_shipments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  delivery_id uuid REFERENCES deliveries ON DELETE SET NULL,
  adr_class text NOT NULL,
  cargo_description text NOT NULL,
  weight_kg numeric(10,2) NOT NULL,
  driver text NOT NULL,
  date date NOT NULL,
  compliant bool NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE adr_shipments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_data" ON adr_shipments
  FOR ALL USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- FINANCE INTELLIGENCE
-- ────────────────────────────────────────────────────────────

CREATE TABLE route_margins (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  route text NOT NULL,
  customer text NOT NULL,
  date date NOT NULL,
  km int NOT NULL,
  driving_hours numeric(5,2) NOT NULL DEFAULT 0,
  revenue numeric(10,2) NOT NULL DEFAULT 0,
  fuel_cost numeric(10,2) NOT NULL DEFAULT 0,
  driver_cost numeric(10,2) NOT NULL DEFAULT 0,
  fixed_cost numeric(10,2) NOT NULL DEFAULT 0,
  tolls numeric(10,2) NOT NULL DEFAULT 0,
  vehicle_id uuid REFERENCES fleet_vehicles ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE route_margins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_data" ON route_margins
  FOR ALL USING (auth.uid() = user_id);


-- ────────────────────────────────────────────────────────────
-- CARBON INTELLIGENCE
-- ────────────────────────────────────────────────────────────

CREATE TABLE emissions_records (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users NOT NULL,
  vehicle_id uuid REFERENCES fleet_vehicles ON DELETE SET NULL,
  route text NOT NULL,
  km int NOT NULL,
  euro_class text NOT NULL,
  co2_kg numeric(10,2) NOT NULL DEFAULT 0,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emissions_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_owns_data" ON emissions_records
  FOR ALL USING (auth.uid() = user_id);
