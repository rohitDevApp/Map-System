export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type MapBounds = {
  northEast: [number, number]; // [lng, lat]
  southWest: [number, number]; // [lng, lat]
};

export type StateMapAccess = {
  enabled: boolean;
  country: string;
  stateCode: string;
  stateName: string;
  minZoom: number;
  maxZoom: number;
  bounds: MapBounds;
};

export type OfflineLocation = {
  id: string;
  title: string;
  address?: string;
  stateCode: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  source: 'SAVED' | 'PRELOADED';
};

export type OfflineMapStatus =
  | 'NOT_DOWNLOADED'
  | 'DOWNLOADING'
  | 'DOWNLOADED'
  | 'FAILED';

export type CurrentLocationDetails = {
  latitude: number;
  longitude: number;
  city?: string;
  district?: string;
  state?: string;
  stateCode?: string;
  country?: string;
  countryCode?: string;
  postcode?: string;
  displayName?: string;
  boundingBox?: {
    south: number;
    north: number;
    west: number;
    east: number;
  };
};
