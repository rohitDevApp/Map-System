import React, { useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import MapHeader from './components/MapHeader';
import OfflineMapDownloader from './components/OfflineMapDownloader';
import OfflineLocationSearch from './components/OfflineLocationSearch';
import SavedLocationsList from './components/SavedLocationsList';
import MapViewPanel from './components/MapViewPanel';
import MapPermissionBox from './components/MapPermissionBox';
import { DEFAULT_STATE_MAP_ACCESS } from '../constants/stateMapConfig';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { useOfflineLocations } from '../hooks/useOfflineLocations';
import { useOfflineMapDownload } from '../hooks/useOfflineMapDownload';

const MapSystem = () => {
  const mapAccess = DEFAULT_STATE_MAP_ACCESS;

  const {
    currentLocation,
    loadingLocation,
    locationError,
    fetchCurrentLocation,
  } = useCurrentLocation();

  const {
    status: mapDownloadStatus,
    progress: mapDownloadProgress,
    error: mapDownloadError,
    downloadMap,
  } = useOfflineMapDownload(mapAccess);

  const {
    query,
    setQuery,
    searchResults,
    selectedLocation,
    setSelectedLocation,
    savedLocations,
    saveLocation,
    removeLocation,
  } = useOfflineLocations(mapAccess?.stateCode);

  const handleSaveSelectedLocation = useCallback(() => {
    if (!selectedLocation) {
      return;
    }

    saveLocation({
      title: selectedLocation.title,
      address: selectedLocation.address,
      latitude: selectedLocation.latitude,
      longitude: selectedLocation.longitude,
      stateCode: selectedLocation.stateCode,
    });
  }, [selectedLocation, saveLocation]);

  return (
    <View style={[{ flex: 1 }]}>
      <ScrollView>
        <TouchableOpacity activeOpacity={1} style={styles.content}>
          <MapHeader mapAccess={mapAccess} />
          <OfflineMapDownloader
            mapAccess={mapAccess}
            status={mapDownloadStatus}
            progress={mapDownloadProgress}
            error={mapDownloadError}
            onDownload={downloadMap}
          />
          <MapPermissionBox
            loadingLocation={loadingLocation}
            locationError={locationError}
            onFetchLocation={fetchCurrentLocation}
          />

          <OfflineLocationSearch
            query={query}
            setQuery={setQuery}
            results={searchResults}
            onSelect={setSelectedLocation}
          />

          <SavedLocationsList
            locations={savedLocations}
            onSelect={setSelectedLocation}
            onRemove={removeLocation}
          />

          <MapViewPanel
            mapAccess={mapAccess}
            currentLocation={currentLocation}
            selectedLocation={selectedLocation}
            onSaveSelected={handleSaveSelectedLocation}
          />

          <View style={styles.bottomSpace} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default React.memo(MapSystem);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 24,
    flex: 1,
  },
  bottomSpace: {
    height: 20,
  },
});
