import { describe, it, expect } from 'vitest';
import type { TimeLog } from '@ponto/shared';

function buildCsv(logs: TimeLog[]): string {
  const headers = ['worker_id', 'log_type', 'log_source', 'logged_at', 'qr_code_value', 'photo_path'];
  const rows = logs.map((log) =>
    [log.worker_id, log.log_type, log.log_source, log.logged_at, log.qr_code_value, log.photo_path ?? ''].join(',')
  );
  return [headers.join(','), ...rows].join('\n');
}

describe('CSV export logic', () => {
  it('produces headers-only CSV for empty logs', () => {
    const csv = buildCsv([]);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(1);
    expect(lines[0]).toBe('worker_id,log_type,log_source,logged_at,qr_code_value,photo_path');
  });

  it('produces correct rows for time logs', () => {
    const logs: TimeLog[] = [
      {
        id: '1',
        worker_id: 'w1',
        boss_id: 'b1',
        log_type: 'clock_in',
        log_source: 'app',
        logged_at: '2026-05-05T08:00:00Z',
        qr_code_value: 'PONTO_KITCHEN_2026',
        photo_path: 'w1/clock_in_1.jpg',
        photo_skipped_reason: null,
        synced: true,
        created_at: '2026-05-05T08:00:00Z',
      },
      {
        id: '2',
        worker_id: 'w2',
        boss_id: 'b1',
        log_type: 'clock_out',
        log_source: 'manual',
        logged_at: '2026-05-05T17:00:00Z',
        qr_code_value: 'PONTO_KITCHEN_2026',
        photo_path: null,
        photo_skipped_reason: null,
        synced: true,
        created_at: '2026-05-05T17:00:00Z',
      },
    ];

    const csv = buildCsv(logs);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toBe('w1,clock_in,app,2026-05-05T08:00:00Z,PONTO_KITCHEN_2026,w1/clock_in_1.jpg');
    expect(lines[2]).toBe('w2,clock_out,manual,2026-05-05T17:00:00Z,PONTO_KITCHEN_2026,');
  });

  it('handles null photo_path as empty string', () => {
    const logs: TimeLog[] = [
      {
        id: '1',
        worker_id: 'w1',
        boss_id: 'b1',
        log_type: 'lunch_start',
        log_source: 'app',
        logged_at: '2026-05-05T12:00:00Z',
        qr_code_value: 'QR',
        photo_path: null,
        photo_skipped_reason: null,
        synced: false,
        created_at: '2026-05-05T12:00:00Z',
      },
    ];

    const csv = buildCsv(logs);
    const row = csv.split('\n')[1];
    const fields = row.split(',');
    expect(fields[5]).toBe('');
  });
});
