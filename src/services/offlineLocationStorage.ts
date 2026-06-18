import uuid from 'react-native-uuid';
import { OfflineLocation } from '../types/mapTypes';
import { createMMKV } from 'react-native-mmkv';


const storage = createMMKV();
const SAVED_LOCATIONS_KEY = 'OFFLINE_SAVED_LOCATIONS';
const PRELOADED_RJ_LOCATIONS: OfflineLocation[] = [
  {
    id: 'preloaded-jaipur',
    title: 'Jaipur',
    address: 'Jaipur, Rajasthan',
    stateCode: 'RJ',
    latitude: 26.9124,
    longitude: 75.7873,
    createdAt: new Date().toISOString(),
    source: 'PRELOADED',
  },
  {
    id: 'preloaded-jodhpur',
    title: 'Jodhpur',
    address: 'Jodhpur, Rajasthan',
    stateCode: 'RJ',
    latitude: 26.2389,
    longitude: 73.0243,
    createdAt: new Date().toISOString(),
    source: 'PRELOADED',
  },
  {
    id: 'preloaded-udaipur',
    title: 'Udaipur',
    address: 'Udaipur, Rajasthan',
    stateCode: 'RJ',
    latitude: 24.5854,
    longitude: 73.7125,
    createdAt: new Date().toISOString(),
    source: 'PRELOADED',
  },
];

const getSavedLocations = (): OfflineLocation[] => {
  const raw = storage.getString(SAVED_LOCATIONS_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const setSavedLocations = (locations: OfflineLocation[]) => {
  storage.set(SAVED_LOCATIONS_KEY, JSON.stringify(locations));
};

const getAllLocations = (stateCode?: string): OfflineLocation[] => {
  const safeStateCode = stateCode || 'RJ';

  const saved = getSavedLocations().filter(
    item => item.stateCode === safeStateCode,
  );

  const preloaded = PRELOADED_RJ_LOCATIONS.filter(
    item => item.stateCode === safeStateCode,
  );

  return [...saved, ...preloaded];
};

const searchLocations = (
  stateCode: string | undefined,
  query: string,
): OfflineLocation[] => {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return [];
  }

  return getAllLocations(stateCode)
    .filter(item => {
      const title = item.title.toLowerCase();
      const address = item.address?.toLowerCase() ?? '';

      return (
        title.includes(normalizedQuery) || address.includes(normalizedQuery)
      );
    })
    .slice(0, 20);
};

const saveLocation = (
  location: Omit<OfflineLocation, 'id' | 'createdAt' | 'source'>,
): OfflineLocation => {
  const saved = getSavedLocations();

  const newLocation: OfflineLocation = {
    ...location,
    id: String(uuid.v4()),
    createdAt: new Date().toISOString(),
    source: 'SAVED',
  };

  setSavedLocations([newLocation, ...saved]);

  return newLocation;
};

const removeLocation = (id: string) => {
  const saved = getSavedLocations();
  setSavedLocations(saved.filter(item => item.id !== id));
};

export const offlineLocationStorage = {
  getAll: getAllLocations,
  search: searchLocations,
  save: saveLocation,
  remove: removeLocation,
};
