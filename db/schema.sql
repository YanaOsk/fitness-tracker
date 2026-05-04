-- ============================================================
-- FitLife Database Schema – Neon PostgreSQL
-- Run this in the Neon SQL Editor or via psql
-- ============================================================

-- ============================================================
-- PROFILES  (id = Google OAuth sub)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id              TEXT PRIMARY KEY,
  email           TEXT,
  full_name       TEXT,
  avatar_url      TEXT,
  gender          TEXT CHECK (gender IN ('male', 'female')),
  is_pregnant     BOOLEAN NOT NULL DEFAULT FALSE,
  pregnancy_week             INTEGER,
  pregnancy_week_updated_at  DATE,
  has_gestational_diabetes   BOOLEAN NOT NULL DEFAULT FALSE,
  goals           TEXT[] DEFAULT '{}',
  activity_level  TEXT CHECK (activity_level IN ('sedentary','light','moderate','active','very_active')),
  birth_year      INTEGER,
  height_cm       INTEGER,
  weight_kg       DECIMAL(5,2),
  target_weight_kg DECIMAL(5,2),
  medical_notes   TEXT,
  setup_complete  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- WORKOUT SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS workout_sessions (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  workout_type     TEXT NOT NULL,
  workout_name     TEXT NOT NULL,
  duration_minutes INTEGER,
  intensity        TEXT,
  notes            TEXT,
  completed_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FOOD LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS food_logs (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  meal_type     TEXT CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  food_name     TEXT NOT NULL,
  exchange_type TEXT,
  portions      DECIMAL(4,2) NOT NULL DEFAULT 1,
  calories      INTEGER,
  protein_g     DECIMAL(6,2),
  carbs_g       DECIMAL(6,2),
  fat_g         DECIMAL(6,2),
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  logged_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- WATER LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS water_logs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_ml  INTEGER NOT NULL,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  logged_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- STEP LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS step_logs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  steps      INTEGER NOT NULL DEFAULT 0,
  date       DATE NOT NULL DEFAULT CURRENT_DATE,
  source     TEXT NOT NULL DEFAULT 'manual',
  logged_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, date)
);

-- ============================================================
-- QUICK MEALS
-- ============================================================
CREATE TABLE IF NOT EXISTS quick_meals (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id        TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  meal_type      TEXT,
  total_calories INTEGER NOT NULL DEFAULT 0,
  description    TEXT,
  items          JSONB NOT NULL DEFAULT '[]',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role       TEXT CHECK (role IN ('user','assistant')) NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_food_logs_user_date      ON food_logs (user_id, date);
CREATE INDEX IF NOT EXISTS idx_water_logs_user_date     ON water_logs (user_id, date);
CREATE INDEX IF NOT EXISTS idx_step_logs_user_date      ON step_logs (user_id, date);
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user    ON workout_sessions (user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_quick_meals_user         ON quick_meals (user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user       ON chat_messages (user_id, created_at);
