interface Props {
  rating: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  onChange?: (rating: number) => void;
}

const SIZE_MAP = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-2xl',
};

export function StarRating({ rating, maxStars = 5, size = 'md', editable = false, onChange }: Props) {
  const stars: React.JSX.Element[] = [];

  const handleClick = (starIndex: number, isHalf: boolean) => {
    if (!editable || !onChange) return;
    const newRating = isHalf ? starIndex + 0.5 : starIndex + 1;
    onChange(newRating);
  };

  for (let i = 0; i < maxStars; i++) {
    const filled = rating >= i + 1;
    const half = !filled && rating >= i + 0.5;

    stars.push(
      <span
        key={i}
        className={`${SIZE_MAP[size]} ${editable ? 'cursor-pointer' : ''} select-none relative inline-block`}
      >
        {editable ? (
          <>
            <span
              className="absolute inset-0 w-1/2 overflow-hidden z-10"
              onClick={() => handleClick(i, true)}
            >
              <span className={half || filled ? 'text-star' : 'text-gray-300'}>★</span>
            </span>
            <span onClick={() => handleClick(i, false)}>
              <span className={filled ? 'text-star' : 'text-gray-300'}>★</span>
            </span>
          </>
        ) : (
          <span className={filled ? 'text-star' : half ? 'text-star opacity-50' : 'text-gray-300'}>
            ★
          </span>
        )}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-0.5">
      {stars}
      <span className="text-xs text-text-muted ml-1">{rating > 0 ? rating.toFixed(1) : ''}</span>
    </span>
  );
}
