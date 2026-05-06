import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Pega as variáveis de ambiente do expo
const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl || process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = Constants.expoConfig?.extra?.supabaseKey || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ [SUPABASE] Missing environment variables!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
