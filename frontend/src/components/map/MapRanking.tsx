import { memo, useMemo } from 'react';
import type { Restaurant } from '../../types/restaurant';
import { StarRating } from '../common/StarRating';
import { RuschlangBadge } from '../common/RuschlangBadge';
import { badgeByScore, calculateAverage } from '../../utils/rating';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  restaurants: Restaurant[];
}

export const MapRanking = memo(function MapRanking({ restaurants }: Props) {
  const { isGuest } = useAuth();
  const ranked = useMemo(() => restaurants
    .map((restaurant) => {
      const reviewCount = restaurant.reviews.length;
      const rating = calculateAverage(restaurant.reviews.map(review => review.rating));
      return { restaurant, reviewCount, rating };
    })
    .filter(item => item.reviewCount > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 20), [restaurants]);

  if (ranked.length === 0) {
    return <p className="text-sm text-text-muted">리뷰가 등록된 맛집이 없습니다.</p>;
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto">
      {ranked.map(({ restaurant: r, rating, reviewCount }, i) => {
        const grade = badgeByScore(rating, reviewCount);
        return (
          <div key={r.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <span className="text-lg font-sans font-bold text-primary min-w-[24px]">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-text truncate">{isGuest ? '루퍼스 맛집' : r.name}</span>
                <RuschlangBadge grade={grade} />
              </div>
              <p className="text-xs text-text-muted truncate">{isGuest ? '서울 지도 탐방 후 공개 예정' : r.address}</p>
              <StarRating rating={rating} size="sm" />
              <span className="text-xs text-text-muted ml-1">({reviewCount})</span>
            </div>
          </div>
        );
      })}
    </div>
  );
});
