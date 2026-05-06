ALTER TABLE public.time_logs
  ADD COLUMN IF NOT EXISTS location_latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_accuracy_meters DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS location_captured_at TIMESTAMPTZ;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'time_logs_location_lat_range'
      AND conrelid = 'public.time_logs'::regclass
  ) THEN
    ALTER TABLE public.time_logs
      ADD CONSTRAINT time_logs_location_lat_range
      CHECK (location_latitude IS NULL OR (location_latitude >= -90 AND location_latitude <= 90));
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'time_logs_location_lng_range'
      AND conrelid = 'public.time_logs'::regclass
  ) THEN
    ALTER TABLE public.time_logs
      ADD CONSTRAINT time_logs_location_lng_range
      CHECK (location_longitude IS NULL OR (location_longitude >= -180 AND location_longitude <= 180));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_time_logs_location_captured_at
  ON public.time_logs(location_captured_at)
  WHERE location_captured_at IS NOT NULL;
