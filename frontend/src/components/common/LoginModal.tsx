import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface Props {
  onClose: () => void;
}

export function LoginModal({ onClose }: Props) {
  const { loginAdmin, loginMember } = useAuth();
  const { showToast } = useToast();
  const [adminToken, setAdminToken] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async () => {
    if (!adminToken.trim()) return;
    setLoading(true);
    const ok = await loginAdmin(adminToken.trim());
    setLoading(false);
    if (ok) {
      showToast('관리자로 로그인되었습니다', 'success');
      onClose();
    } else {
      showToast('관리자 토큰이 올바르지 않습니다', 'error');
    }
  };

  const handleMemberLogin = () => {
    if (!nickname.trim()) return;
    loginMember(nickname.trim());
    showToast(`${nickname.trim()}님 환영합니다!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-sans font-bold text-text mb-1">로그인</h2>
        <p className="text-sm text-text-muted mb-6">관리자 또는 회원으로 로그인하세요.</p>

        {/* 관리자 */}
        <div className="mb-5">
          <h3 className="text-sm font-sans font-bold text-text mb-2">👑 관리자</h3>
          <input
            type="password"
            placeholder="관리자 토큰 입력"
            value={adminToken}
            onChange={e => setAdminToken(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-2"
          />
          <button
            onClick={handleAdminLogin}
            disabled={loading || !adminToken.trim()}
            className="w-full py-2 bg-primary text-white rounded-lg text-sm font-sans font-bold hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {loading ? '확인 중...' : '관리자 로그인'}
          </button>
        </div>

        <hr className="border-border my-4" />

        {/* 회원 */}
        <div className="mb-4">
          <h3 className="text-sm font-sans font-bold text-text mb-2">👤 회원</h3>
          <input
            type="text"
            placeholder="닉네임 입력"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleMemberLogin()}
            maxLength={20}
            className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-2"
          />
          <button
            onClick={handleMemberLogin}
            disabled={!nickname.trim()}
            className="w-full py-2 bg-emerald-500 text-white rounded-lg text-sm font-sans font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            회원 로그인
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 text-text-muted text-sm hover:text-text transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  );
}
