import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  Map as MLMap,
  Camera,
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
  mapLocations?: OfflineLocation[];
  onSaveSelected?: () => void;
};

const MIN_ZOOM = 4;
const MAX_ZOOM = 18;

const MapViewPanel: React.FC<Props> = ({
  mapAccess,
  currentLocation,
  selectedLocation,
  mapLocations = [],
  onSaveSelected,
}) => {
  const cameraRef = useRef<CameraRef>(null);
  const [zoomLevel, setZoomLevel] = useState(6);

  const stateCenterCoordinate: [number, number] = useMemo(() => {
    const [swLng, swLat] = mapAccess.bounds.southWest;
    const [neLng, neLat] = mapAccess.bounds.northEast;

    return [(swLng + neLng) / 2, (swLat + neLat) / 2];
  }, [mapAccess]);

  const centerCoordinate: [number, number] = useMemo(() => {
    if (selectedLocation) {
      return [selectedLocation.longitude, selectedLocation.latitude];
    }

    if (currentLocation) {
      return [currentLocation.longitude, currentLocation.latitude];
    }

    return stateCenterCoordinate;
  }, [selectedLocation, currentLocation, stateCenterCoordinate]);

  const moveCamera = (
    coordinate: [number, number],
    zoom: number,
    duration = 500,
  ) => {
    const camera = cameraRef.current as any;

    if (camera?.easeTo) {
      camera.easeTo({
        center: coordinate,
        zoom,
        duration,
      });
      return;
    }

    camera?.jumpTo?.({
      center: coordinate,
    });

    camera?.zoomTo?.(zoom, {
      duration,
    });
  };

  const handleMapReady = () => {
    moveCamera(centerCoordinate, zoomLevel, 0);
  };

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

    setZoomLevel(14);
    moveCamera(coordinate, 14);
  };

  const handleFocusState = () => {
    setZoomLevel(6);
    moveCamera(stateCenterCoordinate, 6);
  };

  const currentLocationGeoJson = useMemo(() => {
    if (!currentLocation) {
      return null;
    }

    return {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          properties: {
            title: 'My Location',
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [currentLocation.longitude, currentLocation.latitude],
          },
        },
      ],
    };
  }, [currentLocation]);

  const selectedLocationGeoJson = useMemo(() => {
    if (!selectedLocation) {
      return null;
    }

    return {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          properties: {
            title: selectedLocation.title,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: [
              selectedLocation.longitude,
              selectedLocation.latitude,
            ],
          },
        },
      ],
    };
  }, [selectedLocation]);

  const locationNamesGeoJson = useMemo(() => {
    const uniqueMap = new Map<string, OfflineLocation>();

    mapLocations.forEach(item => {
      uniqueMap.set(item.id, item);
    });

    if (selectedLocation) {
      uniqueMap.set(selectedLocation.id, selectedLocation);
    }

    const locations = Array.from(uniqueMap.values());

    return {
      type: 'FeatureCollection' as const,
      features: locations.map(location => ({
        type: 'Feature' as const,
        properties: {
          title: location.title,
        },
        geometry: {
          type: 'Point' as const,
          coordinates: [location.longitude, location.latitude],
        },
      })),
    };
  }, [mapLocations, selectedLocation]);

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

      <View style={styles.mapContainer}>
        <MLMap
          style={styles.map}
          mapStyle={MAP_STYLE_URL}
          // onMapReady={handleMapReady as any}
        >
          <Camera ref={cameraRef} />

          {routeGeoJson ? (
            <GeoJSONSource id="route-source" data={routeGeoJson as any}>
              <Layer
                id="route-line"
                type="line"
                paint={
                  {
                    'line-width': 4,
                    'line-color': '#2563EB',
                    'line-opacity': 0.9,
                  } as any
                }
              />
            </GeoJSONSource>
          ) : null}

          {locationNamesGeoJson.features.length > 0 ? (
            <GeoJSONSource
              id="location-names-source"
              data={locationNamesGeoJson as any}
            >
              <Layer
                id="location-names-layer"
                type="symbol"
                layout={
                  {
                    'text-field': ['get', 'title'],
                    'text-size': 13,
                    'text-offset': [0, 1.5],
                    'text-anchor': 'top',
                    'text-allow-overlap': true,
                    'text-ignore-placement': true,
                  } as any
                }
                paint={
                  {
                    'text-color': '#111827',
                    'text-halo-color': '#FFFFFF',
                    'text-halo-width': 2,
                  } as any
                }
              />
            </GeoJSONSource>
          ) : null}

          {currentLocationGeoJson ? (
            <GeoJSONSource
              id="current-location-source"
              data={currentLocationGeoJson as any}
            >
              <Layer
                id="current-location-circle"
                type="circle"
                paint={
                  {
                    'circle-radius': 7,
                    'circle-color': '#2563EB',
                    'circle-stroke-width': 3,
                    'circle-stroke-color': '#FFFFFF',
                  } as any
                }
              />

              <Layer
                id="current-location-label"
                type="symbol"
                layout={
                  {
                    'text-field': ['get', 'title'],
                    'text-size': 12,
                    'text-offset': [0, 1.5],
                    'text-anchor': 'top',
                    'text-allow-overlap': true,
                    'text-ignore-placement': true,
                  } as any
                }
                paint={
                  {
                    'text-color': '#111827',
                    'text-halo-color': '#FFFFFF',
                    'text-halo-width': 2,
                  } as any
                }
              />
            </GeoJSONSource>
          ) : null}

          {selectedLocationGeoJson ? (
            <GeoJSONSource
              id="selected-location-source"
              data={selectedLocationGeoJson as any}
            >
              <Layer
                id="selected-location-circle"
                type="circle"
                paint={
                  {
                    'circle-radius': 9,
                    'circle-color': '#DC2626',
                    'circle-stroke-width': 3,
                    'circle-stroke-color': '#FFFFFF',
                  } as any
                }
              />

              <Layer
                id="selected-location-label"
                type="symbol"
                layout={
                  {
                    'text-field': ['get', 'title'],
                    'text-size': 13,
                    'text-offset': [0, 1.5],
                    'text-anchor': 'top',
                    'text-allow-overlap': true,
                    'text-ignore-placement': true,
                  } as any
                }
                paint={
                  {
                    'text-color': '#111827',
                    'text-halo-color': '#FFFFFF',
                    'text-halo-width': 2,
                  } as any
                }
              />
            </GeoJSONSource>
          ) : null}
        </MLMap>

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
  mapContainer: {
    marginTop: 12,
    height: 420,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    position: 'relative',
  },
  map: {
    flex: 1,
    borderRadius: 14,
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
