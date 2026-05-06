import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseClientOptions {
  url: string;
  anonKey: string;
  storage?: Storage;
}

export function createSupabaseClient(options: SupabaseClientOptions): SupabaseClient {
  return createClient(options.url, options.anonKey, {
    auth: {
      storage: options.storage ?? undefined,
      autoRefreshToken: true,
      persistSession: !!options.storage,
      detectSessionInUrl: false,
    },
  });
}
