import { useCallback, useEffect, useMemo, useState } from 'react';
import { getRestaurants, createRestaurant, deleteRestaurant, createReview } from '../api/restaurants';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { RestaurantForm } from '../components/restaurant/RestaurantForm';
import type { Restaurant, RestaurantCreateRequest, ReviewCreateRequest } from '../types/restaurant';
import { badgeByScore, calculateAverage } from '../utils/rating';
import { Button } from '../components/common/Button';
import { CardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
type SortOption = 'latest' | 'rating' | 'name';
type BadgeFilter = 'all' | '5star' | '4star' | '3star' | 'newbie';

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
                  : 'bg-white text-text-muted border-border hover:text-text'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as SortOption)}
          className="px-3 py-2 border border-border rounded-lg text-sm bg-white"
        >
          <option value="latest">최신순</option>
          <option value="rating">평점순</option>
          <option value="name">이름순</option>
        </select>
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleRestaurants.map(r => (
            <RestaurantCard
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
