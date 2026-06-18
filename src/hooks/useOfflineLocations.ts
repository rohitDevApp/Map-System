import { useCallback, useMemo, useState } from 'react';
import { offlineLocationStorage } from '../services/offlineLocationStorage';
import { OfflineLocation } from '../types/mapTypes';

export const useOfflineLocations = (stateCode: string) => {
  const [query, setQuery] = useState('');
  const [selectedLocation, setSelectedLocation] =
    useState<OfflineLocation | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const savedLocations = useMemo(() => {
    return offlineLocationStorage
      ?.getAll(stateCode)
      ?.filter(item => item.source === 'SAVED');
  }, [stateCode, refreshKey]);

  const searchResults = useMemo(() => {
    return offlineLocationStorage.search(stateCode, query);
  }, [stateCode, query, refreshKey]);

  const saveLocation = useCallback(
    (location: Omit<OfflineLocation, 'id' | 'createdAt' | 'source'>) => {
      const saved = offlineLocationStorage.save(location);
      setSelectedLocation(saved);
      setRefreshKey(prev => prev + 1);
      return saved;
    },
    [],
  );

  const removeLocation = useCallback((id: string) => {
    offlineLocationStorage.remove(id);
    setRefreshKey(prev => prev + 1);
  }, []);

  return {
    query,
    setQuery,
    searchResults,
    selectedLocation,
    setSelectedLocation,
    savedLocations,
    saveLocation,
    removeLocation,
  };
};
