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

CREATE POLICY "Workers can insert own time_logs"
    ON public.time_logs FOR INSERT TO authenticated
    WITH CHECK (worker_id = auth.uid());

CREATE POLICY "Workers can update own time_logs"
    ON public.time_logs FOR UPDATE TO authenticated
    USING (worker_id = auth.uid())
    WITH CHECK (worker_id = auth.uid());

CREATE POLICY "Boss can insert manual time_logs"
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
