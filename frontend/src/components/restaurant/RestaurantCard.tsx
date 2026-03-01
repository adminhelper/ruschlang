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

export const RestaurantCard = memo(function RestaurantCard({ restaurant: r, onDelete, onReview }: Props) {
  const { isGuest } = useAuth();
  const [showReviews, setShowReviews] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const ratings = r.reviews.map(review => review.rating);
  const averageRating = calculateAverage(ratings);
  const reviewCount = r.reviews.length;
  const grade = badgeByScore(averageRating, reviewCount);
  const displayName = isGuest ? '루퍼스 맛집' : r.name;
  const displayAddress = isGuest ? '서울 지도 탐방 후 공개 예정' : r.address;
  const displayDescription = isGuest
    ? '관리자 승인 후 상세 내용이 공개됩니다'
    : r.description;

  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {isGuest ? (
        <div className="w-full h-40 bg-gray-200 flex items-center justify-center text-4xl">🍽️</div>
      ) : (
        r.photoUrl && <img src={r.photoUrl} alt={r.name} className="w-full h-40 object-cover" />
      )}
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-base font-sans font-bold text-text">{displayName}</h3>
            <p className="text-xs text-text-muted">{displayAddress}</p>
          </div>
          <RuschlangBadge grade={grade} />
        </div>

        <div className="flex items-center gap-2 mb-2">
          <StarRating rating={averageRating} size="sm" />
          <span className="text-xs text-text-muted">({reviewCount}개 리뷰)</span>
        </div>

        {displayDescription && (
          <p className="text-sm text-text-muted mb-3 line-clamp-2">{displayDescription}</p>
        )}

        {/* 액션 버튼 */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={() => setShowReviews(!showReviews)}
            className="text-xs text-primary hover:text-primary-dark font-sans"
          >
            리뷰 {showReviews ? '접기' : '보기'} ({r.reviews?.length || 0})
          </button>
          {!isGuest && onReview && (
            <button
              type="button"
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-sans"
            >
              리뷰 작성
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

        {/* 리뷰 목록 */}
        {showReviews && r.reviews?.length > 0 && (
          <div className="mt-3 space-y-2">
            {r.reviews.map(review => (
              <div key={review.id} className="p-2 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-text">{review.name}</span>
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
        )}

        {/* 리뷰 작성 폼 */}
        {showReviewForm && onReview && (
          <div className="mt-3">
            <ReviewForm
              onSubmit={(data) => {
                onReview(r.id, data);
                setShowReviewForm(false);
              }}
              onCancel={() => setShowReviewForm(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
});
