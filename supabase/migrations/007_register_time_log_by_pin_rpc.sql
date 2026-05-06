CREATE OR REPLACE FUNCTION public.register_time_log_by_pin(
  input_pin TEXT,
  input_log_type TEXT,
  input_qr_code_value TEXT,
  input_location_latitude DOUBLE PRECISION,
  input_location_longitude DOUBLE PRECISION,
  input_location_accuracy_meters DOUBLE PRECISION,
  input_location_captured_at TIMESTAMPTZ
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_worker_id UUID;
  v_boss_id UUID;
  v_expected_qr TEXT;
  v_time_log_id UUID;
BEGIN
  SELECT p.id, p.boss_id
  INTO v_worker_id, v_boss_id
  FROM public.profiles p
  WHERE p.pin_code = input_pin
    AND p.role = 'worker'
    AND p.active = TRUE
  LIMIT 1;

  IF v_worker_id IS NULL THEN
    RAISE EXCEPTION 'Invalid PIN';
  END IF;

  SELECT value #>> '{}'
  INTO v_expected_qr
  FROM public.app_config
  WHERE key = 'kitchen_qr_code'
  LIMIT 1;

  IF v_expected_qr IS NOT NULL AND v_expected_qr <> '' AND input_qr_code_value <> v_expected_qr THEN
    RAISE EXCEPTION 'Invalid QR code';
  END IF;

  INSERT INTO public.time_logs (
    worker_id,
    boss_id,
    log_type,
    log_source,
    logged_at,
    qr_code_value,
    location_latitude,
    location_longitude,
    location_accuracy_meters,
    location_captured_at,
    photo_path,
    photo_skipped_reason,
    synced
  ) VALUES (
    v_worker_id,
    v_boss_id,
    input_log_type,
    'app',
    now(),
    input_qr_code_value,
    input_location_latitude,
    input_location_longitude,
    input_location_accuracy_meters,
    input_location_captured_at,
    NULL,
    'gps_location_used',
    TRUE
  ) RETURNING id INTO v_time_log_id;

  RETURN v_time_log_id;
END;
$$;

REVOKE ALL ON FUNCTION public.register_time_log_by_pin(
  TEXT,
  TEXT,
  TEXT,
  DOUBLE PRECISION,
  DOUBLE PRECISION,
  DOUBLE PRECISION,
  TIMESTAMPTZ
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.register_time_log_by_pin(
  TEXT,
  TEXT,
  TEXT,
  DOUBLE PRECISION,
  DOUBLE PRECISION,
  DOUBLE PRECISION,
  TIMESTAMPTZ
) TO anon, authenticated, service_role;
