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
