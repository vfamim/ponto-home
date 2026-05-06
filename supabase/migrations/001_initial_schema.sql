CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: profiles (extends auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('boss', 'worker')),
    boss_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    pin_code TEXT,
    phone TEXT,
    profile_photo_path TEXT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_profiles_boss_id ON public.profiles(boss_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_pin_code
    ON public.profiles(pin_code)
    WHERE role = 'worker' AND active = TRUE;

-- ============================================
-- TABLE: time_logs
-- ============================================
CREATE TABLE IF NOT EXISTS public.time_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    boss_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_type TEXT NOT NULL CHECK (log_type IN ('clock_in', 'clock_out', 'lunch_start', 'lunch_end')),
    log_source TEXT NOT NULL DEFAULT 'app' CHECK (log_source IN ('app', 'manual', 'offline_sync')),
    logged_at TIMESTAMP NOT NULL DEFAULT now(),
    photo_skipped_reason TEXT,
    qr_code_value TEXT NOT NULL,
    photo_path TEXT,

CREATE INDEX IF NOT EXISTS idx_time_logs_worker_date
    ON public.time_logs(worker_id, DATE(logged_at));
CREATE INDEX IF NOT EXISTS idx_time_logs_boss_date
    ON public.time_logs(boss_id, DATE(logged_at));
CREATE INDEX IF NOT EXISTS idx_time_logs_synced
    ON public.time_logs(synced) WHERE synced = FALSE;
CREATE INDEX IF NOT EXISTS idx_time_logs_log_type
    ON public.time_logs(log_type);

-- ============================================
-- TABLE: app_config
-- ============================================
CREATE TABLE IF NOT EXISTS public.app_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO public.app_config (key, value) VALUES
    ('kitchen_qr_code', '"PONTO_KITCHEN_2026"'::jsonb),
    ('lunch_break_minutes', '60'::jsonb);

-- ============================================
-- STORAGE BUCKETS
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES
    ('time-photos', 'time-photos', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) VALUES
    ('worker-photos', 'worker-photos', FALSE)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- ============================================
-- TRIGGER: auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
        COALESCE(NEW.raw_user_meta_data->>'role', 'boss')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
