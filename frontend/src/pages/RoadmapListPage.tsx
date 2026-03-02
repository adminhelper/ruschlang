import { useState, useEffect } from 'react';
import { getRoadmaps, createRoadmap, updateRoadmap, deleteRoadmap, rateRoadmap } from '../api/roadmaps';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { RoadmapCard } from '../components/roadmap/RoadmapCard';
import { RoadmapForm } from '../components/roadmap/RoadmapForm';
import type { Roadmap, RoadmapCreateRequest, RoadmapRateRequest } from '../types/roadmap';

export function RoadmapListPage() {
  const { isAdmin, isMember, nickname } = useAuth();
  const { showToast } = useToast();
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [openMapId, setOpenMapId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await getRoadmaps();
      setRoadmaps(data);
    } catch (err) {
      console.error('로드맵 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (data: RoadmapCreateRequest) => {
    try {
      await createRoadmap({ ...data, author: nickname || '익명' });
      showToast('로드맵이 생성되었습니다', 'success');
      setShowForm(false);
      loadData();
    } catch (err) {
      showToast('로드맵 생성에 실패했습니다', 'error');
    }
  };

  const handleUpdate = async (data: RoadmapCreateRequest) => {
    if (!editTarget) return;
    try {
      await updateRoadmap(editTarget.id, data);
      showToast('로드맵이 수정되었습니다', 'success');
      setEditTarget(null);
      loadData();
    } catch (err) {
      showToast('로드맵 수정에 실패했습니다', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await deleteRoadmap(id);
      showToast('로드맵이 삭제되었습니다', 'success');
      loadData();
    } catch (err) {
      showToast('삭제에 실패했습니다', 'error');
    }
  };

  const handleRate = async (id: string, data: RoadmapRateRequest) => {
    try {
      await rateRoadmap(id, data);
      showToast('평점이 반영되었습니다', 'success');
      loadData();
    } catch (err) {
      showToast('평점 등록에 실패했습니다', 'error');
    }
  };

  const canCreate = isAdmin || isMember;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-sans font-bold text-text">맛집 로드맵</h2>
        {canCreate && (
          <button
            onClick={() => { setShowForm(!showForm); setEditTarget(null); }}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-sans font-bold hover:bg-primary-dark transition-colors"
          >
            {showForm ? '취소' : '+ 로드맵 생성'}
          </button>
        )}
      </div>

      {(showForm || editTarget) && (
        <div className="mb-6">
          <RoadmapForm
            initialData={editTarget || undefined}
            onSubmit={editTarget ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditTarget(null); }}
          />
        </div>
      )}

      {loading ? (
        <p className="text-center text-text-muted py-8">로딩 중...</p>
      ) : roadmaps.length === 0 ? (
        <p className="text-center text-text-muted py-8">등록된 로드맵이 없습니다.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {roadmaps.map(r => (
            <RoadmapCard
              key={r.id}
              roadmap={r}
              isMapOpen={openMapId === r.id}
              onToggleMap={() => setOpenMapId(prev => prev === r.id ? null : r.id)}
              onEdit={isAdmin ? () => setEditTarget(r) : undefined}
              onDelete={isAdmin ? handleDelete : undefined}
              onRate={canCreate ? handleRate : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
