import { useLocation, useNavigate } from 'react-router-dom';

const TABS = [
  { path: '/', label: '탐방 지도', icon: '🗺️' },
  { path: '/explore', label: '맛집 탐색', icon: '🍽️' },
  { path: '/roadmaps', label: '맛집 로드맵', icon: '📍' },
  { path: '/posts', label: '탐방 게시판', icon: '📝' },
] as const;

export function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-1">
          {TABS.map(tab => {
            const isActive = location.pathname === tab.path;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-sans border-b-2 transition-colors ${
                  isActive
                    ? 'border-primary text-primary font-bold'
                    : 'border-transparent text-text-muted hover:text-text hover:border-border'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
