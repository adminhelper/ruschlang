type RouteMode = 'foot' | 'car';

interface Props {
  roadmapTitle: string;
  mode: RouteMode;
  onModeChange: (mode: RouteMode) => void;
  distanceLabel: string;
  durationLabel: string;
  naverUrl: string;
  onClose: () => void;
}

export function RoutePanel({
  roadmapTitle,
  mode,
  onModeChange,
  distanceLabel,
  durationLabel,
  naverUrl,
  onClose,
}: Props) {
  return (
    <div className="mt-3 bg-white rounded-xl border border-border p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-text-muted">로드맵 경로</p>
          <h3 className="text-sm font-sans font-bold text-text">{roadmapTitle}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-text-muted hover:text-text"
        >
          닫기
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-gray-50 px-3 py-2">
          <p className="text-xs text-text-muted">총 거리</p>
          <p className="font-bold text-text">{distanceLabel}</p>
        </div>
        <div className="rounded-lg bg-gray-50 px-3 py-2">
          <p className="text-xs text-text-muted">총 시간</p>
          <p className="font-bold text-text">{durationLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onModeChange('foot')}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-colors ${mode === 'foot' ? 'bg-primary text-white' : 'bg-gray-100 text-text hover:bg-gray-200'}`}
        >
          도보
        </button>
        <button
          type="button"
          onClick={() => onModeChange('car')}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold transition-colors ${mode === 'car' ? 'bg-primary text-white' : 'bg-gray-100 text-text hover:bg-gray-200'}`}
        >
          차량
        </button>

        {naverUrl && (
          <a
            href={naverUrl}
            target="_blank"
            rel="noreferrer"
            className="ml-auto text-xs text-primary hover:text-primary-dark font-sans font-bold"
          >
            네이버 길찾기
          </a>
        )}
      </div>
    </div>
  );
}
