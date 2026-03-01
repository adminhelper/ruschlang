interface SkeletonProps {
  width?: string;
  height?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  className?: string;
}

const variantStyles: Record<NonNullable<SkeletonProps['variant']>, string> = {
  text: 'h-4 rounded',
  circular: 'rounded-full',
  rectangular: 'rounded-xl',
};

export function Skeleton({
  width,
  height,
  variant = 'text',
  className = '',
}: SkeletonProps) {
  return (
    <div
      className={[
        'bg-gray-100 animate-pulse',
        variantStyles[variant],
        className,
      ].filter(Boolean).join(' ')}
      style={{ width, height }}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
      <Skeleton variant="rectangular" className="w-full h-40 rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton variant="text" className="w-3/4 h-5" />
        <Skeleton variant="text" className="w-1/2 h-3" />
        <Skeleton variant="text" className="w-full h-3" />
        <div className="flex gap-2 pt-2">
          <Skeleton variant="text" className="w-16 h-6" />
          <Skeleton variant="text" className="w-16 h-6" />
        </div>
      </div>
    </div>
  );
}
