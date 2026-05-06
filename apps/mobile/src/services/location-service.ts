import * as Location from 'expo-location';

export interface CapturedLocation {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  capturedAt: string;
}

export async function captureCurrentLocation(): Promise<CapturedLocation> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Permissao de localizacao negada');
  }

  const location = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracyMeters: location.coords.accuracy ?? null,
    capturedAt: new Date(location.timestamp).toISOString(),
  };
}
