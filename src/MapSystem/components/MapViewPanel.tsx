import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Map,
  Camera,
  Marker,
  GeoJSONSource,
  Layer,
  type CameraRef,
} from '@maplibre/maplibre-react-native';

import {
  Coordinates,
  OfflineLocation,
  StateMapAccess,
} from '../../types/mapTypes';
import { MAP_STYLE_URL } from '../../constants/stateMapConfig';

type Props = {
  mapAccess: StateMapAccess;
  currentLocation: Coordinates | null;
  selectedLocation: OfflineLocation | null;
  onSaveSelected?: () => void;
};

const MIN_ZOOM = 4;
const MAX_ZOOM = 18;

const MapViewPanel: React.FC<Props> = ({
  mapAccess,
  currentLocation,
  selectedLocation,
  onSaveSelected,
}) => {
  const cameraRef = useRef<CameraRef>(null);

  const [zoomLevel, setZoomLevel] = useState(6);
  const [focusMode, setFocusMode] = useState<'STATE' | 'CURRENT' | 'SELECTED'>(
    'STATE',
  );

  const stateCenterCoordinate: [number, number] = useMemo(() => {
    const [swLng, swLat] = mapAccess.bounds.southWest;
    const [neLng, neLat] = mapAccess.bounds.northEast;

    return [(swLng + neLng) / 2, (swLat + neLat) / 2];
  }, [mapAccess]);

  const centerCoordinate: [number, number] = useMemo(() => {
    if (focusMode === 'SELECTED' && selectedLocation) {
      return [selectedLocation.longitude, selectedLocation.latitude];
    }

    if (focusMode === 'CURRENT' && currentLocation) {
      return [currentLocation.longitude, currentLocation.latitude];
    }

    if (selectedLocation) {
      return [selectedLocation.longitude, selectedLocation.latitude];
    }

    if (currentLocation) {
      return [currentLocation.longitude, currentLocation.latitude];
    }

    return stateCenterCoordinate;
  }, [focusMode, selectedLocation, currentLocation, stateCenterCoordinate]);

  const routeGeoJson = useMemo(() => {
    if (!currentLocation || !selectedLocation) {
      return null;
    }

    return {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          properties: {},
          geometry: {
            type: 'LineString' as const,
            coordinates: [
              [currentLocation.longitude, currentLocation.latitude],
              [selectedLocation.longitude, selectedLocation.latitude],
            ],
          },
        },
      ],
    };
  }, [currentLocation, selectedLocation]);

  const handleZoomIn = () => {
    setZoomLevel(prev => {
      const nextZoom = Math.min(prev + 1, MAX_ZOOM);
      moveCamera(centerCoordinate, nextZoom);
      return nextZoom;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      const nextZoom = Math.max(prev - 1, MIN_ZOOM);
      moveCamera(centerCoordinate, nextZoom);
      return nextZoom;
    });
  };

  const handleFocusCurrent = () => {
    if (!currentLocation) {
      return;
    }

    const coordinate: [number, number] = [
      currentLocation.longitude,
      currentLocation.latitude,
    ];

    setFocusMode('CURRENT');
    setZoomLevel(14);
    moveCamera(coordinate, 14);
  };

  const handleFocusSelected = () => {
    if (!selectedLocation) {
      return;
    }

    const coordinate: [number, number] = [
      selectedLocation.longitude,
      selectedLocation.latitude,
    ];

    setFocusMode('SELECTED');
    setZoomLevel(14);
    moveCamera(coordinate, 14);
  };

  const handleFocusState = () => {
    setFocusMode('STATE');
    setZoomLevel(6);
    moveCamera(stateCenterCoordinate, 6);
  };

  const moveCamera = (
    coordinate: [number, number],
    zoom: number,
    duration = 500,
  ) => {
    const camera = cameraRef.current as any;

    camera?.jumpTo?.({
      center: coordinate,
    });

    camera?.zoomTo?.(zoom, {
      duration,
    });
  };
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Map Preview</Text>
          <Text style={styles.subtitle}>
            {mapAccess.stateName} • Zoom {zoomLevel}
          </Text>
        </View>

        <TouchableOpacity style={styles.stateButton} onPress={handleFocusState}>
          <Text style={styles.stateButtonText}>State</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapWrap}>
        <Map style={styles.map} mapStyle={MAP_STYLE_URL}>
          <Camera ref={cameraRef} />
          {currentLocation ? (
            <Marker
              id="current-location"
              lngLat={[currentLocation.longitude, currentLocation.latitude]}
            >
              <View style={styles.currentMarkerOuter}>
                <View style={styles.currentMarkerInner} />
              </View>
            </Marker>
          ) : null}

          {selectedLocation ? (
            <Marker
              id="selected-location"
              lngLat={[selectedLocation.longitude, selectedLocation.latitude]}
            >
              <View style={styles.selectedMarkerOuter}>
                <View style={styles.selectedMarkerInner} />
              </View>
            </Marker>
          ) : null}

          {routeGeoJson ? (
            <GeoJSONSource id="route-source" data={routeGeoJson as any}>
              <Layer
                id="route-line"
                type="line"
                paint={{
                  'line-width': 4,
                  'line-color': '#2563EB',
                  'line-opacity': 0.9,
                }}
              />
            </GeoJSONSource>
          ) : null}
        </Map>

        <View style={styles.zoomControl}>
          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>

          <View style={styles.zoomDivider} />

          <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
            <Text style={styles.zoomText}>−</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.focusControl}>
          <TouchableOpacity
            style={[
              styles.focusButton,
              !currentLocation && styles.disabledButton,
            ]}
            onPress={handleFocusCurrent}
            disabled={!currentLocation}
          >
            <Text style={styles.focusText}>My Location</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.focusButton,
              !selectedLocation && styles.disabledButton,
            ]}
            onPress={handleFocusSelected}
            disabled={!selectedLocation}
          >
            <Text style={styles.focusText}>Selected</Text>
          </TouchableOpacity>
        </View>
      </View>

      {selectedLocation ? (
        <View style={styles.selectedBox}>
          <View style={styles.selectedInfo}>
            <Text style={styles.selectedLabel}>Selected Location</Text>
            <Text style={styles.selectedTitle}>{selectedLocation.title}</Text>

            <Text style={styles.selectedAddress}>
              {selectedLocation.address ?? 'Selected location'}
            </Text>

            <Text style={styles.selectedCoords}>
              Lat: {selectedLocation.latitude.toFixed(5)} | Lng:{' '}
              {selectedLocation.longitude.toFixed(5)}
            </Text>
          </View>

          {selectedLocation.source !== 'SAVED' ? (
            <TouchableOpacity
              style={styles.saveButton}
              onPress={onSaveSelected}
            >
              <Text style={styles.saveText}>Save</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.savedBadge}>
              <Text style={styles.savedBadgeText}>Saved</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <Text style={styles.hint}>
            Search a location above and select it to show marker and route line.
          </Text>
        </View>
      )}
    </View>
  );
};

export default React.memo(MapViewPanel);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: '#6B7280',
  },
  stateButton: {
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stateButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  mapWrap: {
    marginTop: 12,
    height: 420,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  zoomControl: {
    position: 'absolute',
    right: 12,
    top: 12,
    width: 42,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  zoomButton: {
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  focusControl: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    right: 12,
    flexDirection: 'row',
    gap: 8,
  },
  focusButton: {
    flex: 1,
    height: 38,
    borderRadius: 9,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  focusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  currentMarkerOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentMarkerInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  selectedMarkerOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(220, 38, 38, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMarkerInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#DC2626',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  selectedBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedInfo: {
    flex: 1,
    paddingRight: 10,
  },
  selectedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
    marginBottom: 3,
  },
  selectedTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  selectedAddress: {
    marginTop: 3,
    fontSize: 12,
    color: '#6B7280',
  },
  selectedCoords: {
    marginTop: 3,
    fontSize: 11,
    color: '#9CA3AF',
  },
  saveButton: {
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 9,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  savedBadge: {
    paddingHorizontal: 12,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  savedBadgeText: {
    color: '#16A34A',
    fontWeight: '700',
    fontSize: 12,
  },
  emptyBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  hint: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
});
