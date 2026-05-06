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
