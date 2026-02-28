import { useState } from 'react';
import { searchPlaces } from '../../api/map';
import type { Stop } from '../../types/roadmap';

interface Props {
  onSelect: (stop: Stop) => void;
  onClose: () => void;
}

export function StopSearchModal({ onSelect, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Array<{ title: string; address: string; roadAddress: string; mapx: string; mapy: string }>>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const data = await searchPlaces(query.trim());
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: typeof results[0]) => {
    const cleanTitle = item.title.replace(/<[^>]+>/g, '');
    const lng = parseInt(item.mapx) / 1e7;
    const lat = parseInt(item.mapy) / 1e7;
    onSelect({
      name: cleanTitle,
      address: item.roadAddress || item.address,
      lat,
      lng,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-5" onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-sans font-bold text-text mb-3">맛집 검색</h2>

        <div className="flex gap-2 mb-4">
          <input
            type="text" placeholder="가게명 검색 (예: 갈비집, 스타벅스)"
            value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
          />
          <button
            onClick={handleSearch} disabled={loading}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-sans font-bold hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? '...' : '검색'}
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {results.map((item, i) => (
            <button
              key={i}
              onClick={() => handleSelect(item)}
              className="w-full text-left p-3 rounded-lg hover:bg-primary/5 border border-border transition-colors"
            >
              <p className="text-sm font-bold text-text" dangerouslySetInnerHTML={{ __html: item.title }} />
              <p className="text-xs text-text-muted">{item.roadAddress || item.address}</p>
            </button>
          ))}
          {results.length === 0 && !loading && query && (
            <p className="text-sm text-text-muted text-center py-4">검색 결과가 없습니다.</p>
          )}
        </div>

        <button onClick={onClose} className="w-full mt-3 py-2 text-text-muted text-sm hover:text-text">닫기</button>
      </div>
    </div>
  );
}
