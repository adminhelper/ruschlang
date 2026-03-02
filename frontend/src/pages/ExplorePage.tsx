import { useCallback, useEffect, useMemo, useState } from 'react';
import { getRestaurants, createRestaurant, deleteRestaurant, createReview } from '../api/restaurants';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { RestaurantGalleryCard } from '../components/restaurant/RestaurantGalleryCard';
import { RestaurantListItem } from '../components/restaurant/RestaurantListItem';
import { RestaurantForm } from '../components/restaurant/RestaurantForm';
import type { Restaurant, RestaurantCreateRequest, ReviewCreateRequest } from '../types/restaurant';
import { badgeByScore, calculateAverage } from '../utils/rating';
import { Button } from '../components/common/Button';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
type SortOption = 'latest' | 'rating' | 'name';
type BadgeFilter = 'all' | '5star' | '4star' | '3star' | 'newbie';
type ViewMode = 'gallery' | 'list';

const BADGE_FILTERS: Array<{ value: BadgeFilter; label: string }> = [
  { value: 'all', label: '전체' },
  { value: '5star', label: '5스타' },
  { value: '4star', label: '4스타' },
  { value: '3star', label: '3스타' },
  { value: 'newbie', label: '뉴비' },
];

export function ExplorePage() {
  const { isAdmin, isGuest } = useAuth();
  const { showToast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [badgeFilter, setBadgeFilter] = useState<BadgeFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('gallery');

  const loadData = useCallback(async () => {
    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (err) {
      console.error('맛집 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const visibleRestaurants = useMemo(() => {
    const withRating = restaurants.map((restaurant) => {
      const averageRating = calculateAverage(restaurant.reviews.map(review => review.rating));
      const grade = badgeByScore(averageRating, restaurant.reviews.length);
      return { restaurant, averageRating, grade };
    });

    const filtered = badgeFilter === 'all'
      ? withRating
      : withRating.filter(item => item.grade === badgeFilter);

    return filtered
      .sort((a, b) => {
        if (sortBy === 'rating') {
          if (b.averageRating !== a.averageRating) return b.averageRating - a.averageRating;
          return new Date(b.restaurant.createdAt).getTime() - new Date(a.restaurant.createdAt).getTime();
        }

        if (sortBy === 'name') {
          return a.restaurant.name.localeCompare(b.restaurant.name, 'ko');
        }

        return new Date(b.restaurant.createdAt).getTime() - new Date(a.restaurant.createdAt).getTime();
      })
      .map(item => item.restaurant);
  }, [badgeFilter, restaurants, sortBy]);

  const handleCreate = async (data: RestaurantCreateRequest) => {
    try {
      await createRestaurant(data);
      showToast('맛집이 등록되었습니다', 'success');
      setShowForm(false);
      loadData();
    } catch (err) {
      showToast('맛집 등록에 실패했습니다', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteRestaurant(id);
      showToast('맛집이 삭제되었습니다', 'success');
      loadData();
    } catch (err) {
      showToast('삭제에 실패했습니다', 'error');
    }
  };

  const handleReview = async (restaurantId: string, data: ReviewCreateRequest) => {
    try {
      await createReview(restaurantId, data);
      showToast('리뷰가 등록되었습니다', 'success');
      loadData();
    } catch (err) {
      showToast('리뷰 등록에 실패했습니다', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-sans font-bold text-text">맛집 탐색</h2>
        {isAdmin && (
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '취소' : '+ 맛집 등록'}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {BADGE_FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setBadgeFilter(item.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-sans font-bold border transition-colors ${
                badgeFilter === item.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-surface text-text-muted border-border hover:text-text'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2 border border-border rounded-lg text-sm bg-surface text-text"
          >
            <option value="latest">최신순</option>
            <option value="rating">평점순</option>
            <option value="name">이름순</option>
          </select>

          {/* 뷰 모드 토글 */}
          <div className="flex bg-surface-dark border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setViewMode('gallery')}
              className={`px-2.5 py-2 text-sm transition-colors ${
                viewMode === 'gallery'
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text'
              }`}
              aria-label="갤러리 보기"
              title="갤러리 보기"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="1" y="1" width="6" height="6" rx="1" />
                <rect x="9" y="1" width="6" height="6" rx="1" />
                <rect x="1" y="9" width="6" height="6" rx="1" />
                <rect x="9" y="9" width="6" height="6" rx="1" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-2 text-sm transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'text-text-muted hover:text-text'
              }`}
              aria-label="리스트 보기"
              title="리스트 보기"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <rect x="1" y="1" width="14" height="3" rx="1" />
                <rect x="1" y="6" width="14" height="3" rx="1" />
                <rect x="1" y="11" width="14" height="3" rx="1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="mb-6">
          <RestaurantForm onSubmit={handleCreate} />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : visibleRestaurants.length === 0 ? (
        <EmptyState icon="🍽️" title="등록된 맛집이 없습니다" description="첫 맛집을 등록해보세요!" />
      ) : viewMode === 'gallery' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {visibleRestaurants.map(r => (
            <RestaurantGalleryCard key={r.id} restaurant={r} />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {visibleRestaurants.map(r => (
            <RestaurantListItem
              key={r.id}
              restaurant={r}
              onDelete={isAdmin ? handleDelete : undefined}
              onReview={isGuest ? undefined : handleReview}
            />
          ))}
        </div>
      )}
    </div>
  );
}
