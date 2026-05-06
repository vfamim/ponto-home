import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';

export default function PinLoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (pin.length !== 4) {
      setError('Digite 4 numeros');
      return;
    }

    console.log('🔵 [LOGIN] Iniciando processo com PIN:', pin);
    setLoading(true);
    setError(null);

    try {
      await login(pin);
      console.log('🟢 [LOGIN] Sucesso! Tentando navegar...');
      await new Promise(resolve => setTimeout(resolve, 100));
      router.replace('/');
    } catch (err: any) {
      console.error('🔴 [LOGIN] ERRO FATAL:', err);
      Alert.alert('Erro no Login', err.message || 'Erro desconhecido');
      setError(err.message || 'PIN invalido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Ponto Home</Text>
      <Text style={styles.subtitle}>Digite seu PIN</Text>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TextInput
        style={styles.input}
        keyboardType="number-pad"
        maxLength={4}
        secureTextEntry
        value={pin}
        onChangeText={setPin}
        editable={!loading}
        autoFocus
      />

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Verificando...' : 'Entrar'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 20,
    textAlign: 'center',
    color: '#666',
    marginBottom: 32,
  },
  errorBox: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    textAlign: 'center',
  },
  input: {
    fontSize: 36,
    letterSpacing: 16,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
  },
  button: {
    backgroundColor: '#2E7D32',
    minHeight: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
