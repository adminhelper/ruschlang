import { memo, useEffect, useRef, useState } from 'react';
import type { Roadmap, RoadmapRateRequest } from '../../types/roadmap';
import { StarRating } from '../common/StarRating';
import { parseStops } from '../../utils/stops';
import { formatRelativeDate } from '../../utils/date';
import { getDirections, getMapConfig, formatRouteDistance, formatRouteDuration, buildNaverDirectionsUrl } from '../../api/map';
import type { Stop } from '../../types/roadmap';

interface Props {
  roadmap: Roadmap;
  isMapOpen?: boolean;
  onToggleMap?: () => void;
  onEdit?: () => void;
  onDelete?: (id: string) => void;
  onRate?: (id: string, data: RoadmapRateRequest) => void;
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

async function ensureNaverMaps(): Promise<void> {
  if (window.naver?.maps) return;

  const config = await getMapConfig();
  if (!config.clientId) throw new Error('Map config missing');

  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="oapi.map.naver.com"]');
    if (existing) {
      const check = () => {
        if (window.naver?.maps) resolve();
        else setTimeout(check, 100);
      };
      check();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${config.clientId}&submodules=geocoder`;
    script.onload = () => {
      const check = () => {
        if (window.naver?.maps) resolve();
        else setTimeout(check, 100);
      };
      check();
    };
    script.onerror = () => reject(new Error('Failed to load Naver Maps'));
    document.head.appendChild(script);
  });
}

function RoadmapInlineMap({ stops }: { stops: Stop[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<naver.maps.Map | null>(null);
  const markersRef = useRef<naver.maps.Marker[]>([]);
  const polylineRef = useRef<naver.maps.Polyline | null>(null);
  const [loading, setLoading] = useState(true);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        await ensureNaverMaps();
        if (cancelled || !mapRef.current || !window.naver) return;

        const bounds = new window.naver.maps.LatLngBounds();
        stops.forEach(s => bounds.extend(new window.naver.maps.LatLng(s.lat, s.lng)));

        const map = new window.naver.maps.Map(mapRef.current, {
          center: stops.length === 1
            ? new window.naver.maps.LatLng(stops[0].lat, stops[0].lng)
            : bounds.getCenter(),
          zoom: 18,
          zoomControl: true,
          zoomControlOptions: { position: window.naver.maps.Position.TOP_RIGHT },
        });
        mapInstance.current = map;

        if (stops.length > 1) {
          map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });
        }

        stops.forEach((stop, i) => {
          const marker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(stop.lat, stop.lng),
            map,
            icon: {
              content: `<div style="background:#3182f6;color:white;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);font-family:Pretendard,sans-serif">${i + 1}</div>`,
              anchor: new window.naver.maps.Point(14, 14),
            },
          });

          const infoWindow = new window.naver.maps.InfoWindow({
            content: `<div style="padding:10px 14px;font-family:Pretendard,sans-serif;min-width:160px">
              <strong style="font-size:14px;color:#191f28">${stop.name}</strong>
              <p style="font-size:12px;color:#8b95a1;margin-top:4px">${stop.address}</p>
            </div>`,
          });

          window.naver.maps.Event.addListener(marker, 'click', () => {
            markersRef.current.forEach(() => infoWindow.close());
            infoWindow.open(map, marker);
            map.setCenter(new window.naver.maps.LatLng(stop.lat, stop.lng));
            map.setZoom(18);
          });

          markersRef.current.push(marker);
        });

        if (stops.length >= 2) {
          const coords = stops.map(s => `${s.lng},${s.lat}`).join(';');
          try {
            const response = await getDirections('foot', coords);
            if (cancelled) return;
            const route = response.routes?.[0];
            if (route?.geometry) {
              const path = decodePolyline(route.geometry).map(
                ([lat, lng]) => new window.naver.maps.LatLng(lat, lng)
              );
              polylineRef.current = new window.naver.maps.Polyline({
                map,
                path,
                strokeColor: '#3182f6',
                strokeWeight: 4,
                strokeOpacity: 0.8,
              });
              setRouteInfo({
                distance: formatRouteDistance(route.distance),
                duration: formatRouteDuration(route.duration),
              });
            }
          } catch {
            // 경로 로딩 실패 — 마커만 표시
          }
        }

        setLoading(false);
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    init();

    return () => {
      cancelled = true;
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      if (mapInstance.current) {
        mapInstance.current.destroy();
        mapInstance.current = null;
      }
    };
  }, [stops]);

  const naverUrl = buildNaverDirectionsUrl(stops);

  return (
    <div className="mt-3">
      <div
        ref={mapRef}
        className="w-full h-[280px] rounded-lg border border-border bg-gray-100 overflow-hidden"
      >
        {loading && (
          <div className="flex items-center justify-center h-full text-text-muted text-sm">
            지도 로딩 중...
          </div>
        )}
      </div>
      {routeInfo && (
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-3 text-xs text-text-muted">
            <span>🚶 도보 {routeInfo.distance} · {routeInfo.duration}</span>
          </div>
          {naverUrl && (
            <a
              href={naverUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:text-primary-dark font-bold"
            >
              네이버 지도로 보기 →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export const RoadmapCard = memo(function RoadmapCard({ roadmap: r, isMapOpen, onToggleMap, onEdit, onDelete, onRate }: Props) {
  const stops = parseStops(r.stops);
  const [showRate, setShowRate] = useState(false);
  const [ratingVal, setRatingVal] = useState(0);

  return (
    <div className="bg-surface rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
      {/* 클릭 가능한 카드 영역 */}
      <button
        type="button"
        onClick={onToggleMap}
        className="w-full text-left p-4 cursor-pointer"
        disabled={stops.length === 0}
      >
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-base font-sans font-bold text-text">{r.title}</h3>
            <p className="text-xs text-text-muted">by {r.author} · {formatRelativeDate(r.createdAt)}</p>
          </div>
          <div className="flex items-center gap-1">
            <StarRating rating={r.rating} size="sm" />
            <span className="text-xs text-text-muted">({r.ratingCount})</span>
          </div>
        </div>

        {r.description && <p className="text-sm text-text-muted mb-3">{r.description}</p>}

        {/* 스톱 목록 */}
        {stops.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {stops.map((stop, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-sans">
                <span className="font-bold">{i + 1}</span> {stop.name}
              </span>
            ))}
          </div>
        )}

        {stops.length > 0 && (
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <span>📍 정류장 {stops.length}곳</span>
            <span className="ml-auto text-primary font-bold">
              {isMapOpen ? '▲ 지도 접기' : '▼ 지도 보기'}
            </span>
          </div>
        )}
      </button>

      {/* 인라인 지도 */}
      {isMapOpen && stops.length > 0 && (
        <div className="px-4 pb-4">
          <RoadmapInlineMap stops={stops} />
        </div>
      )}

      {/* 액션 */}
      <div className="flex gap-2 px-4 pb-3 pt-2 border-t border-border">
        {onRate && (
          <button
            onClick={(e) => { e.stopPropagation(); setShowRate(!showRate); }}
            className="text-xs text-primary hover:text-primary-dark font-sans"
          >
            평점 매기기
          </button>
        )}
        {onEdit && (
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-xs text-blue-600 hover:text-blue-700 font-sans">수정</button>
        )}
        {onDelete && (
          <button onClick={(e) => { e.stopPropagation(); onDelete(r.id); }} className="text-xs text-red-500 hover:text-red-600 font-sans ml-auto">삭제</button>
        )}
      </div>

      {/* 평점 입력 */}
      {showRate && onRate && (
        <div className="px-4 pb-3 flex items-center gap-2">
          <StarRating rating={ratingVal} editable onChange={setRatingVal} size="md" />
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (ratingVal > 0) { onRate(r.id, { rating: ratingVal }); setShowRate(false); }
            }}
            disabled={ratingVal === 0}
            className="px-2 py-1 bg-primary text-white rounded text-xs font-sans disabled:opacity-50"
          >
            등록
          </button>
        </div>
      )}
    </div>
  );
});
