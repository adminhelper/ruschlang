import { useState } from 'react';
import type { PostCreateRequest } from '../../types/post';
import { StarRating } from '../common/StarRating';

interface Props {
  onSubmit: (data: PostCreateRequest) => void;
}

export function PostForm({ onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    onSubmit({
      title: title.trim(),
      content: content.trim(),
      author: '',
      authorRole: '',
      rating: rating > 0 ? rating : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-border p-4 space-y-3">
      <h3 className="text-base font-sans font-bold text-text">글쓰기</h3>

      <input
        type="text" placeholder="제목 *" value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
        required
      />

      <textarea
        placeholder="내용 *" value={content}
        onChange={e => setContent(e.target.value)}
        className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none h-32 focus:ring-2 focus:ring-primary/30 focus:outline-none"
        required
      />

      <div className="flex items-center gap-2">
        <span className="text-sm text-text-muted">평점 (선택):</span>
        <StarRating rating={rating} editable onChange={setRating} size="md" />
      </div>

      <button type="submit"
        className="w-full py-2 bg-primary text-white rounded-lg text-sm font-sans font-bold hover:bg-primary-dark transition-colors"
      >
        게시글 등록
      </button>
    </form>
  );
}
