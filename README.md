# Ponto Home

Android time-tracking application for domestic staff, with a boss dashboard for monitoring.

---

## Table of Contents

- [Overview](#overview)
- [Architecture Decisions](#architecture-decisions)
- [Monorepo Structure](#monorepo-structure)
- [Supabase Setup Guide](#supabase-setup-guide)
- [MCP Configuration](#mcp-configuration)
- [Database Schema](#database-schema)
  - [001_initial_schema.sql](#001_initial_schemasql)
  - [002_rls_policies.sql](#002_rls_policiessql)
  - [003_verify_pin_rpc.sql](#003_verify_pin_rpcsql)
  - [004_storage_rls.sql](#004_storage_rlssql)
  - [005_pin_rate_limit_cleanup.sql](#005_pin_rate_limit_cleanupsql)
- [Environment Variables](#environment-variables)
- [Git Strategy](#git-strategy)
- [Step-by-Step Execution Plan](#step-by-step-execution-plan)
- [Mobile App Specification](#mobile-app-specification)
- [Web Dashboard Specification](#web-dashboard-specification)
- [UI / UX Specification](#ui--ux-specification)
- [Operational Procedures](#operational-procedures)
- [Worker Profile Photo vs Clock-in Selfie](#worker-profile-photo-vs-clock-in-selfie)
- [Research Sources](#research-sources)

---

## Overview

The application allows domestic staff to clock in, clock out, and log lunch breaks by:

1. Selecting an action (ENTRADA / SAIDA / ALMOCO INICIO / ALMOCO FIM)
2. Scanning a static QR Code fixed in the kitchen
3. Taking a selfie as proof of presence

Data (time, user ID, photo) is sent to a Supabase backend. The app is distributed via APK (no app store).

A separate web dashboard allows the boss to:
- Register and manage workers
- Monitor who is clocked in/out in real time
- View time logs with selfie photos
- Export data as CSV

---

## Architecture Decisions

| # | Decision | Choice | Detail |
|---|----------|--------|--------|
| 1 | Mobile framework | Expo (SDK 53+) with Expo Router | File-based routing, `Stack.Protected` for auth guards |
| 2 | Web framework | Vite + React + TypeScript | Boss dashboard |
| 3 | CSS | Tailwind CSS v4 | `@tailwindcss/vite` plugin (no PostCSS config needed) |
| 4 | Package manager | pnpm | Monorepo workspaces |
| 5 | Monorepo | Plain pnpm workspaces | No Turborepo |
| 6 | Auth (boss) | Supabase Auth (email/password) | JWT-based, triggers `handle_new_user()` |
| 7 | Auth (worker) | PIN code via `verify_pin()` RPC | 5 attempts, then 15-min lockout |
| 8 | Boss-worker link | `boss_id` FK on `profiles` | RLS policies scope all data per boss |
| 9 | Worker profile photo | Separate bucket (`worker-photos`) | Uploaded by boss during registration |
| 10 | Clock-in selfie | Separate bucket (`time-photos`) | Captured automatically during clock-in |
| 11 | Storage upload (RN) | ArrayBuffer from base64 | React Native does not support `File`/`Blob` for Supabase upload |
| 12 | APK build | EAS Build with `android.buildType: "apk"` | No Play Store distribution |
| 13 | Git strategy | Feature branches -> develop -> main | Squash merge on release |
| 14 | CI | GitHub Actions | Lint + typecheck + build |
| 15 | Supabase MCP | `https://mcp.supabase.com/mcp` | HTTP type |
| 16 | Vault language | English folder names, Portuguese content | Documentation in Obsidian |
| 17 | Versioning | Git tags on `main` | Semantic versioning |

### Expo vs Flutter Decision Matrix

| Criterion | Expo (React Native) | Flutter |
|-----------|---------------------|---------|
| QR Scanner | Native via `expo-camera` (zero config) | Requires `mobile_scanner` package (third-party) |
| Camera selfie | Same `CameraView` controller, type switch | `camera` package, separate controller |
| APK generation | `eas build --profile production` (cloud) | `flutter build apk` (local) |
| Supabase SDK | Official `@supabase/supabase-js` | Official `supabase_flutter` |
| Storage upload | Must use ArrayBuffer from base64 | Supports `File` and `Uint8List` natively |
| Team familiarity | JavaScript/TypeScript ecosystem | Dart ecosystem (smaller talent pool) |
| **Recommendation** | **Selected** | Viable alternative |

---

## Monorepo Structure

```
ponto-home/
├── .github/workflows/ci.yml
├── apps/
│   ├── mobile/                          # Expo React Native (worker app)
│   │   ├── app/                         # Expo Router file-based routes
│   │   │   ├── _layout.tsx              # Root layout with Stack.Protected
│   │   │   ├── index.tsx                # Home / log-type selection
│   │   │   ├── clock-screen.tsx         # QR scan + selfie + upload
│   │   │   ├── pin-login.tsx            # Worker PIN authentication
│   │   │   └── settings.tsx             # Pending records, manual sync
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── ActionButton.tsx     # Reusable large button
│   │   │   │   └── StatusBanner.tsx     # Success/error banner
│   │   │   ├── hooks/
│   │   │   │   └── useAuth.ts           # Auth state hook
│   │   │   ├── lib/
│   │   │   │   ├── auth.ts              # Auth state management (AsyncStorage)
│   │   │   │   └── supabase.ts          # Supabase client init
│   │   │   └── services/
│   │   │       ├── offline-sync.ts      # Local queue + NetInfo sync
│   │   │       └── time-log-service.ts  # Upload + insert logic
│   │   ├── .env.example
│   │   ├── app.json
│   │   ├── eas.json
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── web/                             # Vite + React (boss dashboard)
│       ├── src/
│       │   ├── components/
│       │   │   ├── ProtectedRoute.tsx
│       │   │   ├── WorkerForm.tsx
│       │   │   ├── WorkerTable.tsx
│       │   │   ├── TimeLogTable.tsx
│       │   │   ├── PhotoModal.tsx
│       │   │   ├── DateRangePicker.tsx
│       │   │   └── StatusBanner.tsx
│       │   ├── hooks/
│       │   │   ├── useAuth.ts
│       │   │   ├── useTimeLogs.ts
│       │   │   └── useWorkers.ts
│       │   ├── lib/
│       │   │   └── supabase.ts
│       │   ├── pages/
│       │   │   ├── Dashboard.tsx         # Today's summary + worker status
│       │   │   ├── Login.tsx             # Boss email/password auth
│       │   │   ├── Settings.tsx          # QR value, lunch duration, profile
│       │   │   ├── TimeLogs.tsx          # Filterable table + CSV export
│       │   │   └── Workers.tsx           # Worker CRUD + profile photo
│       │   ├── App.tsx
│       │   └── index.css                # @import "tailwindcss"
│       ├── .env.example
│       ├── index.html
│       ├── vite.config.ts
│       ├── tsconfig.json
│       └── package.json
├── packages/
│   ├── shared/                          # @ponto/shared
│   │   ├── src/
│   │   │   ├── types.ts                 # Profile, TimeLog, LogType, etc.
│   │   │   ├── constants.ts             # QR_CODE_VALUE, LOG_TYPE_LABELS
│   │   │   └── index.ts                 # Barrel export
│   │   ├── tsconfig.json
│   │   └── package.json
│   └── supabase-config/                 # @ponto/supabase-config
│       ├── src/
│       │   └── client.ts                # Supabase client factory
│       ├── tsconfig.json
│       └── package.json
├── supabase/
│   ├── functions/
│   │   └── create-worker/
│   │       └── index.ts                 # Edge function: boss creates worker auth
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       ├── 003_verify_pin_rpc.sql
│       ├── 004_storage_rls.sql
│       └── 005_pin_rate_limit_cleanup.sql
├── docs/                                # Obsidian vault
│   ├── 00-META/
│   │   ├── project-charter.md
│   │   ├── stack-decisions.md
│   │   └── glossary.md
│   ├── 01-REQUIREMENTS/
│   │   ├── functional/
│   │   │   ├── RF-001-clock-in-out.md
│   │   │   ├── RF-002-qr-scan.md
│   │   │   ├── RF-003-selfie-capture.md
│   │   │   ├── RF-004-lunch-break.md
│   │   │   ├── RF-005-offline-sync.md
│   │   │   ├── RF-006-boss-dashboard.md
│   │   │   ├── RF-007-worker-registration.md
│   │   │   └── RF-008-auth-flow.md
│   │   └── non-functional/
│   │       ├── RNF-001-accessibility.md
│   │       ├── RNF-002-security-rls.md
│   │       └── RNF-003-performance.md
│   ├── 02-DEVELOPMENT/
│   │   ├── sql/
│   │   ├── screens/
│   │   ├── integration/
│   │   └── dev-logs/
│   ├── 03-BUGS/
│   ├── 04-OPERATIONS/
│   │   ├── sop-contingencies.md
│   │   ├── qr-code-physical-spec.md
│   │   └── apk-install-procedure.md
│   ├── 05-TESTS/
│   │   └── test-cases/
│   ├── TEMPLATES/
│   │   ├── template-requirement.md
│   │   ├── template-dev-log.md
│   │   └── template-bug.md
│   └── vault-init.sh
├── .env.example
├── .gitignore
├── package.json                         # Root workspace config
├── pnpm-workspace.yaml
└── README.md
```

---

## Supabase Setup Guide

### Step 1: Create Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in with GitHub or email
3. Click **"New Project"**
4. Fill in:
   - **Name**: `ponto-home`
   - **Database Password**: Generate a strong password and save it securely
   - **Region**: Choose the closest to your location (e.g., `South America (sa-east-1)`)
5. Wait for provisioning (~2 minutes)

### Step 2: Get API Keys

1. Once active, go to **Settings > API**
2. Copy these values:
   - **Project URL**: `https://<your-project-ref>.supabase.co`
   - **anon/public key**: `eyJhbG...` (long string)
3. Go to **Settings > API > service_role key** (reveal it) -- copy and store securely
4. These 3 values go into `.env` files (never commit real values)

### Step 3: Install Supabase CLI

```bash
npm install -g supabase
supabase login
supabase init                  # run inside project root
supabase link --project-ref <your-project-ref>
```

### Step 4: Apply Migrations

```bash
supabase db push               # applies all migrations in supabase/migrations/
```

Or apply manually via the Supabase Dashboard SQL Editor, or via the Supabase MCP.

### Step 5: Enable pg_cron

1. Go to **Database > Extensions** in Supabase Dashboard
2. Enable `pg_cron` extension
3. Migration `005_pin_rate_limit_cleanup.sql` will schedule the cleanup job

---

## MCP Configuration

Add the Supabase MCP server to opencode config at `~/.config/opencode/opencode.json`:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "nvidia/qwen/qwen3-coder-480b-a35b-instruct",
  "mcp": {
    "octocode": {
      "type": "local",
      "enabled": true,
      "command": ["npx", "octocode-mcp@latest"]
    },
    "context7": {
      "type": "remote",
      "enabled": true,
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "ctx7sk-7a407169-fc3f-47d1-b1f4-db1cd9072df2"
      }
    },
    "notebooklm": {
      "type": "local",
      "enabled": true,
      "command": ["/home/vfamim/.local/bin/notebooklm-mcp"]
    },
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    }
  }
}
```

---

## Database Schema

### 001_initial_schema.sql

```sql
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
    logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    qr_code_value TEXT NOT NULL,
    photo_path TEXT,
    photo_skipped_reason TEXT,
    synced BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

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
```

### 002_rls_policies.sql

```sql
-- ============================================
-- RLS: profiles
-- ============================================
CREATE POLICY "Boss can view own profile and workers"
    ON public.profiles FOR SELECT TO authenticated
    USING (id = auth.uid() OR boss_id = auth.uid());

CREATE POLICY "Workers can view own profile"
    ON public.profiles FOR SELECT TO authenticated
    USING (id = auth.uid());

CREATE POLICY "Boss can insert workers"
    ON public.profiles FOR INSERT TO authenticated
    WITH CHECK (boss_id = auth.uid() AND role = 'worker');

CREATE POLICY "Boss can update own workers"
    ON public.profiles FOR UPDATE TO authenticated
    USING (boss_id = auth.uid())
    WITH CHECK (boss_id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE TO authenticated
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

CREATE POLICY "Service role full access on profiles"
    ON public.profiles FOR ALL TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ============================================
-- RLS: time_logs
-- ============================================
CREATE POLICY "Boss can view workers time logs"
    ON public.time_logs FOR SELECT TO authenticated
    USING (boss_id = auth.uid());

CREATE POLICY "Workers can view own time logs"
    ON public.time_logs FOR SELECT TO authenticated
    USING (worker_id = auth.uid());

CREATE POLICY "Workers can insert own time logs"
    ON public.time_logs FOR INSERT TO authenticated
    WITH CHECK (worker_id = auth.uid());

CREATE POLICY "Workers can update own time logs"
    ON public.time_logs FOR UPDATE TO authenticated
    USING (worker_id = auth.uid())
    WITH CHECK (worker_id = auth.uid());

CREATE POLICY "Boss can insert manual time logs"
    ON public.time_logs FOR INSERT TO authenticated
    WITH CHECK (boss_id = auth.uid() AND log_source = 'manual');

CREATE POLICY "Service role full access on time_logs"
    ON public.time_logs FOR ALL TO service_role
    USING (TRUE) WITH CHECK (TRUE);

-- ============================================
-- RLS: app_config
-- ============================================
CREATE POLICY "Authenticated can read app_config"
    ON public.app_config FOR SELECT TO authenticated
    USING (TRUE);

CREATE POLICY "Service role can modify app_config"
    ON public.app_config FOR ALL TO service_role
    USING (TRUE) WITH CHECK (TRUE);
```

### 003_verify_pin_rpc.sql

```sql
CREATE OR REPLACE FUNCTION public.verify_pin(input_pin TEXT)
RETURNS TABLE(user_id UUID, full_name TEXT, boss_id UUID)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    attempt_key TEXT := 'pin_attempts_' || input_pin;
    attempts INT;
BEGIN
    SELECT COALESCE(
        (SELECT value->>'count'
         FROM public.app_config
         WHERE key = attempt_key)::int,
        0
    ) INTO attempts;

    IF attempts >= 5 THEN
        RAISE EXCEPTION 'PIN locked. Try again in 15 minutes.';
    END IF;

    RETURN QUERY
    SELECT p.id, p.full_name, p.boss_id
    FROM public.profiles p
    WHERE p.pin_code = input_pin
      AND p.role = 'worker'
      AND p.active = TRUE;

    IF NOT FOUND THEN
        INSERT INTO public.app_config (key, value)
        VALUES (attempt_key, jsonb_build_object(
            'count', attempts + 1,
            'last_attempt', now()
        ))
        ON CONFLICT (key) DO UPDATE
            SET value = EXCLUDED.value, updated_at = now();

        RAISE EXCEPTION 'Invalid PIN. Attempts remaining: %', 5 - attempts - 1;
    END IF;

    DELETE FROM public.app_config WHERE key = attempt_key;
END;
$$;
```

### 004_storage_rls.sql

```sql
-- ============================================
-- STORAGE RLS: time-photos bucket (clock-in selfies)
-- ============================================
CREATE POLICY "Users can upload to own folder in time-photos"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'time-photos'
        AND (storage.folder(name))[1] = auth.uid()::text
    );

CREATE POLICY "Users can read own photos in time-photos"
    ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'time-photos'
        AND (storage.folder(name))[1] = auth.uid()::text
    );

CREATE POLICY "Boss can read workers photos in time-photos"
    ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'time-photos'
        AND (storage.folder(name))[1] IN (
            SELECT id::text FROM public.profiles WHERE boss_id = auth.uid()
        )
    );

CREATE POLICY "Service role full access on time-photos storage"
    ON storage.objects FOR ALL TO service_role
    USING (bucket_id = 'time-photos')
    WITH CHECK (bucket_id = 'time-photos');

-- ============================================
-- STORAGE RLS: worker-photos bucket (profile photos)
-- ============================================
CREATE POLICY "Boss can upload worker profile photos"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'worker-photos'
        AND EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id::text = (storage.folder(name))[1]
              AND boss_id = auth.uid()
        )
    );

CREATE POLICY "Boss can read worker profile photos"
    ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'worker-photos'
        AND (storage.folder(name))[1] IN (
            SELECT id::text FROM public.profiles WHERE boss_id = auth.uid()
        )
    );

CREATE POLICY "Workers can read own profile photo"
    ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'worker-photos'
        AND (storage.folder(name))[1] = auth.uid()::text
    );

CREATE POLICY "Service role full access on worker-photos storage"
    ON storage.objects FOR ALL TO service_role
    USING (bucket_id = 'worker-photos')
    WITH CHECK (bucket_id = 'worker-photos');
```

### 005_pin_rate_limit_cleanup.sql

```sql
-- Requires pg_cron extension enabled in Supabase dashboard
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'cleanup-pin-attempts',
    '*/15 * * * *',
    $$
    DELETE FROM public.app_config
    WHERE key LIKE 'pin_attempts_%'
      AND (value->>'last_attempt')::timestamptz < now() - interval '15 minutes';
    $$
);
```

---

## Environment Variables

### Root `.env.example`

```env
# ===========================================
# Ponto Home - Environment Variables Template
# ===========================================
# Copy to .env and fill with real values.
# NEVER commit .env to version control.

# -------------------------------------------
# Supabase (shared)
# -------------------------------------------
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# -------------------------------------------
# Supabase CLI (for local dev and migrations)
# -------------------------------------------
# SUPABASE_ACCESS_TOKEN=your-supabase-dashboard-access-token
# SUPABASE_DB_PASSWORD=your-database-password

# -------------------------------------------
# CI/CD (set as GitHub Actions Secrets)
# -------------------------------------------
# EXPO_TOKEN=your-expo-token-for-eas-build
```

### `apps/mobile/.env.example`

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
EXPO_PUBLIC_QR_CODE_VALUE=PONTO_KITCHEN_2026
```

### `apps/web/.env.example`

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Git Strategy

### Branch Strategy

| Branch | Purpose | Merge Target |
|--------|---------|-------------|
| `main` | Production-ready code | -- |
| `develop` | Integration branch | `main` (via squash merge on release) |
| `feature/scaffold-monorepo` | Initial monorepo setup | `develop` |
| `feature/schema-and-rls` | Supabase SQL migrations | `develop` |
| `feature/mobile-pin-login` | PIN authentication for workers | `develop` |
| `feature/mobile-clock-screen` | Worker clock-in/out screen | `develop` |
| `feature/mobile-offline-sync` | Offline queue + sync service | `develop` |
| `feature/web-boss-auth` | Boss login with Supabase Auth | `develop` |
| `feature/web-boss-dashboard` | Boss dashboard | `develop` |
| `feature/web-worker-management` | Worker CRUD in dashboard | `develop` |
| `feature/web-time-logs-view` | Time log viewing/filtering | `develop` |
| `feature/docs-vault` | Obsidian vault initialization | `develop` |
| `feature/env-and-ci` | .env.example, CI workflow | `develop` |

### Conventional Commit Format

```
<type>(<scope>): <description>

[optional body]
[optional footer(s)]
```

- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `ci`
- **Scopes**: `mobile`, `web`, `shared`, `supabase`, `docs`, `root`

---

## Step-by-Step Execution Plan

### Phase 1: Foundation

| Step | Branch | Commit Message |
|------|--------|---------------|
| 0 | -- | Install pnpm, add Supabase MCP config |
| 1 | `feature/scaffold-monorepo` | `chore(root): initialize pnpm monorepo workspace structure` |
| 2 | `feature/scaffold-monorepo` | `feat(shared): create shared types, constants, and Supabase client factory` |
| 3 | `feature/scaffold-monorepo` | `feat(mobile): scaffold Expo app with camera, router, and Supabase` |
| 4 | `feature/scaffold-monorepo` | `feat(web): scaffold Vite React TypeScript boss dashboard with Tailwind v4` |
| 5 | `develop` | Merge `feature/scaffold-monorepo` into `develop` |

### Phase 2: Database

| Step | Branch | Commit Message |
|------|--------|---------------|
| 6 | `feature/schema-and-rls` | `feat(supabase): add initial schema with profiles, time_logs, app_config, buckets` |
| 7 | `feature/schema-and-rls` | `feat(supabase): add RLS policies for boss-scoped data access` |
| 8 | `feature/schema-and-rls` | `feat(supabase): add verify_pin RPC with rate limiting` |
| 9 | `feature/schema-and-rls` | `feat(supabase): add storage bucket RLS for time-photos and worker-photos` |
| 10 | `feature/schema-and-rls` | `feat(supabase): add pg_cron cleanup for PIN rate limit counters` |
| 11 | `develop` | Merge `feature/schema-and-rls` into `develop` |

### Phase 3: Mobile Core

| Step | Branch | Commit Message |
|------|--------|---------------|
| 12 | `feature/mobile-pin-login` | `feat(mobile): implement PIN login with rate limiting and auth state` |
| 13 | `develop` | Merge `feature/mobile-pin-login` into `develop` |
| 14 | `feature/mobile-clock-screen` | `feat(mobile): implement QR scan + selfie capture + Supabase upload flow` |
| 15 | `feature/mobile-clock-screen` | `feat(mobile): add haptic feedback and visual state indicators` |
| 16 | `develop` | Merge `feature/mobile-clock-screen` into `develop` |
| 17 | `feature/mobile-offline-sync` | `feat(mobile): implement offline queue with AsyncStorage and NetInfo sync` |
| 18 | `develop` | Merge `feature/mobile-offline-sync` into `develop` |

### Phase 4: Web Dashboard

| Step | Branch | Commit Message |
|------|--------|---------------|
| 19 | `feature/web-boss-auth` | `feat(web): implement boss login with Supabase Auth` |
| 20 | `develop` | Merge `feature/web-boss-auth` into `develop` |
| 21 | `feature/web-boss-dashboard` | `feat(web): implement dashboard with worker status and today's summary` |
| 22 | `develop` | Merge `feature/web-boss-dashboard` into `develop` |
| 23 | `feature/web-worker-management` | `feat(web): implement worker registration with profile photo upload` |
| 24 | `develop` | Merge `feature/web-worker-management` into `develop` |
| 25 | `feature/web-time-logs-view` | `feat(web): implement time logs table with filters, photo preview, and CSV export` |
| 26 | `develop` | Merge `feature/web-time-logs-view` into `develop` |

### Phase 5: Documentation and CI

| Step | Branch | Commit Message |
|------|--------|---------------|
| 27 | `feature/docs-vault` | `docs: initialize project documentation vault with templates and SOPs` |
| 28 | `develop` | Merge `feature/docs-vault` into `develop` |
| 29 | `feature/env-and-ci` | `ci(root): add GitHub Actions workflow for lint, typecheck, build` |
| 30 | `develop` | Merge `feature/env-and-ci` into `develop` |

### Phase 6: Release

| Step | Branch | Action |
|------|--------|--------|
| 31 | `develop` | Integration testing and fixes |
| 32 | `main` | Squash merge from `develop` as `chore(release): v0.1.0`, tag `v0.1.0` |

---

## Mobile App Specification

### Auth Flow (Worker -- PIN)

1. Worker opens mobile app
2. Enters 4-digit PIN code on large numeric keypad
3. App calls `supabase.rpc('verify_pin', { input_pin: pin })`
4. On success: session stored in AsyncStorage, navigate to home
5. On failure: shows remaining attempts, locks after 5 failures for 15 minutes

### Auth Flow (Boss -- Web)

1. Boss signs up via web dashboard with email/password
2. Supabase Auth triggers `handle_new_user()` -> creates `profiles` row with `role = 'boss'`
3. Boss logs in, JWT stored in browser localStorage
4. All API calls use JWT; RLS policies filter data to `boss_id = auth.uid()`
5. Boss creates worker profiles via Edge Function

### Clock Screen Flow

```
Step 1: User opens app
  -> Large buttons: ENTRADA | SAIDA | ALMOCO INICIO | ALMOCO FIM
  -> Each button has distinct color + icon + text label

Step 2: User taps desired action
  -> Button stays highlighted (selected state)
  -> Camera view activates with QR scanner
  -> Top banner: "Aponte a camera para o QR Code na cozinha"

Step 3: User scans QR Code
  -> Haptic confirmation (200ms vibration)
  -> Camera switches to front-facing
  -> Bottom banner: "Posicione seu rosto e toque no botao"

Step 4: User taps capture button
  -> White screen flash + haptic
  -> Upload indicator
  -> Success/failure banner
  -> Return to Step 1

Total taps required: 2 (select action + capture selfie)
```

### Key Dependencies (Mobile)

```bash
npx expo install expo-camera expo-file-system expo-router
npx expo install @react-native-async-storage/async-storage
npx expo install @react-native-community/netinfo
npm install @supabase/supabase-js base64-arraybuffer
```

### EAS Build Configuration (`eas.json`)

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

Build command: `eas build --platform android --profile production`

### Expo Router Layout (Protected Routes)

```tsx
import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function RootLayout() {
  const { session } = useAuth();

  return (
    <Stack>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="index" />
        <Stack.Screen name="clock-screen" />
        <Stack.Screen name="settings" />
      </Stack.Protected>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="pin-login" />
      </Stack.Protected>
    </Stack>
  );
}
```

### Supabase Client (Mobile)

```typescript
import 'expo-sqlite/localStorage/install';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### Storage Upload Pattern (React Native)

React Native does not support `File`, `Blob`, or `FormData` for Supabase storage uploads.
Convert base64 to `ArrayBuffer` using `base64-arraybuffer`:

```typescript
import { decode as decodeBase64 } from 'base64-arraybuffer';

const base64Data = decodeBase64(photo.base64);

const { error } = await supabase.storage
  .from('time-photos')
  .upload(`${workerId}/clock_in_${Date.now()}.jpg`, base64Data, {
    contentType: 'image/jpeg',
    cacheControl: '3600',
    upsert: false,
  });
```

---

## Web Dashboard Specification

### Pages and Features

| Page | Route | Features |
|------|-------|----------|
| Login | `/login` | Email/password auth via Supabase Auth |
| Dashboard | `/` | Today's summary: who clocked in/out, on lunch, absent. Worker status cards. |
| Workers | `/workers` | CRUD for workers. Add worker = creates auth + profile with PIN. Profile photo upload. |
| Time Logs | `/time-logs` | Filterable table by date, worker, log type. View selfie photos. CSV export. |
| Settings | `/settings` | Change QR code value, lunch duration, own profile. |

### Tailwind CSS v4 Setup

```bash
pnpm add -D tailwindcss @tailwindcss/vite
```

**`vite.config.ts`:**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': '/src' },
  },
});
```

**`src/index.css`:**

```css
@import "tailwindcss";
```

No `tailwind.config.js` needed in v4.

### Edge Function: create-worker

```typescript
// supabase/functions/create-worker/index.ts
// Receives boss's JWT
// Validates boss role
// Creates auth.users entry with random password
// Inserts profiles row with boss_id = boss's uid, role = 'worker', PIN
// Uploads profile photo to worker-photos bucket
```

---

## UI / UX Specification

### Button Dimensions and Touch Targets

| Element | Minimum Size | Recommended Size | Spacing |
|---------|-------------|-----------------|---------|
| Primary action buttons | 48x48dp (WCAG 2.5.5) | 64x64dp | 16dp between targets |
| Full-width action buttons | 48dp height | 64dp height | 12dp vertical gap |
| Capture button (selfie) | 64x64dp | 80x80dp | Centered, 40dp from bottom |
| Text labels on buttons | 16sp minimum | 24sp bold, uppercase | -- |

### Contrast Ratios (WCAG 2.1 AA minimum)

| Element | Foreground | Background | Ratio | Compliance |
|---------|-----------|------------|-------|-----------|
| ENTRADA button text | #FFFFFF | #2E7D32 | 8.2:1 | AAA |
| SAIDA button text | #FFFFFF | #C62828 | 5.9:1 | AA |
| ALMOCO INICIO button text | #000000 | #FDD835 | 12.5:1 | AAA |
| ALMOCO FIM button text | #FFFFFF | #1565C0 | 6.7:1 | AAA |
| Instruction text on dark overlay | #FFFFFF | rgba(0,0,0,0.85) | >7:1 | AAA |
| Error message text | #FFFFFF | #B71C1C | 5.5:1 | AA |

### Visual Feedback States

| State | Visual Feedback | Haptic Feedback | Duration |
|-------|----------------|----------------|----------|
| QR Code scanned (valid) | Green flash overlay + "QR Validado" + checkmark | Vibration 200ms | 500ms |
| QR Code scanned (invalid) | Red flash overlay + "QR Invalido" + X icon | Vibration 100ms, pause, 100ms | Until dismissal |
| Selfie captured | White screen flash + thumbnail preview | Vibration 100ms | 2000ms |
| Upload in progress | ActivityIndicator on capture button + "Enviando..." | None | Until complete |
| Upload success | Green banner "Registro Concluido" + large checkmark | Vibration 0-100-50-100 | 3000ms |
| Upload failure | Red banner "Erro - Registro salvo localmente" + retry | Double vibration 100ms | Until dismissal |
| Network offline | Yellow persistent banner "Sem conexao" | None | Persistent |
| No camera permission | Full-screen message + "Conceder Permissao" button | None | Until action |

---

## Operational Procedures

### SOP: Network Failure

1. App detects network unavailability via NetInfo state change
2. Yellow persistent banner: "Sem conexao. Registro salvo no aparelho."
3. Time log saved to local AsyncStorage with `synced = FALSE`
4. Photo saved to local filesystem with path recorded in local DB
5. Background sync service monitors connectivity
6. When network restores, service uploads pending photos and updates `time_logs`
7. Manual fallback: Settings > "Registros Pendentes" > "Sincronizar Agora"
8. If sync fails after 24h: supervisor exports CSV via share function, emails to payroll

### SOP: Power Outage (QR Code in the Dark)

1. User enables device flashlight (system toggle or in-app torch button)
2. App provides flashlight toggle on scanner screen (always visible during QR scan)
3. If flashlight insufficient: supervisor provides battery-powered lantern
4. If QR remains unreadable: supervisor enters "Registro Manual" mode (long-press on app title + supervisor PIN)
5. Manual record flagged with `log_source = 'manual'` in database
6. Preventive measure: QR Code print includes phosphorescent border

### SOP: Camera Malfunction

1. App checks camera permission; if denied, prompts with settings button
2. If permission granted but camera fails: "Camera indisponivel" + "Tentar Novamente" (re-initializes CameraController)
3. After 3 failed retries: "Registro Sem Foto" mode
4. Time log saved with `photo_path = NULL`, `photo_skipped_reason = 'camera_malfunction'`
5. Flagged for supervisor review at end of day
6. If camera hardware defective: IT provides replacement enrolled device

### Physical QR Code Specifications

| Parameter | Specification | Rationale |
|-----------|--------------|-----------|
| QR Version | Version 3 (29x29 modules) | Sufficient for `PONTO_KITCHEN_2026` with error correction |
| Error Correction Level | H (30% recovery) | Tolerates partial damage, dirt, or wear in kitchen |
| Printed Size | 15cm x 15cm (minimum 10cm) | Readable at 30-50cm without precise aiming |
| Module Scaling | 4mm per module at 15cm print | Exceeds minimum 0.5mm/module for readers |
| Quiet Zone | 4-module white border (1.6cm min) | Required by ISO/IEC 18004 |
| Print Material | Matte laminated vinyl or PVC foam board | Kitchen-safe: resistant to humidity, grease, chemicals |
| Lamination | Anti-reflective matte overlaminate | Prevents glare from kitchen lighting |
| Phosphorescent Border | Glow-in-the-dark strip (1cm wide) | Enables scanning during power outages |
| Mounting Height | 140cm from floor (center) | Ergonomic for selfie positioning at chest height |
| Mounting Location | Wall adjacent to kitchen entrance, left side | Natural rotation from QR scan to selfie |
| Mounting Method | Adhesive + 4 corner screws on PVC board | Prevents detachment from humidity or impact |
| Background | Pure white (#FFFFFF) | Maximum contrast |
| Foreground | Pure black (#000000) | Maximum contrast per ISO 18004 |

---

## Worker Profile Photo vs Clock-in Selfie

| Aspect | Profile Photo | Clock-in Selfie |
|--------|--------------|-----------------|
| Purpose | Identify worker in dashboard | Proof of presence at clock-in |
| Who uploads | Boss (during registration) | Worker (automatically captured) |
| Storage bucket | `worker-photos` | `time-photos` |
| Path pattern | `worker-photos/{worker_id}/profile.jpg` | `time-photos/{worker_id}/{log_type}_{timestamp}.jpg` |
| When set | Once during registration | Every clock-in/out event |
| Viewable by | Boss dashboard (avatar), Worker (own) | Boss dashboard (time log detail), Worker (own) |
| RLS | Boss can upload/read, Worker can read own | Worker can upload/read own, Boss can read workers' |

---

## Research Sources

### Context7 Queries

| Library | Query | Key Finding |
|---------|-------|-------------|
| `/expo/expo` | QR code scanner + camera + APK build | `CameraView` with `barcodeScannerSettings={{ barcodeTypes: ["qr"] }}`; APK via `eas.json` `android.buildType: "apk"` |
| `/websites/supabase` | RLS + storage upload + auth | RLS on `storage.objects` requires `bucket_id` filter; RN uploads must use `ArrayBuffer` from base64; JWT enables RLS |
| `/websites/flutter_dev` | QR + camera + APK | Viable alternative but requires more third-party packages |
| `/expo/expo` | Protected routes | `Stack.Protected` and `Tabs.Protected` for conditional routing |
| `/expo/expo` | Monorepo setup | pnpm workspaces with `apps/*` and `packages/*` |
| `/tailwindlabs/tailwindcss.com` | Tailwind v4 + Vite | Install `@tailwindcss/vite`, add to `vite.config.ts` plugins, `@import "tailwindcss"` in CSS |

### Octocode GitHub Research

| Repository | Relevance | Key Insight |
|-----------|-----------|-------------|
| `clawd-bots/hr-face-clock` | Time-clock with face recognition + Supabase | `time_logs(employee_id, clock_in, clock_out, hours_worked, date)` schema with indexes on `(employee_id, date)` |
| `swells808/cicoclock` | Clock-in/out with photo + Supabase Edge Functions | Uses `supabase.functions.invoke('clock-in-out')` with `photo_url` in payload |
| `hillary-gor/ticketszetu-scanner` | QR scanner + Supabase + offline sync | `useSyncStore` with `QueuedScan` type for offline-first scanning |
| `JessicaCZarate/shelflife` | Barcode scanner + Supabase upload in Expo | `expo-camera`, `base64-arraybuffer` decode, `supabase.storage.from().upload()` |
| `Adel0s/PillSync` | Camera + barcode + Supabase in Expo Router | Combines `CameraView`, `expo-image-picker`, Supabase in single screen |

### Best Practices Checklist

1. **QR Validation**: Always validate scanned QR value against a known constant before proceeding
2. **Atomic Operations**: Insert `time_log` ONLY after confirming storage upload succeeded; if upload fails, insert with `photo_path = NULL` and `synced = FALSE`
3. **Index Strategy**: Composite index `(worker_id, DATE(logged_at))` for most common query; partial index on `synced WHERE synced = FALSE` for offline sync worker
4. **Base64 Upload**: In React Native, always use `decode(base64String)` from `base64-arraybuffer` to convert to `ArrayBuffer` before Supabase storage upload
5. **Vibration Feedback**: Use `Vibration.vibrate()` for haptic confirmation; distinguish patterns (single pulse = scan success, double pulse = upload success)
6. **Flashlight Toggle**: Provide in-app torch button during QR scanning for low-light conditions
7. **Offline-First**: Use `AsyncStorage` + `expo-file-system` for local persistence; implement sync queue monitoring `NetInfo` state changes
8. **APK Sideloading**: Document "Install from unknown sources" procedure for target Android versions
9. **Rate Limiting**: `verify_pin()` RPC enforces 5-attempt lockout with 15-minute auto-reset via pg_cron
10. **Boss-Worker Isolation**: All data access scoped via `boss_id` in RLS policies; workers only see their own data
