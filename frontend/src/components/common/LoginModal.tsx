import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { Button } from './Button';
import { Input } from './Input';

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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-sans font-bold text-text mb-1">로그인</h2>
        <p className="text-sm text-text-muted mb-6">관리자 또는 회원으로 로그인하세요.</p>

        {/* 관리자 */}
        <div className="mb-5">
          <h3 className="text-sm font-sans font-bold text-text mb-2">👑 관리자</h3>
          <div className="mb-2">
            <Input
              type="password"
              placeholder="관리자 토큰 입력"
              value={adminToken}
              onChange={e => setAdminToken(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdminLogin()}
            />
          </div>
          <Button
            variant="primary"
            fullWidth
            loading={loading}
            disabled={!adminToken.trim()}
            onClick={handleAdminLogin}
          >
            관리자 로그인
          </Button>
        </div>

        <hr className="border-border my-4" />

        {/* 회원 */}
        <div className="mb-4">
          <h3 className="text-sm font-sans font-bold text-text mb-2">👤 회원</h3>
          <div className="mb-2">
            <Input
              type="text"
              placeholder="닉네임 입력"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleMemberLogin()}
              maxLength={20}
            />
          </div>
          <Button
            variant="primary"
            fullWidth
            disabled={!nickname.trim()}
            onClick={handleMemberLogin}
          >
            회원 로그인
          </Button>
        </div>

        <Button variant="ghost" fullWidth onClick={onClose}>
          닫기
        </Button>
      </div>
    </div>
  );
}
