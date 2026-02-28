import { useState, useEffect } from 'react';
import { getRestaurants, createRestaurant, deleteRestaurant, createReview } from '../api/restaurants';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { RestaurantCard } from '../components/restaurant/RestaurantCard';
import { RestaurantForm } from '../components/restaurant/RestaurantForm';
import type { Restaurant, RestaurantCreateRequest, ReviewCreateRequest } from '../types/restaurant';

export function ExplorePage() {
  const { isAdmin } = useAuth();
  const { showToast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await getRestaurants();
      setRestaurants(data);
    } catch (err) {
      console.error('맛집 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

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
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-sans font-bold hover:bg-primary-dark transition-colors"
          >
            {showForm ? '취소' : '+ 맛집 등록'}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-6">
          <RestaurantForm onSubmit={handleCreate} />
        </div>
      )}

      {loading ? (
        <p className="text-center text-text-muted py-8">로딩 중...</p>
      ) : restaurants.length === 0 ? (
        <p className="text-center text-text-muted py-8">등록된 맛집이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {restaurants.map(r => (
            <RestaurantCard
              key={r.id}
              restaurant={r}
              onDelete={isAdmin ? handleDelete : undefined}
              onReview={handleReview}
            />
          ))}
        </div>
      )}
    </div>
  );
}
