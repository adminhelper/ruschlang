import { api } from './client';

export interface MapConfig {
  ok: boolean;
  provider: string;
  configured: boolean;
  clientId: string;
}

export interface PlaceSearchResult {
  title: string;
  address: string;
  roadAddress: string;
  mapx: string;
  mapy: string;
  category: string;
}

export interface DirectionsResult {
  code: string;
  routes: Array<{
    distance: number;
    duration: number;
    geometry: string;
  }>;
}

export async function getMapConfig(): Promise<MapConfig> {
  return api.get<MapConfig>('/api/map/config');
}

export async function searchPlaces(query: string): Promise<PlaceSearchResult[]> {
  const data = await api.get<{ items: PlaceSearchResult[] }>('/api/search/places', { q: query });
  return data.items || [];
}

export async function getDirections(mode: string, coords: string): Promise<DirectionsResult> {
  return api.get<DirectionsResult>('/api/routes/directions', { mode, coords });
}

export function formatRouteDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatRouteDuration(seconds: number): string {
  const min = Math.round(seconds / 60);
  if (min < 60) return `${min}분`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}시간 ${m}분`;
}

export function buildNaverDirectionsUrl(stops: Array<{ lat: number; lng: number }>): string {
  if (stops.length < 2) return '';
  const start = stops[0];
  const end = stops[stops.length - 1];
  const waypoints = stops.slice(1, -1);
  let url = `https://map.naver.com/v5/directions/${start.lng},${start.lat},,/${end.lng},${end.lat},,`;
  if (waypoints.length > 0) {
    url += '/' + waypoints.map(w => `${w.lng},${w.lat},,`).join('/');
  }
  return url;
}
