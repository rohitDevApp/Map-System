import { CurrentLocationDetails, StateMapAccess } from '../types/mapTypes';

export const MAP_STYLE_URL = 'https://demotiles.maplibre.org/style.json';

export const DEFAULT_DYNAMIC_MAP_ACCESS: StateMapAccess = {
  enabled: true,
  country: 'UNKNOWN',
  stateCode: 'CURRENT',
  stateName: 'Current State',
  minZoom: 6,
  maxZoom: 14,
  bounds: {
    southWest: [-180, -85],
    northEast: [180, 85],
  },
};

export const createMapAccessFromCurrentDetails = (
  details: CurrentLocationDetails,
): StateMapAccess => {
  const hasValidBoundingBox =
    details.boundingBox &&
    Number.isFinite(details.boundingBox.south) &&
    Number.isFinite(details.boundingBox.north) &&
    Number.isFinite(details.boundingBox.west) &&
    Number.isFinite(details.boundingBox.east);

  /**
   * If reverse geocoder gives bounding box, use it.
   * Otherwise create small fallback bounds around GPS.
   */
  const bounds = hasValidBoundingBox
    ? {
        southWest: [details.boundingBox!.west, details.boundingBox!.south] as [
          number,
          number,
        ],
        northEast: [details.boundingBox!.east, details.boundingBox!.north] as [
          number,
          number,
        ],
      }
    : {
        southWest: [details.longitude - 1, details.latitude - 1] as [
          number,
          number,
        ],
        northEast: [details.longitude + 1, details.latitude + 1] as [
          number,
          number,
        ],
      };

  return {
    enabled: true,
    country: details.countryCode ?? details.country ?? 'UNKNOWN',
    stateCode: details.stateCode ?? 'CURRENT',
    stateName: details.state ?? 'Current State',
    minZoom: 6,
    maxZoom: 14,
    bounds,
  };
};
