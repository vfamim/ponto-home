import { Stack } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack>
      {!session ? (
        <Stack.Screen name="pin-login" options={{ title: 'Login' }} />
      ) : (
        <>
          <Stack.Screen name="index" options={{ title: 'Ponto Home' }} />
          <Stack.Screen name="clock-screen" options={{ title: 'Registro' }} />
        </>
      )}
    </Stack>
  );
}
