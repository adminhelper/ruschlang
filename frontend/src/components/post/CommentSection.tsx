import { useState } from 'react';
import type { PostComment, CommentCreateRequest } from '../../types/post';
import { buildCommentTree } from '../../utils/comments';
import { CommentItem } from './CommentItem';

interface Props {
  comments: PostComment[];
  onComment?: (data: CommentCreateRequest) => void;
}

export function CommentSection({ comments, onComment }: Props) {
  const [content, setContent] = useState('');
  const tree = buildCommentTree(comments);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !onComment) return;
    onComment({ author: '', content: content.trim() });
    setContent('');
  };

  return (
    <div className="space-y-2">
      {tree.length > 0 ? (
        tree.map(node => (
          <CommentItem key={node.id} comment={node} depth={0} onReply={onComment} />
        ))
      ) : (
        <p className="text-xs text-text-muted">댓글이 없습니다.</p>
      )}

      {onComment && (
        <form onSubmit={handleSubmit} className="flex gap-2 mt-2">
          <input
            type="text" placeholder="댓글 입력..."
            value={content} onChange={e => setContent(e.target.value)}
            className="flex-1 px-3 py-1.5 border border-border rounded-lg text-xs focus:ring-2 focus:ring-primary/30 focus:outline-none"
          />
          <button type="submit" disabled={!content.trim()}
            className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-sans disabled:opacity-50"
          >
            등록
          </button>
        </form>
      )}
    </div>
  );
}
