import { StateMapAccess } from '../types/mapTypes';

export const DEFAULT_STATE_MAP_ACCESS: StateMapAccess = {
  enabled: true,
  country: 'IN',
  stateCode: 'RJ',
  stateName: 'Rajasthan',
  minZoom: 6,
  maxZoom: 14,
  bounds: {
    // [longitude, latitude]
    southWest: [69.48, 23.03],
    northEast: [78.17, 30.12],
  },
};

export const MAP_STYLE_URL = 'https://demotiles.maplibre.org/style.json';
