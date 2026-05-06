import { useState, useEffect } from 'react';
import { getSession, signOut, type WorkerSession } from '../lib/auth';

export function useAuth() {
  const [session, setSession] = useState<WorkerSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const s = await getSession();
      setSession(s);
    } catch (e) {
      console.error('Erro ao carregar sessão:', e);
    } finally {
      setLoading(false);
    }
  };

  const login = async (pin: string) => {
    const s = await signInWithPin(pin);
    setSession(s);
    return s;
  };

  const logout = async () => {
    await signOut();
    setSession(null);
  };

  return { session, loading, login, logout };
}

// Importa a função de signInWithPin da lib
import { signInWithPin } from '../lib/auth';
