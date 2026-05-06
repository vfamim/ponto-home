import { useState } from 'react';
import { useWorkers } from '@/hooks/useWorkers';
import { WorkerForm } from '@/components/WorkerForm';
import { WorkerTable } from '@/components/WorkerTable';

export default function WorkersPage() {
  const { workers, loading, createWorker, toggleWorkerActive } = useWorkers();
  const [showForm, setShowForm] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Funcionarios</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800 font-semibold"
        >
          {showForm ? 'Cancelar' : 'Novo Funcionario'}
        </button>
      </div>

      {showForm && (
        <WorkerForm
          onSubmit={createWorker}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="bg-white rounded-xl shadow">
        <WorkerTable workers={workers} onToggleActive={toggleWorkerActive} />
      </div>
    </div>
  );
}
