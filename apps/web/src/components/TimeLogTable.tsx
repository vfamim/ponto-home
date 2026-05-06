import type { TimeLog } from '@ponto/shared';
import { LOG_TYPE_LABELS } from '@ponto/shared';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';
import { PhotoModal } from './PhotoModal';

interface TimeLogTableProps {
  logs: TimeLog[];
  onExportCsv: () => void;
}

export function TimeLogTable({ logs, onExportCsv }: TimeLogTableProps) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const viewPhoto = async (photoPath: string) => {
    const { data } = supabase.storage.from('time-photos').getPublicUrl(photoPath);
    setPhotoUrl(data?.publicUrl ?? null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Registros de Ponto</h2>
        <button
          onClick={onExportCsv}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-semibold"
        >
          Exportar CSV
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-xl shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Funcionario</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fonte</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Foto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="px-6 py-4 text-sm text-gray-900 font-mono">{log.worker_id.slice(0, 8)}...</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100">
                    {LOG_TYPE_LABELS[log.log_type]}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(log.logged_at).toLocaleString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{log.log_source}</td>
                <td className="px-6 py-4 text-sm">
                  {log.photo_path ? (
                    <button
                      onClick={() => viewPhoto(log.photo_path!)}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Ver foto
                    </button>
                  ) : (
                    <span className="text-gray-400">Sem foto</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && (
          <div className="text-center py-12 text-gray-500">Nenhum registro encontrado</div>
        )}
      </div>

      {photoUrl && <PhotoModal url={photoUrl} onClose={() => setPhotoUrl(null)} />}
    </div>
  );
}
