import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginModal } from '../common/LoginModal';

export function Header() {
  const { role, nickname, isGuest, logout } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  return (
    <>
      <header className="bg-gradient-to-r from-primary-light via-primary to-primary-dark text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs opacity-80 tracking-wider">LooSchlang Club</p>
            <h1 className="text-2xl font-sans font-bold">루슐랭</h1>
            <p className="text-xs opacity-80 mt-0.5">서울 맛집 탐방 지도 + 리뷰 기록</p>
          </div>

          <div className="flex items-center gap-3">
            {isGuest ? (
              <button
                onClick={() => setShowLogin(true)}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-sans transition-colors"
              >
                로그인
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-sm">
                  <span className="opacity-70">{role === 'admin' ? '👑' : '👤'}</span>
                  {' '}{nickname}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-sans transition-colors"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}
