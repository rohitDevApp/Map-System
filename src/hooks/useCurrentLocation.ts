import { useCallback, useState } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { Coordinates } from '../types/mapTypes';

const requestAndroidLocationPermission = async () => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Location Permission',
      message: 'This app needs your location to show your current position.',
      buttonPositive: 'Allow',
      buttonNegative: 'Deny',
    },
  );

  return result === PermissionsAndroid.RESULTS.GRANTED;
};

export const useCurrentLocation = () => {
  const [currentLocation, setCurrentLocation] = useState<Coordinates | null>(
    null,
  );
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const fetchCurrentLocation = useCallback(async () => {
    try {
      setLoadingLocation(true);
      setLocationError(null);

      const hasPermission = await requestAndroidLocationPermission();

      if (!hasPermission) {
        setLocationError('Location permission denied');
        return null;
      }

      return await new Promise<Coordinates>((resolve, reject) => {
        Geolocation.getCurrentPosition(
          position => {
            const coords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            setCurrentLocation(coords);
            resolve(coords);
          },
          error => {
            setLocationError(error.message);
            reject(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          },
        );
      });
    } catch (error: any) {
      setLocationError(error?.message ?? 'Unable to fetch location');
      return null;
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  return {
    currentLocation,
    loadingLocation,
    locationError,
    fetchCurrentLocation,
  };
};
