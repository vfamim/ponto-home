import type { LogType } from '@ponto/shared';
import { supabase } from '@/lib/supabase';
import type { CapturedLocation } from './location-service';

interface RegisterTimeLogParams {
  pin: string;
  logType: LogType;
  qrCodeValue: string;
  location: CapturedLocation;
}

export async function registerTimeLog(params: RegisterTimeLogParams) {
  const { error } = await supabase.rpc('register_time_log_by_pin', {
    input_pin: params.pin,
    input_log_type: params.logType,
    input_qr_code_value: params.qrCodeValue,
    input_location_latitude: params.location.latitude,
    input_location_longitude: params.location.longitude,
    input_location_accuracy_meters: params.location.accuracyMeters,
    input_location_captured_at: params.location.capturedAt,
  });

  if (error) {
    throw new Error(error.message);
  }
}
