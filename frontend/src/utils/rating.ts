import type { RuschlangGrade } from '../types/auth';

export function clampRating(value: number): number {
  return Math.round(Math.min(5, Math.max(0.1, value)) * 10) / 10;
}

export function parseHalfStepRating(value: number): number {
  const clamped = clampRating(value);
  return Math.round(clamped * 2) / 2;
}

export function calculateAverage(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((a, b) => a + b, 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

export function badgeByScore(avgRating: number, reviewCount: number): RuschlangGrade {
  if (reviewCount === 0) return 'newbie';
  if (avgRating >= 4.5) return '5star';
  if (avgRating >= 3.5) return '4star';
  if (avgRating >= 2.5) return '3star';
  return 'newbie';
}

export function gradeLabel(grade: RuschlangGrade): string {
  switch (grade) {
    case '5star': return '5스타';
    case '4star': return '4스타';
    case '3star': return '3스타';
    case 'newbie': return '뉴비';
  }
}

export function gradeColor(grade: RuschlangGrade): string {
  switch (grade) {
    case '5star': return 'text-grade-5star';
    case '4star': return 'text-grade-4star';
    case '3star': return 'text-grade-3star';
    case 'newbie': return 'text-grade-newbie';
  }
}

export function toStarDisplay(rating: number): string {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '★'.repeat(full) + (half ? '☆' : '') + '☆'.repeat(empty);
}
