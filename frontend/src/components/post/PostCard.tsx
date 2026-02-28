import { useState } from 'react';
import type { Post, CommentCreateRequest } from '../../types/post';
import { StarRating } from '../common/StarRating';
import { CommentSection } from './CommentSection';
import { formatRelativeDate } from '../../utils/date';

interface Props {
  post: Post;
  onDelete?: (id: string) => void;
  onApprove?: (id: string, status: 'approved' | 'rejected') => void;
  onComment?: (postId: string, data: CommentCreateRequest) => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  approved: { label: '승인됨', color: 'bg-status-approved text-white' },
  pending: { label: '대기 중', color: 'bg-status-pending text-white' },
  rejected: { label: '거절됨', color: 'bg-status-rejected text-white' },
};

export function PostCard({ post: p, onDelete, onApprove, onComment }: Props) {
  const [showComments, setShowComments] = useState(false);
  const statusInfo = STATUS_LABELS[p.status] || STATUS_LABELS.pending;

  return (
    <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-sans font-bold text-text">{p.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.color}`}>{statusInfo.label}</span>
          </div>
          <p className="text-xs text-text-muted">
            {p.author} ({p.authorRole}) · {formatRelativeDate(p.createdAt)}
          </p>
        </div>
        {p.rating !== null && p.rating > 0 && (
          <StarRating rating={p.rating} size="sm" />
        )}
      </div>

      <p className="text-sm text-text mb-3 whitespace-pre-wrap">{p.content}</p>

      {p.locationName && (
        <p className="text-xs text-text-muted mb-2">📍 {p.locationName}</p>
      )}

      {p.photo && (
        <img src={p.photo} alt="" className="w-full max-h-48 object-cover rounded-lg mb-3" />
      )}

      {/* 액션 */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <button
          onClick={() => setShowComments(!showComments)}
          className="text-xs text-primary hover:text-primary-dark font-sans"
        >
          💬 댓글 ({p.comments?.length || 0})
        </button>

        {onApprove && p.status === 'pending' && (
          <>
            <button onClick={() => onApprove(p.id, 'approved')} className="text-xs text-emerald-600 hover:text-emerald-700 font-sans">
              ✅ 승인
            </button>
            <button onClick={() => onApprove(p.id, 'rejected')} className="text-xs text-red-500 hover:text-red-600 font-sans">
              ❌ 거절
            </button>
          </>
        )}

        {onDelete && (
          <button onClick={() => onDelete(p.id)} className="text-xs text-red-500 hover:text-red-600 font-sans ml-auto">
            삭제
          </button>
        )}
      </div>

      {showComments && (
        <div className="mt-3">
          <CommentSection
            comments={p.comments || []}
            onComment={onComment ? (data) => onComment(p.id, data) : undefined}
          />
        </div>
      )}
    </div>
  );
}
