import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import MapHeader from './components/MapHeader';
import OfflineMapDownloader from './components/OfflineMapDownloader';
import OfflineLocationSearch from './components/OfflineLocationSearch';
import SavedLocationsList from './components/SavedLocationsList';
import MapViewPanel from './components/MapViewPanel';
import MapPermissionBox from './components/MapPermissionBox';
import {
  createMapAccessFromCurrentDetails,
  DEFAULT_DYNAMIC_MAP_ACCESS,
} from '../constants/stateMapConfig';
import { useCurrentLocation } from '../hooks/useCurrentLocation';
import { useOfflineLocations } from '../hooks/useOfflineLocations';
import { useOfflineMapDownload } from '../hooks/useOfflineMapDownload';
import { CurrentLocationDetails, StateMapAccess } from '../types/mapTypes';
import { getCurrentLocationDetails } from '../services/reverseGeocodingService';

type ScreenStep =
  | 'CHECKING'
  | 'LOCATION_REQUIRED'
  | 'STATE_DETECTED'
  | 'MAP_DOWNLOADING'
  | 'MAP_READY'
  | 'ERROR';

const MapSystem = () => {
  const [detectedMapAccess, setDetectedMapAccess] =
    useState<StateMapAccess | null>(null);

  const [currentDetails, setCurrentDetails] =
    useState<CurrentLocationDetails | null>(null);

  const [screenStep, setScreenStep] = useState<ScreenStep>('CHECKING');
  const [startupError, setStartupError] = useState<string | null>(null);

  const {
    currentLocation,
    loadingLocation,
    locationError,
    fetchCurrentLocation,
  } = useCurrentLocation();

  const mapAccess = useMemo(() => {
    return detectedMapAccess ?? DEFAULT_DYNAMIC_MAP_ACCESS;
  }, [detectedMapAccess]);

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
  } = useOfflineLocations(mapAccess.stateCode);

  const detectCurrentDetailsAndCreateMap = useCallback(
    async (lat: number, lng: number) => {
      const details = await getCurrentLocationDetails(lat, lng);

      setCurrentDetails(details);

      const dynamicMapAccess = createMapAccessFromCurrentDetails(details);

      setDetectedMapAccess(dynamicMapAccess);
      setStartupError(null);
      setScreenStep('STATE_DETECTED');

      return dynamicMapAccess;
    },
    [],
  );

  const initializeMapFlow = useCallback(async () => {
    try {
      setScreenStep('CHECKING');
      setStartupError(null);

      const netState = await NetInfo.fetch();
      const isOnline = Boolean(
        netState.isConnected && netState.isInternetReachable !== false,
      );

      if (!isOnline) {
        setStartupError(
          'Internet is required first time to detect current details and download map.',
        );
        setScreenStep('ERROR');
        return;
      }

      const location = await fetchCurrentLocation();

      if (!location) {
        setScreenStep('LOCATION_REQUIRED');
        return;
      }

      await detectCurrentDetailsAndCreateMap(
        location.latitude,
        location.longitude,
      );
    } catch (error: any) {
      setStartupError(
        error?.message ?? 'Unable to detect current location details.',
      );
      setScreenStep('ERROR');
    }
  }, [fetchCurrentLocation, detectCurrentDetailsAndCreateMap]);

  useEffect(() => {
    initializeMapFlow();
  }, [initializeMapFlow]);

  useEffect(() => {
    if (mapDownloadStatus === 'DOWNLOADING') {
      setScreenStep('MAP_DOWNLOADING');
      return;
    }

    if (mapDownloadStatus === 'DOWNLOADED') {
      setScreenStep('MAP_READY');
      return;
    }

    if (mapDownloadStatus === 'FAILED') {
      setScreenStep('STATE_DETECTED');
    }
  }, [mapDownloadStatus]);

  const handleRefreshCurrentLocation = useCallback(async () => {
    try {
      setScreenStep('CHECKING');

      const location = await fetchCurrentLocation();

      if (!location) {
        setScreenStep('LOCATION_REQUIRED');
        return;
      }

      await detectCurrentDetailsAndCreateMap(
        location.latitude,
        location.longitude,
      );
    } catch (error: any) {
      setStartupError(
        error?.message ?? 'Unable to refresh current location details.',
      );
      setScreenStep('ERROR');
    }
  }, [fetchCurrentLocation, detectCurrentDetailsAndCreateMap]);

  const handleDownloadStateMap = useCallback(async () => {
    if (!mapAccess?.enabled) {
      Alert.alert('Map Disabled', 'Offline map download is not enabled.');
      return;
    }

    const netState = await NetInfo.fetch();
    const isOnline = Boolean(
      netState.isConnected && netState.isInternetReachable !== false,
    );

    if (!isOnline) {
      Alert.alert(
        'Internet Required',
        'Please connect to internet to download this map first time.',
      );
      return;
    }

    setScreenStep('MAP_DOWNLOADING');
    downloadMap();
  }, [downloadMap, mapAccess]);

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

  const canShowDownload =
    screenStep === 'STATE_DETECTED' ||
    screenStep === 'MAP_DOWNLOADING' ||
    mapDownloadStatus === 'FAILED';

  const canShowMap = screenStep === 'MAP_READY';

  return (
    <View style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <MapHeader mapAccess={mapAccess} />

        <View style={styles.stateCard}>
          <Text style={styles.stateTitle}>Current State Map Setup</Text>

          {screenStep === 'CHECKING' || loadingLocation ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#2563EB" />
              <Text style={styles.loadingText}>
                Getting current location and state details...
              </Text>
            </View>
          ) : null}

          {screenStep === 'ERROR' ? (
            <>
              <Text style={styles.errorText}>
                {startupError ?? locationError ?? 'Something went wrong.'}
              </Text>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={initializeMapFlow}
              >
                <Text style={styles.primaryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </>
          ) : null}

          {screenStep === 'LOCATION_REQUIRED' ? (
            <>
              <Text style={styles.stateDescription}>
                Location permission is required to detect your current state
                map.
              </Text>

              {!!locationError && (
                <Text style={styles.errorText}>{locationError}</Text>
              )}

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleRefreshCurrentLocation}
              >
                <Text style={styles.primaryButtonText}>
                  Allow / Get Current Location
                </Text>
              </TouchableOpacity>
            </>
          ) : null}

          {screenStep !== 'CHECKING' &&
          screenStep !== 'ERROR' &&
          screenStep !== 'LOCATION_REQUIRED' ? (
            <>
              <Text style={styles.stateName}>{mapAccess.stateName}</Text>

              <Text style={styles.stateDescription}>
                Current state detected. You can download and view this state
                map.
              </Text>

              {currentDetails ? (
                <LocationDetailsBox currentDetails={currentDetails} />
              ) : null}

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleRefreshCurrentLocation}
              >
                <Text style={styles.secondaryButtonText}>
                  Refresh Current Details
                </Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>

        {canShowDownload ? (
          <OfflineMapDownloader
            mapAccess={mapAccess}
            status={mapDownloadStatus}
            progress={mapDownloadProgress}
            error={mapDownloadError}
            onDownload={handleDownloadStateMap}
          />
        ) : null}

        {screenStep === 'MAP_READY' ? (
          <View style={styles.successCard}>
            <Text style={styles.successTitle}>
              {mapAccess.stateName} Map Ready
            </Text>
            <Text style={styles.successText}>
              Map has been downloaded. You can now view this map offline.
            </Text>
          </View>
        ) : null}

        <MapPermissionBox
          loadingLocation={loadingLocation}
          locationError={locationError}
          onFetchLocation={handleRefreshCurrentLocation}
        />

        {canShowMap ? (
          <>
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
              key={mapAccess.stateCode}
              mapAccess={mapAccess}
              currentLocation={currentLocation}
              selectedLocation={selectedLocation}
              mapLocations={[...searchResults, ...savedLocations]}
              onSaveSelected={handleSaveSelectedLocation}
            />
          </>
        ) : (
          <View style={styles.lockedMapCard}>
            <Text style={styles.lockedMapTitle}>Map Preview Locked</Text>
            <Text style={styles.lockedMapText}>
              Download {mapAccess.stateName} map first. After download, map
              preview will open.
            </Text>
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>
    </View>
  );
};

const LocationDetailsBox = ({
  currentDetails,
}: {
  currentDetails: CurrentLocationDetails;
}) => {
  return (
    <View style={styles.detailsBox}>
      <Text style={styles.detailsTitle}>Detected Current Details</Text>

      <Text style={styles.detailsText}>City: {currentDetails.city ?? '-'}</Text>

      <Text style={styles.detailsText}>
        District: {currentDetails.district ?? '-'}
      </Text>

      <Text style={styles.detailsText}>
        State: {currentDetails.state ?? '-'}
      </Text>

      <Text style={styles.detailsText}>
        Country: {currentDetails.country ?? '-'}
      </Text>

      <Text style={styles.detailsText}>
        Pincode: {currentDetails.postcode ?? '-'}
      </Text>
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
    backgroundColor: '#F3F4F6',
  },
  content: {
    paddingBottom: 24,
  },
  stateCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stateTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  stateName: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '800',
    color: '#2563EB',
  },
  stateDescription: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
  },
  loadingRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  loadingText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 12,
    color: '#6B7280',
  },
  errorText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: '#DC2626',
  },
  primaryButton: {
    marginTop: 12,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    marginTop: 12,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
  detailsBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 6,
  },
  detailsText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 3,
  },
  successCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  successTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#16A34A',
  },
  successText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: '#166534',
  },
  lockedMapCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  lockedMapTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  lockedMapText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
  },
  bottomSpace: {
    height: 20,
  },
});
