import { describe, it, expect } from 'vitest';
import {
  QR_CODE_VALUE,
  LOG_TYPE_LABELS,
  LOG_TYPE_COLORS,
  LOG_TYPE_TEXT_COLORS,
  PIN_MAX_ATTEMPTS,
  PIN_LOCKOUT_MINUTES,
  LUNCH_BREAK_DEFAULT_MINUTES,
} from '../constants';
import type { LogType, Role, LogSource } from '../types';

describe('constants', () => {
  it('QR_CODE_VALUE is a non-empty string', () => {
    expect(QR_CODE_VALUE).toBe('PONTO_KITCHEN_2026');
    expect(QR_CODE_VALUE.length).toBeGreaterThan(0);
  });

  it('LOG_TYPE_LABELS has all 4 log types in Portuguese', () => {
    const types: LogType[] = ['clock_in', 'clock_out', 'lunch_start', 'lunch_end'];
    for (const t of types) {
      expect(LOG_TYPE_LABELS[t]).toBeDefined();
      expect(typeof LOG_TYPE_LABELS[t]).toBe('string');
    }
    expect(LOG_TYPE_LABELS.clock_in).toBe('ENTRADA');
    expect(LOG_TYPE_LABELS.clock_out).toBe('SAIDA');
    expect(LOG_TYPE_LABELS.lunch_start).toBe('ALMOCO INICIO');
    expect(LOG_TYPE_LABELS.lunch_end).toBe('ALMOCO FIM');
  });

  it('LOG_TYPE_COLORS has colors for all log types', () => {
    const types: LogType[] = ['clock_in', 'clock_out', 'lunch_start', 'lunch_end'];
    for (const t of types) {
      expect(LOG_TYPE_COLORS[t]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('LOG_TYPE_TEXT_COLORS has text colors for all log types', () => {
    const types: LogType[] = ['clock_in', 'clock_out', 'lunch_start', 'lunch_end'];
    for (const t of types) {
      expect(LOG_TYPE_TEXT_COLORS[t]).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  it('PIN rate limiting constants are sensible', () => {
    expect(PIN_MAX_ATTEMPTS).toBe(5);
    expect(PIN_LOCKOUT_MINUTES).toBe(15);
    expect(PIN_MAX_ATTEMPTS).toBeGreaterThan(0);
    expect(PIN_LOCKOUT_MINUTES).toBeGreaterThan(0);
  });

  it('LUNCH_BREAK_DEFAULT_MINUTES is 60', () => {
    expect(LUNCH_BREAK_DEFAULT_MINUTES).toBe(60);
  });
});

describe('types', () => {
  it('Role type accepts valid values', () => {
    const boss: Role = 'boss';
    const worker: Role = 'worker';
    expect(boss).toBe('boss');
    expect(worker).toBe('worker');
  });

  it('LogType type accepts valid values', () => {
    const types: LogType[] = ['clock_in', 'clock_out', 'lunch_start', 'lunch_end'];
    expect(types).toHaveLength(4);
  });

  it('LogSource type accepts valid values', () => {
    const sources: LogSource[] = ['app', 'manual', 'offline_sync'];
    expect(sources).toHaveLength(3);
  });
});
