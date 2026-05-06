import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { TimeLog } from '@ponto/shared';

interface UseTimeLogsParams {
  workerId?: string;
  logType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export function useTimeLogs(params: UseTimeLogsParams = {}) {
  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from('time_logs')
      .select('*')
      .order('logged_at', { ascending: false })
      .limit(500);

    if (params.workerId) query = query.eq('worker_id', params.workerId);
    if (params.logType) query = query.eq('log_type', params.logType);
    if (params.dateFrom) query = query.gte('logged_at', params.dateFrom);
    if (params.dateTo) query = query.lte('logged_at', params.dateTo);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching time logs:', error.message);
    } else {
      setLogs(data as TimeLog[]);
    }
    setLoading(false);
  }, [params.workerId, params.logType, params.dateFrom, params.dateTo]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const insertManualLog = async (log: {
    worker_id: string;
    log_type: string;
    logged_at: string;
    qr_code_value: string;
  }) => {
    const { error } = await supabase.from('time_logs').insert({
      ...log,
      boss_id: (await supabase.auth.getUser()).data.user?.id,
      log_source: 'manual',
      synced: true,
    });
    if (error) throw error;
    await fetchLogs();
  };

  const exportCsv = () => {
    const headers = ['worker_id', 'log_type', 'log_source', 'logged_at', 'qr_code_value', 'photo_path'];
    const rows = logs.map((log) =>
      [log.worker_id, log.log_type, log.log_source, log.logged_at, log.qr_code_value, log.photo_path ?? ''].join(',')
    );
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return { logs, loading, insertManualLog, exportCsv, refetch: fetchLogs };
}
