import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { getMapConfig } from '../../api/map';
import type { RestaurantCreateRequest } from '../../types/restaurant';
import { resizePhoto } from '../../utils/photo';

interface Props {
  onSubmit: (data: RestaurantCreateRequest) => void;
}

export function RestaurantForm({ onSubmit }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const miniMapInstance = useRef<any>(null);
  const tempMarkerRef = useRef<any>(null);
  const clickListenerRef = useRef<any>(null);
  const [form, setForm] = useState<RestaurantCreateRequest>({
    name: '', address: '', lat: 0, lng: 0,
    description: '', photoUrl: '',
  });

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        const config = await getMapConfig();
        if (cancelled || !config.clientId) return;

        const initMap = () => {
          if (cancelled || !mapRef.current || !window.naver) return;

          const map = new window.naver.maps.Map(mapRef.current, {
            center: new window.naver.maps.LatLng(37.5665, 126.978),
            zoom: 13,
            zoomControl: true,
          });

          miniMapInstance.current = map;
          clickListenerRef.current = window.naver.maps.Event.addListener(map, 'click', (e: any) => {
            const lat = e.coord.lat();
            const lng = e.coord.lng();

            setForm(prev => ({
              ...prev,
              lat,
              lng,
            }));

            if (tempMarkerRef.current) {
              tempMarkerRef.current.setMap(null);
              tempMarkerRef.current = null;
            }

            const marker = new window.naver.maps.Marker({
              position: new window.naver.maps.LatLng(lat, lng),
              map,
              title: '선택한 좌표',
            });
            tempMarkerRef.current = marker;

            window.setTimeout(() => {
              if (tempMarkerRef.current === marker) {
                marker.setMap(null);
                tempMarkerRef.current = null;
              }
            }, 1500);
          });
        };

        if (window.naver) {
          initMap();
          return;
        }

        const script = document.createElement('script');
        script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${config.clientId}&submodules=geocoder`;
        script.onload = initMap;
        document.head.appendChild(script);
      } catch {
        return;
      }
    };

    initialize();

    return () => {
      cancelled = true;
      if (clickListenerRef.current && window.naver) {
        window.naver.maps.Event.removeListener(clickListenerRef.current);
      }
      if (tempMarkerRef.current) {
        tempMarkerRef.current.setMap(null);
        tempMarkerRef.current = null;
      }
    };
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) return;
    onSubmit(form);
  };

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const photoUrl = await resizePhoto(file);
      setForm({ ...form, photoUrl });
    } catch {
      setForm({ ...form, photoUrl: '' });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-4 space-y-3">
      <h3 className="text-base font-sans font-bold text-text">맛집 등록</h3>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="text" placeholder="상호명 *" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
          required
        />
        <input
          type="text" placeholder="주소 *" value={form.address}
          onChange={e => setForm({ ...form, address: e.target.value })}
          className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
          required
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs text-text-muted">지도를 클릭하면 위도/경도가 자동 입력됩니다.</p>
        <div ref={mapRef} className="w-full h-48 rounded-lg border border-border bg-gray-100" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="number" placeholder="위도 (lat)" value={form.lat || ''}
          onChange={e => setForm({ ...form, lat: parseFloat(e.target.value) || 0 })}
          className="px-3 py-2 border border-border rounded-lg text-sm" step="any"
        />
        <input
          type="number" placeholder="경도 (lng)" value={form.lng || ''}
          onChange={e => setForm({ ...form, lng: parseFloat(e.target.value) || 0 })}
          className="px-3 py-2 border border-border rounded-lg text-sm" step="any"
        />
      </div>

      <textarea
        placeholder="설명" value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
        className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none h-20 focus:ring-2 focus:ring-primary/30 focus:outline-none"
      />

      <div className="space-y-2">
        <input
          type="file"
          accept="image/*"
          onChange={handlePhotoChange}
          className="w-full text-xs text-text-muted file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-gray-100 file:text-text"
        />
        {form.photoUrl && (
          <img src={form.photoUrl} alt="맛집 사진 미리보기" className="w-full h-36 object-cover rounded-lg border border-border" />
        )}
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-primary text-white rounded-lg text-sm font-sans font-bold hover:bg-primary-dark transition-colors"
      >
        맛집 등록
      </button>
    </form>
  );
}

declare global {
  interface Window {
    naver: any;
  }
}
