import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile, TimeLog, WorkerStatus } from '@ponto/shared';
import { LOG_TYPE_LABELS } from '@ponto/shared';

export default function DashboardPage() {
  const [workerStatuses, setWorkerStatuses] = useState<WorkerStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayCount, setTodayCount] = useState({ clockIn: 0, clockOut: 0, lunchStart: 0, lunchEnd: 0 });

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);

    const { data: workers } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'worker')
      .eq('active', true);

    const today = new Date().toISOString().split('T')[0];
    const { data: todayLogs } = await supabase
      .from('time_logs')
      .select('*')
      .gte('logged_at', today)
      .order('logged_at', { ascending: false });

    const logs = (todayLogs ?? []) as TimeLog[];
    const counts = { clockIn: 0, clockOut: 0, lunchStart: 0, lunchEnd: 0 };
    logs.forEach((log) => {
      if (log.log_type in counts) counts[log.log_type as keyof typeof counts]++;
    });
    setTodayCount(counts);

    const statuses: WorkerStatus[] = (workers ?? []).map((w: Profile) => {
      const workerLogs = logs.filter((l) => l.worker_id === w.id);
      const lastLog = workerLogs[0] ?? null;
      let status: WorkerStatus['status'] = 'absent';
      if (lastLog) {
        if (lastLog.log_type === 'clock_in') status = 'clocked_in';
        else if (lastLog.log_type === 'lunch_start') status = 'on_lunch';
        else if (lastLog.log_type === 'lunch_end') status = 'clocked_in';
        else if (lastLog.log_type === 'clock_out') status = 'clocked_out';
      }
      return { profile: w, last_log: lastLog, status };
    });

    setWorkerStatuses(statuses);
    setLoading(false);
  };

  const statusLabel: Record<WorkerStatus['status'], string> = {
    clocked_in: 'Presente',
    clocked_out: 'Saiu',
    on_lunch: 'No almoco',
    absent: 'Ausente',
  };

  const statusColor: Record<WorkerStatus['status'], string> = {
    clocked_in: 'bg-green-100 text-green-800',
    clocked_out: 'bg-gray-100 text-gray-800',
    on_lunch: 'bg-yellow-100 text-yellow-800',
    absent: 'bg-red-100 text-red-800',
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Painel de Hoje</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-green-700">{todayCount.clockIn}</p>
          <p className="text-sm text-green-600">Entradas</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-red-700">{todayCount.clockOut}</p>
          <p className="text-sm text-red-600">Saidas</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-yellow-700">{todayCount.lunchStart}</p>
          <p className="text-sm text-yellow-600">Almoco Inicio</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-3xl font-bold text-blue-700">{todayCount.lunchEnd}</p>
          <p className="text-sm text-blue-600">Almoco Fim</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold">Funcionarios</h2>
      <div className="grid gap-3">
        {workerStatuses.map((ws) => (
          <div key={ws.profile.id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
            <div>
              <p className="font-medium">{ws.profile.full_name}</p>
              {ws.last_log && (
                <p className="text-sm text-gray-500">
                  {LOG_TYPE_LABELS[ws.last_log.log_type]} - {new Date(ws.last_log.logged_at).toLocaleTimeString('pt-BR')}
                </p>
              )}
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor[ws.status]}`}>
              {statusLabel[ws.status]}
            </span>
          </div>
        ))}
        {workerStatuses.length === 0 && (
          <p className="text-gray-500 text-center py-8">Nenhum funcionario ativo</p>
        )}
      </div>
    </div>
  );
}
