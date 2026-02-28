import { REGION_OPTIONS, FOOD_CATEGORY_OPTIONS, GRADE_FILTER_OPTIONS } from '../../utils/mapFilters';

interface Filters {
  region: string;
  food: string;
  grade: string;
}

interface Props {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

export function MapFilters({ filters, onChange }: Props) {
  const reset = () => onChange({ region: '지역 전체', food: '음식종류 전체', grade: '평점 전체' });

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <select
        value={filters.region}
        onChange={e => onChange({ ...filters, region: e.target.value })}
        className="px-3 py-1.5 border border-border rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/30 focus:outline-none"
      >
        {REGION_OPTIONS.map(o => <option key={o}>{o}</option>)}
      </select>

      <select
        value={filters.food}
        onChange={e => onChange({ ...filters, food: e.target.value })}
        className="px-3 py-1.5 border border-border rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/30 focus:outline-none"
      >
        {FOOD_CATEGORY_OPTIONS.map(o => <option key={o}>{o}</option>)}
      </select>

      <select
        value={filters.grade}
        onChange={e => onChange({ ...filters, grade: e.target.value })}
        className="px-3 py-1.5 border border-border rounded-lg text-sm bg-white focus:ring-2 focus:ring-primary/30 focus:outline-none"
      >
        {GRADE_FILTER_OPTIONS.map(o => <option key={o}>{o}</option>)}
      </select>

      <button
        onClick={reset}
        className="px-3 py-1.5 text-xs text-text-muted hover:text-text border border-border rounded-lg hover:bg-gray-50 transition-colors"
      >
        초기화
      </button>
    </div>
  );
}
