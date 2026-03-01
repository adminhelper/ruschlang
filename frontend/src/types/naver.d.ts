/* Naver Maps JavaScript API v3 — minimal type stubs */

declare namespace naver.maps {
  class Map {
    constructor(element: HTMLElement, options?: MapOptions);
    setCenter(latlng: LatLng): void;
    setZoom(level: number): void;
    fitBounds(bounds: LatLngBounds): void;
    getCenter(): LatLng;
    getZoom(): number;
  }

  interface MapOptions {
    center?: LatLng;
    zoom?: number;
    mapTypeControl?: boolean;
    zoomControl?: boolean;
  }

  class LatLng {
    constructor(lat: number, lng: number);
    lat(): number;
    lng(): number;
  }

  class LatLngBounds {
    constructor();
    extend(latlng: LatLng): void;
  }

  class Point {
    constructor(x: number, y: number);
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
}

interface Window {
  naver: typeof naver;
}
