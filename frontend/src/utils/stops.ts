import type { Stop } from '../types/roadmap';

export function parseStops(raw: string): Stop[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function serializeStops(stops: Stop[]): string {
  return JSON.stringify(stops);
}
