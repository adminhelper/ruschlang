import { useState } from 'react';
import type { Roadmap, RoadmapCreateRequest } from '../../types/roadmap';
import type { Stop } from '../../types/roadmap';
import { StopSearchModal } from './StopSearchModal';
import { parseStops, serializeStops } from '../../utils/stops';

interface Props {
  initialData?: Roadmap;
  onSubmit: (data: RoadmapCreateRequest) => void;
  onCancel: () => void;
}

export function RoadmapForm({ initialData, onSubmit, onCancel }: Props) {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [stops, setStops] = useState<Stop[]>(initialData ? parseStops(initialData.stops) : []);
  const [showSearch, setShowSearch] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      author: '',
      description: description.trim(),
      stops: serializeStops(stops),
    });
  };

  const removeStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-4 space-y-3">
        <h3 className="text-base font-sans font-bold text-text">
          {initialData ? '로드맵 수정' : '로드맵 생성'}
        </h3>

        <input
          type="text" placeholder="로드맵 제목 *" value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
          required
        />

        <textarea
          placeholder="설명 (선택)" value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none h-16 focus:ring-2 focus:ring-primary/30 focus:outline-none"
        />

        {/* 스톱 목록 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-sans font-bold text-text">경유지 ({stops.length})</span>
            <button
              type="button"
              onClick={() => setShowSearch(true)}
              className="px-3 py-1 bg-primary text-white rounded text-xs font-sans"
            >
              + 맛집 검색
            </button>
          </div>
          {stops.length > 0 && (
            <div className="space-y-1">
              {stops.map((s, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{s.name}</p>
                    <p className="text-xs text-text-muted truncate">{s.address}</p>
                  </div>
                  <button type="button" onClick={() => removeStop(i)} className="text-red-500 text-xs">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <button type="submit" className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-sans font-bold hover:bg-primary-dark">
            {initialData ? '수정' : '생성'}
          </button>
          <button type="button" onClick={onCancel} className="px-4 py-2 text-text-muted text-sm hover:text-text">
            취소
          </button>
        </div>
      </form>

      {showSearch && (
        <StopSearchModal
          onSelect={(stop) => { setStops([...stops, stop]); setShowSearch(false); }}
          onClose={() => setShowSearch(false)}
        />
      )}
    </>
  );
}
