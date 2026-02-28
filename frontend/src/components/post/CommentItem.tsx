import { useState } from 'react';
import type { CommentNode, CommentCreateRequest } from '../../types/post';
import { formatRelativeDate } from '../../utils/date';

interface Props {
  comment: CommentNode;
  depth: number;
  onReply?: (data: CommentCreateRequest) => void;
}

export function CommentItem({ comment, depth, onReply }: Props) {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !onReply) return;
    onReply({ author: '', content: replyContent.trim(), parentCommentId: comment.id });
    setReplyContent('');
    setShowReply(false);
  };

  return (
    <div style={{ marginLeft: depth * 20 }}>
      <div className="p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold text-text">{comment.author}</span>
          <span className="text-xs text-text-muted">{formatRelativeDate(comment.createdAt)}</span>
        </div>
        <p className="text-xs text-text">{comment.content}</p>
        {onReply && (
          <button
            onClick={() => setShowReply(!showReply)}
            className="text-xs text-primary hover:text-primary-dark mt-1"
          >
            답글
          </button>
        )}

        {showReply && (
          <form onSubmit={handleReply} className="flex gap-1 mt-1">
            <input
              type="text" placeholder="답글..." value={replyContent}
              onChange={e => setReplyContent(e.target.value)}
              className="flex-1 px-2 py-1 border border-border rounded text-xs"
            />
            <button type="submit" className="px-2 py-1 bg-primary text-white rounded text-xs">등록</button>
          </form>
        )}
      </div>

      {comment.children.map(child => (
        <CommentItem key={child.id} comment={child} depth={depth + 1} onReply={onReply} />
      ))}
    </div>
  );
}
