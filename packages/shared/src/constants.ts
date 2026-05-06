import type { LogType } from './types';

export const QR_CODE_VALUE = 'PONTO_KITCHEN_2026';

export const LOG_TYPE_LABELS: Record<LogType, string> = {
  clock_in: 'ENTRADA',
  clock_out: 'SAIDA',
  lunch_start: 'ALMOCO INICIO',
  lunch_end: 'ALMOCO FIM',
} as const;

export const LOG_TYPE_COLORS: Record<LogType, string> = {
  clock_in: '#2E7D32',
  clock_out: '#C62828',
  lunch_start: '#FDD835',
  lunch_end: '#1565C0',
} as const;

export const LOG_TYPE_TEXT_COLORS: Record<LogType, string> = {
  clock_in: '#FFFFFF',
  clock_out: '#FFFFFF',
  lunch_start: '#000000',
  lunch_end: '#FFFFFF',
} as const;

export const PIN_MAX_ATTEMPTS = 5;

export const PIN_LOCKOUT_MINUTES = 15;

export const LUNCH_BREAK_DEFAULT_MINUTES = 60;
