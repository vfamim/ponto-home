export type Role = 'boss' | 'worker';

export type LogType = 'clock_in' | 'clock_out' | 'lunch_start' | 'lunch_end';

export type LogSource = 'app' | 'manual' | 'offline_sync';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  boss_id: string | null;
  pin_code: string | null;
  phone: string | null;
  profile_photo_path: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimeLog {
  id: string;
  worker_id: string;
  boss_id: string;
  log_type: LogType;
  log_source: LogSource;
  logged_at: string;
  qr_code_value: string;
  photo_path: string | null;
  photo_skipped_reason: string | null;
  synced: boolean;
  created_at: string;
}

export interface AppConfig {
  id: string;
  key: string;
  value: Record<string, unknown>;
  updated_at: string;
}

export interface VerifyPinResultRow {
  user_id: string;
  full_name: string;
  boss_id: string;
}

export type VerifyPinResult = VerifyPinResultRow[];

export interface WorkerStatus {
  profile: Profile;
  last_log: TimeLog | null;
  status: 'clocked_in' | 'clocked_out' | 'on_lunch' | 'absent';
}
