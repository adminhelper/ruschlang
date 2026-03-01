import { memo, useState } from 'react';
import type { Roadmap, RoadmapRateRequest } from '../../types/roadmap';
import { StarRating } from '../common/StarRating';
import { parseStops } from '../../utils/stops';
import { formatRelativeDate } from '../../utils/date';

interface Props {
  roadmap: Roadmap;
  onEdit?: () => void;
  onDelete?: (id: string) => void;
  onRate?: (id: string, data: RoadmapRateRequest) => void;
}

export const RoadmapCard = memo(function RoadmapCard({ roadmap: r, onEdit, onDelete, onRate }: Props) {
  const stops = parseStops(r.stops);
  const [showRate, setShowRate] = useState(false);
  const [ratingVal, setRatingVal] = useState(0);

  return (
    <div className="bg-white rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-shadow">
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
        <div className="flex flex-wrap gap-1.5 mb-3">
          {stops.map((stop, i) => (
            <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-sans">
              <span className="font-bold">{i + 1}</span> {stop.name}
            </span>
          ))}
        </div>
      )}

      {/* 액션 */}
      <div className="flex gap-2 pt-2 border-t border-border">
        {onRate && (
          <button
            onClick={() => setShowRate(!showRate)}
            className="text-xs text-primary hover:text-primary-dark font-sans"
          >
            평점 매기기
          </button>
        )}
        {onEdit && (
          <button onClick={onEdit} className="text-xs text-blue-600 hover:text-blue-700 font-sans">수정</button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(r.id)} className="text-xs text-red-500 hover:text-red-600 font-sans ml-auto">삭제</button>
        )}
      </div>

      {/* 평점 입력 */}
      {showRate && onRate && (
        <div className="mt-2 flex items-center gap-2">
          <StarRating rating={ratingVal} editable onChange={setRatingVal} size="md" />
          <button
            onClick={() => {
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
