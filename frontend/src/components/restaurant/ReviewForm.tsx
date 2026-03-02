import { useState, type ChangeEvent, type FormEvent } from 'react';
import type { ReviewCreateRequest } from '../../types/restaurant';
import { StarRating } from '../common/StarRating';
import { useAuth } from '../../contexts/AuthContext';
import { resizePhoto } from '../../utils/photo';

interface Props {
  onSubmit: (data: ReviewCreateRequest) => void;
  onCancel: () => void;
}

export function ReviewForm({ onSubmit, onCancel }: Props) {
  const { nickname } = useAuth();
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');
  const [name, setName] = useState(nickname || '');
  const [photoUrl, setPhotoUrl] = useState('');
  const [generation, setGeneration] = useState<string>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0) return;
    onSubmit({ name: name || '익명', generation: generation ? Number(generation) : undefined, rating, note, photoUrl });
  };

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await resizePhoto(file);
      setPhotoUrl(dataUrl);
    } catch {
      setPhotoUrl('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text" placeholder="이름" value={name}
          onChange={e => setName(e.target.value)}
          className="px-2 py-1 border border-border rounded text-xs w-20"
          maxLength={20}
        />
        <input
          type="number" placeholder="기수" value={generation}
          onChange={e => setGeneration(e.target.value)}
          className="px-2 py-1 border border-border rounded text-xs w-14"
          min={1} max={99}
        />
        <StarRating rating={rating} editable onChange={setRating} size="md" />
      </div>
      <textarea
        placeholder="리뷰를 남겨주세요 (선택)" value={note}
        onChange={e => setNote(e.target.value)}
        className="w-full px-2 py-1 border border-border rounded text-xs resize-none h-16"
        maxLength={300}
      />
      <input
        type="file"
        accept="image/*"
        onChange={handlePhotoChange}
        className="w-full text-xs text-text-muted file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-white file:text-text"
      />
      {photoUrl && (
        <img src={photoUrl} alt="리뷰 사진 미리보기" className="w-full h-28 object-cover rounded border border-border" />
      )}
      <div className="flex gap-2">
        <button type="submit" disabled={rating === 0}
          className="px-3 py-1 bg-emerald-500 text-white rounded text-xs font-sans font-bold hover:bg-emerald-600 disabled:opacity-50"
        >
          등록
        </button>
        <button type="button" onClick={onCancel}
          className="px-3 py-1 text-text-muted text-xs hover:text-text"
        >
          취소
        </button>
      </div>
    </form>
  );
}
