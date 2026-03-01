import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  onClick?: () => void;
}

const paddingStyles: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export function Card({
  children,
  className = '',
  padding = 'md',
  hoverable = false,
  onClick,
}: CardProps) {
  return (
    <div
      className={[
        'bg-white rounded-2xl border border-border shadow-[0_2px_8px_rgba(0,0,0,0.04)]',
        hoverable ? 'hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow cursor-pointer' : '',
        paddingStyles[padding],
        className,
      ].filter(Boolean).join(' ')}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
