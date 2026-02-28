import type { Restaurant } from '../../types/restaurant';
import { StarRating } from '../common/StarRating';
import { RuschlangBadge } from '../common/RuschlangBadge';
import { badgeByScore } from '../../utils/rating';

interface Props {
  restaurants: Restaurant[];
}

export function MapRanking({ restaurants }: Props) {
  const ranked = restaurants
    .filter(r => r.reviewCount > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 20);

  if (ranked.length === 0) {
    return <p className="text-sm text-text-muted">리뷰가 등록된 맛집이 없습니다.</p>;
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto">
      {ranked.map((r, i) => {
        const grade = badgeByScore(r.rating, r.reviewCount);
        return (
          <div key={r.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-lg font-sans font-bold text-primary min-w-[24px]">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text truncate">{r.name}</span>
                <RuschlangBadge grade={grade} />
              </div>
              <p className="text-xs text-text-muted truncate">{r.address}</p>
              <StarRating rating={r.rating} size="sm" />
              <span className="text-xs text-text-muted ml-1">({r.reviewCount})</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
