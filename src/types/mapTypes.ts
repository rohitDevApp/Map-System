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
