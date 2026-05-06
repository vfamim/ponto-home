import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { CameraView, type BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LOG_TYPE_LABELS, QR_CODE_VALUE } from '@ponto/shared';
import type { LogType } from '@ponto/shared';
import { useAuth } from '@/hooks/useAuth';
import { captureCurrentLocation } from '@/services/location-service';
import { registerTimeLog } from '@/services/time-log-service';

const VALID_LOG_TYPES: LogType[] = ['clock_in', 'clock_out', 'lunch_start', 'lunch_end'];

export default function ClockScreen() {
  const router = useRouter();
  const { logType } = useLocalSearchParams<{ logType?: string }>();
  const { session } = useAuth();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [scanned, setScanned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const resolvedLogType = useMemo<LogType | null>(() => {
    if (!logType) return null;
    return VALID_LOG_TYPES.includes(logType as LogType) ? (logType as LogType) : null;
  }, [logType]);

  const registerWithLocation = async () => {
    if (!session || !resolvedLogType) return;

    try {
      setSubmitting(true);
      setStatusMessage('Capturando localizacao...');

      const location = await captureCurrentLocation();

      setStatusMessage('Enviando registro de ponto...');

      if (!session.pin) {
        throw new Error('Sessao sem PIN. Saia e entre novamente.');
      }

      await registerTimeLog({
        pin: session.pin,
        logType: resolvedLogType,
        qrCodeValue: QR_CODE_VALUE,
        location,
      });

      Alert.alert('Sucesso', 'Ponto registrado com GPS com sucesso!');
      router.replace('/');
    } catch (error: any) {
      Alert.alert('Erro', error?.message || 'Falha ao registrar ponto');
      setScanned(false);
    } finally {
      setSubmitting(false);
      setStatusMessage(null);
    }
  };

  const onBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (scanned || submitting) return;

    setScanned(true);

    if (result.data !== QR_CODE_VALUE) {
      Alert.alert('QR invalido', 'Use o QR oficial da cozinha');
      setScanned(false);
      return;
    }

    await registerWithLocation();
  };

  if (!session) {
    return (
      <View style={styles.centered}>
        <Text>Sem sessao ativa. Volte ao login.</Text>
      </View>
    );
  }

  if (!resolvedLogType) {
    return (
      <View style={styles.centered}>
        <Text>Tipo de registro invalido.</Text>
        <Pressable style={styles.secondaryButton} onPress={() => router.replace('/')}>
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  if (!cameraPermission) {
    return (
      <View style={styles.centered}>
        <Text>Carregando permissao da camera...</Text>
      </View>
    );
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>Permita o acesso a camera para escanear o QR code.</Text>
        <Pressable style={styles.primaryButton} onPress={requestCameraPermission}>
          <Text style={styles.primaryButtonText}>Permitir camera</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar {LOG_TYPE_LABELS[resolvedLogType]}</Text>
      <Text style={styles.subtitle}>Escaneie o QR da cozinha. O app capturara sua localizacao GPS.</Text>

      <View style={styles.cameraWrap}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={submitting ? undefined : onBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        />
      </View>

      {statusMessage ? <Text style={styles.status}>{statusMessage}</Text> : null}

      <Pressable
        style={[styles.secondaryButton, submitting && styles.buttonDisabled]}
        onPress={() => router.replace('/')}
        disabled={submitting}
      >
        <Text style={styles.secondaryButtonText}>Cancelar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  title: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: '#cbd5e1',
    marginBottom: 16,
  },
  cameraWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 420,
    borderWidth: 1,
    borderColor: '#334155',
  },
  camera: {
    flex: 1,
  },
  status: {
    color: '#e2e8f0',
    marginTop: 14,
    textAlign: 'center',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#334155',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  secondaryButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#64748b',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
