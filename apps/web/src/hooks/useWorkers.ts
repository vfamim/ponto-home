import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@ponto/shared';

export function useWorkers() {
  const [workers, setWorkers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'worker')
      .order('full_name');

    if (error) {
      console.error('Error fetching workers:', error.message);
    } else {
      setWorkers(data as Profile[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const createWorker = async (worker: { full_name: string; pin_code: string; phone?: string }) => {
    const { error } = await supabase.functions.invoke('create-worker', {
      body: worker,
    });
    if (error) throw error;
    await fetchWorkers();
  };

  const updateWorker = async (id: string, updates: Partial<Profile>) => {
    const { error } = await supabase.from('profiles').update(updates).eq('id', id);
    if (error) throw error;
    await fetchWorkers();
  };

  const toggleWorkerActive = async (id: string, active: boolean) => {
    const { error } = await supabase.from('profiles').update({ active }).eq('id', id);
    if (error) throw error;
    await fetchWorkers();
  };

  return { workers, loading, createWorker, updateWorker, toggleWorkerActive, refetch: fetchWorkers };
}
