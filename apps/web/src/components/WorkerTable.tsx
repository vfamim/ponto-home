import { useState } from 'react';
import type { Profile } from '@ponto/shared';
import { supabase } from '@/lib/supabase';

interface WorkerTableProps {
  workers: Profile[];
  onToggleActive: (id: string, active: boolean) => Promise<void>;
}

export function WorkerTable({ workers, onToggleActive }: WorkerTableProps) {
  const [photoUrl, setPhotoUrl] = useState<Record<string, string>>({});

  const getPhotoUrl = async (worker: Profile) => {
    if (photoUrl[worker.id]) return;
    if (!worker.profile_photo_path) return;

    const { data } = supabase.storage
      .from('worker-photos')
      .getPublicUrl(worker.profile_photo_path);

    if (data?.publicUrl) {
      setPhotoUrl((prev) => ({ ...prev, [worker.id]: data.publicUrl }));
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Foto</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PIN</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acoes</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {workers.map((worker) => {
            getPhotoUrl(worker);
            return (
              <tr key={worker.id} className={!worker.active ? 'opacity-50' : ''}>
                <td className="px-6 py-4">
                  {photoUrl[worker.id] ? (
                    <img src={photoUrl[worker.id]} alt={worker.full_name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm font-bold">
                      {worker.full_name.charAt(0)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{worker.full_name}</td>
                <td className="px-6 py-4 text-sm text-gray-500 font-mono">{worker.pin_code ?? '—'}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{worker.phone ?? '—'}</td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full font-semibold ${
                      worker.active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {worker.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onToggleActive(worker.id, !worker.active)}
                    className={`text-sm px-3 py-1 rounded ${
                      worker.active
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-green-50 text-green-600 hover:bg-green-100'
                    }`}
                  >
                    {worker.active ? 'Desativar' : 'Ativar'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {workers.length === 0 && (
        <div className="text-center py-12 text-gray-500">Nenhum funcionario cadastrado</div>
      )}
    </div>
  );
}
