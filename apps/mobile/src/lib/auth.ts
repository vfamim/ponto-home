import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

const SESSION_KEY = 'ponto_session';

export interface WorkerSession {
  userId: string;
  fullName: string;
  bossId: string;
}

export async function signInWithPin(pin: string): Promise<WorkerSession> {
  console.log('📡 [AUTH] Tentando conectar no Supabase com PIN:', pin);

  try {
    const { data, error } = await supabase.rpc('verify_pin', {
      input_pin: pin,
    });

    console.log('📡 [AUTH] Resposta bruta do Supabase:', { data, error });

    if (error) {
      console.error('❌ [AUTH] Erro no RPC:', error.message);
      throw new Error(error.message);
    }

    const result = data as any[];

    if (!result || result.length === 0) {
      console.error('❌ [AUTH] PIN Inválido ou retorno vazio:', result);
      throw new Error('PIN inválido');
    }

    const row = result[0];
    
    const session: WorkerSession = {
      userId: row.user_id,
      fullName: row.full_name,
      bossId: row.boss_id,
    };

    console.log('✅ [AUTH] Login sucesso! Salvando sessão:', session);

    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    
    return session;
  } catch (err: any) {
    console.error('🔴 [AUTH] Erro fatal no signInWithPin:', err);
    throw err;
  }
}

export async function getSession(): Promise<WorkerSession | null> {
  try {
    const raw = await AsyncStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WorkerSession;
  } catch (e) {
    console.error('Erro ao ler sessão:', e);
    return null;
  }
}

export async function signOut(): Promise<void> {
  await AsyncStorage.removeItem(SESSION_KEY);
}
