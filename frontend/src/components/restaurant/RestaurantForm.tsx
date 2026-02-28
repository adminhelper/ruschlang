import { useState } from 'react';
import type { RestaurantCreateRequest } from '../../types/restaurant';
import { FOOD_CATEGORY_OPTIONS, REGION_OPTIONS } from '../../utils/mapFilters';

interface Props {
  onSubmit: (data: RestaurantCreateRequest) => void;
}

export function RestaurantForm({ onSubmit }: Props) {
  const [form, setForm] = useState<RestaurantCreateRequest>({
    name: '', address: '', lat: 0, lng: 0,
    category: '', region: '', phone: '', description: '', photo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.address.trim()) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-4 space-y-3">
      <h3 className="text-base font-sans font-bold text-text">맛집 등록</h3>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="text" placeholder="상호명 *" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
          required
        />
        <input
          type="text" placeholder="주소 *" value={form.address}
          onChange={e => setForm({ ...form, address: e.target.value })}
          className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <select
          value={form.category}
          onChange={e => setForm({ ...form, category: e.target.value })}
          className="px-3 py-2 border border-border rounded-lg text-sm bg-white"
        >
          <option value="">음식종류</option>
          {FOOD_CATEGORY_OPTIONS.filter(o => o !== '음식종류 전체').map(o => <option key={o}>{o}</option>)}
        </select>
        <select
          value={form.region}
          onChange={e => setForm({ ...form, region: e.target.value })}
          className="px-3 py-2 border border-border rounded-lg text-sm bg-white"
        >
          <option value="">지역</option>
          {REGION_OPTIONS.filter(o => o !== '지역 전체').map(o => <option key={o}>{o}</option>)}
        </select>
        <input
          type="tel" placeholder="전화번호" value={form.phone}
          onChange={e => setForm({ ...form, phone: e.target.value })}
          className="px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          type="number" placeholder="위도 (lat)" value={form.lat || ''}
          onChange={e => setForm({ ...form, lat: parseFloat(e.target.value) || 0 })}
          className="px-3 py-2 border border-border rounded-lg text-sm" step="any"
        />
        <input
          type="number" placeholder="경도 (lng)" value={form.lng || ''}
          onChange={e => setForm({ ...form, lng: parseFloat(e.target.value) || 0 })}
          className="px-3 py-2 border border-border rounded-lg text-sm" step="any"
        />
      </div>

      <textarea
        placeholder="설명" value={form.description}
        onChange={e => setForm({ ...form, description: e.target.value })}
        className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none h-20 focus:ring-2 focus:ring-primary/30 focus:outline-none"
      />

      <button
        type="submit"
        className="w-full py-2 bg-primary text-white rounded-lg text-sm font-sans font-bold hover:bg-primary-dark transition-colors"
      >
        맛집 등록
      </button>
    </form>
  );
}
