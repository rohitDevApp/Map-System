import MapLibreGL from '@maplibre/maplibre-react-native';
import { MAP_STYLE_URL } from '../constants/stateMapConfig';
import { StateMapAccess } from '../types/mapTypes';

type DownloadProgressCallback = (progress: number) => void;

export const getOfflinePackName = (stateCode: string) => {
  return `offline-state-map-${stateCode}`;
};

export const downloadOfflineStateMap = async (
  mapAccess: StateMapAccess,
  onProgress?: DownloadProgressCallback,
) => {
  if (!mapAccess.enabled) {
    throw new Error('Offline map access is disabled');
  }

  const packName = getOfflinePackName(mapAccess.stateCode);

  const options = {
    name: packName,
    styleURL: MAP_STYLE_URL,
    bounds: [mapAccess.bounds.southWest, mapAccess.bounds.northEast],
    minZoom: mapAccess.minZoom,
    maxZoom: mapAccess.maxZoom,
    metadata: {
      stateCode: mapAccess.stateCode,
      stateName: mapAccess.stateName,
      downloadedAt: new Date().toISOString(),
    },
  };

  /**
   * Depending on your MapLibre RN version, this can be:
   * MapLibreGL.offlineManager.createPack(...)
   * or OfflineManager.createPack(...)
   *
   * This version uses MapLibreGL.offlineManager because many projects expose it this way.
   */
  const pack = await MapLibreGL.offlineManager.createPack(
    options,
    (_offlineRegion: unknown, status: any) => {
      const required = status?.requiredResourceCount ?? 0;
      const completed = status?.completedResourceCount ?? 0;

      const percentage =
        required > 0 ? Math.round((completed / required) * 100) : 0;

      onProgress?.(percentage);
    },
    (_offlineRegion: unknown, error: any) => {
      console.log('Offline map download error:', error);
    },
  );

  return pack;
};

export const getOfflinePacks = async () => {
  return MapLibreGL.offlineManager.getPacks();
};

export const deleteOfflinePack = async (stateCode: string) => {
  const packName = getOfflinePackName(stateCode);
  return MapLibreGL.offlineManager.deletePack(packName);
};
