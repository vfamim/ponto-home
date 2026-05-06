import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
const [user, setUser] = useState<User | null>(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
// Check initial session
supabase.auth.getSession().then(({ data: { session } }) => {
setUser(session?.user ?? null);
setLoading(false);
});

// Listen for changes
const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
console.log('Auth state changed:', session?.user?.email, session?.user?.user_metadata?.role);
setUser(session?.user ?? null);
setLoading(false);
});

return () => subscription.unsubscribe();
}, []);

const signIn = async (email: string, password: string) => {
console.log('Tentando login com:', email);
const { error, data } = await supabase.auth.signInWithPassword({ email, password });
if (error) {
console.error('Erro no login:', error.message);
throw error;
}
console.log('Login sucesso:', data.user?.email);
};

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role: 'boss' } },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signIn, signUp, signOut };
}
