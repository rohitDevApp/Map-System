import { CurrentLocationDetails } from '../types/mapTypes';

const getSimpleStateCode = (stateName?: string, countryCode?: string) => {
  if (!stateName) {
    return 'CURRENT';
  }

  const cleanedState = stateName
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toUpperCase();

  const cleanedCountry = countryCode?.trim().toUpperCase() ?? 'XX';

  return `${cleanedCountry}_${cleanedState}`;
};

export const getCurrentLocationDetails = async (
  latitude: number,
  longitude: number,
): Promise<CurrentLocationDetails> => {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&addressdetails=1&zoom=10`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': 'MapSystemApp/1.0',
    },
  });

  if (!response.ok) {
    throw new Error('Unable to fetch current location details.');
  }

  const data = await response.json();
  const address = data?.address ?? {};

  const countryCode = address.country_code?.toUpperCase();

  const city =
    address.city ||
    address.town ||
    address.village ||
    address.suburb ||
    address.hamlet ||
    address.county;

  const state = address.state;
  const stateCode = getSimpleStateCode(state, countryCode);

  /**
   * Nominatim boundingbox format:
   * [south, north, west, east]
   */
  const rawBoundingBox = data?.boundingbox;

  const boundingBox = Array.isArray(rawBoundingBox)
    ? {
        south: Number(rawBoundingBox[0]),
        north: Number(rawBoundingBox[1]),
        west: Number(rawBoundingBox[2]),
        east: Number(rawBoundingBox[3]),
      }
    : undefined;

  const details: CurrentLocationDetails = {
    latitude,
    longitude,
    city,
    district: address.county || address.state_district,
    state,
    stateCode,
    country: address.country,
    countryCode,
    postcode: address.postcode,
    displayName: data?.display_name,
    boundingBox,
  };

  console.log('Current location details:', details);

  return details;
};
