import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { LoginModal } from '../common/LoginModal';
import { Button } from '../common/Button';
export function Header() {
  const { role, nickname, isGuest, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <header className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted tracking-wider">LooSchlang Club</p>
            <h1 className="text-xl font-sans font-bold text-primary">루슐랭</h1>
            <p className="text-xs text-text-muted mt-0.5">서울 맛집 탐방 지도 + 리뷰 기록</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-surface-dark transition-colors text-lg"
              aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            {isGuest ? (
              <Button variant="primary" size="sm" onClick={() => setShowLogin(true)}>
                로그인
              </Button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm text-text">
                  <span className="opacity-70">{role === 'admin' ? '👑' : '👤'}</span>
                  {' '}{nickname}
                </span>
                <Button variant="ghost" size="sm" onClick={logout}>
                  로그아웃
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
