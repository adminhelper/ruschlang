/* Naver Maps JavaScript API v3 — minimal type stubs */

declare namespace naver.maps {
  class Map {
    constructor(element: HTMLElement, options?: MapOptions);
    setCenter(latlng: LatLng): void;
    setZoom(level: number): void;
    fitBounds(bounds: LatLngBounds, padding?: { top?: number; right?: number; bottom?: number; left?: number }): void;
    getCenter(): LatLng;
    getZoom(): number;
    destroy(): void;
  }

  interface MapOptions {
    center?: LatLng;
    zoom?: number;
    mapTypeControl?: boolean;
    zoomControl?: boolean;
    zoomControlOptions?: { position?: number };
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class LatLngBounds {
    constructor();
    extend(latlng: LatLng): void;
    getCenter(): LatLng;
  }

  class Point {
    constructor(x: number, y: number);
  }

  class Size {
    constructor(width: number, height: number);
  }

  class Marker {
    constructor(options: MarkerOptions);
    setMap(map: Map | null): void;
    getPosition(): LatLng;
  }

  interface MarkerOptions {
    position: LatLng;
    map?: Map | null;
    title?: string;
    icon?: string | MarkerIcon;
  }

  interface MarkerIcon {
    content: string;
    size?: Size;
    anchor?: Point;
  }

  class InfoWindow {
    constructor(options: InfoWindowOptions);
    open(map: Map | null, marker: Marker): void;
    close(): void;
    getMap(): Map | null;
  }

  interface InfoWindowOptions {
    content: string;
  }

  class Polyline {
    constructor(options: PolylineOptions);
    setMap(map: Map | null): void;
  }

  interface PolylineOptions {
    map?: Map | null;
    path: LatLng[];
    strokeColor?: string;
    strokeWeight?: number;
    strokeOpacity?: number;
  }

  namespace Event {
    function addListener(target: unknown, type: string, handler: (e: MapMouseEvent) => void): unknown;
    function removeListener(listener: unknown): void;
  }

  interface MapMouseEvent {
    coord: LatLng;
  }

  namespace Service {
    const Status: { OK: string };
    function geocode(options: { query: string }, callback: (status: string, response: unknown) => void): void;
  }

  const Position: Record<string, number>;
}

interface Window {
  naver: typeof naver;
}
