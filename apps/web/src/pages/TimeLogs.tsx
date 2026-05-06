import { useState } from 'react';
import { useTimeLogs } from '@/hooks/useTimeLogs';
import { TimeLogTable } from '@/components/TimeLogTable';
import { DateRangePicker } from '@/components/DateRangePicker';

export default function TimeLogsPage() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [logType, setLogType] = useState('');

  const { logs, loading, exportCsv } = useTimeLogs({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    logType: logType || undefined,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Registros de Ponto</h1>

      <div className="flex flex-wrap gap-4 items-end bg-white p-4 rounded-xl shadow">
        <DateRangePicker
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            value={logType}
            onChange={(e) => setLogType(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="">Todos</option>
            <option value="clock_in">Entrada</option>
            <option value="clock_out">Saida</option>
            <option value="lunch_start">Almoco Inicio</option>
            <option value="lunch_end">Almoco Fim</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
        </div>
      ) : (
        <TimeLogTable logs={logs} onExportCsv={exportCsv} />
      )}
    </div>
  );
}
