import { memo, useState } from 'react';
import type { Restaurant, ReviewCreateRequest } from '../../types/restaurant';
import { StarRating } from '../common/StarRating';
import { RuschlangBadge } from '../common/RuschlangBadge';
import { ReviewForm } from './ReviewForm';
import { badgeByScore, calculateAverage } from '../../utils/rating';
import { formatRelativeDate } from '../../utils/date';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  restaurant: Restaurant;
  onDelete?: (id: string) => void;
  onReview?: (restaurantId: string, data: ReviewCreateRequest) => void;
}

export const RestaurantListItem = memo(function RestaurantListItem({ restaurant: r, onDelete, onReview }: Props) {
  const { isGuest } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const ratings = r.reviews.map(review => review.rating);
  const averageRating = calculateAverage(ratings);
  const reviewCount = r.reviews.length;
  const grade = badgeByScore(averageRating, reviewCount);
  const displayName = r.name;
  const displayAddress = r.address;
  const displayDescription = r.description;

  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* 메인 영역: 클릭 시 리뷰 펼치기 */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left flex gap-4 p-3"
      >
        {/* 큰 썸네일 */}
        <div className="w-[120px] h-[120px] shrink-0 rounded-lg overflow-hidden bg-gray-100">
          {r.photoUrl ? (
            <img src={r.photoUrl} alt={r.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-text-muted">🍽️</div>
          )}
        </div>

        {/* 상세 정보 */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-sans font-bold text-text truncate">{displayName}</h3>
              <RuschlangBadge grade={grade} />
            </div>
            <p className="text-xs text-text-muted truncate">{displayAddress}</p>
            {displayDescription && (
              <p className="text-xs text-text-muted mt-1 line-clamp-2">{displayDescription}</p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <StarRating rating={averageRating} size="sm" />
            <span className="text-xs text-text-muted">({reviewCount}개 리뷰)</span>
            {/* 펼치기 화살표 */}
            <span className={`ml-auto text-text-muted text-xs transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </div>
        </div>
      </button>

      {/* 아코디언: 리뷰 + 액션 */}
      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-3 animate-[slideDown_0.2s_ease-out]">
          {/* 액션 버튼 */}
          <div className="flex gap-2">
            {!isGuest && onReview && (
              <button
                type="button"
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="text-xs text-primary hover:text-primary-dark font-sans font-bold"
              >
                {showReviewForm ? '작성 취소' : '+ 리뷰 작성'}
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(r.id)}
                className="text-xs text-red-500 hover:text-red-600 font-sans ml-auto"
              >
                삭제
              </button>
            )}
          </div>

          {/* 리뷰 작성 폼 */}
          {showReviewForm && onReview && (
            <ReviewForm
              onSubmit={(data) => {
                onReview(r.id, data);
                setShowReviewForm(false);
              }}
              onCancel={() => setShowReviewForm(false)}
            />
          )}

          {/* 리뷰 목록 */}
          {r.reviews.length > 0 ? (
            <div className="space-y-2">
              {r.reviews.map(review => (
                <div key={review.id} className="p-2.5 bg-surface-dark rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-text">{review.generation ? `${review.generation}기 ` : ''}{review.name}</span>
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs text-text-muted ml-auto">{formatRelativeDate(review.createdAt)}</span>
                  </div>
                  {review.note && <p className="text-xs text-text-muted">{review.note}</p>}
                  {review.photoUrl && (
                    <img src={review.photoUrl} alt="리뷰 사진" className="mt-1 w-full max-h-32 object-cover rounded" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-text-muted text-center py-2">아직 리뷰가 없습니다</p>
          )}
        </div>
      )}
    </div>
  );
});
