const MAPBOX_TOKEN_KEY = 'cesium_mapbox_token';
const CESIUM_TOKEN_KEY = 'cesium_ion_token';

export interface Tokens {
  mapbox: string;
  cesium: string;
}

const DEFAULT_MAPBOX = atob('cGsuZXlKMWlqb2ljMmwwYjI1aFpDSXNJbUVpT2lKamJYWnZPR1kzZG5Jd2NHd3pNelZ4ZDI5eU1uQm5jWE56SW4wLjhDOUdFQmJXRTI4QjRmWFJkMzRVQQ==');
const DEFAULT_CESIUM = atob('ZXlKaGJHY2lPaUpJVXpVbk5pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SnViMjVqWlNJNkludHBSVUpGYWpsdFlVOUljbGhvWmw4aUxDSnFkR2tpT2lJNU1qZ3pOV0kxT1MwMFlqQmhMVEpsT1RVdFlqYzBZeTA0TUdZeU5UTXhaVGcwTmpFaUxDSnBaQ0k2TlRNME9EYzRMQ0pwY3NJanBvaHRkSEJ6T2k4dllYQnBMTU5sYzNpdXkyOXRMQ0poZFdRaU9pSjFibVJsWm1sdVpXUmZaR1ZtWVhWc2RDSTNJbWxoZENJNk1UYzVNakkxTnpVNE4zMDlsVWpFdXpwZlRBMXB4ZG9WYkszQy1zYmhPdzdEald4dm0tb0x5S0trcw==');

export function getTokens(): Tokens {
  const envMapbox = import.meta.env.VITE_MAPBOX_TOKEN;
  const envCesium = import.meta.env.VITE_CESIUM_TOKEN;

  const localMapbox = typeof window !== 'undefined' ? localStorage.getItem(MAPBOX_TOKEN_KEY) : null;
  const localCesium = typeof window !== 'undefined' ? localStorage.getItem(CESIUM_TOKEN_KEY) : null;

  return {
    mapbox: envMapbox || localMapbox || DEFAULT_MAPBOX,
    cesium: envCesium || localCesium || DEFAULT_CESIUM,
  };
}

export function hasValidTokens(): boolean {
  const tokens = getTokens();
  return tokens.mapbox.length > 0 && tokens.cesium.length > 0;
}

export function saveTokens(mapbox: string, cesium: string): void {
  localStorage.setItem(MAPBOX_TOKEN_KEY, mapbox);
  localStorage.setItem(CESIUM_TOKEN_KEY, cesium);
}

export function clearTokens(): void {
  localStorage.removeItem(MAPBOX_TOKEN_KEY);
  localStorage.removeItem(CESIUM_TOKEN_KEY);
}


