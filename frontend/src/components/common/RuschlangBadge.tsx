import type { RuschlangGrade } from '../../types/auth';
import { gradeLabel, gradeColor } from '../../utils/rating';

interface Props {
  grade: RuschlangGrade;
  size?: 'sm' | 'md';
}

const BG_MAP: Record<RuschlangGrade, string> = {
  '5star': 'bg-grade-5star/10',
  '4star': 'bg-grade-4star/10',
  '3star': 'bg-grade-3star/10',
  'newbie': 'bg-grade-newbie/10',
};

export function RuschlangBadge({ grade, size = 'sm' }: Props) {
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-sans font-bold ${sizeClass} ${gradeColor(grade)} ${BG_MAP[grade]}`}>
      🏆 {gradeLabel(grade)}
    </span>
  );
}
