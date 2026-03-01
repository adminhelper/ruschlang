import { useEffect, useMemo, useRef, useState } from 'react';
import { getRestaurants } from '../api/restaurants';
import {
  buildNaverDirectionsUrl,
  formatRouteDistance,
  formatRouteDuration,
  getDirections,
  getMapConfig,
} from '../api/map';
import { getRoadmaps } from '../api/roadmaps';
import { MapFilters } from '../components/map/MapFilters';
import { MapRanking } from '../components/map/MapRanking';
import { RoutePanel } from '../components/map/RoutePanel';
import { useToast } from '../contexts/ToastContext';
import type { Roadmap } from '../types/roadmap';
import type { Restaurant } from '../types/restaurant';
import { parseStops } from '../utils/stops';
import { matchesFoodCategory, matchesGradeFilter, matchesRegion } from '../utils/mapFilters';
import { badgeByScore, calculateAverage } from '../utils/rating';

type SidebarTab = 'ranking' | 'roadmap';
type RouteMode = 'foot' | 'car';

interface RouteSummary {
  distance: number;
  duration: number;
}

function decodePolyline(encoded: string): Array<[number, number]> {
  const points: Array<[number, number]> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lat += result & 1 ? ~(result >> 1) : result >> 1;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    lng += result & 1 ? ~(result >> 1) : result >> 1;
    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

export function MapPage() {
  const { showToast } = useToast();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<naver.maps.Map | null>(null);
  const restaurantMarkersRef = useRef<Array<{ restaurantId: string; marker: naver.maps.Marker; infoWindow: naver.maps.InfoWindow }>>([]);
  const roadmapMarkersRef = useRef<naver.maps.Marker[]>([]);
  const routePolylineRef = useRef<naver.maps.Polyline | null>(null);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filters, setFilters] = useState({ region: '지역 전체', food: '음식종류 전체', grade: '평점 전체' });
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('ranking');
  const [searchQuery, setSearchQuery] = useState('');

  const [activeRoadmap, setActiveRoadmap] = useState<Roadmap | null>(null);
  const [routeMode, setRouteMode] = useState<RouteMode>('foot');
  const [routeSummary, setRouteSummary] = useState<RouteSummary | null>(null);

  const activeStops = useMemo(() => {
    if (!activeRoadmap) return [];
    return parseStops(activeRoadmap.stops);
  }, [activeRoadmap]);

  useEffect(() => {
    getRestaurants().then(setRestaurants).catch(() => {
      showToast('맛집 데이터를 불러오지 못했습니다', 'error');
    });
  }, [showToast]);

  useEffect(() => {
    getRoadmaps().then(setRoadmaps).catch(() => {
      showToast('로드맵 데이터를 불러오지 못했습니다', 'error');
    });
  }, [showToast]);

  useEffect(() => {
    const filtered = restaurants.filter((r) => {
      const reviewCount = r.reviews?.length ?? 0;
      const rating = calculateAverage((r.reviews || []).map(review => review.rating));
      const grade = badgeByScore(rating, reviewCount);
      return matchesRegion(r.address, filters.region)
        && matchesFoodCategory(r.name, r.description, '', filters.food)
        && matchesGradeFilter(grade, filters.grade);
    });
    setFilteredRestaurants(filtered);
  }, [restaurants, filters]);

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      try {
        const config = await getMapConfig();
        if (cancelled || !config.clientId) return;

        const script = document.createElement('script');
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${config.clientId}&submodules=geocoder`;
        script.onload = () => {
          if (cancelled || !mapRef.current || !window.naver) return;
          const map = new window.naver.maps.Map(mapRef.current, {
            center: new window.naver.maps.LatLng(37.5665, 126.978),
            zoom: 12,
            mapTypeControl: true,
            zoomControl: true,
          });
          mapInstance.current = map;
          setMapLoaded(true);
        };
        document.head.appendChild(script);
      } catch {
        showToast('지도 초기화에 실패했습니다', 'error');
      }
    }

    initMap();

    return () => {
      cancelled = true;
    };
  }, [showToast]);

  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || !window.naver) return;

    restaurantMarkersRef.current.forEach(({ marker }) => {
      marker.setMap(null);
    });
    restaurantMarkersRef.current = [];

    filteredRestaurants.forEach((r) => {
      if (!r.lat || !r.lng) return;

      const reviewCount = r.reviews?.length ?? 0;
      const rating = calculateAverage((r.reviews || []).map(review => review.rating));

      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(r.lat, r.lng),
        map: mapInstance.current,
        title: r.name,
      });

      const infoWindow = new window.naver.maps.InfoWindow({
        content: `<div style="padding:10px;font-family:Jua,sans-serif;min-width:150px">
          <strong>${r.name}</strong><br/>
          <span style="font-size:12px;color:#666">${r.address}</span><br/>
          <span style="color:#f59e0b">★</span> ${rating > 0 ? rating.toFixed(1) : '-'}
          <span style="font-size:11px;color:#999">(${reviewCount})</span>
        </div>`,
      });

      window.naver.maps.Event.addListener(marker, 'click', () => {
        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(mapInstance.current, marker);
        }
      });

      restaurantMarkersRef.current.push({
        restaurantId: r.id,
        marker,
        infoWindow,
      });
    });
  }, [filteredRestaurants, mapLoaded]);

  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || !searchQuery.trim()) return;

    const normalized = searchQuery.trim().toLowerCase();
    const target = filteredRestaurants.find((r) => {
      return r.name.toLowerCase().includes(normalized) || r.address.toLowerCase().includes(normalized);
    });

    if (!target) {
      showToast('검색 결과가 없습니다', 'info');
      return;
    }

    const targetMarker = restaurantMarkersRef.current.find(item => item.restaurantId === target.id);
    if (!targetMarker) return;

    mapInstance.current.setCenter(new window.naver.maps.LatLng(target.lat, target.lng));
    mapInstance.current.setZoom(14);
    restaurantMarkersRef.current.forEach(({ infoWindow }) => {
      infoWindow.close();
    });
    targetMarker.infoWindow.open(mapInstance.current, targetMarker.marker);
  }, [filteredRestaurants, mapLoaded, searchQuery, showToast]);

  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || !window.naver) return;

    roadmapMarkersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    roadmapMarkersRef.current = [];

    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }

    setRouteSummary(null);

    if (!activeRoadmap) return;

    const stops = parseStops(activeRoadmap.stops);
    if (stops.length === 0) {
      showToast('로드맵 정류장이 없습니다', 'info');
      return;
    }

    const bounds = new window.naver.maps.LatLngBounds();
    stops.forEach((stop, i) => {
      const position = new window.naver.maps.LatLng(stop.lat, stop.lng);
      bounds.extend(position);
      const marker = new window.naver.maps.Marker({
        position,
        map: mapInstance.current,
        icon: {
          content: `<div style="background:#ff6b35;color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.3)">${i + 1}</div>`,
          anchor: new window.naver.maps.Point(12, 12),
        },
      });
      roadmapMarkersRef.current.push(marker);
    });

    if (stops.length === 1) {
      const stop = stops[0];
      mapInstance.current.setCenter(new window.naver.maps.LatLng(stop.lat, stop.lng));
      mapInstance.current.setZoom(14);
    } else {
      mapInstance.current.fitBounds(bounds);
    }

    if (stops.length < 2) return;

    const coords = stops.map(stop => `${stop.lng},${stop.lat}`).join(';');
    getDirections(routeMode, coords)
      .then((response) => {
        const route = response.routes?.[0];
        if (!route?.geometry) return;

        const path = decodePolyline(route.geometry).map(
          ([lat, lng]) => new window.naver.maps.LatLng(lat, lng)
        );

        if (routePolylineRef.current) {
          routePolylineRef.current.setMap(null);
        }

        routePolylineRef.current = new window.naver.maps.Polyline({
          map: mapInstance.current,
          path,
          strokeColor: '#ff6b35',
          strokeWeight: 5,
          strokeOpacity: 0.85,
        });

        setRouteSummary({
          distance: route.distance,
          duration: route.duration,
        });
      })
      .catch(() => {
        showToast('경로를 불러오지 못했습니다', 'error');
      });
  }, [activeRoadmap, mapLoaded, routeMode, showToast]);

  const handleRoadmapView = (roadmap: Roadmap) => {
    setActiveRoadmap(roadmap);
    setRouteMode('foot');
  };

  const closeRoadmapView = () => {
    setActiveRoadmap(null);
    setRouteSummary(null);
  };

  const roadmapStopsCount = (roadmap: Roadmap) => parseStops(roadmap.stops).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <h2 className="text-xl font-sans font-bold text-text mb-3">루슐랭 지도</h2>
          <MapFilters
            filters={filters}
            onChange={setFilters}
            onSearch={setSearchQuery}
          />
          <div
            ref={mapRef}
            className="w-full h-[500px] rounded-xl border border-border bg-gray-100 mt-3"
          >
            {!mapLoaded && (
              <div className="flex items-center justify-center h-full text-text-muted text-sm">
                지도 로딩 중...
              </div>
            )}
          </div>
          <p className="text-xs text-text-muted mt-2">
            맛집 {filteredRestaurants.length}개 표시 중 (전체 {restaurants.length}개)
          </p>
          {activeRoadmap && (
            <RoutePanel
              roadmapTitle={activeRoadmap.title}
              mode={routeMode}
              onModeChange={setRouteMode}
              distanceLabel={routeSummary ? formatRouteDistance(routeSummary.distance) : '-'}
              durationLabel={routeSummary ? formatRouteDuration(routeSummary.duration) : '-'}
              naverUrl={buildNaverDirectionsUrl(activeStops)}
              onClose={closeRoadmapView}
            />
          )}
        </div>

        <div className="w-80 shrink-0">
          <div className="bg-white rounded-xl border border-border p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 bg-gray-100 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setSidebarTab('ranking')}
                className={`py-1.5 text-sm rounded-md transition-colors ${sidebarTab === 'ranking' ? 'bg-white text-text font-bold shadow-sm' : 'text-text-muted hover:text-text'}`}
              >
                랭킹
              </button>
              <button
                type="button"
                onClick={() => setSidebarTab('roadmap')}
                className={`py-1.5 text-sm rounded-md transition-colors ${sidebarTab === 'roadmap' ? 'bg-white text-text font-bold shadow-sm' : 'text-text-muted hover:text-text'}`}
              >
                로드맵
              </button>
            </div>

            {sidebarTab === 'ranking' ? (
              <>
                <h3 className="text-lg font-sans font-bold text-text">🏆 루슐랭 랭킹</h3>
                <MapRanking restaurants={filteredRestaurants} />
              </>
            ) : (
              <>
                <h3 className="text-lg font-sans font-bold text-text">🗺️ 맛집 로드맵</h3>
                <div className="space-y-2 max-h-[420px] overflow-y-auto">
                  {roadmaps.map(roadmap => (
                    <div key={roadmap.id} className="rounded-lg border border-border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-text truncate">{roadmap.title}</p>
                          <p className="text-xs text-text-muted">by {roadmap.author}</p>
                        </div>
                        <span className="text-xs text-text-muted">
                          ★ {roadmap.rating.toFixed(1)} ({roadmap.ratingCount})
                        </span>
                      </div>
                      <p className="text-xs text-text-muted mt-1">정류장 {roadmapStopsCount(roadmap)}곳</p>
                      <button
                        type="button"
                        onClick={() => handleRoadmapView(roadmap)}
                        className="mt-2 text-xs text-primary hover:text-primary-dark font-sans font-bold"
                      >
                        지도에서 보기
                      </button>
                    </div>
                  ))}
                  {roadmaps.length === 0 && (
                    <p className="text-sm text-text-muted">등록된 로드맵이 없습니다.</p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
