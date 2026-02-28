import { useState, useEffect, useRef } from 'react';
import { getRestaurants } from '../api/restaurants';
import { getMapConfig } from '../api/map';
import { MapFilters } from '../components/map/MapFilters';
import { MapRanking } from '../components/map/MapRanking';
import type { Restaurant } from '../types/restaurant';
import { matchesRegion, matchesFoodCategory, matchesGradeFilter } from '../utils/mapFilters';
import { badgeByScore } from '../utils/rating';

export function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [filters, setFilters] = useState({ region: '지역 전체', food: '음식종류 전체', grade: '평점 전체' });

  // 맛집 데이터 로드
  useEffect(() => {
    getRestaurants().then(setRestaurants).catch(console.error);
  }, []);

  // 필터 적용
  useEffect(() => {
    const filtered = restaurants.filter(r => {
      const grade = badgeByScore(r.rating, r.reviewCount);
      return matchesRegion(r.region || r.address, filters.region)
        && matchesFoodCategory(r.name, r.description, r.category, filters.food)
        && matchesGradeFilter(grade, filters.grade);
    });
    setFilteredRestaurants(filtered);
  }, [restaurants, filters]);

  // 네이버 지도 초기화
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
      } catch (err) {
        console.error('지도 초기화 실패:', err);
      }
    }
    initMap();
    return () => { cancelled = true; };
  }, []);

  // 마커 업데이트
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || !window.naver) return;

    // 기존 마커 제거
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    filteredRestaurants.forEach(r => {
      if (!r.lat || !r.lng) return;
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(r.lat, r.lng),
        map: mapInstance.current,
        title: r.name,
      });

      const infoWindow = new window.naver.maps.InfoWindow({
        content: `<div style="padding:10px;font-family:Jua,sans-serif;min-width:150px">
          <strong>${r.name}</strong><br/>
          <span style="font-size:12px;color:#666">${r.address}</span><br/>
          <span style="color:#f59e0b">★</span> ${r.rating > 0 ? r.rating.toFixed(1) : '-'}
          <span style="font-size:11px;color:#999">(${r.reviewCount})</span>
        </div>`,
      });

      window.naver.maps.Event.addListener(marker, 'click', () => {
        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(mapInstance.current, marker);
        }
      });

      markersRef.current.push(marker);
    });
  }, [filteredRestaurants, mapLoaded]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4">
      <div className="flex gap-4">
        {/* 지도 영역 */}
        <div className="flex-1">
          <h2 className="text-xl font-sans font-bold text-text mb-3">루슐랭 지도</h2>
          <MapFilters filters={filters} onChange={setFilters} />
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
        </div>

        {/* 사이드바 */}
        <div className="w-80 shrink-0">
          <div className="bg-white rounded-xl border border-border p-4">
            <h3 className="text-lg font-sans font-bold text-text mb-3">🏆 루슐랭 랭킹</h3>
            <MapRanking restaurants={filteredRestaurants} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Global type for Naver Maps
declare global {
  interface Window {
    naver: any;
  }
}
