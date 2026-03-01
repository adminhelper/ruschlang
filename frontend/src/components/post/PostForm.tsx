import { useState, type FormEvent } from 'react';
import type { PostCreateRequest } from '../../types/post';
import type { Stop } from '../../types/roadmap';
import { StarRating } from '../common/StarRating';
import { StopSearchModal } from '../roadmap/StopSearchModal';

interface Props {
  onSubmit: (data: PostCreateRequest) => void;
}

export function PostForm({ onSubmit }: Props) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(0);
  const [selectedPlace, setSelectedPlace] = useState<Stop | null>(null);
  const [showPlaceSearch, setShowPlaceSearch] = useState(false);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    onSubmit({
      title: title.trim(),
      content: content.trim(),
      author: '',
      placeName: selectedPlace?.name || '',
      address: selectedPlace?.address || '',
      lat: selectedPlace?.lat ?? 0,
      lng: selectedPlace?.lng ?? 0,
      rating: rating > 0 ? rating : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-border p-4 space-y-3">
      <h3 className="text-base font-sans font-bold text-text">글쓰기</h3>

      <input
        type="text"
        placeholder="제목 *"
        value={title}
        onChange={e => setTitle(e.target.value)}
        className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/30 focus:outline-none"
        required
      />

      <textarea
        placeholder="내용 *"
        value={content}
        onChange={e => setContent(e.target.value)}
        className="w-full px-3 py-2 border border-border rounded-lg text-sm resize-none h-32 focus:ring-2 focus:ring-primary/30 focus:outline-none"
        required
      />

      <div className="flex items-center gap-2">
        <span className="text-sm text-text-muted">평점 (선택):</span>
        <StarRating rating={rating} editable onChange={setRating} size="md" />
      </div>

      <div className="rounded-lg border border-border p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-sans font-bold text-text">장소</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPlaceSearch(true)}
              className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-sans font-bold hover:bg-primary-dark transition-colors"
            >
              장소 선택
            </button>
            {selectedPlace && (
              <button
                type="button"
                onClick={() => setSelectedPlace(null)}
                className="px-3 py-1.5 bg-gray-100 text-text rounded-lg text-xs font-sans font-bold hover:bg-gray-200 transition-colors"
              >
                장소 초기화
              </button>
            )}
          </div>
        </div>

        {selectedPlace ? (
          <div className="rounded-lg bg-primary/5 px-3 py-2">
            <p className="text-sm font-bold text-text">{selectedPlace.name}</p>
            <p className="text-xs text-text-muted">{selectedPlace.address}</p>
          </div>
        ) : (
          <p className="text-xs text-text-muted">선택된 장소가 없습니다.</p>
        )}
      </div>

      <button
        type="submit"
        className="w-full py-2 bg-primary text-white rounded-lg text-sm font-sans font-bold hover:bg-primary-dark transition-colors"
      >
        게시글 등록
      </button>

      {showPlaceSearch && (
        <StopSearchModal
          onSelect={(stop) => {
            setSelectedPlace(stop);
            setShowPlaceSearch(false);
          }}
          onClose={() => setShowPlaceSearch(false)}
        />
      )}
    </form>
  );
}
