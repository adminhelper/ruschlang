import { memo, useEffect, useState } from 'react';
import type { Post, CommentCreateRequest } from '../../types/post';
import { StarRating } from '../common/StarRating';
import { CommentSection } from './CommentSection';
import { formatRelativeDate } from '../../utils/date';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  post: Post;
  onDelete?: (id: string) => void;
  onApprove?: (id: string, status: 'approved' | 'rejected' | 'pending') => void;
  onUpdate?: (id: string, data: { title: string; content: string }) => void;
  onComment?: (postId: string, data: CommentCreateRequest) => void;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  approved: { label: '승인됨', color: 'bg-status-approved text-white' },
  pending: { label: '대기 중', color: 'bg-status-pending text-white' },
  rejected: { label: '거절됨', color: 'bg-status-rejected text-white' },
};

export const PostCard = memo(function PostCard({ post: p, onDelete, onApprove, onUpdate, onComment }: Props) {
  const { isAdmin, nickname } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(p.title);
  const [editContent, setEditContent] = useState(p.content);
  const statusInfo = STATUS_LABELS[p.status] || STATUS_LABELS.pending;
  const canEdit = isAdmin || (!!nickname && nickname === p.author);

  useEffect(() => {
    setEditTitle(p.title);
    setEditContent(p.content);
    setIsEditing(false);
  }, [p.content, p.title]);

  return (
    <div className="bg-white rounded-xl border border-border p-4 shadow-sm">
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(event) => setEditTitle(event.target.value)}
                className="px-2 py-1 border border-border rounded text-sm font-sans font-bold"
              />
            ) : (
              <h3 className="text-base font-sans font-bold text-text">{p.title}</h3>
            )}
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

      {isEditing ? (
        <textarea
          value={editContent}
          onChange={(event) => setEditContent(event.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none h-28 mb-3"
        />
      ) : (
        <p className="text-sm text-text mb-3 whitespace-pre-wrap">{p.content}</p>
      )}

      {p.placeName && (
        <p className="text-xs text-text-muted mb-2">📍 {p.placeName}</p>
      )}

      {/* 액션 */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        {canEdit && !isEditing && onUpdate && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-sans"
          >
            수정
          </button>
        )}

        {canEdit && isEditing && onUpdate && (
          <>
            <button
              type="button"
              onClick={() => {
                if (!editTitle.trim() || !editContent.trim()) return;
                onUpdate(p.id, { title: editTitle.trim(), content: editContent.trim() });
                setIsEditing(false);
              }}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-sans"
            >
              저장
            </button>
            <button
              type="button"
              onClick={() => {
                setEditTitle(p.title);
                setEditContent(p.content);
                setIsEditing(false);
              }}
              className="text-xs text-text-muted hover:text-text font-sans"
            >
              취소
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setShowComments(!showComments)}
          className="text-xs text-primary hover:text-primary-dark font-sans"
        >
          💬 댓글 ({p.comments?.length || 0})
        </button>

        {onApprove && p.status === 'pending' && (
          <>
            <button type="button" onClick={() => onApprove(p.id, 'approved')} className="text-xs text-emerald-600 hover:text-emerald-700 font-sans">
              ✅ 승인
            </button>
            <button type="button" onClick={() => onApprove(p.id, 'rejected')} className="text-xs text-red-500 hover:text-red-600 font-sans">
              ❌ 거절
            </button>
          </>
        )}

        {onApprove && p.status === 'approved' && (
          <button type="button" onClick={() => onApprove(p.id, 'pending')} className="text-xs text-amber-600 hover:text-amber-700 font-sans">
            승인 취소
          </button>
        )}

        {onDelete && (
          <button type="button" onClick={() => onDelete(p.id)} className="text-xs text-red-500 hover:text-red-600 font-sans ml-auto">
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
});
