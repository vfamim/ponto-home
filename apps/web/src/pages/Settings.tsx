import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { user } = useAuth();
  const [qrValue, setQrValue] = useState('');
  const [lunchMinutes, setLunchMinutes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    const { data } = await supabase.from('app_config').select('*').in('key', ['kitchen_qr_code', 'lunch_break_minutes']);
    (data ?? []).forEach((row: any) => {
      if (row.key === 'kitchen_qr_code') setQrValue(row.value);
      if (row.key === 'lunch_break_minutes') setLunchMinutes(String(row.value));
    });
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await supabase.from('app_config').update({ value: JSON.stringify(qrValue) }).eq('key', 'kitchen_qr_code');
      await supabase.from('app_config').update({ value: JSON.stringify(Number(lunchMinutes)) }).eq('key', 'lunch_break_minutes');
      setMessage('Configuracoes salvas');
    } catch {
      setMessage('Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-700" />
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Configuracoes</h1>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Valor do QR Code</label>
          <input
            type="text"
            value={qrValue}
            onChange={(e) => setQrValue(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duracao do almoco (minutos)</label>
          <input
            type="number"
            value={lunchMinutes}
            onChange={(e) => setLunchMinutes(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="bg-green-700 text-white py-2 px-4 rounded-lg hover:bg-green-800 disabled:opacity-60 font-semibold"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
      </form>

      {user && (
        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-sm text-gray-500">Logado como</p>
          <p className="font-medium">{user.email}</p>
        </div>
      )}
    </div>
  );
}
