import { useState } from 'react';
import { searchPlaces } from '../../api/map';
import type { Stop } from '../../types/roadmap';

interface Props {
  onSelect: (stop: Stop) => void;
  onClose: () => void;
}

type SearchMode = 'place' | 'address';

interface AddressSearchResult {
  x: string;
  y: string;
  roadAddress: string;
  jibunAddress: string;
}

export function StopSearchModal({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState<SearchMode>('place');
  const [results, setResults] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(false);

  const geocodeByAddress = (keyword: string): Promise<Stop[]> => {
    return new Promise((resolve, reject) => {
      if (!window.naver?.maps?.Service) {
        reject(new Error('Naver map service unavailable'));
        return;
      }

      window.naver.maps.Service.geocode({ query: keyword }, (status: string, response: any) => {
        if (status !== window.naver.maps.Service.Status.OK) {
          resolve([]);
          return;
        }

        const addresses = (response?.v2?.addresses || []) as AddressSearchResult[];
        const parsed: Stop[] = addresses.map((item) => {
          const address = item.roadAddress || item.jibunAddress;
          return {
            name: address,
            address,
            lat: Number(item.y),
            lng: Number(item.x),
          };
        });
        resolve(parsed);
      });
    });
  };

  const handleSearch = async () => {
    const keyword = query.trim();
    if (!keyword) return;

    setLoading(true);
    try {
      if (mode === 'place') {
        const data = await searchPlaces(keyword);
        const mapped = data.map((item) => {
          const cleanTitle = item.title.replace(/<[^>]+>/g, '');
          return {
            name: cleanTitle,
            address: item.roadAddress || item.address,
            lat: parseInt(item.mapy, 10) / 1e7,
            lng: parseInt(item.mapx, 10) / 1e7,
          };
        });
        setResults(mapped);
      } else {
        const data = await geocodeByAddress(keyword);
        setResults(data);
      }
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="검색 모달 닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-5">
        <h2 className="text-lg font-sans font-bold text-text mb-3">맛집 검색</h2>

        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            type="button"
            onClick={() => setMode('place')}
            className={`py-1.5 rounded-lg text-sm font-sans font-bold transition-colors ${mode === 'place' ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted hover:text-text'}`}
          >
            가게명 검색
          </button>
          <button
            type="button"
            onClick={() => setMode('address')}
            className={`py-1.5 rounded-lg text-sm font-sans font-bold transition-colors ${mode === 'address' ? 'bg-primary text-white' : 'bg-gray-100 text-text-muted hover:text-text'}`}
          >
            주소 검색
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder={mode === 'place' ? '가게명 검색 (예: 갈비집, 스타벅스)' : '주소 검색 (예: 강남역 1번 출구)'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-sans font-bold hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? '...' : '검색'}
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {results.map((item, i) => (
            <button
              key={`${item.name}-${i}`}
              type="button"
              onClick={() => onSelect(item)}
              className="w-full text-left p-3 rounded-lg hover:bg-primary/5 border border-border transition-colors"
            >
              <p className="text-sm font-bold text-text">{item.name}</p>
              <p className="text-xs text-text-muted">{item.address}</p>
            </button>
          ))}
          {results.length === 0 && !loading && query && (
            <p className="text-sm text-text-muted text-center py-4">검색 결과가 없습니다.</p>
          )}
        </div>

        <button type="button" onClick={onClose} className="w-full mt-3 py-2 text-text-muted text-sm hover:text-text">닫기</button>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    naver: any;
  }
}
