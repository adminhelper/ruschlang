import { memo } from 'react';
import type { Restaurant } from '../../types/restaurant';
import { RuschlangBadge } from '../common/RuschlangBadge';
import { badgeByScore, calculateAverage } from '../../utils/rating';

interface Props {
  restaurant: Restaurant;
}

export const RestaurantGalleryCard = memo(function RestaurantGalleryCard({ restaurant: r }: Props) {
  const ratings = r.reviews.map(review => review.rating);
  const averageRating = calculateAverage(ratings);
  const reviewCount = r.reviews.length;
  const grade = badgeByScore(averageRating, reviewCount);
  const displayName = r.name;
  const displayAddress = r.address;

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 cursor-pointer group">
      {/* 사진 영역 — 크게 */}
      <div className="relative w-full h-48 bg-gray-100 overflow-hidden">
        {r.photoUrl ? (
          <img
            src={r.photoUrl}
            alt={r.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl text-text-muted">🍽️</div>
        )}
        {/* 배지 오버레이 */}
        <div className="absolute top-2 right-2">
          <RuschlangBadge grade={grade} />
        </div>
      </div>

      {/* 정보 영역 — 간결 */}
      <div className="p-3">
        <h3 className="text-sm font-sans font-bold text-text truncate">{displayName}</h3>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-text-muted truncate flex-1">{displayAddress}</p>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <span className="text-star text-xs">★</span>
            <span className="text-xs font-bold text-text">{averageRating > 0 ? averageRating.toFixed(1) : '-'}</span>
            <span className="text-xs text-text-muted">({reviewCount})</span>
          </div>
        </div>
      </div>
    </div>
  );
});
