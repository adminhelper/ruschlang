import type { Review } from '../../types/restaurant';
import { StarRating } from '../common/StarRating';
import { formatRelativeDate } from '../../utils/date';

interface Props {
  reviews: Review[];
}

export function ReviewList({ reviews }: Props) {
  if (reviews.length === 0) {
    return <p className="text-xs text-text-muted">리뷰가 없습니다.</p>;
  }

  return (
    <div className="space-y-2">
      {reviews.map(r => (
        <div key={r.id} className="p-2 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold">{r.name}</span>
            <StarRating rating={r.rating} size="sm" />
            <span className="text-xs text-text-muted ml-auto">{formatRelativeDate(r.createdAt)}</span>
          </div>
          {r.note && <p className="text-xs text-text-muted">{r.note}</p>}
          {r.photoUrl && <img src={r.photoUrl} alt="" className="mt-1 max-h-24 rounded" />}
        </div>
      ))}
    </div>
  );
}
