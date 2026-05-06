import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { LOG_TYPE_LABELS } from '@ponto/shared';

export default function HomeScreen() {
  const { session, logout } = useAuth();
  const router = useRouter();

  if (!session) {
    return null; // O layout vai redirecionar
  }

  const handleAction = (type: string) => {
    router.push(`/clock-screen?logType=${type}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Olá, {session.fullName}!</Text>
      
      <View style={styles.grid}>
        {(Object.keys(LOG_TYPE_LABELS) as any[]).map((type) => (
          <Pressable
            key={type}
            style={styles.button}
            onPress={() => handleAction(type)}
          >
            <Text style={styles.buttonText}>
              {LOG_TYPE_LABELS[type as keyof typeof LOG_TYPE_LABELS]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Sair</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    backgroundColor: '#2E7D32',
    padding: 20,
    borderRadius: 12,
    minWidth: 140,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoutButton: {
    marginTop: 'auto',
    backgroundColor: '#C62828',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
